"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * Hero mouse-follow lighting — velocity-aware and very restrained.
 *
 * There is NO glow at rest. As the cursor moves, the layered warm glows
 * (coral · rose · gold) fade in and grow in proportion to mouse SPEED: a slow
 * drift barely lifts them; a quicker sweep brings them up to a soft, capped
 * peak; when the cursor stops they ease back to fully invisible. Each layer
 * trails the cursor with its own lag for an organic, parallax feel — soft radial
 * gradients only, no hard edges, no neon.
 *
 * Sits behind the content (pointer-events-none, z-0), blended into the ink
 * stage. Disabled under prefers-reduced-motion and on coarse / touch pointers
 * (no hovering cursor there — the hero's static mosaic carries the ambience).
 *
 * Performance: GPU transform + opacity only; one rAF that runs while moving /
 * fading and stops when fully idle; a passive listener; the hero rect is read on
 * move (not per frame).
 */

type Blob = {
  hx: number;
  hy: number;
  follow: number;
  lerp: number;
  size: string;
  gradient: string;
  blend: CSSProperties["mixBlendMode"];
  peak: number; // opacity at full velocity (the discrete ceiling)
};

const BLOBS: Blob[] = [
  {
    hx: 0.5, hy: 0.42, follow: 0.9, lerp: 0.12,
    size: "clamp(220px, 24vw, 440px)",
    gradient: "radial-gradient(circle closest-side, rgba(208,129,113,0.55), transparent)",
    blend: "screen", peak: 0.22,
  },
  {
    hx: 0.42, hy: 0.6, follow: 0.6, lerp: 0.08,
    size: "clamp(180px, 20vw, 380px)",
    gradient: "radial-gradient(circle closest-side, rgba(185,72,92,0.5), transparent)",
    blend: "screen", peak: 0.14,
  },
  {
    hx: 0.74, hy: 0.3, follow: 0.4, lerp: 0.06,
    size: "clamp(160px, 17vw, 320px)",
    gradient: "radial-gradient(circle closest-side, rgba(201,161,74,0.42), transparent)",
    blend: "soft-light", peak: 0.22,
  },
];

// Mouse speed (px/ms) that maps to full intensity — kept high so the effect
// stays discrete and only a brisk sweep approaches the (already gentle) peak.
const SPEED_REF = 3.2;

export function HeroSpotlight() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-blob]"));
    const cur = BLOBS.map((b) => ({ x: b.hx, y: b.hy }));
    let tx = 0.5;
    let ty = 0.42;
    let raf = 0;
    let hw = root.clientWidth;
    let hh = root.clientHeight;

    // velocity → intensity
    let speed = 0; // smoothed normalized speed (0..1), decays each frame
    let energy = 0; // eased intensity (0..1) driving opacity + scale
    let lx = 0;
    let ly = 0;
    let lt = 0;
    let primed = false;

    const frame = () => {
      speed *= 0.88; // no movement → speed falls away
      energy += (speed - energy) * 0.14;
      if (energy < 0.0015) energy = 0;
      const scale = 0.92 + energy * 0.13;

      let posMoving = false;
      for (let i = 0; i < els.length; i++) {
        const b = BLOBS[i];
        const dx = b.hx + b.follow * (tx - b.hx);
        const dy = b.hy + b.follow * (ty - b.hy);
        cur[i].x += (dx - cur[i].x) * b.lerp;
        cur[i].y += (dy - cur[i].y) * b.lerp;
        if (
          Math.abs(dx - cur[i].x) > 0.0004 ||
          Math.abs(dy - cur[i].y) > 0.0004
        ) {
          posMoving = true;
        }
        els[i].style.transform = `translate(-50%,-50%) translate3d(${
          cur[i].x * hw
        }px, ${cur[i].y * hh}px, 0) scale(${scale})`;
        els[i].style.opacity = String(b.peak * energy);
      }
      raf = posMoving || energy > 0.0015 ? requestAnimationFrame(frame) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      hw = r.width;
      hh = r.height;
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) return;

      // speed (px/ms) → normalized intensity input
      const now = performance.now();
      if (lt) {
        const dt = Math.max(now - lt, 8);
        const v = Math.hypot(e.clientX - lx, e.clientY - ly) / dt;
        const vN = Math.min(1, v / SPEED_REF);
        speed = vN > speed ? vN : speed * 0.7 + vN * 0.3;
      }
      lt = now;
      lx = e.clientX;
      ly = e.clientY;

      tx = x < 0 ? 0 : x > 1 ? 1 : x;
      ty = y < 0 ? 0 : y > 1 ? 1 : y;

      // snap to the cursor-influenced spot on the first move so the glow fades
      // in where the cursor is rather than drifting from home.
      if (!primed) {
        primed = true;
        for (let i = 0; i < cur.length; i++) {
          cur[i].x = BLOBS[i].hx + BLOBS[i].follow * (tx - BLOBS[i].hx);
          cur[i].y = BLOBS[i].hy + BLOBS[i].follow * (ty - BLOBS[i].hy);
        }
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      hw = root.clientWidth;
      hh = root.clientHeight;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {BLOBS.map((b, i) => (
        <span
          key={i}
          data-blob
          className="absolute left-0 top-0"
          style={{
            width: b.size,
            height: b.size,
            background: b.gradient,
            mixBlendMode: b.blend,
            opacity: 0, // no effect until the cursor moves
            willChange: "transform, opacity",
            transform: `translate(-50%,-50%) translate3d(${b.hx * 100}vw, ${
              b.hy * 100
            }vh, 0) scale(0.8)`,
          }}
        />
      ))}
    </div>
  );
}
