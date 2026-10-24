import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LimitVerdict = { ok: true } | { ok: false; reason: "ip" | "paused" | "budget" };

const LIMITS = {
  perMinute: 10, // messages per IP per minute
  perDay: 40, // messages per IP per day
  visitorsPerDay: 100, // distinct visitors per UTC day; newcomers past this are paused
  globalPerDay: 500, // total messages per day across all visitors
};

const DAY_SECONDS = 86_400;

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
let minuteLimiter: Ratelimit | null = null;
let dayLimiter: Ratelimit | null = null;
let globalLimiter: Ratelimit | null = null;

if (hasUpstash) {
  redis = Redis.fromEnv();
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
export function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    memory.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

const utcDay = () => new Date().toISOString().slice(0, 10);

/**
 * Kill switch for a traffic spike (e.g. a post going viral): once
 * LIMITS.visitorsPerDay distinct visitors have chatted today, new visitors
 * are turned away until the next UTC day. Visitors already admitted today
 * can keep their conversation going.
 */
async function admitVisitor(r: Redis, ip: string): Promise<boolean> {
  const key = `chat:visitors:${utcDay()}`;
  const added = await r.sadd(key, ip);
  if (added === 0) return true; // already admitted today
  await r.expire(key, 2 * DAY_SECONDS);
  // Add-then-count so concurrent newcomers can't both slip in at the cap
  if ((await r.scard(key)) > LIMITS.visitorsPerDay) {
    await r.srem(key, ip);
    return false;
  }
  return true;
}

const memoryVisitors = { day: "", ips: new Set<string>() };
function memoryAdmitVisitor(ip: string): boolean {
  const day = utcDay();
  if (memoryVisitors.day !== day) {
    memoryVisitors.day = day;
    memoryVisitors.ips.clear();
  }
  if (memoryVisitors.ips.has(ip)) return true;
  if (memoryVisitors.ips.size >= LIMITS.visitorsPerDay) return false;
  memoryVisitors.ips.add(ip);
  return true;
}

/**
 * Rate-limit identity for an IP. A single IPv6 connection is typically
 * assigned a whole /64, so per-address limits are trivial to dodge by
 * rotating addresses; bucket IPv6 by its /64 prefix instead.
 */
export function limitKey(ip: string): string {
  if (!ip.includes(":")) return ip; // IPv4 (or "anonymous")
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];
  const [head, tail] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups =
    tail === undefined
      ? left
      : [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

export async function checkLimits(clientIp: string): Promise<LimitVerdict> {
  const ip = limitKey(clientIp);
  if (redis && minuteLimiter && dayLimiter && globalLimiter) {
    try {
      const [minute, day] = await Promise.all([
        minuteLimiter.limit(ip),
        dayLimiter.limit(ip),
      ]);
      if (!minute.success || !day.success) return { ok: false, reason: "ip" };
      if (!(await admitVisitor(redis, ip))) return { ok: false, reason: "paused" };
      const global = await globalLimiter.limit("all");
      if (!global.success) return { ok: false, reason: "budget" };
      return { ok: true };
    } catch (err) {
      // Upstash unreachable: degrade to the in-memory limits below rather
      // than letting every request through unmetered.
      console.error("[chat] Upstash rate limit failed, using in-memory limits", err);
    }
  }

  if (!memoryLimit(`min:${ip}`, LIMITS.perMinute, 60_000)) {
    return { ok: false, reason: "ip" };
  }
  if (!memoryLimit(`day:${ip}`, LIMITS.perDay, 86_400_000)) {
    return { ok: false, reason: "ip" };
  }
  if (!memoryAdmitVisitor(ip)) {
    return { ok: false, reason: "paused" };
  }
  if (!memoryLimit("global", LIMITS.globalPerDay, 86_400_000)) {
    return { ok: false, reason: "budget" };
  }
  return { ok: true };
}
