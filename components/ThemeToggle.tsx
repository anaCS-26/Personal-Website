"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  const toggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const apply = () => {
        document.documentElement.dataset.theme = next;
        setTheme(next);
      };
      try {
        localStorage.setItem("theme", next);
      } catch {
        // private mode — theme just won't persist
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => {
          finished: Promise<void>;
          ready: Promise<void>;
        };
      };
      if (!reduced && typeof doc.startViewTransition === "function") {
        // The wash radiates out from the toggle itself
        const rect = e.currentTarget.getBoundingClientRect();
        document.documentElement.style.setProperty(
          "--toggle-x",
          `${rect.left + rect.width / 2}px`,
        );
        document.documentElement.style.setProperty(
          "--toggle-y",
          `${rect.top + rect.height / 2}px`,
        );
        // (transition promises can reject if another transition is in flight —
        // the theme still applies, so silence the abort)
        const transition = doc.startViewTransition(apply);
        transition.ready.catch(() => {});
        transition.finished.catch(() => {});
      } else {
        apply();
      }
    },
    [theme],
  );

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-9 items-center gap-2 rounded-full border border-line-strong bg-bg-elevated px-3 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
    >
      {dark ? (
        // sun — clicking goes to light
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
          </g>
        </svg>
      ) : (
        // moon — clicking goes to dark
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"
            fill="currentColor"
          />
        </svg>
      )}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}
