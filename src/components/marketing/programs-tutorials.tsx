import type { ReactNode } from "react";
import Link from "next/link";
import {
  GraduationCap,
  PlayCircle,
  Check,
  ArrowRight,
  Film,
  Search,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Marketing section — highlights the two learning surfaces, Programs and
 * Tutorials. Each card pairs a one-line promise with a nested mockup that
 * mirrors the real in-app curriculum + tutorials patterns, in Profluencer's
 * rose/cream/ink language. Sits directly above the Integrations ("Every
 * platform, one workspace") section on the landing page.
 */
export function ProgramsTutorials() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1340px] px-6 py-16 lg:px-10 lg:py-24">
        {/* Header */}
        <h2 className="mx-auto max-w-3xl text-center text-[32px] font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-[44px]">
          Learn the system.
          <br />
          Master your craft.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-[15px] leading-relaxed text-ink-500">
          Guided programs to follow and quick tutorials to reference —
          everything you need to grow as a creator, in one place.
        </p>

        {/* Two feature cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:mt-14 lg:grid-cols-2">
          <FeatureCard
            title="Follow a proven path"
            body="Guided programs take you from setup to consistent growth — modules, lessons and missions that build on each other, so you always know your next step."
            href="/programs"
          >
            <ProgramsMockup />
          </FeatureCard>

          <FeatureCard
            title="Quick tutorials, on demand"
            body="Short, focused how-to videos for every tool and tactic. Search, watch and apply the exact skill you need — in minutes, not hours."
            href="/tutorials"
          >
            <TutorialsMockup />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* ── Card shell — mockup on top, copy + CTA below (matches the reference) ── */

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

/* ── Programs mockup — program path: progress + lessons ──────────────── */

const LESSONS = [
  { t: "Welcome to Creator Growth OS", d: "0:19", done: true },
  { t: "Find Your Way Around", d: "0:21", done: true },
  { t: "Your Profile & Account Settings", d: "2:30", done: false, current: true },
];

function ProgramsMockup() {
  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-100 text-rose-600">
            <GraduationCap className="size-[18px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-ink-900">
              Start Here: Platform Intro
            </div>
            <div className="text-[11px] text-ink-400">
              Module 1 · Platform Basics
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-rose-700">
          62%
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <div className="h-full w-[62%] rounded-full bg-rose-500" />
      </div>

      <div className="space-y-2">
        {LESSONS.map((l, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2.5 rounded-[11px] border bg-white px-2.5 py-2 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)]",
              l.current
                ? "border-rose-200 ring-1 ring-rose-100"
                : "border-ink-100",
            )}
          >
            <span
              className={cn(
                "flex size-[22px] shrink-0 items-center justify-center rounded-full",
                l.done
                  ? "bg-rose-500 text-white"
                  : "border-2 border-rose-300 bg-white text-rose-500",
              )}
            >
              {l.done ? (
                <Check className="size-3" strokeWidth={3} />
              ) : (
                <PlayCircle className="size-3" strokeWidth={2.5} />
              )}
            </span>
            <span
              className={cn(
                "flex-1 truncate text-[12.5px]",
                l.done ? "text-ink-400" : "font-semibold text-ink-900",
              )}
            >
              {l.t}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-ink-400">
              {l.d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Tutorials mockup — searchable how-to video list ─────────────────── */

const TUTORIALS = [
  { t: "Film a clean talking-head clip", f: "Video", d: "3:00" },
  { t: "Set up your content calendar", f: "Guide", d: "1:30" },
  { t: "Reply → Reel in 30 seconds", f: "Reel", d: "0:30" },
];

function TutorialsMockup() {
  return (
    <div className="p-5">
      <div className="mb-3 flex items-center gap-2 rounded-[11px] border border-ink-100 bg-white px-3 py-2 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)]">
        <Search className="size-3.5 text-ink-400" strokeWidth={2} />
        <span className="text-[12px] text-ink-400">Search tutorials…</span>
      </div>

      <div className="space-y-2">
        {TUTORIALS.map((tu, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-[11px] border border-ink-100 bg-white px-2.5 py-2 shadow-[0_2px_6px_-4px_rgba(26,24,22,0.3)]"
          >
            <span className="relative flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-gradient-to-br from-rose-100 to-cream-200 text-rose-600">
              <PlayCircle className="size-4" strokeWidth={2} fill="currentColor" />
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[8px] font-semibold tabular-nums text-white">
                {tu.d}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-semibold text-ink-900">
                {tu.t}
              </div>
              <div className="text-[11px] text-ink-400">{tu.f}</div>
            </div>
            <Film className="size-3.5 shrink-0 text-ink-300" strokeWidth={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
