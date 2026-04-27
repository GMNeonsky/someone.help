"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { uuidv4, isValidUuid } from "@/lib/uuid";
import {
  greetingForPersona,
  isPersonaId,
  PERSONAS,
  PERSONA_IDS,
  type PersonaId,
} from "@/lib/personas";

const STORAGE_UUID_KEY = "someone.help/uuid";
const STORAGE_MSGS_KEY = "someone.help/messages";
const STORAGE_PERSONA_KEY = "someone.help/persona";

type StoredMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<{ type: "text"; text: string }>;
};

function loadUuid(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(STORAGE_UUID_KEY);
  if (isValidUuid(existing)) {
    return existing as string;
  }
  const id = uuidv4();
  localStorage.setItem(STORAGE_UUID_KEY, id);
  return id;
}

function loadStoredMessages(): StoredMessage[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_MSGS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Defensive filter: drop anything that isn't a clean user/assistant
    // message with text parts. Protects against schema drift between
    // deploys (the AI SDK occasionally tweaks message shape between
    // versions, and a single bad stored message will 400 the whole API
    // call).
    const cleaned = parsed
      .filter(
        (m): m is StoredMessage =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          Array.isArray(m.parts) &&
          m.parts.every(
            (p: { type?: string; text?: string }) =>
              p && p.type === "text" && typeof p.text === "string",
          ),
      )
      .map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts.filter(
          (p): p is { type: "text"; text: string } => p?.type === "text",
        ),
      }));
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}

