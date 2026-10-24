import type { ClientEvent } from "@/lib/events";

/** localStorage flag that stops this browser from being counted. */
export const OPT_OUT_KEY = "analytics-off";

/** localStorage flag marking a browser that has visited before. Holds no ID. */
export const VISITED_KEY = "visited";

/**
 * True when this browser shouldn't be counted: the owner's opt-out, or a
 * browser-level Global Privacy Control / Do Not Track signal.
 */
export function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || nav.doNotTrack === "1") return true;
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
