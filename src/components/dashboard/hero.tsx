import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/app-shell/topbar";

/**
 * Where the user is in their program journey. Drives the welcome hero's copy
 * + CTA so it evolves: start → continue → next program → all done. Resolved on
 * the page; the component below stays purely presentational.
 */
export type HeroJourney =
  | { stage: "start"; primaryHref: string; secondaryHref: string }
  | {
      stage: "continue";
      programTitle: string;
      percent: number;
      primaryHref: string;
      secondaryHref: string;
    }
  | {
      stage: "next";
      programTitle: string;
      primaryHref: string;
      secondaryHref: string;
    }
  | { stage: "done"; primaryHref: string; secondaryHref: string };

/** The "continue where you left off" context, when the user has live progress. */
export type HeroResume = {
  programTitle: string;
  percent: number;
  /** The next lesson to resume, when it belongs to the in-progress program. */
  lessonTitle: string | null;
  /** e.g. "3:20 left" — null when we can't compute remaining time. */
  lessonMeta: string | null;
};

type Props = {
  firstName: string;
  /** Time-of-day eyebrow, e.g. "Thursday afternoon" (rendered uppercase). */
  greeting: string;
  avatarUrl?: string | null;
  headline: string;
  subline: string;
  primaryLabel: string;
  primaryHref: string;
  resume: HeroResume | null;
};

/**
 * Dashboard welcome hero — a single full-width "Editorial" band: greeting +
 * progress on the left, an "Up next" lesson + the primary action on the right.
 */
export function DashboardHero({
  firstName,
  greeting,
  avatarUrl,
  headline,
  subline,
  primaryLabel,
  primaryHref,
  resume,
}: Props) {
  const pct = resume
    ? Math.min(100, Math.max(0, Math.round(resume.percent)))
    : 0;

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-gradient-to-br from-white via-cream-50 to-rose-50 px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-7">
        {/* ── Greeting + progress ─────────────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-4 lg:flex-1 lg:gap-5">
          <span className="hidden size-[60px] shrink-0 overflow-hidden rounded-full bg-rose-100 ring-4 ring-white sm:inline-flex">
            <Avatar name={firstName} src={avatarUrl ?? undefined} size={60} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-500">
              {greeting}
            </div>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-[30px]">
              {headline}
            </h1>
            <p className="mt-1.5 text-[14.5px] text-ink-500">{subline}</p>

            {resume && (
              <div className="mt-3.5 flex items-center gap-3">
                <div className="h-[7px] w-[200px] shrink-0 overflow-hidden rounded-full bg-rose-100 sm:w-[230px]">
                  <div
                    className="h-full rounded-full bg-rose-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="min-w-0 truncate text-[12px] text-ink-500">
                  <span className="font-semibold text-ink-700">{pct}%</span>
                  {" · "}
                  {resume.programTitle}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Divider (desktop) ───────────────────────────────────────── */}
        {resume && (
          <span
            aria-hidden
            className="my-1 hidden w-px self-stretch bg-ink-100 lg:block"
          />
        )}

        {/* ── Up next + primary action ────────────────────────────────── */}
        <div className="flex flex-col gap-3 lg:w-[280px] lg:shrink-0">
          {resume?.lessonTitle && (
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                Up next
              </div>
              <div className="mt-1 truncate text-[14px] font-semibold text-ink-900">
                {resume.lessonTitle}
              </div>
              {resume.lessonMeta && (
                <div className="text-[12px] text-ink-500">{resume.lessonMeta}</div>
              )}
            </div>
          )}
          <Link
            href={primaryHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-rose-600 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            {primaryLabel}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
