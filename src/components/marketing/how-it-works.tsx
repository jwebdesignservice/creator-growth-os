"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/cn";

/**
 * "How It Works" — a masked, state-based sticky snap-slider.
 *
 * The keyword column is clipped to exactly THREE rows. "Creator" stays sticky on
 * the left and the active word always aligns with it; the inactive visible rows
 * above/below are muted and fade toward the mask edges. The section pins while a
 * tall runway drives discrete states — the visual only ever rests on a locked
 * state (CSS-eased between them, never halfway), and the scroll magnetically
 * snaps to the nearest state when it settles.
 *
 * Locked states (per the blueprint):
 *   • state 0 — "Creator" aligns with the TOP row (Posting); Planning/Managing
 *     muted below.
 *   • state ≥1 — "Creator" holds at the MIDDLE row; the column scrolls up so the
 *     active word sits at the middle with one muted word above and one below.
 */

const PREFIX = "Creator";
const WORDS = ["Posting", "Planning", "Managing", "Tutorials", "Programs", "Events"];
const N = WORDS.length;

// One supporting line per keyword — shown in the lower zone and revealed
// word-by-word (left to right) whenever the active keyword changes.
const PARAS = [
  "Schedule once and auto-publish to Instagram, TikTok and YouTube. Every post goes live at your best time — no manual uploads.",
  "Map a whole week of content on one shared calendar. Drag to reschedule Reels, carousels and long-form across every platform in seconds.",
  "Run every connected account from a single workspace. Track followers, reach and engagement week over week, so you always know what's working.",
  "Short, searchable how-to videos for every tool and tactic. Hit play and apply the exact skill you need — in minutes, not hours.",
  "Follow a guided path of bite-size video lessons. Modules build from setup to growth, so you always know your next step.",
  "Host and join live workshops, AMAs and challenges. Bring your community together and turn passive watchers into a loyal following.",
];

