import { userAgent, type NextRequest } from "next/server";
import { countable, record } from "@/lib/analytics";
import { isClientEvent } from "@/lib/events";
import { limitKey, memoryLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024;
const EVENTS_PER_MINUTE = 60; // per visitor, per warm instance

const noContent = () => new Response(null, { status: 204 });

/** Collects feature-usage events from lib/track.ts. Always answers 204. */
export async function POST(req: NextRequest) {
  // Same guard as the chat route: only this site's own pages, JSON only
  const fetchSite = req.headers.get("sec-fetch-site");
  if (
    (fetchSite !== null && fetchSite !== "same-origin") ||
    !req.headers.get("content-type")?.startsWith("application/json") ||
    Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES ||
    userAgent(req).isBot ||
    !countable(req.headers)
  ) {
    return noContent();
  }

  let event: unknown;
  let detail: unknown;
  try {
    ({ event, detail } = (await req.json()) as { event?: unknown; detail?: unknown });
  } catch {
    return noContent();
  }
  if (!isClientEvent(event, detail)) return noContent();

  const ip = limitKey(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous");
  // Cheap per-instance cap so one visitor can't inflate the counts
  if (!memoryLimit(`track:${ip}`, EVENTS_PER_MINUTE, 60_000)) return noContent();

  await record(
    event,
    detail as string | undefined,
    event === "view" ? { set: "visitors", id: ip } : undefined,
  );
  return noContent();
}
