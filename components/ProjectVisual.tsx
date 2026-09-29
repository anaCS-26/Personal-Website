"use client";

import { useEffect, useRef } from "react";

/**
 * Small animated illustrations, one per project. They are schematic, not real
 * model output: no scores or metrics are shown here.
 */

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface">
      {children}
      <figcaption className="absolute bottom-3 left-3 rounded-md bg-bg/80 px-2 py-1 text-[11px] text-fg-muted backdrop-blur-sm">
        {label}
      </figcaption>
    </figure>
  );
}

/* PulmoLens: an attention map that drifts across two lung fields */
function AttentionMap() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COLS = 24;
    const ROWS = 18;
    let accent: number[] = [0, 0, 0];
    let fg: number[] = [0, 0, 0];
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      const hex = (v: string) => {
        const n = parseInt(s.getPropertyValue(v).trim().slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      };
      accent = hex("--accent");
      fg = hex("--fg");
    };
    readColors();

    // Two lung-shaped regions (ellipses) in grid units
    const lungs = [
      { cx: 7.6, cy: 9, rx: 4.6, ry: 7.2 },
      { cx: 16.4, cy: 9, rx: 4.6, ry: 7.2 },
    ];
    const inLung = (x: number, y: number) =>
      lungs.some((l) => ((x - l.cx) / l.rx) ** 2 + ((y - l.cy) / l.ry) ** 2 <= 1);

    let t = 0;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const cw = width / COLS;
      const ch = height / ROWS;
      const gap = 2;

      // Hotspots wander slowly inside the lung fields
      const spots = [
        { x: 6 + Math.sin(t * 0.6) * 1.8, y: 11 + Math.cos(t * 0.45) * 2.5, s: 2.6 },
        { x: 17.5 + Math.cos(t * 0.5) * 1.6, y: 7 + Math.sin(t * 0.7) * 2.8, s: 2.2 },
      ];
      const scan = ((t * 0.12) % 1) * ROWS;

      for (let j = 0; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++) {
          const x = i + 0.5;
          const y = j + 0.5;
          const lung = inLung(x, y);
          let heat = 0;
          if (lung) {
            for (const s of spots) {
              heat += Math.exp(-((x - s.x) ** 2 + (y - s.y) ** 2) / (2 * s.s * s.s));
            }
          }
          heat = Math.min(1, heat);
          const nearScan = Math.max(0, 1 - Math.abs(y - scan) / 1.2);
          const base = lung ? 0.1 : 0.035;
          ctx.fillStyle = `rgba(${fg[0]},${fg[1]},${fg[2]},${base + nearScan * 0.08})`;
          const px = i * cw + gap / 2;
          const py = j * ch + gap / 2;
          ctx.beginPath();
          ctx.roundRect(px, py, cw - gap, ch - gap, 2);
          ctx.fill();
          if (heat > 0.05) {
            ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${heat * 0.85})`;
            ctx.fill();
          }
        }
      }
    };

    if (reduced) {
      draw();
      return;
    }

    let raf = 0;
    let last = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 33) return;
      last = now;
      t += 0.033;
      draw();
    };
    draw();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <Frame label="Attention map over both lung fields">
      <canvas ref={ref} aria-hidden="true" className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]" />
    </Frame>
  );
}

/* Surgical tool detection: tracked bounding boxes inside a laparoscope view */
const TRACKS = [
  { id: 3, cls: "Grasper", w: 92, h: 58, path: "M70 70 C 120 110, 150 60, 190 95", anim: "track-a" },
  { id: 7, cls: "Hook", w: 70, h: 64, path: "M250 170 C 225 130, 280 110, 300 140", anim: "track-b" },
  { id: 12, cls: "Clipper", w: 64, h: 50, path: "M130 200 C 160 215, 200 190, 215 205", anim: "track-c" },
];

function DetectionTracking() {
  return (
    <Frame label="Tracked instruments across frames">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="scope" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--fg)" stopOpacity="0.07" />
            <stop offset="100%" stopColor="var(--fg)" stopOpacity="0.02" />
          </radialGradient>
        </defs>
        {/* circular field of view of a laparoscope */}
        <circle cx="200" cy="150" r="138" fill="url(#scope)" stroke="var(--border-strong)" />
        {TRACKS.map((tr) => (
          <path
            key={tr.id}
            d={tr.path}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.35"
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
        ))}
        {TRACKS.map((tr) => (
          <g key={tr.id} style={{ animation: `${tr.anim} ${8 + tr.id % 5}s ease-in-out infinite alternate` }}>
            <rect
              x={-tr.w / 2}
              y={-tr.h / 2}
              width={tr.w}
              height={tr.h}
              rx="3"
              fill="var(--accent)"
              fillOpacity="0.06"
              stroke="var(--accent)"
              strokeWidth="1.5"
            />
            <rect x={-tr.w / 2 - 0.75} y={-tr.h / 2 - 17} width={tr.cls.length * 6.2 + 34} height="16" rx="2" fill="var(--accent)" />
            <text
              x={-tr.w / 2 + 5}
              y={-tr.h / 2 - 5.5}
              fontSize="10"
              fontFamily="var(--font-sans)"
              fill="var(--bg)"
            >
              {tr.cls} · #{tr.id}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* NexGen: dispatch routes from a depot out to machines, with live vehicles */
const STOPS = [
  { x: 300, y: 70 },
  { x: 330, y: 160 },
  { x: 270, y: 235 },
  { x: 150, y: 245 },
  { x: 90, y: 90 },
  { x: 190, y: 55 },
];
const ROUTES = [
  "M200 150 C 230 120, 260 80, 300 70 C 330 95, 345 130, 330 160",
  "M200 150 C 225 185, 245 215, 270 235 C 225 255, 185 255, 150 245",
  "M200 150 C 160 140, 120 120, 90 90 C 125 65, 160 55, 190 55",
];

function DispatchRoutes() {
  return (
    <Frame label="Dispatch routes with live updates">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* faint street grid */}
        <g stroke="var(--border)" strokeWidth="1">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={40 + i * 40} y1="20" x2={40 + i * 40} y2="280" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1="20" y1={30 + i * 40} x2="380" y2={30 + i * 40} />
          ))}
        </g>
        {ROUTES.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--fg)" strokeOpacity="0.28" strokeWidth="1.5" />
        ))}
        {ROUTES.map((d, i) => (
          <path
            key={`v${i}`}
            d={d}
            pathLength={100}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="0.01 99.99"
            style={{ animation: `route-drive ${7 + i * 1.5}s linear infinite`, animationDelay: `${-i * 2}s` }}
          />
        ))}
        {STOPS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="5" fill="var(--bg-elevated)" stroke="var(--fg)" strokeOpacity="0.6" strokeWidth="1.5" />
        ))}
        <rect x="190" y="140" width="20" height="20" rx="4" fill="var(--fg)" />
        <text x="216" y="172" fontSize="10" fontFamily="var(--font-sans)" fill="var(--fg-muted)">
          Depot
        </text>
      </svg>
    </Frame>
  );
}

export function ProjectVisual({ slug }: { slug: string }) {
  if (slug === "pulmolens") return <AttentionMap />;
  if (slug === "surgical-tracking") return <DetectionTracking />;
  if (slug === "nexgen-vending") return <DispatchRoutes />;
  return null;
}
