"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Sparkles,
  Play,
  Images,
  Film,
  TrendingUp,
  CalendarClock,
  Radio,
  Users,
} from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

/**
 * Section 4 — "Creator OS" stacked product showcase.
 *
 * A 1:1 recreation of the tr9.webflow.io "Our Products → Scheduling Agent"
 * section, rebuilt in the Profluencer rose / ink / cream system:
 *   • a light (cream) intro: top-left label · oversized headline · top-right
 *     index marker — mirroring "Our Products / Scheduling Agent / #1".
 *   • a sequence of dark (ink-900) numbered cards that PIN (position: sticky) at
 *     the SAME top offset and stack as you scroll. As the next card slides up to
 *     cover the active one, the covered card eases back + lightens (a scroll-
 *     driven `--recede` var, 0→1). At rest only the active card shows; during a
 *     transition the previous card peeks above it — exactly like the reference.
 *   • each card: left number · centre title + bottom-anchored paragraph · right
 *     product mockup that bleeds off the card's right edge.
 *
 * Reference greens → our rose accent; sharp corners → our rounded system. All
 * scroll motion is disabled below `lg` and under prefers-reduced-motion (cards
 * fall back to a clean vertical stack).
 */

const STICK_TOP = 76; // px — where every card pins (the page has no fixed nav)
const RECEDE_DISTANCE = 460; // px of approach over which a covered card recedes
const CARD_H = "lg:h-[clamp(460px,62vh,544px)]";

type Feature = { n: string; title: string; body: string; mockup: ReactNode };

