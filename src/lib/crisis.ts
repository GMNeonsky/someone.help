/**
 * Lightweight first-message safety check.
 *
 * If a user's very first message contains an explicit suicide/self-harm phrase,
 * we prepend the crisis resource info to the model's response stream. This is
 * a floor, not a filter — the model will still reply warmly, but the resources
 * appear immediately so they're never more than a glance away.
 *
 * We deliberately keep the keyword list narrow and high-signal. False positives
 * are okay (the message reads as supportive either way). False negatives are
 * fine too — the system prompt covers the rest.
 */
const HIGH_SIGNAL_PHRASES = [
  "kill myself",
  "killing myself",
  "end my life",
  "ending my life",
  "want to die",
  "wanna die",
  "suicide",
  "suicidal",
  "i'm going to kill",
  "i am going to kill",
  "self harm",
  "self-harm",
  "cut myself",
  "hurt myself",
];

export function isLikelyCrisis(message: string): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return HIGH_SIGNAL_PHRASES.some((phrase) => m.includes(phrase));
}

export const CRISIS_RESOURCES = {
  us_call_text: "988",
  us_text_line: "Text HOME to 741741",
  uk_ie: "Samaritans — 116 123",
  international: "findahelpline.com",
};
