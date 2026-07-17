"use client";

import { useEffect, useRef } from "react";

/**
 * The site's mascot mark: a rounded-square "bot" face whose pupils follow the
 * cursor (or last touch). Eyes close while `thinking`, blink occasionally.
 * Honors prefers-reduced-motion by keeping a static, friendly gaze.
 */
export function AvatarMark({
  size = 40,
  thinking = false,
}: {
  size?: number;
  thinking?: boolean;
}) {
  const leftPupil = useRef<SVGCircleElement>(null);
  const rightPupil = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onPoint = (x: number, y: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(dist / 80, 1) * 1.6; // max pupil travel in svg units
      targetX = (dx / dist) * reach;
      targetY = (dy / dist) * reach;
    };

    const onMouse = (e: MouseEvent) => onPoint(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPoint(t.clientX, t.clientY);
    };

    const tick = () => {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;
      const transform = `translate(${curX}px, ${curY}px)`;
      if (leftPupil.current) leftPupil.current.style.transform = transform;
      if (rightPupil.current) rightPupil.current.style.transform = transform;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="3"
        y="5"
        width="26"
        height="22"
        rx="7"
        fill="var(--surface)"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      {/* antenna */}
      <path d="M16 5V2.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="2" r="1.3" fill="var(--accent)" />
      {thinking ? (
        // closed eyes while thinking
        <g stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round">
          <path d="M9 16.5c1.2 1 2.8 1 4 0" />
          <path d="M19 16.5c1.2 1 2.8 1 4 0" />
        </g>
      ) : (
        <g className="avatar-eyes">
          <circle cx="11" cy="16" r="3.4" fill="var(--bg)" stroke="var(--fg-muted)" strokeWidth="1" />
          <circle cx="21" cy="16" r="3.4" fill="var(--bg)" stroke="var(--fg-muted)" strokeWidth="1" />
          <circle ref={leftPupil} cx="11" cy="16" r="1.5" fill="var(--accent)" />
          <circle ref={rightPupil} cx="21" cy="16" r="1.5" fill="var(--accent)" />
        </g>
      )}
      {/* small smile */}
      <path
        d="M13.5 22c1.5 1.1 3.5 1.1 5 0"
        stroke="var(--fg-muted)"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
