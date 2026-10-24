import type { ClientEvent } from "@/lib/events";

/** localStorage flag that stops this browser from being counted. */
export const OPT_OUT_KEY = "analytics-off";

export function optedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Count a feature-usage event (see lib/events.ts for the allowed names and
 * details). Fire-and-forget; keepalive lets it finish while the page unloads.
 */
export function track(event: ClientEvent, detail?: string): void {
  if (optedOut()) return;
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, detail }),
    keepalive: true,
  }).catch(() => {
    // analytics is best effort
  });
}
