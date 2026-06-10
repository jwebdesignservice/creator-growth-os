import type { ReactNode } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Play,
  Check,
  ArrowRight,
  Film,
  Lock,
  Clock,
  Crown,
} from "lucide-react";

/**
 * Marketing section — the two learning surfaces, Programs and Tutorials.
 *
 * Deliberately *different* visuals (Programs = an in-progress course; Tutorials
 * = a video player) but the same SIZE: both mockups share a fixed height and
 * fill it, and both "Learn More" buttons sit on the same baseline, so the two
 * cards read as a matched pair. Sits directly above the Integrations ("Every
 * platform, one workspace") section.
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

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:mt-14 lg:grid-cols-2">
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

/* ── Card shell — fixed-height mockup on top, copy, then a bottom-aligned CTA ── */

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
      <div className="overflow-hidden rounded-[18px] bg-white ring-1 ring-ink-100 shadow-[0_1px_3px_rgba(26,24,22,0.04),0_12px_28px_rgba(26,24,22,0.06)] lg:h-[448px]">
        {children}
      </div>
      <h3 className="mt-7 px-1 text-[22px] font-bold tracking-tight text-ink-900">
        {title}
      </h3>
      <p className="mt-2.5 max-w-md px-1 text-[14.5px] leading-relaxed text-ink-500">
        {body}
      </p>
      {/* spacer keeps the CTA on a shared baseline across both cards */}
      <div className="flex-1" />
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

/* ── Programs mockup — an in-progress course (fills the card height) ──── */

function ProgramsMockup() {
  return (
    <div className="flex h-full flex-col p-5">
      {/* Header + overall progress */}
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-100 text-rose-600">
          <GraduationCap className="size-[18px]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink-900">
            Start Here: Platform Intro
          </div>
          <div className="text-[11px] text-ink-400">
            A guided program · 5 modules
          </div>
        </div>
        <span className="shrink-0 text-[15px] font-bold tabular-nums text-ink-900">
          62%
        </span>
      </div>
      <div className="mt-2.5 h-2 shrink-0 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-rose-400 to-rose-600" />
      </div>
      <div className="mt-1.5 shrink-0 text-[10.5px] text-ink-400">
        5 of 8 lessons complete
      </div>

      {/* Modules — flex-1 so they fill + center within the card height */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5 py-3">
        {/* Completed */}
        <div className="flex items-center gap-2.5 rounded-[12px] border border-ink-100 bg-white px-3 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-semibold text-ink-900">
              Module 1 · Platform Basics
            </div>
            <div className="text-[10.5px] font-medium text-emerald-600">
              Completed · 3 lessons
            </div>
          </div>
        </div>

        {/* Active — highlighted with a Continue action */}
        <div className="rounded-[12px] border border-rose-200 bg-rose-50/60 px-3 py-2.5 ring-1 ring-rose-100">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-600 ring-2 ring-rose-200">
              2
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-semibold text-ink-900">
                Module 2 · Your First Week
              </div>
              <div className="text-[10.5px] font-medium text-rose-600">
                In progress · 2 of 4 lessons
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-[8px] bg-rose-600 px-2.5 py-1 text-[10.5px] font-semibold text-white">
              Continue
              <ArrowRight className="size-3" strokeWidth={2.5} />
            </span>
          </div>
          <div className="ml-[38px] mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full w-1/2 rounded-full bg-rose-500" />
          </div>
        </div>

        {/* Upcoming — locked (compact roadmap rows) */}
        <div className="flex items-center gap-2.5 rounded-[12px] border border-ink-100 bg-white px-3 py-2 opacity-60">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-400">
            <Lock className="size-3" strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink-400">
            Module 3 · Grow Consistently
          </span>
          <span className="shrink-0 text-[10.5px] text-ink-400">3 lessons</span>
        </div>

        <div className="flex items-center gap-2.5 rounded-[12px] border border-ink-100 bg-white px-3 py-2 opacity-60">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-400">
            <Lock className="size-3" strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink-400">
            Module 4 · Monetize Your Audience
          </span>
          <span className="shrink-0 text-[10.5px] text-ink-400">2 lessons</span>
        </div>

        {/* Bonus — Pro-only premium module */}
        <div className="flex items-center gap-2.5 rounded-[12px] border border-amber-200 bg-amber-50/70 px-3 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Crown className="size-3.5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink-800">
            Module 5 · Pro Masterclass
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-500 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white">
            Pro
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-ink-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-400">
          <Clock className="size-3" strokeWidth={2} /> ~18 min left
        </span>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500" /> On track
        </span>
      </div>
    </div>
  );
}

/* ── Tutorials mockup — a video player that fills the card height ────── */

const NEXT_TUTORIALS = [
  { t: "Set up your content calendar", d: "1:30", f: "Guide" },
  { t: "Reply → Reel in 30 seconds", d: "0:30", f: "Reel" },
];

function TutorialsMockup() {
  return (
    <div className="flex h-full flex-col p-4">
      {/* Featured video player — grows to fill the available height */}
      <div className="relative min-h-[180px] w-full flex-1 overflow-hidden rounded-[12px] bg-gradient-to-br from-ink-900 via-[#2a2422] to-[#3a2a2e]">
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
