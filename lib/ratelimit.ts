import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LimitVerdict = { ok: true } | { ok: false; reason: "ip" | "budget" };

const LIMITS = {
  perMinute: 10, // messages per IP per minute
  perDay: 40, // messages per IP per day
  globalPerDay: 500, // total messages per day across all visitors
};

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let minuteLimiter: Ratelimit | null = null;
let dayLimiter: Ratelimit | null = null;
let globalLimiter: Ratelimit | null = null;

if (hasUpstash) {
  const redis = Redis.fromEnv();
  minuteLimiter = new Ratelimit({
    redis,
    prefix: "chat:min",
    limiter: Ratelimit.slidingWindow(LIMITS.perMinute, "1 m"),
  });
  dayLimiter = new Ratelimit({
    redis,
    prefix: "chat:day",
    limiter: Ratelimit.slidingWindow(LIMITS.perDay, "1 d"),
  });
  globalLimiter = new Ratelimit({
    redis,
    prefix: "chat:global",
    limiter: Ratelimit.fixedWindow(LIMITS.globalPerDay, "1 d"),
  });
} else if (process.env.NODE_ENV === "production") {
  console.warn(
    "[chat] Upstash env vars missing — falling back to per-instance in-memory rate limiting.",
  );
}

// In-memory fallback (per warm serverless instance; best effort only).
const memory = new Map<string, { count: number; windowStart: number }>();
function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    memory.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export async function checkLimits(ip: string): Promise<LimitVerdict> {
  if (minuteLimiter && dayLimiter && globalLimiter) {
    const [minute, day] = await Promise.all([
      minuteLimiter.limit(ip),
      dayLimiter.limit(ip),
    ]);
    if (!minute.success || !day.success) return { ok: false, reason: "ip" };
    const global = await globalLimiter.limit("all");
    if (!global.success) return { ok: false, reason: "budget" };
    return { ok: true };
  }

  if (!memoryLimit(`min:${ip}`, LIMITS.perMinute, 60_000)) {
    return { ok: false, reason: "ip" };
  }
  if (!memoryLimit(`day:${ip}`, LIMITS.perDay, 86_400_000)) {
    return { ok: false, reason: "ip" };
  }
  if (!memoryLimit("global", LIMITS.globalPerDay, 86_400_000)) {
    return { ok: false, reason: "budget" };
  }
  return { ok: true };
}
