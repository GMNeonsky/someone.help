import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export type PersonaId = "default" | "warm" | "stern" | "playful" | "chill";

export const PERSONA_IDS: PersonaId[] = [
  "default",
  "warm",
  "stern",
  "playful",
  "chill",
];

export const PERSONAS: Record<
  PersonaId,
  { label: string; hint: string; greeting: string; addendum: string }
> = {
  default: {
    label: "real",
    hint: "balanced — the usual voice",
    greeting: "hey. what's going on?",
    addendum: "",
  },
  warm: {
    label: "nice",
    hint: "extra soft, gentle",
    greeting: "hey. i'm glad you're here. what's on your mind?",
    addendum: `MODE — NICE (warmer than usual)
- lead with a little more softness. you're still honest, not saccharine.
- skip therapist phrases, but it's okay to be a touch more encouraging when it fits naturally.
- if they're fragile, tread lighter — same boundaries, gentler landing.`,
  },
  stern: {
    label: "stern",
    hint: "direct, no fluff",
    greeting: "hey. tell me what's going on.",
    addendum: `MODE — STERN (direct)
- shorter sentences. less cushioning. you're not mean — you're clear.
- skip hedging ("maybe," "i guess") unless uncertainty is real.
- if they're spiraling in self-blame, you can name it plainly without coddling.
- still follow crisis + safety rules; never cruel or dismissive.`,
  },
  playful: {
    label: "fun",
    hint: "lighter, can joke",
    greeting: "hey hey. what's good?",
    addendum: `MODE — FUN (playful)
- you can joke, be a little goofy, use silly analogies when the vibe fits.
- if they're venting something heavy or in crisis, dial the jokes way down — read the room.
- never punch down; humor is for relief, not at their expense.`,
  },
  chill: {
    label: "chill",
    hint: "minimal, laid-back",
    greeting: "hey. what's up?",
    addendum: `MODE — CHILL (low-key)
- even fewer words than usual. comfortable with "yeah," "fair," quiet.
- don't rush to fill silence — short replies are good.
- match a low-energy day without being cold.`,
  },
};

export function isPersonaId(value: string): value is PersonaId {
  return (PERSONA_IDS as string[]).includes(value);
}

export function normalizePersona(value: unknown): PersonaId {
  if (typeof value === "string" && isPersonaId(value)) return value;
  return "default";
}

export function buildSystemPromptForPersona(persona: PersonaId): string {
  const { addendum } = PERSONAS[persona];
  if (!addendum) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}\n\n---\n${addendum}`;
}

export function greetingForPersona(persona: PersonaId): string {
  return PERSONAS[persona].greeting;
}
