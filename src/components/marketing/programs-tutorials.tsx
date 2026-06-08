import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap, Play, Check, ArrowRight, Film, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Marketing section — the two learning surfaces, Programs and Tutorials.
 *
 * Deliberately *different* visuals so the cards don't read as twins:
 *   • Tutorials → a video-player mockup (this is on-demand video).
 *   • Programs  → a guided-path mockup (progress ring + module roadmap with
 *     done / in-progress / locked states) — this is a structured course.
 *
 * In Profluencer's rose/cream/ink language. Sits directly above the
 * Integrations ("Every platform, one workspace") section.
 */
export function ProgramsTutorials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1340px] px-6 py-16 lg:px-10 lg:py-24">
        <h2 className="mx-auto max-w-3xl text-center text-[32px] font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-[44px]">
          Watch, learn, grow.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed text-ink-500">
          Follow a guided program step by step, or pull up a quick tutorial when
          you need it — all built on short, focused videos you can apply in
          minutes.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-2">
          <FeatureCard
            title="Follow a guided program"
            body="A structured path of short video lessons — modules build on each other from setup to growth, so you always know your next step."
            href="/programs"
          >
            <ProgramsMockup />
          </FeatureCard>

          <FeatureCard
            title="Bite-size video tutorials"
            body="Short how-to videos for every tool and tactic. Search, hit play, and apply the exact skill you need — in minutes, not hours."
            href="/tutorials"
          >
            <TutorialsMockup />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* ── Card shell — mockup on top, copy + CTA below ──────────────────── */

function FeatureCard({
  title,
  body,
  href,
  children,
}: {
  title: string;
  body: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-[24px] bg-cream-100 p-5 ring-1 ring-ink-100 sm:p-6">
      <div className="overflow-hidden rounded-[18px] bg-white ring-1 ring-ink-100 shadow-[0_1px_3px_rgba(26,24,22,0.04),0_12px_28px_rgba(26,24,22,0.06)]">
        {children}
      </div>
      <h3 className="mt-7 px-1 text-[22px] font-bold tracking-tight text-ink-900">
        {title}
      </h3>
      <p className="mt-2.5 max-w-md px-1 text-[14.5px] leading-relaxed text-ink-500">
        {body}
      </p>
      <Link
        href={href}
        className="mt-6 ml-1 inline-flex w-fit items-center gap-2 rounded-[12px] border border-ink-200 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink-900 transition-colors hover:border-ink-300 hover:bg-cream-50"
      >
        Learn More
        <ArrowRight className="size-4" strokeWidth={2.2} />
      </Link>
    </div>
  );
}

/* ── Programs mockup — guided path: progress ring + module roadmap ───── */

const PROGRAM_MODULES = [
  { n: "1", title: "Platform Basics", meta: "3 lessons", state: "done" as const },
  { n: "2", title: "Your First Week", meta: "2 of 4 lessons", state: "active" as const },
  { n: "3", title: "Grow Consistently", meta: "3 lessons", state: "locked" as const },
];

function ProgramsMockup() {
  return (
    <div className="p-5">
      {/* Header — program + progress ring */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-100 text-rose-600">
            <GraduationCap className="size-[18px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-ink-900">
              Start Here: Platform Intro
            </div>
            <div className="text-[11px] text-ink-400">
              3 modules · 8 video lessons
            </div>
          </div>
        </div>
        <ProgressRing percent={62} />
      </div>

      {/* Module roadmap — vertical path with a connector line */}
      <div className="relative space-y-3">
        <div className="absolute bottom-4 left-[13px] top-4 w-0.5 bg-cream-200" />
        {PROGRAM_MODULES.map((m) => (
          <div key={m.n} className="relative flex items-center gap-3">
            <span
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                m.state === "done" && "bg-rose-500 text-white",
                m.state === "active" &&
                  "bg-rose-100 text-rose-600 ring-2 ring-rose-200",
                m.state === "locked" && "bg-cream-200 text-ink-400",
              )}
            >
              {m.state === "done" ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : m.state === "locked" ? (
                <Lock className="size-3" strokeWidth={2.5} />
              ) : (
                m.n
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "truncate text-[12.5px] font-semibold",
                  m.state === "locked" ? "text-ink-400" : "text-ink-900",
                )}
              >
                Module {m.n}: {m.title}
              </div>
              <div className="text-[11px] text-ink-400">{m.meta}</div>
            </div>
            {m.state === "active" && (
              <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                In progress
              </span>
            )}
            {m.state === "done" && (
              <span className="shrink-0 text-[10px] font-semibold text-emerald-600">
                Done
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Small donut progress indicator. */
function ProgressRing({ percent }: { percent: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <div className="relative size-[46px] shrink-0">
      <svg viewBox="0 0 40 40" className="size-[46px] -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#EDE3DC" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#B9485C"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-ink-900">
        {percent}%
      </span>
    </div>
  );
}

/* ── Tutorials mockup — a featured video tutorial + up-next ──────────── */

const NEXT_TUTORIALS = [
  { t: "Set up your content calendar", d: "1:30", f: "Guide" },
  { t: "Reply → Reel in 30 seconds", d: "0:30", f: "Reel" },
];

function TutorialsMockup() {
  return (
    <div className="p-4">
      {/* Featured video player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-gradient-to-br from-ink-900 via-[#2a2422] to-[#3a2a2e]">
        <div className="absolute -left-6 -top-10 size-32 rounded-full bg-white/[0.06] blur-2xl" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          <Film className="size-3" strokeWidth={2.4} />
          Tutorial
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-[0_10px_24px_rgba(0,0,0,0.4)]">
            <Play className="ml-0.5 size-5" fill="currentColor" strokeWidth={0} />
          </span>
        </div>
        <span className="absolute bottom-2.5 right-3 rounded bg-black/70 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-white">
          3:00
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div className="h-full w-1/3 bg-rose-500" />
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <div className="text-[13px] font-semibold text-ink-900">
          Film a clean talking-head clip
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-ink-400">
          <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
            <Film className="size-3" strokeWidth={2.4} /> Video
          </span>
          <span className="text-ink-300">·</span>
          <span>Beginner</span>
          <span className="text-ink-300">·</span>
          <span className="tabular-nums">3:00</span>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {NEXT_TUTORIALS.map((tu, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-[10px] border border-ink-100 bg-white px-2 py-1.5 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)]"
          >
            <span className="relative flex h-8 w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-gradient-to-br from-ink-800 to-[#3a2a2e] text-white">
              <Play className="ml-0.5 size-3" fill="currentColor" strokeWidth={0} />
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[8px] font-semibold tabular-nums text-white">
                {tu.d}
              </span>
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-700">
              {tu.t}
            </span>
            <span className="shrink-0 text-[10px] font-semibold text-ink-400">
              {tu.f}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
