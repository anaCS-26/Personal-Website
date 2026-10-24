"use client";

import { useEffect } from "react";
import { OPT_OUT_KEY } from "@/lib/track";

/**
 * Opening the dashboard marks this browser as the owner's, so browsing your
 * own site doesn't inflate the numbers (first-party and Vercel alike).
 */
export function StatsOptOut() {
  useEffect(() => {
    try {
      localStorage.setItem(OPT_OUT_KEY, "1");
    } catch {
      // storage blocked: this browser will still be counted
    }
  }, []);

  return (
    <p className="text-sm text-fg-faint">
      Your visits from this browser aren&apos;t counted.
    </p>
  );
}
