import { ImageResponse } from "next/og";
import { identity } from "@/lib/content";

/**
 * Link preview card (X, LinkedIn, iMessage, Slack...). A still frame of the
 * homepage: the loss-landscape contours with one optimizer's descent, the
 * name, and the AsadGPT chat bar. Rendered once at build time.
 */

export const alt = `${identity.name}, ${identity.role}. Ask AsadGPT about his work.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Light theme tokens from globals.css
const BG = "#fbfaf8";
const FG = "#1b1a18";
const FG_MUTED = "#57544e";
const FG_FAINT = "#75716a";
const ACCENT = "#a8431f";

const SUBTITLE = `${identity.role} · ${identity.location}`;
const PLACEHOLDER = "Ask AsadGPT about Asad";

// Fixed version of LossLandscape's surface (no time, no randomness) so the
// card is the same on every build. Coordinates: y in [0, 1], x in [0, ASPECT].
const ASPECT = size.width / size.height;
const WELLS = [
  { cx: 0.32, cy: 0.66, depth: 0.95, width: 0.17 },
  { cx: 1.6, cy: 0.3, depth: 0.75, width: 0.15 },
  { cx: 1.3, cy: 0.82, depth: 0.6, width: 0.13 },
  { cx: 0.62, cy: 0.18, depth: 0.42, width: 0.14 },
];
const LEVEL_STEP = 0.075;
const CELL = 10;

const field = (x: number, y: number) => {
  let f = 0.35 * ((x - ASPECT / 2) ** 2 + (y - 0.5) ** 2);
  for (const w of WELLS) {
    const d2 = (x - w.cx) ** 2 + (y - w.cy) ** 2;
    f -= w.depth * Math.exp(-d2 / (2 * w.width * w.width));
  }
  return f + 0.06 * Math.sin(3.1 * x) * Math.cos(2.7 * y);
};

/** Marching squares over the field: one SVG path per contour level. */
function contours() {
  const cols = Math.ceil(size.width / CELL) + 1;
  const rows = Math.ceil(size.height / CELL) + 1;
  const v = new Float32Array(cols * rows);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const f = field((i * CELL) / size.height, (j * CELL) / size.height);
      v[j * cols + i] = f;
      min = Math.min(min, f);
      max = Math.max(max, f);
    }
  }

  const paths: { d: string; index: boolean }[] = [];
  for (let k = Math.ceil(min / LEVEL_STEP); k <= Math.floor(max / LEVEL_STEP); k++) {
    const level = k * LEVEL_STEP;
    let d = "";
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = v[j * cols + i];
        const b = v[j * cols + i + 1];
        const c = v[(j + 1) * cols + i + 1];
        const e = v[(j + 1) * cols + i];
        const x = i * CELL;
        const y = j * CELL;
        // Where the level crosses each edge of the cell (top, right, bottom, left)
        const hits: [number, number][] = [];
        if (a < level !== b < level) hits.push([x + ((level - a) / (b - a)) * CELL, y]);
        if (b < level !== c < level) hits.push([x + CELL, y + ((level - b) / (c - b)) * CELL]);
        if (e < level !== c < level) hits.push([x + ((level - e) / (c - e)) * CELL, y + CELL]);
        if (a < level !== e < level) hits.push([x, y + ((level - a) / (e - a)) * CELL]);
        for (let h = 0; h + 1 < hits.length; h += 2) {
          const [p, q] = [hits[h], hits[h + 1]];
          d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        }
      }
    }
    if (d) paths.push({ d, index: k % 5 === 0 });
  }
  return paths;
}

/** Gradient descent with momentum from high ground, as the homepage runs it. */
function descent() {
  let x = 0.1;
  let y = 0.12;
  let vx = 0;
  let vy = 0;
  const e = 1e-3;
  const points: string[] = [];
  for (let s = 0; s < 260; s++) {
    const gx = (field(x + e, y) - field(x - e, y)) / (2 * e);
    const gy = (field(x, y + e) - field(x, y - e)) / (2 * e);
    vx = 0.92 * vx - 0.0002 * gx;
    vy = 0.92 * vy - 0.0002 * gy;
    x += vx;
    y += vy;
    points.push(`${(x * size.height).toFixed(1)},${(y * size.height).toFixed(1)}`);
  }
  return { points: points.join(" "), end: { x: x * size.height, y: y * size.height } };
}

// Subset to just the glyphs the card uses; Google serves TTF to non-browser
// user agents, which is what the image renderer needs
async function googleFont(family: string, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@400&text=${encodeURIComponent(text)}`,
  ).then((res) => res.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`Could not load font ${family}`);
  return fetch(url).then((res) => res.arrayBuffer());
}

export default async function Image() {
  const [newsreader, inter] = await Promise.all([
    googleFont("Newsreader", identity.name),
    googleFont("Inter", SUBTITLE + PLACEHOLDER),
  ]);
  const lines = contours();
  const trail = descent();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          position: "relative",
        }}
      >
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {lines.map((l, i) => (
            <path key={i} d={l.d} stroke={FG} strokeOpacity={l.index ? 0.16 : 0.075} strokeWidth={1} fill="none" />
          ))}
          <polyline points={trail.points} stroke={ACCENT} strokeOpacity={0.55} strokeWidth={2} fill="none" />
          <circle cx={trail.end.x} cy={trail.end.y} r={9} fill={ACCENT} fillOpacity={0.14} />
          <circle cx={trail.end.x} cy={trail.end.y} r={4} fill={ACCENT} />
        </svg>

        {/* Fades the contours behind the text, like the homepage's mask */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(ellipse 45% 50% at 50% 50%, ${BG} 30%, rgba(251,250,248,0) 100%)`,
          }}
        />

        <div
          style={{
            fontFamily: "Newsreader",
            fontSize: 128,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: FG,
          }}
        >
          {identity.name}
        </div>
        <div style={{ marginTop: 28, fontFamily: "Inter", fontSize: 30, color: FG_MUTED }}>
          {SUBTITLE}
        </div>

        <div
          style={{
            marginTop: 56,
            width: 640,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 10px 10px 28px",
            background: "#ffffff",
            border: "1.5px solid rgba(27,26,24,0.2)",
            borderRadius: 18,
            boxShadow: "0 4px 18px rgba(27,26,24,0.08)",
          }}
        >
          <div style={{ fontFamily: "Inter", fontSize: 27, color: FG_FAINT }}>{PLACEHOLDER}</div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: FG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5m0 0l-6 6m6-6l6 6"
                stroke={BG}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader, style: "normal", weight: 400 },
        { name: "Inter", data: inter, style: "normal", weight: 400 },
      ],
    },
  );
}
