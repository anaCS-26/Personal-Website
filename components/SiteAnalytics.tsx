"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { PAGES, linkTarget, referrerBucket, type ClientEvent } from "@/lib/events";
import { optedOut, track } from "@/lib/track";

/** Pages that are never counted (the private dashboard). */
const PRIVATE = ["/stats"];

/**
 * Site-wide analytics: Vercel Web Analytics for traffic, plus first-party
 * page views, landing referrers, and clicks on any `<a data-track="event">`
 * (link events in lib/events.ts), so server-rendered pages can be tracked
 * with an attribute instead of a client component.
 */
export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (PRIVATE.includes(pathname)) return;
    track("view", (PAGES as readonly string[]).includes(pathname) ? pathname : "other");
  }, [pathname]);

  useEffect(() => {
    // Once per tab: where this visit came from
    try {
      if (sessionStorage.getItem("referrer-sent")) return;
      sessionStorage.setItem("referrer-sent", "1");
    } catch {
      return;
    }
    if (PRIVATE.includes(window.location.pathname)) return;
    const ref = document.referrer;
    if (ref.startsWith(window.location.origin)) return; // came from this site
    track("referrer", referrerBucket(ref));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button > 1) return; // left or middle click
      const a = (e.target as Element | null)?.closest?.("a[data-track]");
      const href = a?.getAttribute("href");
      if (!a || !href) return;
      track(a.getAttribute("data-track") as ClientEvent, linkTarget(href));
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);

  return (
    <Analytics
      beforeSend={(event) =>
        optedOut() || PRIVATE.some((p) => new URL(event.url).pathname === p) ? null : event
      }
    />
  );
}
