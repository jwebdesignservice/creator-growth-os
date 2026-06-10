"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MousePointer2 } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
  LinkedinIcon,
  SnapchatIcon,
} from "@/components/brand-icons";
import { BrandMark } from "@/components/brand-mark";

/**
 * Marketing "integrations" section — a circuit-board network: scattered
 * platform tiles wired to the central Profluencer hub by meandering rounded
 * traces, with a bright pulse continuously streaming along each trace toward
 * the hub (the "current flowing" effect). A few faint traces run off to the
 * edges so it reads as a real board, not a tidy radial diagram.
 *
 * One SVG carries the wires (shared 1000×620 viewBox); the tiles + hub + labels
 * are HTML positioned by percentage over the same space. All motion disables
 * under prefers-reduced-motion (globals.css → .flow-line / .reveal-*).
 */

/* Facebook + X + Pinterest glyphs (brand-icons.tsx ships the other five). */
function FacebookGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M13.5 21.5v-8h2.7l.41-3.1h-3.11V8.4c0-.9.25-1.51 1.55-1.51H17V4.12c-.3-.04-1.31-.13-2.47-.13-2.43 0-4.1 1.49-4.1 4.21v2.2H7.7v3.1h2.73v8h3.07Z" />
    </svg>
  );
}
function XGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M17.53 3h3.04l-6.64 7.59L21.75 21h-6.11l-4.79-6.26L5.37 21H2.33l7.1-8.12L2.25 3h6.27l4.33 5.72L17.53 3Zm-1.07 16.2h1.69L7.6 4.7H5.8L16.46 19.2Z" />
    </svg>
  );
}
function PinterestGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2 .03-2.87.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.48c0-1.39.8-2.43 1.8-2.43.85 0 1.26.64 1.26 1.4 0 .85-.54 2.13-.82 3.31-.24.99.5 1.8 1.47 1.8 1.77 0 3.13-1.87 3.13-4.56 0-2.38-1.71-4.05-4.15-4.05-2.83 0-4.49 2.12-4.49 4.31 0 .85.33 1.77.74 2.27.08.1.09.19.07.29-.08.32-.25 1-.28 1.14-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.47 0 6.16 2.47 6.16 5.77 0 3.45-2.17 6.22-5.18 6.22-1.01 0-1.97-.53-2.29-1.15l-.62 2.37c-.23.86-.83 1.94-1.24 2.6.93.29 1.92.44 2.95.44 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
    </svg>
  );
}

/* ── Shared 1000×620 coordinate space ──────────────────────────────────── */

// Viewbox cropped to the actual content band (y0 … y0+h). The tiles only live
// in y≈186–518, so cropping kills the dead space above/below the diagram and
// keeps the section tight under the CTA.
const VB = { x0: 0, y0: 150, w: 1000, h: 390 };
const pctX = (x: number) => `${((x - VB.x0) / VB.w) * 100}%`;
const pctY = (y: number) => `${((y - VB.y0) / VB.h) * 100}%`;

