import { togetherai } from "@ai-sdk/togetherai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextRequest } from "next/server";
import {
  buildSystemPromptForPersona,
  normalizePersona,
} from "@/lib/personas";
import { isValidUuid } from "@/lib/uuid";
import { checkRate, recordTokenUsage } from "@/lib/rate-limit";
import { isLikelyCrisis, CRISIS_RESOURCES } from "@/lib/crisis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES_PER_REQUEST = 40;
const MAX_CHARS_PER_MESSAGE = 4000;
const MODEL_ID =
  process.env.TOGETHER_MODEL ?? "meta-llama/Llama-3.3-70B-Instruct-Turbo";

export async function POST(req: NextRequest) {
  if (!process.env.TOGETHER_API_KEY) {
    return Response.json(
      { error: "Server is not configured. Try again later." },
      { status: 503 }
    );
  }

  let body: { messages?: UIMessage[]; uuid?: string; persona?: string };
  try {
    body = await req.json();
  } catch {
    console.warn("[chat] 400: invalid JSON body");
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, uuid } = body;
  const persona = normalizePersona(body.persona);
  const baseSystemPrompt = buildSystemPromptForPersona(persona);

  // Diagnostic: log only the SHAPE of bad requests, never content.
  // Helps debug client/server schema drift without touching user text.
  const shape = () => ({
    hasUuid: typeof uuid === "string" && uuid.length > 0,
    uuidValid: isValidUuid(uuid),
    uuidLen: typeof uuid === "string" ? uuid.length : 0,
    messagesIsArray: Array.isArray(messages),
    messageCount: Array.isArray(messages) ? messages.length : 0,
    bodyKeys: Object.keys(body ?? {}),
    persona,
    firstMsgRole:
      Array.isArray(messages) && messages[0] ? messages[0].role : null,
    firstMsgPartTypes:
      Array.isArray(messages) &&
      messages[0] &&
      Array.isArray(messages[0].parts)
        ? messages[0].parts.map((p) => p?.type)
        : null,
  });

  if (!isValidUuid(uuid)) {
    console.warn("[chat] 400: missing/invalid uuid", shape());
    return Response.json({ error: "Missing anon id." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    console.warn("[chat] 400: no messages", shape());
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return Response.json(
      { error: "Conversation got too long. Refresh to start fresh." },
      { status: 413 }
    );
  }

  // Light per-message size cap, applied to the user's text content only.
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) {
      console.warn("[chat] 400: bad message role", shape());
      return Response.json({ error: "Bad message." }, { status: 400 });
    }
    const text = extractText(m);
    if (text.length > MAX_CHARS_PER_MESSAGE) {
      return Response.json(
        { error: "Message is too long. Try breaking it up." },
        { status: 413 }
      );
    }
  }

  const gate = checkRate(uuid!);
  if (!gate.ok) {
    const friendly =
      gate.reason === "daily_tokens"
        ? "you've chatted a lot today, take a break and come back tomorrow."
        : "slow down a sec — you're going faster than I can keep up.";
    return Response.json(
      { error: friendly, reason: gate.reason },
      {
        status: 429,
        headers: { "Retry-After": String(gate.retryAfterSeconds) },
      }
    );
  }

  // First-message safety check — if the user's opening line trips a high-signal
  // phrase, we tack a crisis-resource preamble onto the system prompt so the
  // resources land immediately. Doesn't block the model from responding warmly.
  const userMessages = messages.filter((m) => m.role === "user");
  const firstUserText = userMessages[0] ? extractText(userMessages[0]) : "";
  const isFirstUserMessage = userMessages.length === 1;
  const triggeredCrisis =
    isFirstUserMessage && isLikelyCrisis(firstUserText);

  const system = triggeredCrisis
    ? `${baseSystemPrompt}\n\nIMPORTANT: The user's first message contains content suggesting they may be in crisis. Open your reply by gently sharing the relevant resource (US: 988 call/text, or text HOME to 741741. UK/IE: Samaritans 116 123. International: findahelpline.com). Then briefly, warmly acknowledge what they shared. Don't lecture. Keep it short.`
    : baseSystemPrompt;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: togetherai(MODEL_ID),
    system,
    messages: modelMessages,
    temperature: 0.8,
    maxOutputTokens: 600,
    onFinish: ({ usage }) => {
      const total =
        (usage as { totalTokens?: number; inputTokens?: number; outputTokens?: number })
          ?.totalTokens ??
        ((usage as { inputTokens?: number })?.inputTokens ?? 0) +
          ((usage as { outputTokens?: number })?.outputTokens ?? 0);
      if (total > 0) recordTokenUsage(uuid!, total);
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      // CRITICAL: Some reverse proxies gzip any text/* response. When the
      // browser sends `Accept-Encoding: gzip`, the SSE stream can be
      // compressed mid-flight. The AI SDK's UI message stream parser receives raw
      // gzipped bytes, fails to parse, and surfaces as a generic
      // "something hiccupped" error — even though the upstream model
      // streamed cleanly.
      //
      // `Cache-Control: no-transform` instructs every intermediary
      // (proxies, CDNs, anyone in between) to leave the body
      // untouched. `Content-Encoding: identity` is belt-and-suspenders for
      // any proxy that doesn't honour `no-transform`.
      "Cache-Control": "no-cache, no-transform",
      "Content-Encoding": "identity",
    },
  });
}

function extractText(m: UIMessage): string {
  if (!m.parts || !Array.isArray(m.parts)) return "";
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p?.type === "text")
    .map((p) => p.text)
    .join(" ");
}

// We export this so the resources are available to the client too, but the
// route itself doesn't return them — the model handles delivery in-stream.
export const _resources = CRISIS_RESOURCES;
