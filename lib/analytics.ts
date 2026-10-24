import { Redis } from "@upstash/redis";
import type { ClientEvent, ServerEvent } from "@/lib/events";

// First-party usage counters for the /stats dashboard. Vercel Web Analytics
// covers page-level traffic, but on the Hobby plan it has no custom events and
// only a month of history, so feature usage is counted here instead.
//
// Storage is one Redis hash per UTC day (`stats:YYYY-MM-DD`, field
// `event` or `event:detail` -> count) plus HyperLogLog sketches for daily
// unique visitors and chatters. A sketch keeps only hashed registers, so no
// IP address is stored. No cookies are set and no message text is recorded.

const RETENTION_SECONDS = 400 * 86_400;

// Only production counts: preview deployments share this Redis database.
const redis =
  process.env.VERCEL_ENV === "production" &&
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export const analyticsEnabled = redis !== null;

/** Daily distinct-visitor sketches. */
export type UniqueSet = "visitors" | "chatters";

const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);

/**
 * False when the visitor asked not to be counted: Global Privacy Control,
 * Do Not Track, or the owner's opt-out (X-No-Track, sent by useChat).
 */
export function countable(headers: Headers): boolean {
  return (
    headers.get("sec-gpc") !== "1" &&
    headers.get("dnt") !== "1" &&
    headers.get("x-no-track") !== "1"
  );
}

/**
 * Count one event for today. Never throws: analytics must not break the
 * request it rides on.
 */
export async function record(
  event: ClientEvent | ServerEvent,
  detail?: string,
  unique?: { set: UniqueSet; id: string },
): Promise<void> {
  if (!redis) return;
  const day = utcDay();
  const counts = `stats:${day}`;
  const p = redis.pipeline();
  p.hincrby(counts, detail === undefined ? event : `${event}:${detail}`, 1);
  p.expire(counts, RETENTION_SECONDS);
  if (unique) {
    const key = `stats:${unique.set}:${day}`;
    p.pfadd(key, unique.id);
    p.expire(key, RETENTION_SECONDS);
  }
  try {
    await p.exec();
  } catch (err) {
    console.error("[analytics] record failed", err);
  }
}

export type DayStats = {
  day: string;
  counts: Record<string, number>;
  visitors: number;
  chatters: number;
};

export type StatsRange = {
  days: DayStats[];
  /** Distinct across the whole range, not the sum of daily counts. */
  visitors: number;
  chatters: number;
};

/** The last `n` UTC days of counters, oldest first. Null when not configured. */
export async function readStats(n: number): Promise<StatsRange | null> {
  if (!redis) return null;
  const now = Date.now();
  const days = Array.from({ length: n }, (_, i) =>
    utcDay(new Date(now - (n - 1 - i) * 86_400_000)),
  );
  const visitorKeys = days.map((d) => `stats:visitors:${d}`);
  const chatterKeys = days.map((d) => `stats:chatters:${d}`);

  const p = redis.pipeline();
  for (const d of days) p.hgetall<Record<string, number>>(`stats:${d}`);
  for (const k of visitorKeys) p.pfcount(k);
  for (const k of chatterKeys) p.pfcount(k);
  // Multi-key PFCOUNT counts the union: distinct people across the range
  p.pfcount(visitorKeys[0], ...visitorKeys.slice(1));
  p.pfcount(chatterKeys[0], ...chatterKeys.slice(1));
  const res = (await p.exec()) as unknown[];

  return {
    days: days.map((day, i) => ({
      day,
      counts: Object.fromEntries(
        Object.entries((res[i] as Record<string, unknown> | null) ?? {}).map(
          ([field, count]) => [field, Number(count)],
        ),
      ),
      visitors: Number(res[n + i]),
      chatters: Number(res[2 * n + i]),
    })),
    visitors: Number(res[3 * n]),
    chatters: Number(res[3 * n + 1]),
  };
}
