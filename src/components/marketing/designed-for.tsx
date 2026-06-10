"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Designed for your niche" — a 1:1 recreation of the tr9.webflow.io
 * "Designed for Your Specialty" section, rebuilt on our dark rose/ink brand.
 *
 * Reference structure: a slim left label, a central stacked list of audience
 * categories with ONE light-highlighted active row, and a tall right-side image
 * that swaps to match the active row. Adapted from medical specialties to the
 * creator niches Profluencer is built for — so it reads as a clear "who this is
 * for" moment. Reference green → our rose-400 accent.
 */

type Niche = { name: string; tag: string; img: string };

const U =
  "?auto=format&fit=crop&w=900&q=80";

// Who actually uses Profluencer — creator personas across the whole journey,
// from a first post to a full-time creator business. The active row's image +
// caption reinforce "built for *this* kind of creator".
const NICHES: Niche[] = [
  { name: "New creators",            tag: "Starting out", img: `https://images.unsplash.com/photo-1598550880863-4e8aa3d0edb4${U}` },
  { name: "UGC creators",            tag: "UGC",          img: `https://images.unsplash.com/photo-1556745757-8d76bdb6984b${U}` },
  { name: "Influencers",             tag: "Audience",     img: `https://images.unsplash.com/photo-1611162616475-46b635cb6868${U}` },
  { name: "Full-time creators",      tag: "Full-time",    img: `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4${U}` },
  { name: "Coaches & educators",     tag: "Educators",    img: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f${U}` },
  { name: "Side-hustle creators",    tag: "Part-time",    img: `https://images.unsplash.com/photo-1499951360447-b19be8fe80f5${U}` },
];

export function DesignedFor() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Scroll-reveal — same IntersectionObserver pattern as the other sections.
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
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-white/15 bg-ink-900 text-white"
    >
      {/* ambient warm glow for depth (matches the other dark sections) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(55% 50% at 88% 6%, rgba(185,72,92,0.16), transparent 62%)," +
            "radial-gradient(40% 45% at 4% 96%, rgba(201,161,74,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-y-12 px-6 pt-16 pb-28 sm:px-10 sm:pt-20 sm:pb-36 lg:grid-cols-[200px_1fr_400px] lg:gap-x-14 lg:gap-y-0 lg:px-12 lg:pt-[clamp(4rem,6vw,7rem)] lg:pb-[clamp(7rem,11vw,12rem)]">

        {/* ── Left: supportive label ─────────────────────────────────── */}
        <div className="reveal-up self-start lg:sticky lg:top-24">
          <span className="block h-px w-8 bg-rose-400" />
          <p className="mt-5 text-[15px] font-medium leading-[1.5] text-white/90">
            Designed for
            <br />
            <span className="text-white/45">creators like you</span>
          </p>
          <p className="mt-4 max-w-[185px] text-[13px] font-medium leading-relaxed text-white/40">
            From your first post to full-time — Profluencer grows with you.
          </p>
        </div>

        {/* ── Center: the stacked niche list ─────────────────────────── */}
        <div className="reveal-up delay-1 lg:border-l lg:border-white/[0.13] lg:pl-12">
          {NICHES.map((n, i) => {
            const isActive = i === active;
            return (
              <button
                key={n.name}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`flex w-full items-center justify-between gap-4 border-b border-white/10 text-left transition-[background-color,padding,color] duration-300 ${
                  isActive ? "bg-white px-5 py-5 sm:px-6" : "px-1 py-5 sm:px-2"
                }`}
              >
                <span
                  className={`font-sans font-semibold tracking-[-0.015em] transition-colors ${
                    isActive ? "text-ink-900" : "text-white/80"
                  }`}
                  style={{ fontSize: "clamp(1.5rem, 2.55vw, 2.5rem)" }}
                >
                  {n.name}
                </span>
                <span
                  className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity duration-300 ${
                    isActive ? "text-rose-600 opacity-100" : "opacity-0"
                  }`}
                >
                  {n.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Right: image panel that swaps with the active row ──────── */}
        <div className="reveal-scale relative h-[64vw] max-h-[420px] self-stretch overflow-hidden rounded-[20px] bg-[#0E0D0C] ring-1 ring-white/10 lg:h-auto lg:max-h-none">
          {NICHES.map((n, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={n.name}
              src={n.img}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === active ? "scale-100 opacity-100" : "scale-[1.05] opacity-0"
              }`}
            />
          ))}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-transparent to-ink-900/10"
          />
          <div className="absolute bottom-5 left-5 border-l-2 border-rose-400 pl-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Built for
            </div>
            <div className="mt-0.5 text-[15px] font-semibold text-white">
              {NICHES[active].name}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
