"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * "Proven Results. Powerful Impact." — a horizontal expanding-panel stats
 * accordion. A 1:1 recreation of the tr9.webflow.io section, rebuilt in our
 * rose / ink / cream language.
 *
 * A fixed white heading panel on the left; four colour panels on the right.
 * The hovered / focused panel expands to reveal a large stat while the others
 * collapse to thin numbered strips; on mouse-leave it settles back on the
 * featured first panel. Below `lg` it stacks: heading block + stat cards.
 *
 * Reference mechanics (measured via DevTools):
 *   • each panel `flex: 1 1 <basis>`; active basis 100%, collapsed 16% — with
 *     flex-shrink this renders ≈ 68% / 11% / 11% / 11%.
 *   • transition `flex-basis 0.6s cubic-bezier(0.645,0.045,0.355,1)`.
 *   • full-bleed (no outer frame); heading 56px / weight 400 / line-height 1.0.
 *   • blue ramp #168AE2 → #00269B → #001A6A → #000D39 mapped to a rose ramp
 *     (bright → near-black wine, with a deliberate jump after the first panel).
 */

const EASE = "cubic-bezier(0.645, 0.045, 0.355, 1)";

type Stat = { n: string; value: string; label: string; bg: string; img?: string };

// Rose ramp mirroring the reference's blue lightness curve: a bright lead
// panel, then a hard drop into a tight family of deep wines. The first and last
// panels carry a real photo (from /public); the middle two keep the solid wine.
const STATS: Stat[] = [
  { n: "01", value: "2,000+", label: "Creators on Profluencer", bg: "#CD6178", img: "/Users%20Img.jpg" },
  { n: "02", value: "92%", label: "Post more consistently", bg: "#8A2540" },
  { n: "03", value: "3×", label: "Faster audience growth", bg: "#5E1E30" },
  { n: "04", value: "80%", label: "Less time spent planning", bg: "#36141F", img: "/Less%20time%20spent.jpg" },
];

function Heading() {
  return (
    <h2 className="font-sans text-[clamp(2.4rem,4vw,3.5rem)] font-semibold leading-[1.0] tracking-[-0.02em]">
      <span className="block text-ink-900">Proven Results.</span>
      <span className="block text-rose-500">Powerful Impact.</span>
    </h2>
  );
}

/**
 * Blurred pixel cluster — the reference's corner motif, re-keyed to brand
 * accents (rose + gold + cream, no off-brand greens).
 */
function PixelDeco() {
  const accents: Record<number, string> = {
    7: "bg-gold-400/70",
    8: "bg-rose-200/70",
    12: "bg-gold-500/55",
    13: "bg-gold-400/85",
    14: "bg-rose-300/70",
    15: "bg-cream-200/80",
    19: "bg-rose-300/60",
    20: "bg-rose-500/90",
    21: "bg-rose-400/75",
    25: "bg-rose-200/45",
    26: "bg-rose-600/80",
    27: "bg-gold-400/45",
  };
  return (
    <div aria-hidden className="w-44 sm:w-52" style={{ filter: "blur(6px)" }}>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square rounded-[2px]",
              accents[i] ?? "bg-cream-100/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function ProvenResults() {
  // Featured panel index. `0` on load and after the cursor leaves the
  // accordion — mirrors the reference settling on its first panel.
  const [active, setActive] = useState(0);

  return (
    <section id="results" className="bg-ink-900">
      {/* ── Desktop: white heading panel + expanding accordion ─────── */}
      <div className="hidden h-[80vh] min-h-[560px] w-full overflow-hidden lg:flex">
        {/* Heading panel */}
        <div className="relative flex w-[26%] min-w-[340px] shrink-0 flex-col bg-white px-10 py-14 xl:px-12">
          <Heading />
          <div className="mt-auto pt-10">
            <PixelDeco />
          </div>
        </div>

        {/* Accordion */}
        <div
          className="flex min-w-0 flex-1"
          onMouseLeave={() => setActive(0)}
        >
          {STATS.map((s, i) => {
            const on = active === i;
            return (
              <button
                key={s.n}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-label={`${s.value} — ${s.label}`}
                className="group relative h-full min-w-0 cursor-pointer overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60"
                style={{
                  backgroundColor: s.bg,
                  flexBasis: on ? "100%" : "16%",
                  flexGrow: 1,
                  flexShrink: 1,
                  transition: `flex-basis 0.6s ${EASE}`,
                }}
              >
                {/* photo (first + last panels) — beneath the depth + text layers */}
                {s.img && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.img}
                      alt=""
                      className="pointer-events-none absolute inset-0 size-full object-cover"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-ink-900/45"
                    />
                  </>
                )}

                {/* depth — soft studio light (top) + grounding vignette (bottom) */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-28 size-96 rounded-full bg-white/14 blur-[90px]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "radial-gradient(120% 90% at 78% 8%, rgba(255,255,255,0.10), transparent 55%)",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/45 via-black/[0.08] to-transparent"
                />

                {/* number */}
                <span className="absolute left-8 top-9 z-10 text-[14px] font-medium tracking-[0.16em] text-white/85">
                  {s.n}
                </span>

                {/* stat — only on the active panel */}
                <div
                  className={cn(
                    "absolute bottom-11 left-8 right-7 z-10 transition-all duration-500",
                    on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                  style={{ transitionDelay: on ? "0.18s" : "0s" }}
                >
                  <div className="font-sans text-[clamp(3.5rem,6vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-white [font-variant-numeric:tabular-nums]">
                    {s.value}
                  </div>
                  <div className="mt-4 text-[17px] leading-snug text-white/80">
                    {s.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile / tablet: heading block + stacked stat bands ─────── */}
      <div className="lg:hidden">
        <div className="bg-white px-6 py-12 sm:px-10 sm:py-14">
          <Heading />
          <div className="mt-10">
            <PixelDeco />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {STATS.map((s) => (
            <div
              key={s.n}
              className="relative flex aspect-[16/10] flex-col justify-between overflow-hidden p-7 sm:p-8"
              style={{ backgroundColor: s.bg }}
            >
              {s.img && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.img}
                    alt=""
                    className="pointer-events-none absolute inset-0 size-full object-cover"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-ink-900/45"
                  />
                </>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-14 -top-16 size-56 rounded-full bg-white/12 blur-2xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/40 to-transparent"
              />
              <span className="relative z-10 text-[13px] font-medium tracking-[0.16em] text-white/85">
                {s.n}
              </span>
              <div className="relative z-10">
                <div className="font-sans text-[clamp(2.75rem,11vw,3.75rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-white [font-variant-numeric:tabular-nums]">
                  {s.value}
                </div>
                <div className="mt-2.5 text-[15px] text-white/80">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
