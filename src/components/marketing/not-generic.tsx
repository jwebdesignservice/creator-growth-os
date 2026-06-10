"use client";

import { useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";

/**
 * "Not Generic / Creator Analytics" — a 1:1 recreation of the tr9.webflow.io
 * /compare split section, rebuilt on our rose/ink brand.
 *
 * Reference structure (captured via DevTools):
 *   • SECTION: flex row, border-top 1px rgba(255,255,255,0.2)
 *   • LEFT visual panel ~27% (a dark stage with concentric radar rings, a
 *     glowing gradient core + icon, and an equalizer waveform). In the
 *     reference this is a baked .avif — we recreate every element in CSS so it
 *     scales and carries our brand colour.
 *   • RIGHT content ~73%, flex column justify-between: small eyebrow + oversized
 *     two-line headline (accent line 1) pinned to the top, large paragraph
 *     pinned to the bottom — leaving the signature tall gap between them.
 * Reference blue (#168AE2) → our rose accent; sizes mapped from the reference's
 * 7.083vw headline / 2.083vw paragraph into bounded clamp()s.
 */

const ACCENT = "#D08171"; // rose-400 — brand equivalent of the reference accent

// Equalizer bar heights (0..1) — a deterministic "live signal" pattern, mirrored
// on each side of the core. Varied like an audio meter, not a flat row.
const WAVE = [
  0.28, 0.42, 0.34, 0.55, 0.72, 0.48, 0.36, 0.6, 0.86, 0.64, 0.46, 0.7, 0.52,
  0.34, 0.5, 0.3,
];

export function NotGeneric() {
  const ref = useRef<HTMLElement>(null);

  // Scroll-reveal: add `is-visible` once the section enters the viewport so the
  // `reveal-up` / `reveal-scale` children animate in (same pattern as the
  // Integrations section). Falls back to visible when IO is unavailable.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-white/15 bg-ink-900 text-white lg:flex lg:min-h-[680px]"
    >
      {/* ── Left: visual stage ─────────────────────────────────────── */}
      <div className="relative flex h-[300px] shrink-0 items-center justify-center overflow-hidden border-b border-white/10 bg-[#0E0D0C] sm:h-[360px] lg:h-auto lg:w-[27%] lg:min-w-[340px] lg:max-w-[440px] lg:border-b-0 lg:border-r lg:border-white/10">
        <Visual />
      </div>

      {/* ── Right: content ─────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col gap-10 px-6 py-12 sm:px-10 sm:py-14 lg:justify-between lg:gap-0 lg:px-14 lg:py-[clamp(2.5rem,4vw,3.75rem)]">
        <div>
          <div className="reveal-up text-[15px] font-medium text-white/50 sm:text-[16px]">
            Why Profluencer
          </div>
          <h2
            className="reveal-up delay-1 mt-7 font-sans font-bold leading-[1.0] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6.5rem)" }}
          >
            <span style={{ color: ACCENT }}>Not Generic</span>
            <br />
            Creator Analytics
          </h2>
        </div>

        <p
          className="reveal-up delay-2 max-w-[34ch] font-medium leading-[1.25] text-white/90 sm:max-w-[40ch]"
          style={{ fontSize: "clamp(1.125rem, 2.1vw, 1.875rem)" }}
        >
          Profluencer delivers platform-aware analytics built to handle real
          creator workflows with precision, clarity, and consistency. Unlike
          general-purpose dashboards, it&apos;s purpose-built for creators —
          where what you measure is what you actually grow.
        </p>
      </div>
    </section>
  );
}

/* ── Left visual — radar rings + glow + waveform + gradient core ───────── */

function Visual() {
  return (
    <div aria-hidden className="reveal-scale absolute inset-0">
      {/* ambient depth — warm core wash + a brighter top-left light source */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 30% 28%, rgba(224,168,158,0.16), transparent 60%)," +
            "radial-gradient(120% 95% at 50% 52%, rgba(151,56,74,0.20), transparent 66%)",
        }}
      />

      {/* concentric radar rings, centred on the core, fading outward */}
      <div className="absolute left-1/2 top-1/2">
        {[150, 250, 362, 482, 616].map((d, i) => (
          <span
            key={d}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: d,
              height: d,
              borderColor: `rgba(224,168,158,${0.34 - i * 0.052})`,
            }}
          />
        ))}
      </div>

      {/* layered glow behind the core */}
      <span
        className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(194,97,116,0.55), transparent 66%)",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(224,168,158,0.40), transparent 62%)",
        }}
      />

      {/* equalizer waveform — flanks the core at its vertical centre */}
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-6 sm:px-8">
        <Bars side="l" />
        <Bars side="r" />
      </div>

      {/* gradient core + icon — a glossy rose sphere */}
      <div
        className="absolute left-1/2 top-1/2 grid size-[clamp(120px,14.5vw,170px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-[0_24px_64px_-12px_rgba(194,97,116,0.7)]"
        style={{
          background:
            "radial-gradient(132% 132% at 30% 24%, #ECB3A4 0%, #D58575 26%, #C0526A 60%, #8E3445 100%)",
        }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/30" />
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(58% 48% at 32% 24%, rgba(255,255,255,0.42), transparent 60%)",
          }}
        />
        <TrendingUp className="relative size-[42%]" strokeWidth={2.3} />
      </div>
    </div>
  );
}

function Bars({ side }: { side: "l" | "r" }) {
  const bars = side === "l" ? WAVE : [...WAVE].reverse();
  return (
    <div className="flex items-center gap-[3px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] shrink-0 rounded-full bg-white/45"
          style={{ height: `${9 + h * 56}px` }}
        />
      ))}
    </div>
  );
}