/** Orthogonal polyline → path string with rounded corners at each vertex. */
function roundedPath(pts: [number, number][], r = 18): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const inLen = Math.hypot(x1 - x0, y1 - y0) || 1;
    const outLen = Math.hypot(x2 - x1, y2 - y1) || 1;
    const rr = Math.min(r, inLen / 2, outLen / 2);
    const ax = x1 - ((x1 - x0) / inLen) * rr;
    const ay = y1 - ((y1 - y0) / inLen) * rr;
    const bx = x1 + ((x2 - x1) / outLen) * rr;
    const by = y1 + ((y2 - y1) / outLen) * rr;
    d += ` L ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${x1} ${y1} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

type Tile = {
  key: string;
  x: number;
  y: number;
  size: number;
  color: string;
  icon: ReactNode;
  /** Meandering trace from the tile to a hub edge. */
  route: [number, number][];
};

// Hub centred slightly low-of-centre (like the reference); ~128px.
const HUB = { x: 500, y: 352 };

const TILES: Tile[] = [
  {
    key: "youtube", x: 120, y: 250, size: 80, color: "#FF0000",
    icon: <YoutubeIcon size={34} />,
    route: [[120, 250], [235, 250], [235, 330], [436, 330]],
  },
  {
    key: "tiktok", x: 385, y: 232, size: 70, color: "#111111",
    icon: <TiktokIcon size={28} />,
    route: [[385, 232], [470, 232], [470, 288]],
  },
  {
    key: "linkedin", x: 865, y: 222, size: 72, color: "#0A66C2",
    icon: <LinkedinIcon size={28} />,
    route: [[865, 222], [865, 312], [564, 312]],
  },
  {
    key: "instagram", x: 305, y: 458, size: 78, color: "#C13584",
    icon: <InstagramIcon size={32} />,
    route: [[305, 458], [305, 392], [436, 392]],
  },
  {
    key: "facebook", x: 135, y: 482, size: 72, color: "#1877F2",
    icon: <FacebookGlyph size={30} />,
    route: [[135, 482], [300, 482], [300, 372], [436, 372]],
  },
  {
    key: "snapchat", x: 772, y: 330, size: 70, color: "#1A1816",
    icon: <SnapchatIcon size={30} />,
    route: [[772, 330], [652, 330], [652, 356], [564, 356]],
  },
  {
    key: "pinterest", x: 628, y: 458, size: 66, color: "#E60023",
    icon: <PinterestGlyph size={26} />,
    route: [[628, 458], [628, 416], [520, 416]],
  },
  {
    key: "x", x: 872, y: 470, size: 64, color: "#111111",
    icon: <XGlyph size={24} />,
    route: [[872, 470], [712, 470], [712, 376], [564, 376]],
  },
];

export function Integrations() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="integrations" className="scroll-mt-24 bg-cream-50">
      <div className="mx-auto max-w-[1120px] px-6 py-20 lg:py-28">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[640px] text-center">
          <span className="reveal-up inline-flex items-center rounded-full bg-rose-50 px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-rose-600">
            Integrations
          </span>
          <h2 className="reveal-up delay-1 mt-5 font-sans text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[2.75rem]">
            Seamlessly connect every platform
          </h2>
          <p className="reveal-up delay-2 mx-auto mt-4 max-w-[480px] text-[15.5px] leading-relaxed text-ink-500">
            Plan, publish and track Instagram, TikTok, YouTube, Snapchat and more —
            all wired into one workspace.
          </p>
          <Link
            href="/sign-up"
            className="reveal-up delay-3 mt-8 inline-flex h-12 items-center gap-2 rounded-[12px] bg-rose-600 px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            Explore Integrations
            <ArrowRight className="size-4" strokeWidth={2.4} />
          </Link>
        </div>

        {/* ── Circuit board ──────────────────────────────────────── */}
        <div className="reveal-scale relative mx-auto mt-8 w-full max-w-[960px] lg:mt-10">
          <div className="relative w-full" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
            {/* Wires */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`${VB.x0} ${VB.y0} ${VB.w} ${VB.h}`}
              fill="none"
              aria-hidden
            >
              {/* tile traces: base + flowing current */}
              {TILES.map((t, i) => {
                const d = roundedPath(t.route);
                return (
                  <g key={t.key}>
                    <path d={d} className="stroke-ink-100" strokeWidth={2} />
                    <path
                      d={d}
                      pathLength={100}
                      className="flow-line stroke-rose-500"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      style={{ animationDelay: `${(i * 0.7).toFixed(2)}s` } as CSSProperties}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Platform tiles */}
            {TILES.map((t) => (
              <span
                key={t.key}
                className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-[20px] border border-ink-100 bg-white shadow-[0_14px_34px_-14px_rgba(26,24,22,0.24)]"
                style={{
                  left: pctX(t.x),
                  top: pctY(t.y),
                  width: t.size,
                  height: t.size,
                  color: t.color,
                }}
              >
                {t.icon}
              </span>
            ))}

            {/* Central hub */}
            <span className="absolute z-10 inline-flex size-[128px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[30px] bg-rose-600 shadow-[0_24px_52px_-14px_rgba(185,72,92,0.55)]" style={{ left: pctX(HUB.x), top: pctY(HUB.y) }}>
              <BrandMark size={54} className="text-white" />
            </span>

            {/* Floating labels + cursors */}
            <span className="absolute left-[6%] top-[58%] inline-flex items-center rounded-full bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-md">
              Easy Integration
            </span>
            <MousePointer2 className="absolute left-[16%] top-[49%] size-5 fill-rose-500 text-rose-600" strokeWidth={1.5} />
            <span className="absolute right-[5%] bottom-[4%] inline-flex items-center rounded-full bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-md">
              Seamless Process
            </span>
            <MousePointer2 className="absolute right-[19%] bottom-[16%] size-5 fill-rose-500 text-rose-600" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
