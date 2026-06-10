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

// High-res portrait crop (4:5) — sharp on retina, premium editorial feel.
const U = "?auto=format&fit=crop&w=1600&h=2000&q=82";

// Who actually uses Profluencer — creator personas across the whole journey,
// from a first post to a full-time creator business. Each row swaps to a
// hand-picked, premium creator-workspace photo (no faces, strong composition,
// consistent grading) so it reads as "built for *this* kind of creator".
//   New        → a clean, minimal first-setup desk
//   UGC        → a phone-on-gimbal mobile content rig
//   Influencer → a bright desk with a camera on a tripod (on-camera brand)
//   Full-time  → a cinematic editing station (the craft as a job)
//   Coaches    → a podcast / course recording desk (mixer + mic)
//   Side-hustle→ a moody after-hours desk with a studio mic
const NICHES: Niche[] = [
  { name: "New creators",            tag: "Starting out", img: `https://images.unsplash.com/photo-1611096002616-763f16ef15f3${U}` },
  { name: "UGC creators",            tag: "UGC",          img: `https://images.unsplash.com/photo-1697649272441-be6e4a563e9b${U}` },
  { name: "Influencers",             tag: "Audience",     img: `https://images.unsplash.com/photo-1616412875447-096e932d893c${U}` },
  { name: "Full-time creators",      tag: "Full-time",    img: `https://images.unsplash.com/photo-1627244714766-94dab62ed964${U}` },
  { name: "Coaches & educators",     tag: "Educators",    img: `https://images.unsplash.com/photo-1615458318132-1f151a3d18f4${U}` },
  { name: "Side-hustle creators",    tag: "Part-time",    img: `https://images.unsplash.com/photo-1659958661414-59d7bd483853${U}` },
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
        <div className="reveal-scale relative h-[68vw] max-h-[440px] self-stretch overflow-hidden rounded-[24px] bg-[#0E0D0C] shadow-[0_34px_80px_-34px_rgba(0,0,0,0.9)] ring-1 ring-white/12 lg:h-auto lg:max-h-none">
          {NICHES.map((n, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={n.name}
              src={n.img}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 size-full object-cover contrast-[1.04] saturate-[1.03] transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === active ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
              }`}
            />
          ))}

          {/* Consistent colour grade + legibility: a warm rose corner tint, a
              slight top darken for depth, and a strong base gradient so the
              caption always reads cleanly — unifying six different photos into
              one cohesive, on-brand treatment. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(115% 80% at 0% 0%, rgba(185,72,92,0.18), transparent 52%)," +
                "linear-gradient(180deg, rgba(26,24,22,0.22) 0%, transparent 26%, transparent 50%, rgba(26,24,22,0.62) 78%, rgba(26,24,22,0.95) 100%)",
            }}
          />
          {/* inner hairline seats the image on the dark section */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10"
          />

          {/* caption */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
            <div className="border-l-2 border-rose-400 pl-3.5">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/65">
                Built for
              </div>
              <div className="mt-1 text-[17px] font-semibold tracking-[-0.012em] text-white">
                {NICHES[active].name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