export function Chat() {
  const [uuid, setUuid] = useState<string>("");
  const [input, setInput] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const hasHydratedRef = useRef(false);
  // Mirror uuid into a ref so `prepareSendMessagesRequest` (which lives
  // inside a memoised transport) always reads the current value at send
  // time, not the value captured at transport-construction time. Without
  // this, a stale closure could ship `uuid: ""` to the server on the very
  // first send after mount, getting a 400 "Missing anon id".
  const uuidRef = useRef<string>("");
  const personaRef = useRef<PersonaId>("default");
  const [persona, setPersona] = useState<PersonaId>("default");

  useEffect(() => {
    const id = loadUuid();
    uuidRef.current = id;
    setUuid(id);
    try {
      const p = localStorage.getItem(STORAGE_PERSONA_KEY);
      if (p && isPersonaId(p)) {
        personaRef.current = p;
        setPersona(p);
      }
    } catch {
      // ignore
    }
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages: msgs }) => {
          // Read from the ref — never from the closure variable. If the
          // ref is empty (shouldn't happen — submit is gated on uuid being
          // truthy — but belt and suspenders) fall back to localStorage.
          let id = uuidRef.current;
          if (!id && typeof window !== "undefined") {
            id = localStorage.getItem(STORAGE_UUID_KEY) ?? "";
          }
          return {
            body: {
              messages: msgs,
              uuid: id,
              persona: personaRef.current,
            },
          };
        },
      }),
    [],
  );

  const onPersonaChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (!isPersonaId(next)) return;
    personaRef.current = next;
    setPersona(next);
    try {
      localStorage.setItem(STORAGE_PERSONA_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  // Start useChat with an empty conversation — always. Hydrate from
  // localStorage in a follow-up effect so a malformed stored message
  // can't poison initialization (and silently set useChat's `error`
  // before the user has even typed anything, which was the cause of
  // "something hiccupped" appearing on a fresh page load).
  const { messages, sendMessage, status, error, setMessages, clearError } =
    useChat({
      transport,
      onError: (err) => {
        const msg = parseError(err);
        setErrorBanner(msg);
      },
    });

  // Hydrate stored messages once after mount. If anything goes wrong
  // (schema drift, useChat rejecting our shape, JSON corruption), wipe
  // localStorage and start fresh — better than a permanently broken UI.
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const stored = loadStoredMessages();
    if (!stored || stored.length === 0) return;
    try {
      setMessages(stored as never);
    } catch (e) {
      console.warn("[someone.help] failed to restore conversation:", e);
      try {
        localStorage.removeItem(STORAGE_MSGS_KEY);
      } catch {
        // ignore
      }
    }
  }, [setMessages]);

  // Persist conversation to localStorage on every change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_MSGS_KEY, JSON.stringify(messages));
    } catch {
      // localStorage full or disabled — fail silent, conversation just won't persist.
    }
  }, [messages]);

  // Autoscroll on new content.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const smooth =
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, [messages, status]);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text) return;
      if (!uuid) return;
      setErrorBanner(null);
      // Clear any prior useChat error so the banner doesn't stay sticky
      // across a successful retry.
      clearError?.();
      sendMessage({ text });
      setInput("");
      requestAnimationFrame(() => taRef.current?.focus());
    },
    [input, sendMessage, uuid, clearError]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const startFresh = useCallback(() => {
    setMessages([]);
    setErrorBanner(null);
    clearError?.();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_MSGS_KEY);
    }
    requestAnimationFrame(() => taRef.current?.focus());
  }, [setMessages, clearError]);

  const isStreaming = status === "streaming" || status === "submitted";
  const showGreeting = messages.length === 0;

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <header className="w-full shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur z-10 supports-[backdrop-filter]:bg-[var(--color-bg)]/70">
        <div className="mx-auto max-w-2xl px-3 min-[400px]:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-x-3 gap-y-2 justify-between">
          <h1 className="text-sm font-medium tracking-tight text-[var(--color-fg)] min-h-11 inline-flex items-center">
            someone.help
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-xs text-[var(--color-fg-dim)] min-h-11">
              <span className="shrink-0 hidden min-[400px]:inline">helper</span>
              <select
                value={persona}
                onChange={onPersonaChange}
                className="touch-manip min-h-11 max-w-[10.5rem] sm:max-w-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] text-[var(--color-fg)] text-base sm:text-sm py-2 pl-3 pr-8 outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-accent)_35%,transparent)]"
                aria-label="Conversation style"
              >
                {PERSONA_IDS.map((id) => (
                  <option key={id} value={id} title={PERSONAS[id].hint}>
                    {PERSONAS[id].label}
                  </option>
                ))}
              </select>
            </label>
            {(messages.length > 0 || error || errorBanner) && (
              <button
                type="button"
                onClick={startFresh}
                className="touch-manip min-h-11 inline-flex items-center px-2 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] active:opacity-80 transition rounded-lg"
                aria-label="Start a new conversation"
              >
                start fresh
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="chat-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="mx-auto max-w-2xl px-3 min-[400px]:px-4 py-5 sm:py-8">
          {showGreeting && (
            <div className="text-[var(--color-fg-muted)] text-base leading-relaxed mb-6">
              {greetingForPersona(persona)}
            </div>
          )}

          <ul className="space-y-4">
            {messages.map((m) => {
              const text = m.parts
                .filter(
                  (p): p is { type: "text"; text: string } =>
                    p?.type === "text"
                )
                .map((p) => p.text)
                .join("");
              const isUser = m.role === "user";
              return (
                <li
                  key={m.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={[
                      "px-3.5 sm:px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-base leading-relaxed",
                      "max-w-[min(92%,28rem)] sm:max-w-[80%]",
                      isUser
                        ? "bg-[var(--color-bg-bubble-user)] text-[var(--color-fg)] rounded-br-md"
                        : "bg-[var(--color-bg-bubble-ai)] text-[var(--color-fg)] rounded-bl-md border border-[var(--color-border)]",
                    ].join(" ")}
                  >
                    {text || (isStreaming && !isUser ? <TypingDots /> : null)}
                  </div>
                </li>
              );
            })}
            {isStreaming &&
              messages[messages.length - 1]?.role === "user" && (
                <li className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--color-bg-bubble-ai)] border border-[var(--color-border)]">
                    <TypingDots />
                  </div>
                </li>
              )}
          </ul>

          {errorBanner && (
            <div className="mt-4 text-xs text-[var(--color-fg-muted)] bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-lg px-3 py-2">
              {errorBanner}
            </div>
          )}
          {error && !errorBanner && (
            <div className="mt-4 text-xs text-[var(--color-fg-muted)] bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-lg px-3 py-2">
              something hiccupped on my end. tap &lsquo;start fresh&rsquo; up top, or refresh the page.
            </div>
          )}
        </div>
      </div>

      <div className="w-full shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl px-3 min-[400px]:px-4 py-2 sm:py-3"
        >
          <div className="flex items-end gap-2 bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-2xl px-2.5 sm:px-3 py-2 focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/25 transition">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="on"
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 200) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={showGreeting ? "say hi…" : "type something…"}
              className="touch-manip flex-1 min-w-0 bg-transparent outline-none resize-none text-base leading-relaxed py-2.5 sm:py-2 max-h-[200px] placeholder:text-[var(--color-fg-dim)]"
              aria-label="Message"
              disabled={!uuid}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming || !uuid}
              className="touch-manip shrink-0 self-end min-h-11 min-w-[3.25rem] rounded-xl px-3 sm:px-4 text-sm font-medium bg-[var(--color-accent)] text-[var(--color-bg)] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80 transition"
              aria-label="Send message"
            >
              send
            </button>
          </div>
          <p className="mt-2 px-0.5 text-[11px] sm:text-xs text-[var(--color-fg-dim)] text-center leading-snug">
            press enter to send · shift+enter for newline · your conversation lives only in this browser
          </p>
        </form>
      </div>
    </main>
  );
}

function TypingDots() {
  return (
    <span aria-label="typing" role="status">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  );
}

function parseError(err: unknown): string {
  if (!err) return "something hiccupped. try start fresh up top, or refresh the page.";
  const msg = (err as { message?: string })?.message ?? "";
  if (msg.includes("429")) {
    return "slow down a sec — that was a lot fast.";
  }
  if (msg.includes("503")) {
    return "i'm not feeling well right now, try again in a minute.";
  }
  if (msg.includes("400")) {
    return "something's off with this conversation — tap 'start fresh' up top to reset.";
  }
  return "something hiccupped. tap 'start fresh' up top, or refresh the page.";
}
