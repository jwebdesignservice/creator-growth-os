"use client";

import { useEffect, useState } from "react";
import {
  Mic,
  MessageSquare,
  CalendarCheck,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

/**
 * "Creator Agent" — a timed tab/slider section. A 1:1 recreation of the
 * tr9.webflow.io "Tasking Agent" tabs block, rebuilt in our rose / ink system.
 *
 *   • full-width 50/50 split — left light panel, right dark textured panel.
 *   • left: oversized 2-line heading + "#2" index marker (top-right), then a
 *     stacked list of rows. One row is active at a time (light-grey bg + a 6px
 *     vertical progress bar on its far-left edge that fills top→bottom over the
 *     cycle). Thin dividers between inactive rows.
 *   • right: a request card → glowing brand node (with a glowing vertical
 *     connection line) → a result card, plus a supporting description. The
 *     whole right visual swaps with the active row.
 *
 * Auto-cycles every 5s (reference cadence); clicking a row jumps to it and the
 * timer restarts cleanly. Reference blue (#0033CC) → our rose accent.
 */

const DURATION = 5000; // ms each row stays active (matches the reference cadence)

type Slide = {
  title: string;
  desc: string;
  request: { initials: string; name: string; role: string; msg: string };
  result: {
    Icon: LucideIcon;
    label: string;
    sub: string;
    pill: string;
    badge: string;
    badgeTone: "rose" | "emerald";
  };
};

const SLIDES: Slide[] = [
  {
    title: "Auto-Reply to Comments & DMs",
    desc: "Drafts on-brand replies to your comments and DMs — you just review and send.",
    request: {
      initials: "ML",
      name: "Maya Lin",
      role: "Follower",
      msg: "Where's your ring light from? 😍",
    },
    result: {
      Icon: MessageSquare,
      label: "Comments & DMs",
      sub: "Instagram · TikTok",
      pill: "Inbox",
      badge: "1",
      badgeTone: "rose",
    },
  },
  {
    title: "Smart Post Scheduling",
    desc: "Turns a quick message into a fully scheduled post across Instagram, TikTok and YouTube.",
    request: {
      initials: "You",
      name: "You",
      role: "Creator",
      msg: "Post my Reel Tuesday at 6 PM",
    },
    result: {
      Icon: CalendarCheck,
      label: "Content Calendar",
      sub: "Reel · Tue 6:00 PM",
      pill: "Scheduled",
      badge: "✓",
      badgeTone: "emerald",
    },
  },
  {
    title: "Weekly Performance Digest",
    desc: "Pulls your week's reach, growth and engagement into one clear digest — automatically.",
    request: {
      initials: "You",
      name: "You",
      role: "Creator",
      msg: "How did this week go?",
    },
    result: {
      Icon: BarChart3,
      label: "Weekly Insights",
      sub: "Reach & growth",
      pill: "Report",
      badge: "✓",
      badgeTone: "emerald",
    },
  },
];

export function AgentShowcase() {
  const [active, setActive] = useState(0);

  // Auto-cycle. `active` in deps → the timer restarts cleanly whenever the row
  // changes (auto-advance OR manual click), so every row gets a full duration.
  useEffect(() => {
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % SLIDES.length),
      DURATION,
    );
    return () => window.clearInterval(id);
  }, [active]);

  const slide = SLIDES[active];

  return (
    <section className="w-full bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ── LEFT (light) ──────────────────────────────────────────── */}
        <div className="relative flex flex-col px-6 pt-12 sm:px-10 lg:min-h-screen lg:px-14 lg:pb-14 lg:pt-16">
          {/* heading + index */}
          <div className="relative">
            <span className="absolute right-0 top-2 text-[15px] font-medium text-ink-400">
              #2
            </span>
            <h2 className="font-sans text-[clamp(3rem,6.5vw,6rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-ink-900">
              Creator
              <br />
              Agent
            </h2>
          </div>

          {/* rows */}
          <div className="mt-auto pt-12 lg:pt-0">
            {SLIDES.map((s, i) => {
              const on = active === i;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "group relative block w-full overflow-hidden border-t border-ink-100 px-6 py-7 text-left transition-colors duration-300 last:border-b sm:px-8 lg:py-8",
                    on ? "bg-cream-100" : "hover:bg-cream-50",
                  )}
                >
                  {/* vertical progress bar (active only) */}
                  {on && (
                    <span
                      key={active}
                      aria-hidden
                      className="agent-progress absolute left-0 top-0 w-[5px] bg-rose-500"
                      style={{
                        animation: `agent-progress-fill ${DURATION}ms linear`,
                      }}
                    />
                  )}
                  <span
                    className={cn(
                      "block font-sans text-[clamp(1.4rem,2.2vw,1.9rem)] font-medium tracking-[-0.01em] transition-colors",
                      on ? "text-ink-900" : "text-ink-900/85 group-hover:text-ink-900",
                    )}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT (dark) ──────────────────────────────────────────── */}
        <div className="relative isolate min-h-[600px] overflow-hidden bg-ink-900 lg:min-h-screen">
          {/* texture + node glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(40% 32% at 50% 50%, rgba(208,129,113,0.18), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "clamp(54px,5vw,88px) clamp(54px,5vw,88px)",
            }}
          />

          {/* visual stack */}
          <div className="relative flex h-full flex-col justify-center px-6 py-14 sm:px-10 lg:px-12">
            <div className="relative mx-auto w-full max-w-[440px]">
              {/* glowing vertical connection line (behind everything) */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[12%] bottom-[12%] w-px -translate-x-1/2"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, transparent, rgba(224,168,158,0.7) 22%, rgba(217,182,107,0.7) 78%, transparent)",
                  boxShadow: "0 0 14px 1px rgba(208,129,113,0.5)",
                }}
              />

              {/* request card (top) */}
              <RequestCard slide={slide} keyId={active} />

              {/* brand node (center) */}
              <div className="relative my-7 flex justify-center">
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400/25 blur-3xl"
                />
                <span className="relative rounded-[26px] bg-gradient-to-br from-rose-400 via-rose-500 to-gold-400 p-[1.5px] shadow-[0_0_40px_-6px_rgba(208,129,113,0.6)]">
                  <span className="flex size-[clamp(84px,9vw,110px)] items-center justify-center rounded-[25px] bg-ink-900">
                    <BrandMark className="size-[46%] text-rose-300" />
                  </span>
                </span>
              </div>

              {/* result card (bottom) */}
              <ResultCard slide={slide} keyId={active} />
            </div>

            {/* supporting description */}
            <p
              key={active}
              className="absolute bottom-8 left-6 max-w-[420px] text-[14px] leading-relaxed text-white/55 sm:left-10 lg:left-12"
              style={{ animation: "brand-fade-in 0.4s ease both" }}
            >
              {slide.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Cards ───────────────────────────────────────────────────────────────── */

function Waveform() {
  const bars = [9, 15, 22, 13, 19, 26, 14, 20, 10];
  return (
    <span aria-hidden className="flex items-center gap-[3px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-white/55"
          style={{ height: h }}
        />
      ))}
    </span>
  );
}

