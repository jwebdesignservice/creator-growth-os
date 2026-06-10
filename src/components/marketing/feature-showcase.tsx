"use client";

import { useEffect, useState } from "react";
import { Check, TrendingUp, Users } from "lucide-react";
import { InstagramIcon, TiktokIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";

/**
 * Interactive feature showcase — a list of features where the active row
 * highlights as a dark bar and a synced visual panel on the left swaps to the
 * matching mini-mockup. Hovering a row selects it (and pauses the auto-cycle);
 * it auto-advances otherwise. Mirrors the reference's "what it does" section.
 */

const FEATURES = [
  {
    key: "plan",
    title: "Plan your week",
    desc: "Map every post across Instagram, TikTok and YouTube on one simple calendar.",
  },
  {
    key: "track",
    title: "Know what's working",
    desc: "Track followers and engagement across every account, week over week.",
  },
  {
    key: "missions",
    title: "Daily missions, done",
    desc: "Turn “grow my channel” into clear daily missions you can actually finish.",
  },
  {
    key: "community",
    title: "Grow with other creators",
    desc: "Trade wins, feedback and ideas with creators on the same path.",
  },
];

/* ── Synced visual panels ──────────────────────────────────────────────── */

function PlanVisual() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const posts = [
    { Icon: InstagramIcon, t: "Reel · Morning routine", bg: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]" },
    { Icon: TiktokIcon, t: "Short · 3 quick tips", bg: "bg-[#010101]" },
  ];
  return (
    <div className="rounded-[16px] border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-900">This week</span>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-700">5 posts</span>
      </div>
      <div className="mt-3 flex items-center rounded-lg border border-ink-100 bg-cream-50 px-1 py-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className={cn("text-[9px] font-bold", i === 2 ? "text-rose-600" : "text-ink-400")}>{d}</span>
            <span className={cn("rounded-full", i === 2 ? "size-1.5 bg-rose-600" : "size-1 bg-ink-200")} />
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {posts.map((p, i) => (
          <div key={i} className="flex items-center gap-2 rounded-[10px] border border-ink-100 bg-white px-2 py-1.5">
            <span className={cn("flex size-7 items-center justify-center rounded-[8px] text-white", p.bg)}>
              <p.Icon size={14} />
            </span>
            <span className="text-[11.5px] font-medium text-ink-900">{p.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackVisual() {
  return (
    <div className="rounded-[16px] border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-500">Reach · 30 days</span>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
          <TrendingUp className="size-3" strokeWidth={2.4} />12%
        </span>
      </div>
      <div className="mt-1 text-[26px] font-bold tabular-nums text-ink-900">24.8K</div>
      <svg viewBox="0 0 220 70" className="mt-2 w-full overflow-visible">
        <path
          d="M0 58 C30 50 50 30 78 36 C108 42 128 16 162 22 C190 27 208 12 220 8"
          fill="none"
          stroke="#B9485C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="220" cy="8" r="3.5" fill="#B9485C" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function MissionsVisual() {
  const items = [
    { t: "Plan this week's content", done: true },
    { t: "Film your next short", done: false },
    { t: "Reply to 10 comments", done: false },
  ];
  return (
    <div className="rounded-[16px] border border-ink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-900">Today&apos;s missions</span>
        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold text-rose-700">1/3</span>
      </div>
      <div className="mt-3 space-y-1.5">
        {items.map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-[10px] border border-ink-100 bg-white px-2.5 py-2">
            <span className={cn("flex size-[16px] items-center justify-center rounded-[5px] border-2", m.done ? "border-rose-500 bg-rose-500" : "border-ink-200")}>
              {m.done && <Check className="size-2.5 text-white" strokeWidth={3} />}
            </span>
            <span className={cn("text-[11.5px]", m.done ? "text-ink-400 line-through" : "text-ink-700")}>{m.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityVisual() {
  const grads = [
    "from-[#C26174] to-[#8E3447]",
    "from-[#B5738A] to-[#8A4057]",
    "from-[#A98494] to-[#735060]",
    "from-[#CDA0AB] to-[#A86A78]",
  ];
  return (
    <div className="flex flex-col items-center rounded-[16px] border border-ink-100 bg-white p-6 shadow-sm">
      <div className="flex items-center">
        {grads.map((g, i) => (
          <span
            key={i}
            className={cn("-ml-2.5 flex size-10 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br first:ml-0", g)}
            style={{ zIndex: 10 - i }}
          >
            <Users className="size-4 text-white/85" strokeWidth={2} />
          </span>
        ))}
        <span className="-ml-2.5 flex size-10 items-center justify-center rounded-full border-[3px] border-white bg-rose-50 text-[11px] font-bold text-rose-700">
          +2k
        </span>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Creators online now
      </span>
    </div>
  );
}

const VISUALS = [PlanVisual, TrackVisual, MissionsVisual, CommunityVisual];

export function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % FEATURES.length),
      3800,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  const Visual = VISUALS[active];

  return (
    <section className="bg-cream-100">
      <div className="mx-auto max-w-[1180px] px-6 py-20 lg:py-28">
        {/* Header */}
        <div className="mx-auto max-w-[640px] text-center">
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-rose-600">
            How it works
          </span>
          <h2 className="mt-5 font-sans text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[2.75rem]">
            Your whole workflow, in one place
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Synced visual */}
          <div className="relative flex min-h-[300px] items-center justify-center rounded-[24px] bg-cream-50 p-8 ring-1 ring-ink-100">
            <div
              key={active}
              className="w-full max-w-[300px]"
              style={{ animation: "brand-fade-in 0.35s ease" }}
            >
              <Visual />
            </div>
          </div>

          {/* Feature list */}
          <div
            className="flex flex-col gap-2"
            onMouseLeave={() => setPaused(false)}
          >
            {FEATURES.map((f, i) => {
              const on = active === i;
              return (
                <button
                  key={f.key}
                  type="button"
                  onMouseEnter={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-[16px] px-6 py-5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-6",
                    on ? "bg-ink-900" : "hover:bg-white/60",
                  )}
                >
                  <span
                    className={cn(
                      "text-[20px] font-semibold sm:w-[42%] sm:shrink-0 sm:text-[22px]",
                      on ? "text-white" : "text-ink-900",
                    )}
                  >
                    {f.title}
                  </span>
                  <span
                    className={cn(
                      "text-[13.5px] leading-relaxed sm:flex-1",
                      on ? "text-white/70" : "text-ink-500",
                    )}
                  >
                    {f.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