export function StackedFeatures() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wideMq = window.matchMedia("(min-width: 1024px)");
    const cards = Array.from(
      el.querySelectorAll<HTMLElement>("[data-stack-card]"),
    );

    let raf = 0;
    const clear = () =>
      cards.forEach((c) => c.style.setProperty("--recede", "0"));

    const update = () => {
      if (motionMq.matches || !wideMq.matches) {
        clear();
        return;
      }
      for (let i = 0; i < cards.length - 1; i++) {
        const top = cards[i].getBoundingClientRect().top;
        const nextTop = cards[i + 1].getBoundingClientRect().top;
        const recede = Math.min(
          1,
          Math.max(0, 1 - (nextTop - top) / RECEDE_DISTANCE),
        );
        cards[i].style.setProperty("--recede", recede.toFixed(3));
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="bg-cream-50">
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1500px] px-6 lg:px-10">
        <div className="flex items-center justify-between pt-[13vh] text-[14px] font-medium tracking-tight lg:pt-[16vh]">
          <span className="text-ink-900">The Platform</span>
          <span className="text-ink-400">#1</span>
        </div>
        <h2 className="mt-7 font-sans text-[clamp(3.25rem,10vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink-900">
          Creator OS
        </h2>
      </div>

      {/* ── Stacked cards ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1500px] px-6 pb-[12vh] pt-[7vh] lg:px-10 lg:pb-[18vh]">
        {FEATURES.map((f, i) => (
          <div
            key={f.n}
            className="mb-6 last:mb-0 lg:sticky lg:mb-36 lg:last:mb-0"
            style={{ top: `${STICK_TOP}px`, zIndex: i + 1 } as CSSProperties}
          >
            <article
              data-stack-card
              className={cn(
                "relative isolate overflow-hidden rounded-[26px] border border-white/[0.12] bg-ink-900",
                "shadow-[0_40px_90px_-50px_rgba(26,24,22,0.7)]",
                CARD_H,
              )}
              style={
                {
                  transform: "scale(calc(1 - 0.035 * var(--recede, 0)))",
                  transformOrigin: "center top",
                } as CSSProperties
              }
            >
              {/* warm corner glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(70% 95% at 1% 100%, rgba(185,72,92,0.16), transparent 56%)," +
                    "radial-gradient(46% 60% at 100% 2%, rgba(201,161,74,0.07), transparent 60%)",
                }}
              />

              <div className="relative flex h-full flex-col gap-y-5 p-7 sm:p-9 lg:grid lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.95fr)_minmax(0,1.55fr)] lg:gap-x-8 lg:gap-y-0 lg:p-11 xl:p-12">
                {/* number */}
                <div className="text-[clamp(1.5rem,2vw,1.9rem)] font-medium leading-none tabular-nums text-white">
                  {f.n}
                </div>

                {/* title + bottom-anchored paragraph */}
                <div className="flex flex-col lg:max-w-[22rem]">
                  <h3 className="font-sans text-[clamp(1.6rem,2.3vw,2rem)] font-medium leading-[1.12] tracking-[-0.015em] text-white">
                    {f.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/55 lg:mt-auto lg:max-w-none lg:pt-8">
                    {f.body}
                  </p>
                </div>

                {/* mockup — right column */}
                <div aria-hidden className="relative">
                  {/* desktop: bleeds off the card's right edge */}
                  <div className="absolute left-2 top-1/2 hidden w-[740px] -translate-y-1/2 lg:block xl:w-[784px]">
                    {f.mockup}
                  </div>
                  {/* mobile / tablet: full-bleed clipped strip */}
                  <div className="relative -mx-7 mt-1 h-[244px] overflow-hidden sm:-mx-9 lg:hidden">
                    <div className="absolute left-7 top-0 w-[640px] sm:left-9 sm:w-[680px]">
                      {f.mockup}
                    </div>
                  </div>
                </div>
              </div>

              {/* recede lighten overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[26px] bg-cream-100"
                style={{ opacity: "calc(0.82 * var(--recede, 0))" }}
              />
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Mockup primitives ──────────────────────────────────────────────────── */

const TONE = {
  green: {
    bar: "bg-emerald-400",
    text: "text-emerald-400",
    pill: "bg-emerald-400/12 text-emerald-300 ring-emerald-400/20",
    glow: "rgba(52,211,153,0.5)",
  },
  rose: {
    bar: "bg-rose-400",
    text: "text-rose-300",
    pill: "bg-rose-400/12 text-rose-300 ring-rose-400/20",
    glow: "rgba(208,129,113,0.5)",
  },
  gold: {
    bar: "bg-amber-400",
    text: "text-amber-300",
    pill: "bg-amber-400/12 text-amber-300 ring-amber-400/20",
    glow: "rgba(251,191,36,0.45)",
  },
  blue: {
    bar: "bg-sky-400",
    text: "text-sky-300",
    pill: "bg-sky-400/12 text-sky-300 ring-sky-400/20",
    glow: "rgba(56,189,248,0.45)",
  },
  red: {
    bar: "bg-red-400",
    text: "text-red-300",
    pill: "bg-red-500/12 text-red-300 ring-red-500/20",
    glow: "rgba(248,113,113,0.45)",
  },
} as const;
type Tone = keyof typeof TONE;

function Panel({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_40px_90px_-45px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      {/* glassy top highlight — a hairline of light along the top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="relative flex items-center justify-between gap-3 px-6 py-5">
        <span className="text-[17px] font-bold tracking-[-0.01em] text-white">{title}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1",
        TONE[tone].pill,
      )}
    >
      {children}
    </span>
  );
}

function MockAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const grads = [
    "from-rose-400 to-rose-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-amber-600",
    "from-sky-400 to-sky-600",
    "from-violet-400 to-violet-600",
  ];
  const g = grads[name.charCodeAt(0) % grads.length];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-white/10",
        g,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

/* ── 01 · Posting Plans → calendar ──────────────────────────────────────── */

type Ev = { tone: Tone; type: string; who: string; t: string };
const WEEK: { day: string; days: { n: number; events: Ev[] }[] }[] = [
  {
    day: "Monday",
    days: [
      {
        n: 1,
        events: [
          { tone: "green", type: "Reel", who: "Instagram", t: "9:00 AM" },
          { tone: "blue", type: "Carousel", who: "TikTok", t: "11:30 AM" },
          { tone: "gold", type: "Story", who: "Instagram", t: "2:00 PM" },
        ],
      },
      {
        n: 8,
        events: [{ tone: "rose", type: "Short", who: "YouTube", t: "11:30 AM" }],
      },
    ],
  },
  {
    day: "Tuesday",
    days: [
      {
        n: 2,
        events: [
          { tone: "rose", type: "Short", who: "YouTube", t: "9:30 AM" },
          { tone: "gold", type: "Post", who: "LinkedIn", t: "1:00 PM" },
          { tone: "green", type: "Reel", who: "Instagram", t: "4:30 PM" },
        ],
      },
      {
        n: 9,
        events: [
          { tone: "green", type: "Reel", who: "Instagram", t: "11:30 AM" },
        ],
      },
    ],
  },
];

function CalendarMock() {
  return (
    <Panel title="Calendar" right={<ScheduledBy />}>
      <div className="grid grid-cols-2 border-t border-white/10">
        {WEEK.map((col, ci) => (
          <div key={col.day} className={ci === 0 ? "border-r border-white/10" : ""}>
            <div className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {col.day}
            </div>
            {col.days.map((d) => {
              const isToday = ci === 0 && d.n === 1;
              return (
                <div
                  key={d.n}
                  className="border-t border-white/[0.06] px-3.5 pb-4 pt-3"
                >
                  {/* day number + a live "Today" marker on the current day */}
                  <div className="mb-2.5 flex items-center gap-2 px-1">
                    <span
                      className={cn(
                        "text-[13px] font-medium tabular-nums",
                        isToday ? "text-white" : "text-white/40",
                      )}
                    >
                      {d.n}
                    </span>
                    {isToday && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/[0.14] px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.12em] text-rose-200 ring-1 ring-rose-400/25">
                        <span className="size-1 rounded-full bg-rose-400" />
                        Today
                      </span>
                    )}
                  </div>

                  {/* scheduled-post cards — raised, glassy, with a glowing accent */}
                  <div className="space-y-2.5">
                    {d.events.map((e, i) => (
                      <div
                        key={i}
                        className="relative overflow-hidden rounded-[12px] bg-gradient-to-b from-white/[0.09] to-white/[0.025] py-3 pl-5 pr-4 ring-1 ring-inset ring-white/[0.07] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.75)]"
                      >
                        {/* glowing tone bar (full height, soft bleed into the card) */}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-y-[3px] left-[3px] w-[3px] rounded-full",
                            TONE[e.tone].bar,
                          )}
                          style={{ boxShadow: `0 0 12px 0 ${TONE[e.tone].glow}` }}
                        />
                        {/* faint inner top highlight for glass depth */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"
                        />
                        <div className="relative flex items-center justify-between gap-2.5">
                          <span className="min-w-0 leading-tight">
                            <span
                              className={cn(
                                "block text-[14px] font-semibold tracking-[-0.01em]",
                                TONE[e.tone].text,
                              )}
                            >
                              {e.type}
                            </span>
                            <span className="mt-0.5 block text-[12px] text-white/50">
                              {e.who}
                            </span>
                          </span>
                          <span className="shrink-0 text-[11.5px] font-medium tabular-nums text-white/45">
                            {e.t}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ScheduledBy() {
  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-[9px] bg-rose-500/15 ring-1 ring-rose-400/20">
          <BrandMark size={16} className="text-rose-300" />
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Scheduled by
          </span>
          <span className="block text-[12.5px] font-semibold text-white">
            Profluencer
          </span>
        </span>
      </span>
      <span className="flex items-center gap-2">
        <span className="flex -space-x-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF] text-white ring-2 ring-ink-900">
            <InstagramIcon size={13} />
          </span>
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#010101] text-white ring-2 ring-ink-900">
            <TiktokIcon size={12} />
          </span>
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#FF0000] text-white ring-2 ring-ink-900">
            <YoutubeIcon size={13} />
          </span>
        </span>
        <span className="text-[12px] text-white/45">+2 channels</span>
      </span>
    </div>
  );
}

/* ── 02 · Performance → top-content table ───────────────────────────────── */

const CONTENT: {
  title: string;
  fmt: string;
  icon: typeof Play;
  tone: Tone;
  plat: "ig" | "tt" | "yt";
  reach: string;
  up: string;
}[] = [
  { title: "How I plan a week of content", fmt: "Reel", icon: Play, tone: "green", plat: "ig", reach: "14.2K", up: "+38%" },
  { title: "3 hooks that doubled my saves", fmt: "Carousel", icon: Images, tone: "blue", plat: "tt", reach: "9.8K", up: "+21%" },
  { title: "My filming setup tour", fmt: "Video", icon: Film, tone: "rose", plat: "yt", reach: "6.4K", up: "+12%" },
  { title: "Reply → Reel in 30 seconds", fmt: "Reel", icon: Play, tone: "green", plat: "ig", reach: "4.1K", up: "+9%" },
];

const PLAT_ICON = {
  ig: <InstagramIcon size={13} className="text-rose-300" />,
  tt: <TiktokIcon size={12} className="text-white/70" />,
  yt: <YoutubeIcon size={13} className="text-red-300" />,
};
const PLAT_NAME = { ig: "Instagram", tt: "TikTok", yt: "YouTube" };

function PerformanceMock() {
  return (
    <Panel title="Top content" right={<Pill tone="green">This month</Pill>}>
      <div className="border-t border-white/10">
        <div className="grid grid-cols-[1fr_130px_110px] gap-4 px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/30">
          <span>Content</span>
          <span>Platform</span>
          <span className="text-right">Reach</span>
        </div>
        {CONTENT.map((r) => (
          <div
            key={r.title}
            className="grid grid-cols-[1fr_130px_110px] items-center gap-4 border-t border-white/[0.06] px-6 py-3.5"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                  TONE[r.tone].pill,
                )}
              >
                <r.icon className="size-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13.5px] font-semibold text-white">
                  {r.title}
                </span>
                <span className="block text-[11.5px] text-white/40">{r.fmt}</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              {PLAT_ICON[r.plat]}
              {PLAT_NAME[r.plat]}
            </span>
            <span className="flex items-center justify-end gap-2">
              <span className="text-[13.5px] font-semibold tabular-nums text-white">
                {r.reach}
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-400/12 px-1.5 py-0.5 text-[10.5px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                <TrendingUp className="size-2.5" strokeWidth={3} />
                {r.up}
              </span>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ── 03 · Live events → event cards ─────────────────────────────────────── */

const EVENTS: {
  title: string;
  host: string;
  role: string;
  when: string;
  format: string;
  status: { tone: Tone; label: string };
  going: string;
}[] = [
  {
    title: "Hooks Masterclass",
    host: "Sophie Carter",
    role: "Growth Coach",
    when: "Tue · 6:00 PM",
    format: "Live workshop",
    status: { tone: "green", label: "Live now" },
    going: "248 going",
  },
  {
    title: "Q&A: Going Viral",
    host: "Marcus Lee",
    role: "Creator, 240K",
    when: "Thu · 5:00 PM",
    format: "Open AMA",
    status: { tone: "gold", label: "Upcoming" },
    going: "132 going",
  },
];

function EventsMock() {
  return (
    <Panel title="Events" right={<Pill tone="rose">2 this week</Pill>}>
      <div className="grid grid-cols-2 gap-3.5 border-t border-white/10 p-4">
        {EVENTS.map((e) => (
          <div
            key={e.title}
            className="rounded-[16px] border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col items-center text-center">
              <MockAvatar name={e.host} size={56} />
              <div className="mt-3 text-[15px] font-bold text-white">
                {e.title}
              </div>
              <div className="text-[12px] text-white/40">
                {e.host} · {e.role}
              </div>
            </div>
            <div className="mt-5 space-y-3.5">
              <StatRow label="When" icon={CalendarClock}>
                <span className="text-[13px] font-medium text-white">
                  {e.when}
                </span>
              </StatRow>
              <StatRow label="Format" icon={Radio}>
                <span className="text-[13px] font-medium text-white">
                  {e.format}
                </span>
              </StatRow>
              <StatRow label="Status" icon={Users}>
                <span className="flex flex-col items-end gap-1.5">
                  <Pill tone={e.status.tone}>{e.status.label}</Pill>
                  <Pill tone="green">{e.going}</Pill>
                </span>
              </StatRow>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StatRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Play;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
        <Icon className="size-3.5" strokeWidth={2} />
        {label}
      </span>
      {children}
    </div>
  );
}

/* ── 04 · AI Coach → chat ───────────────────────────────────────────────── */

function CoachChatMock() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.035] shadow-[0_40px_90px_-45px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <span className="flex items-center gap-2.5">
          <MockAvatar name="Maya Rivers" size={38} />
          <span className="leading-tight">
            <span className="block text-[13.5px] font-semibold text-white">
              Maya Rivers
            </span>
            <span className="block text-[11.5px] text-white/40">Creator</span>
          </span>
        </span>
        <span className="flex items-end gap-[3px]" aria-hidden>
          {[8, 13, 18, 11, 16, 9, 14].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-emerald-400/70"
              style={{ height: h }}
            />
          ))}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="text-right leading-tight">
            <span className="block text-[13.5px] font-semibold text-white">
              AI Coach
            </span>
            <span className="block text-[11.5px] text-emerald-300">Online</span>
          </span>
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-400/25">
            <Sparkles className="size-4 text-rose-300" strokeWidth={2} />
          </span>
        </span>
      </div>

      <div className="space-y-3 p-6">
        <Bubble side="in">What should I post tomorrow?</Bubble>
        <Bubble side="out">
          Try a Reel: &ldquo;3 mistakes I made at 1K followers.&rdquo; Hook in the
          first 2 seconds.
        </Bubble>
        <Bubble side="in">Can you write the hook?</Bubble>
        <Bubble side="out">
          &ldquo;Nobody tells you this about going from 1K to 10K…&rdquo; Want 3
          variations?
        </Bubble>
        <Bubble side="in">Yes please 🙌</Bubble>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: "in" | "out"; children: ReactNode }) {
  return (
    <div className={cn("flex", side === "out" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[74%] rounded-[16px] px-3.5 py-2.5 text-[13.5px] leading-snug",
          side === "out"
            ? "bg-rose-600 text-white"
            : "bg-white/[0.07] text-white/85",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Feature list ───────────────────────────────────────────────────────── */

const FEATURES: Feature[] = [
  {
    n: "01",
    title: "Comprehensive Content Planning",
    body: "Schedule, reschedule and confirm Reels, carousels, stories and long-form — across Instagram, TikTok and YouTube — all from a single content calendar.",
    mockup: <CalendarMock />,
  },
  {
    n: "02",
    title: "Weekly Performance Tracking",
    body: "Track followers, reach and engagement across every connected account, week over week — so you always know exactly what's working.",
    mockup: <PerformanceMock />,
  },
  {
    n: "03",
    title: "Live Community Events",
    body: "Host and join workshops, AMAs and challenges — bring your community together and turn passive watchers into a real, loyal following.",
    mockup: <EventsMock />,
  },
  {
    n: "04",
    title: "Always-On AI Growth Coach",
    body: "Ask anything — hooks, captions, what to post next — and get instant, on-brand answers tailored to your niche and your goals.",
    mockup: <CoachChatMock />,
  },
];
