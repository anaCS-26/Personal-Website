"use client";

import { useEffect, useRef } from "react";

/**
 * Background canvas: contour lines of a slowly shifting loss surface, with a
 * few optimizers running gradient descent (with momentum) across it. The
 * cursor raises a hill in the surface, bending the contours and pushing the
 * optimizers away. Reduced motion gets a single static frame.
 */

type Optimizer = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  still: number; // frames spent converged
  age: number;
  fade: number; // 0..1, used for spawn/despawn
};

type Well = { ax: number; ay: number; fx: number; fy: number; px: number; depth: number; width: number };

const LEVEL_STEP = 0.075;
const TRAIL_LEN = 220;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function LossLandscape({
  className = "",
  cell = 12,
  optimizers: optimizerCount = 3,
  dimmed = false,
}: {
  className?: string;
  /** Grid resolution in CSS px; smaller is smoother and more expensive. */
  cell?: number;
  optimizers?: number;
  dimmed?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef(dimmed);
  useEffect(() => {
    dimRef.current = dimmed;
  }, [dimmed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let aspect = 1;
    let cols = 0;
    let rows = 0;
    let values = new Float32Array(0);

    // Randomized per mount so the landscape differs a little on each visit
    const rand = Math.random;
    const wells: Well[] = Array.from({ length: 4 }, (_, i) => ({
      ax: 0.2 + rand() * 0.25,
      ay: 0.15 + rand() * 0.2,
      fx: 0.05 + rand() * 0.06,
      fy: 0.04 + rand() * 0.06,
      px: rand() * Math.PI * 2 + i,
      depth: 0.55 + rand() * 0.45,
      width: 0.13 + rand() * 0.1,
    }));

    const pointer = { x: -10, y: -10, strength: 0, target: 0 };
    let t = rand() * 100;

    // Normalized coordinates: y in [0, 1], x in [0, aspect]
    const field = (x: number, y: number) => {
      let f = 0.35 * ((x - aspect / 2) ** 2 + (y - 0.5) ** 2);
      for (const w of wells) {
        const cx = aspect / 2 + Math.cos(t * w.fx + w.px) * w.ax * aspect;
        const cy = 0.5 + Math.sin(t * w.fy + w.px * 1.3) * w.ay;
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        f -= w.depth * Math.exp(-d2 / (2 * w.width * w.width));
      }
      f += 0.06 * Math.sin(3.1 * x + t * 0.07) * Math.cos(2.7 * y - t * 0.05);
      if (pointer.strength > 0.001) {
        const d2 = (x - pointer.x) ** 2 + (y - pointer.y) ** 2;
        f += 0.9 * pointer.strength * Math.exp(-d2 / (2 * 0.06 * 0.06));
      }
      return f;
    };

    // Start on high ground (best of a few random candidates) so each run
    // makes a long, visible descent
    const spawn = (): Optimizer => {
      let bx = 0;
      let by = 0;
      let best = -Infinity;
      for (let i = 0; i < 6; i++) {
        const x = aspect * (0.05 + rand() * 0.9);
        const y = 0.05 + rand() * 0.9;
        const f = field(x, y);
        if (f > best) {
          best = f;
          bx = x;
          by = y;
        }
      }
      return { x: bx, y: by, vx: 0, vy: 0, trail: [], still: 0, age: 0, fade: 0 };
    };
    let opts: Optimizer[] = [];

    let fg: [number, number, number] = [0, 0, 0];
    let accent: [number, number, number] = [0, 0, 0];
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      fg = hexToRgb(s.getPropertyValue("--fg"));
      accent = hexToRgb(s.getPropertyValue("--accent"));
    };
    readColors();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      aspect = width / height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;
      values = new Float32Array(cols * rows);
      opts = Array.from({ length: optimizerCount }, spawn);
    };

    const step = () => {
      pointer.strength += (pointer.target - pointer.strength) * 0.06;
      for (let i = 0; i < opts.length; i++) {
        const o = opts[i];
        const e = 1e-3;
        const gx = (field(o.x + e, o.y) - field(o.x - e, o.y)) / (2 * e);
        const gy = (field(o.x, o.y + e) - field(o.x, o.y - e)) / (2 * e);
        o.vx = 0.92 * o.vx - 0.0002 * gx;
        o.vy = 0.92 * o.vy - 0.0002 * gy;
        o.age++;
        o.x += o.vx;
        o.y += o.vy;
        o.trail.push({ x: o.x, y: o.y });
        if (o.trail.length > TRAIL_LEN) o.trail.shift();

        const speed = Math.hypot(o.vx, o.vy);
        o.still = speed < 0.0006 ? o.still + 1 : 0;
        const out = o.x < -0.1 || o.x > aspect + 0.1 || o.y < -0.1 || o.y > 1.1;
        if (o.still > 120 || o.age > 900 || out) {
          o.fade -= 0.02;
          if (o.fade <= 0) opts[i] = spawn();
        } else if (o.fade < 1) {
          o.fade = Math.min(1, o.fade + 0.02);
        }
      }
    };

    const draw = () => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const dim = dimRef.current ? 0.45 : 1;

      // Sample the field on the grid
      let min = Infinity;
      let max = -Infinity;
      for (let j = 0; j < rows; j++) {
        const y = (j * cell) / height;
        for (let i = 0; i < cols; i++) {
          const v = field((i * cell) / height, y);
          values[j * cols + i] = v;
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }

      // Marching squares, one path per contour level. Every fifth level is an
      // "index contour", drawn heavier like on a topographic map.
      const first = Math.ceil(min / LEVEL_STEP);
      const last = Math.floor(max / LEVEL_STEP);
      ctx.lineWidth = 1;
      for (let k = first; k <= last; k++) {
        const level = k * LEVEL_STEP;
        const index = k % 5 === 0;
        ctx.strokeStyle = `rgba(${fg[0]},${fg[1]},${fg[2]},${(index ? 0.16 : 0.075) * dim})`;
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const a = values[j * cols + i];
            const b = values[j * cols + i + 1];
            const c = values[(j + 1) * cols + i + 1];
            const d = values[(j + 1) * cols + i];
            const code = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (code === 0 || code === 15) continue;
            const x0 = i * cell;
            const y0 = j * cell;
            const top = x0 + ((level - a) / (b - a)) * cell;
            const right = y0 + ((level - b) / (c - b)) * cell;
            const bottom = x0 + ((level - d) / (c - d)) * cell;
            const left = y0 + ((level - a) / (d - a)) * cell;
            const seg = (x1: number, y1: number, x2: number, y2: number) => {
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
            };
            switch (code) {
              case 1: case 14: seg(x0, left, bottom, y0 + cell); break;
              case 2: case 13: seg(bottom, y0 + cell, x0 + cell, right); break;
              case 3: case 12: seg(x0, left, x0 + cell, right); break;
              case 4: case 11: seg(top, y0, x0 + cell, right); break;
              case 5: seg(x0, left, top, y0); seg(bottom, y0 + cell, x0 + cell, right); break;
              case 6: case 9: seg(top, y0, bottom, y0 + cell); break;
              case 7: case 8: seg(x0, left, top, y0); break;
              case 10: seg(x0, left, bottom, y0 + cell); seg(top, y0, x0 + cell, right); break;
            }
          }
        }
        ctx.stroke();
      }

      // Optimizer trails (fading toward the tail) and heads
      for (const o of opts) {
        const n = o.trail.length;
        for (let i = 1; i < n; i++) {
          const p = o.trail[i - 1];
          const q = o.trail[i];
          const alpha = (i / n) * 0.85 * o.fade * dim;
          ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(p.x * height, p.y * height);
          ctx.lineTo(q.x * height, q.y * height);
          ctx.stroke();
        }
        const hx = o.x * height;
        const hy = o.y * height;
        ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${0.9 * o.fade * dim})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${0.3 * o.fade * dim})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hx, hy, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    resize();

    if (reduced) {
      // Static frame: let the optimizers run their course, then draw once
      for (const o of opts) o.fade = 1;
      for (let i = 0; i < 220; i++) step();
      draw();
      const ro = new ResizeObserver(() => {
        resize();
        for (const o of opts) o.fade = 1;
        for (let i = 0; i < 220; i++) step();
        draw();
      });
      ro.observe(canvas);
      const mo = new MutationObserver(() => {
        readColors();
        draw();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => {
        ro.disconnect();
        mo.disconnect();
      };
    }

    let raf = 0;
    let last = 0;
    let visible = true;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      // ~40fps is plenty for slow contours and keeps the main thread light
      if (now - last < 24) return;
      last = now;
      t += 0.016;
      step();
      draw();
    };
    raf = requestAnimationFrame(loop);

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      pointer.target = inside && e.pointerType === "mouse" ? 1 : 0;
      pointer.x = (e.clientX - rect.left) / rect.height;
      pointer.y = (e.clientY - rect.top) / rect.height;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [cell, optimizerCount]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
