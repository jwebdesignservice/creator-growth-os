import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap, Play, Check, ArrowRight, Film } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Marketing section — the two learning surfaces, Programs and Tutorials, are
 * both VIDEO-first, so each card leads with a real video-player mockup (dark
 * frame, play button, duration, progress bar, "Video" labels). Reads instantly
 * as "watch and learn", in Profluencer's rose/cream/ink language. Sits directly
 * above the Integrations ("Every platform, one workspace") section.
 */
export function ProgramsTutorials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1340px] px-6 py-16 lg:px-10 lg:py-24">
        <h2 className="mx-auto max-w-3xl text-center text-[32px] font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-[44px]">
          Watch, learn, grow.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed text-ink-500">
          Guided video programs to follow, and quick how-to tutorials to
          reference — every lesson is a short, focused video you can watch and
          apply in minutes.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-2">
          <FeatureCard
            title="Guided video programs"
            body="Step-by-step video programs take you from setup to consistent growth — every lesson builds on the last, so you always know what to watch next."
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

/* ── Reusable video-player thumbnail — the unmistakable "this is video" cue ── */

function VideoThumb({
  label,
  duration,
  progress = 30,
}: {
  label: string;
  duration: string;
  progress?: number;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-gradient-to-br from-ink-900 via-[#2a2422] to-[#3a2a2e]">
      <div className="absolute -left-6 -top-10 size-32 rounded-full bg-white/[0.06] blur-2xl" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        <Film className="size-3" strokeWidth={2.4} />
        {label}
      </span>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-[0_10px_24px_rgba(0,0,0,0.4)]">
          <Play className="ml-0.5 size-5" fill="currentColor" strokeWidth={0} />
        </span>
      </div>
      <span className="absolute bottom-2.5 right-3 rounded bg-black/70 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-white">
        {duration}
      </span>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
        <div className="h-full bg-rose-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

/* ── Programs mockup — a video lesson + the program path ─────────────── */

const PROGRAM_LESSONS = [
  { t: "Welcome to Creator Growth OS", d: "0:19", done: true },
  { t: "Find Your Way Around", d: "0:21", done: true },
  { t: "Your Profile & Account Settings", d: "2:30", done: false },
];

function ProgramsMockup() {
  return (
    <div className="p-4">
      <VideoThumb label="Lesson 1" duration="0:19" progress={45} />

      <div className="mt-3 flex items-center justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-rose-100 text-rose-600">
            <GraduationCap className="size-[15px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-ink-900">
              Start Here: Platform Intro
            </div>
            <div className="text-[10.5px] text-ink-400">
              Module 1 · 3 video lessons
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] font-semibold tabular-nums text-rose-700">
          62%
        </span>
      </div>

      <div className="mx-0.5 mt-2.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full w-[62%] rounded-full bg-rose-500" />
      </div>

      <div className="mt-2.5 space-y-1.5">
        {PROGRAM_LESSONS.map((l, i) => (
          <div key={i} className="flex items-center gap-2 px-0.5 text-[11.5px]">
            <span
              className={cn(
                "flex size-[18px] shrink-0 items-center justify-center rounded-full",
                l.done
                  ? "bg-rose-500 text-white"
                  : "border-2 border-rose-300 text-rose-500",
              )}
            >
              {l.done ? (
                <Check className="size-2.5" strokeWidth={3} />
              ) : (
                <Play className="ml-px size-2" fill="currentColor" strokeWidth={0} />
              )}
            </span>
            <span
              className={cn(
                "flex-1 truncate",
                l.done ? "text-ink-400" : "font-semibold text-ink-900",
              )}
            >
              {l.t}
            </span>
            <span className="shrink-0 tabular-nums text-ink-400">{l.d}</span>
          </div>
        ))}
      </div>
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
      <VideoThumb label="Tutorial" duration="3:00" progress={33} />

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
