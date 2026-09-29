"use client";

import Link from "next/link";
import { useRef } from "react";

/** A card link with a soft highlight that follows the cursor on hover. */
export function SpotlightLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      className={`group relative isolate overflow-hidden ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--accent-soft), transparent 70%)",
        }}
      />
      {children}
    </Link>
  );
}
