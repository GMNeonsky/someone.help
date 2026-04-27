/**
 * In-memory rate limiter, keyed by anonymous UUID.
 *
 * Lives only in the running process — restart wipes it. That's fine for v1:
 * your edge / provider handles coarse abuse protection, and the model provider
 * account has its own limits. This layer just keeps a single browser id from
 * hammering the API.
 *
 * If you need durable limits, swap this for Redis or similar — same interface.
 */

type Bucket = {
  count: number;
  resetAt: number;
  tokensToday: number;
  tokenWindowEnd: number;
};

const buckets = new Map<string, Bucket>();

const PER_MINUTE_LIMIT = Number(
  process.env.MESSAGES_PER_MINUTE_PER_UUID ?? 20
);
const DAILY_TOKEN_LIMIT = Number(
  process.env.DAILY_TOKEN_LIMIT_PER_UUID ?? 50_000
);

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function getBucket(uuid: string): Bucket {
  const now = Date.now();
  let b = buckets.get(uuid);
  if (!b) {
    b = {
      count: 0,
      resetAt: now + MINUTE_MS,
      tokensToday: 0,
      tokenWindowEnd: now + DAY_MS,
    };
    buckets.set(uuid, b);
  }
  if (now >= b.resetAt) {
    b.count = 0;
    b.resetAt = now + MINUTE_MS;
  }
  if (now >= b.tokenWindowEnd) {
    b.tokensToday = 0;
    b.tokenWindowEnd = now + DAY_MS;
  }
  return b;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "rate" | "daily_tokens"; retryAfterSeconds: number };

export function checkRate(uuid: string): RateLimitResult {
  const b = getBucket(uuid);
  if (b.tokensToday >= DAILY_TOKEN_LIMIT) {
    return {
      ok: false,
      reason: "daily_tokens",
      retryAfterSeconds: Math.ceil((b.tokenWindowEnd - Date.now()) / 1000),
    };
  }
  if (b.count >= PER_MINUTE_LIMIT) {
    return {
      ok: false,
      reason: "rate",
      retryAfterSeconds: Math.ceil((b.resetAt - Date.now()) / 1000),
    };
  }
  b.count += 1;
  return { ok: true };
}

export function recordTokenUsage(uuid: string, tokens: number): void {
  const b = getBucket(uuid);
  b.tokensToday += tokens;
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [uuid, b] of buckets.entries()) {
      if (now >= b.tokenWindowEnd && b.count === 0) {
        buckets.delete(uuid);
      }
    }
  }, 60 * 60 * 1000).unref?.();
}