const ROW = "clamp(150px, 21vh, 190px)"; // ≈ reference 174px/819 row
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const STATE_VH = 0.72; // scroll runway (in viewports) allotted to each state step

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [state, setState] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const progress = total > 0 ? scrolled / total : 0;
      const s = Math.max(0, Math.min(N - 1, Math.round(progress * (N - 1))));
      setState((prev) => (prev === s ? prev : s));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const aiRow = Math.min(state, 1); // 0 (top) for state 0, else 1 (middle)
  const listShift = Math.max(state - 1, 0); // column scroll once "Creator" holds

  const trans = `transform 0.6s ${EASE}`;
  const rowVar = { ["--row" as string]: ROW } as CSSProperties;
  const fadeMask =
    "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)";

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${(N - 1) * STATE_VH * 100 + 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-ink-900 text-white">
        {/* depth — subtle warm glow + faint grain grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(70% 55% at 32% 50%, rgba(208,129,113,0.06), transparent 70%)",
          }}
        />
        {/* ── Desktop: centered, balanced grid ─────────────────────── */}
        <div className="absolute inset-0 hidden lg:block" style={rowVar}>
          {/* vertical column divider — full height */}
          <span
            aria-hidden
            className="absolute bottom-0 left-[30%] top-0 w-px bg-white/[0.09]"
          />

          {/* "How It Works" — sits in the top margin, above the grid */}
          <span
            className="absolute left-[30%] pl-10 text-[14px] font-medium tracking-tight text-white xl:pl-14"
            style={{ top: "calc(50% - 1.5 * var(--row) - clamp(2.5rem,6vh,4.5rem))" }}
          >
            How It Works
          </span>

          {/* 3-row keyword window — vertically centred (active row = 50%) so
              the header margin above balances the empty margin below */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2"
            style={{ height: "calc(3 * var(--row))" }}
          >
            {/* top + bottom lines span full width; the two middle dividers
                stay inside the keyword column so the "Creator" cell is clean */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.1]" />
            <span aria-hidden className="absolute left-[30%] right-0 h-px bg-white/[0.07]" style={{ top: "var(--row)" }} />
            <span aria-hidden className="absolute left-[30%] right-0 h-px bg-white/[0.07]" style={{ top: "calc(2 * var(--row))" }} />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.1]" />

            {/* "Creator" — left column, slides to the active row */}
            <div
              className="absolute left-0 top-0 flex w-[30%] items-center pl-6 sm:pl-9 xl:pl-12"
              style={{
                height: "var(--row)",
                transform: `translateY(calc(${aiRow} * var(--row)))`,
                transition: trans,
              }}
            >
              <span className="font-sans text-[clamp(2.53rem,6.9vw,6.44rem)] font-semibold leading-[1.0] tracking-[-0.035em] text-white">
                {PREFIX}
              </span>
            </div>

            {/* keyword window — right column, masked + scrolling */}
            <div
              className="absolute left-[30%] right-0 top-0 overflow-hidden"
              style={{
                height: "calc(3 * var(--row))",
                WebkitMaskImage: fadeMask,
                maskImage: fadeMask,
              }}
            >
              <div
                style={{
                  transform: `translateY(calc(-${listShift} * var(--row)))`,
                  transition: trans,
                }}
              >
                {WORDS.map((w, i) => (
                  <div
                    key={w}
                    className="flex items-center pl-10 xl:pl-14"
                    style={{ height: "var(--row)" }}
                  >
                    <span
                      className={cn(
                        "font-sans text-[clamp(2.53rem,6.9vw,6.44rem)] font-semibold leading-[1.0] tracking-[-0.035em] transition-colors duration-500",
                        state === i ? "text-rose-400" : "text-[#56524c]",
                      )}
                    >
                      {w}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* supporting line — lower zone, word-by-word reveal per keyword.
              Aligned with the keyword column; re-keyed on `state` so it replays
              the staggered animation each time the active word changes. */}
          <WordReveal
            key={state}
            text={PARAS[state]}
            className="absolute left-[30%] max-w-[34rem] pl-10 pr-6 text-[clamp(0.95rem,1.1vw,1.1rem)] font-medium leading-relaxed text-white/55 xl:pl-14"
            style={{ top: "calc(50% + 1.5 * var(--row) + clamp(1.5rem,3.5vh,2.75rem))" }}
          />
        </div>

        {/* ── Mobile / tablet ───────────────────────────────────────── */}
        <div
          className="flex h-full flex-col items-start justify-center px-6 sm:px-9 lg:hidden"
          style={rowVar}
        >
          <span className="mb-2 font-sans text-[clamp(2.07rem,9.2vw,2.99rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
            {PREFIX}
          </span>
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: "calc(3 * var(--row) * 0.62)",
              WebkitMaskImage: fadeMask,
              maskImage: fadeMask,
            }}
          >
            <div
              style={{
                transform: `translateY(calc(-${state} * var(--row) * 0.62))`,
                transition: trans,
              }}
            >
              {WORDS.map((w, i) => (
                <div
                  key={w}
                  className="flex items-center"
                  style={{ height: "calc(var(--row) * 0.62)" }}
                >
                  <span
                    className={cn(
                      "font-sans text-[clamp(2.07rem,9.2vw,2.99rem)] font-semibold leading-[1.0] tracking-[-0.03em] transition-colors duration-500",
                      state === i ? "text-rose-400" : "text-[#56524c]",
                    )}
                  >
                    {w}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <WordReveal
            key={state}
            text={PARAS[state]}
            className="mt-7 max-w-[28rem] text-[clamp(0.95rem,3.6vw,1.05rem)] font-medium leading-relaxed text-white/55"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Splits a line into words and reveals them left-to-right: each word is an
 * inline-block span that slides + fades in, staggered by a small per-word
 * delay (see the `.hiw-word` keyframe in globals.css). Real space text nodes
 * sit between words so the line still wraps naturally. Remounting (via a
 * `key`) replays the whole sequence.
 */
function WordReveal({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <p className={className} style={style}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="hiw-word" style={{ animationDelay: `${i * 45}ms` }}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