function RequestCard({ slide, keyId }: { slide: Slide; keyId: number }) {
  const { initials, name, role, msg } = slide.request;
  return (
    <div className="relative z-10 rounded-[20px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-[12px] font-semibold uppercase text-white">
          {initials.slice(0, 2)}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[14.5px] font-semibold text-white">
            {name}
          </span>
          <span className="block text-[12.5px] text-white/45">{role}</span>
        </span>
        <span className="ml-auto flex items-center gap-3">
          <Waveform />
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-rose-400 text-ink-900">
            <Mic className="size-4" strokeWidth={2.2} />
          </span>
        </span>
      </div>
      <p
        key={keyId}
        className="mt-4 text-[clamp(1.05rem,1.5vw,1.3rem)] font-medium leading-snug text-white"
        style={{ animation: "brand-fade-in 0.4s ease both" }}
      >
        {msg}
      </p>
    </div>
  );
}

function ResultCard({ slide, keyId }: { slide: Slide; keyId: number }) {
  const { Icon, label, sub, pill, badge, badgeTone } = slide.result;
  return (
    <div
      key={keyId}
      className="relative z-10 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm"
      style={{ animation: "brand-fade-in 0.4s ease both" }}
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/25">
        <Icon className="size-[22px]" strokeWidth={2} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[14.5px] font-semibold text-white">
          {label}
        </span>
        <span className="block text-[12.5px] text-white/45">{sub}</span>
      </span>
      <span className="ml-auto inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white py-2 pl-3.5 pr-2 text-[13px] font-semibold text-ink-900">
        {pill}
        <span
          className={cn(
            "inline-flex size-[19px] items-center justify-center rounded-full text-[11px] font-bold text-white",
            badgeTone === "rose" ? "bg-rose-500" : "bg-emerald-500",
          )}
        >
          {badge}
        </span>
      </span>
    </div>
  );
}
