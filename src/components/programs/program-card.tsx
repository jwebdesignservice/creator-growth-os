import Link from "next/link";
import {
  Lock,
  BookOpen,
  CheckSquare,
  CheckCircle2,
  ArrowRight,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/cn";

/** Human-friendly program length: 3 days · 1 week · 3 weeks · 1 month. */
function formatDuration(days: number): string {
  if (days < 1) return "";
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"}`;
}

export type ProgramRow = {
  slug: string;
  title: string;
  description: string;
  cover_hue?: "rose" | "cream" | "warm";
  cover_image_url?: string | null;
  category_label?: string;
  status: "in_progress" | "not_started" | "pro_only" | "completed";
  progress?: number;
  total_lessons?: number;
  total_tasks?: number;
  estimated_days?: number;
  /** Soft-locked behind the Start Here onboarding gate. */
  locked?: boolean;
};

/**
 * Program card — the Programs library tile.
 *
 * Anatomy (top → bottom):
 *   · Framed 16:9 thumbnail — inset hairline ring, glassy status pill
 *     (top-left), gold Pro pill (top-right), dark duration pill
 *     (bottom-right, YouTube-style) and — for started programs — a thin
 *     progress strip along the thumbnail's bottom edge that sweeps in on
 *     mount (`.program-bar`, reduced-motion safe).
 *   · Body — uppercase category eyebrow ("who it's for"), two-line title,
 *     two-line value description, then lessons/tasks stat chips.
 *   · Footer — hairline-divided action row: status summary on the left,
 *     a pill CTA on the right that fills with its accent colour while the
 *     card is hovered (Continue / Start / Review / Upgrade / Start Here).
 *
 * The whole card is a single link. Hover lifts it on a soft spring curve
 * with a deepened two-layer shadow and a slow artwork zoom; pressing it
 * settles back down; keyboard focus draws a rose ring. Footers align
 * across grid rows via h-full + mt-auto regardless of copy length.
 */
export function ProgramCard({ program }: { program: ProgramRow }) {
  const isLocked     = !!program.locked;
  const isPro        = !isLocked && program.status === "pro_only";
  const isCompleted  = !isLocked && program.status === "completed";
  const isInProgress = !isLocked && program.status === "in_progress";
  const isNotStarted = !isLocked && program.status === "not_started";
  // Locked cards route to Start Here (helpful), never the program itself.
  const href = isLocked
    ? "/programs/start-here"
    : isPro
      ? "/billing?upgrade=pro"
      : `/programs/${program.slug}`;
  const progress = Math.min(100, Math.max(0, program.progress ?? 0));
  const duration =
    typeof program.estimated_days === "number" && program.estimated_days > 0
      ? formatDuration(program.estimated_days)
      : null;

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-[20px] border border-ink-100 bg-gradient-to-b from-white to-cream-50 p-3",
        "shadow-[0_1px_2px_rgba(26,24,22,0.04),0_10px_28px_-18px_rgba(26,24,22,0.10)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-ink-200 hover:shadow-[0_2px_4px_rgba(26,24,22,0.05),0_26px_48px_-24px_rgba(26,24,22,0.38)]",
        "active:-translate-y-0 active:shadow-[0_1px_2px_rgba(26,24,22,0.05),0_12px_28px_-20px_rgba(26,24,22,0.25)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
      )}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div className="relative aspect-video overflow-hidden rounded-[13px] bg-cream-100">
        <CoverArt
          title={program.title}
          hue={program.cover_hue}
          status={program.status}
          coverImageUrl={program.cover_image_url}
        />

        {/* inset hairline — seats the artwork in its frame */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[13px] ring-1 ring-inset ring-ink-900/[0.08]"
        />

        {/* Status pill (top-left) — glassy, reads on any artwork */}
        {isInProgress && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-800 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.32)] ring-1 ring-ink-900/[0.06] backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-rose-400 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-1.5 rounded-full bg-rose-500" />
            </span>
            In progress
          </span>
        )}
        {isCompleted && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-800 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.32)] ring-1 ring-ink-900/[0.06] backdrop-blur-sm">
            <CheckCircle2 className="size-3 text-success" strokeWidth={2.5} />
            Completed
          </span>
        )}

        {/* Pro pill (top-right) */}
        {isPro && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.32)] ring-1 ring-amber-500/25 backdrop-blur-sm">
            <Crown className="size-3" strokeWidth={2.5} />
            Pro
          </span>
        )}

        {/* Completion pill (bottom-left) — the % at a glance */}
        {!isLocked && !isPro && (
          <span
            className={cn(
              "absolute left-2.5 inline-flex items-center gap-1.5 rounded-[7px] bg-ink-900/75 px-2 py-[3px] text-[11px] font-semibold tabular-nums tracking-[0.01em] text-white backdrop-blur-sm",
              isInProgress || isCompleted ? "bottom-3.5" : "bottom-2.5",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isCompleted
                  ? "bg-emerald-400"
                  : isInProgress
                    ? "bg-rose-400"
                    : "bg-white/40",
              )}
            />
            {isCompleted ? 100 : progress}%
          </span>
        )}

        {/* Duration pill (bottom-right, YouTube-style) */}
        {duration && !isLocked && (
          <span
            className={cn(
              "absolute right-2.5 rounded-[7px] bg-ink-900/75 px-2 py-[3px] text-[11px] font-semibold tracking-[0.01em] text-white backdrop-blur-sm",
              isInProgress || isCompleted ? "bottom-3.5" : "bottom-2.5",
            )}
          >
            {duration}
          </span>
        )}

        {/* Progress strip along the thumbnail's bottom edge (YouTube cue).
            Sweeps in on mount; static full-width emerald once completed. */}
        {(isInProgress || isCompleted) && (
          <span
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Program progress"
            className="absolute inset-x-0 bottom-0 h-[3px] bg-ink-900/20"
          >
            <span
              className={cn(
                "block h-full rounded-r-full",
                isCompleted
                  ? "bg-success"
                  : "program-bar bg-gradient-to-r from-rose-600 to-rose-400",
              )}
              style={{ width: `${isCompleted ? 100 : progress}%` }}
            />
          </span>
        )}

        {/* Onboarding soft-lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/35 backdrop-blur-[2px]">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/85 shadow-soft">
              <Lock className="size-5 text-rose-600" strokeWidth={2} />
            </span>
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
        {/* Category eyebrow — who the program is for */}
        {program.category_label && (
          <span className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.13em] text-rose-600/85">
            {program.category_label}
          </span>
        )}

        <h3 className="text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink-900 line-clamp-2 transition-colors duration-200 group-hover:text-rose-700">
          {program.title}
        </h3>

        {program.description && (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500 line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Stat chips — lessons / tasks */}
        {(typeof program.total_lessons === "number" ||
          typeof program.total_tasks === "number") && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {typeof program.total_lessons === "number" && (
              <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-cream-100 px-2.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100/90">
                <BookOpen className="size-3.5 text-ink-400" strokeWidth={1.8} />
                {program.total_lessons}{" "}
                {program.total_lessons === 1 ? "lesson" : "lessons"}
              </span>
            )}
            {typeof program.total_tasks === "number" && (
              <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-cream-100 px-2.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100/90">
                <CheckSquare className="size-3.5 text-ink-400" strokeWidth={1.8} />
                {program.total_tasks}{" "}
                {program.total_tasks === 1 ? "task" : "tasks"}
              </span>
            )}
          </div>
        )}

        {/* ── Footer — status summary · pill CTA ──────────────────── */}
        <div className="mt-auto pt-3.5">
          <div className="flex h-9 items-center gap-2.5 border-t border-ink-100/90 pt-3">
            {isLocked ? (
              <>
                <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink-500">
                  <Lock className="size-3.5 shrink-0 text-ink-400" strokeWidth={2} />
                  <span className="truncate">Finish Start Here first</span>
                </span>
                <CtaPill tone="neutral" className="ml-auto">
                  Start Here
                </CtaPill>
              </>
            ) : isPro ? (
              <>
                <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink-500">
                  <Lock className="size-3.5 shrink-0 text-amber-600/80" strokeWidth={2} />
                  <span className="truncate">Pro membership</span>
                </span>
                <CtaPill tone="rose" className="ml-auto">
                  Upgrade
                </CtaPill>
              </>
            ) : isNotStarted ? (
              <>
                <span className="text-[12px] font-medium text-ink-400">
                  Not started
                </span>
                <CtaPill tone="rose" className="ml-auto">
                  Start program
                </CtaPill>
              </>
            ) : isCompleted ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-success">
                  <CheckCircle2 className="size-3.5" strokeWidth={2.2} />
                  Completed
                </span>
                <CtaPill tone="emerald" className="ml-auto">
                  Review
                </CtaPill>
              </>
            ) : (
              <>
                <span className="text-[12px] font-medium text-ink-500">
                  <span className="font-semibold tabular-nums text-rose-700">
                    {progress}%
                  </span>{" "}
                  complete
                </span>
                <CtaPill tone="rose" className="ml-auto">
                  Continue
                </CtaPill>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Footer CTA pill — tinted at rest, fills with its accent while the card is
   hovered, and nudges its arrow. Pure presentation; the card is the link. */
function CtaPill({
  tone,
  className,
  children,
}: {
  tone: "rose" | "emerald" | "neutral";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 ring-rose-200/80 group-hover:bg-rose-600 group-hover:text-white group-hover:ring-rose-600",
    emerald:
      "bg-emerald-50 text-emerald-700 ring-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600",
    neutral:
      "bg-cream-100 text-ink-700 ring-ink-200/90 group-hover:bg-ink-900 group-hover:text-white group-hover:ring-ink-900",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold ring-1 ring-inset transition-colors duration-200",
        tones[tone],
        className,
      )}
    >
      {children}
      <ArrowRight
        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
    </span>
  );
}

export function CoverArt({
  title,
  hue = "cream",
  status,
  coverImageUrl,
}: {
  title?: string;
  hue?: "rose" | "cream" | "warm";
  status: ProgramRow["status"];
  coverImageUrl?: string | null;
}) {
  const palette =
    hue === "rose"
      ? "from-rose-100/70 via-rose-50 to-cream-200"
      : hue === "warm"
        ? "from-cream-200 via-rose-100/40 to-cream-300"
        : "from-cream-200 via-cream-100 to-rose-100/40";

  const isPro = status === "pro_only";
  const monogram = (title ?? "").trim().charAt(0).toUpperCase();

  // Real uploaded cover image → fill the thumbnail with it. Supabase covers
  // can be storage URLs or inline data URLs, so a plain <img> keeps both
  // working without next/image domain config.
  if (coverImageUrl) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        {/* bottom scrim so the duration pill + progress strip read on photos */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/35 to-transparent"
        />
        {isPro && (
          <span aria-hidden className="absolute inset-0 bg-ink-900/15" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
        `bg-gradient-to-br ${palette}`,
      )}
    >
      {/* soft radial light source + warm corner answer */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 75% at 78% 18%, rgba(255,255,255,0.55), transparent 62%)," +
            "radial-gradient(45% 60% at 12% 92%, rgba(225,118,132,0.14), transparent 60%)",
        }}
      />

      {/* soft monogram — gives bare covers a deliberate identity */}
      {monogram && (
        <span
          aria-hidden
          className="absolute inset-0 flex select-none items-center justify-center"
        >
          <span className="font-sans text-[56px] font-bold leading-none tracking-tight text-rose-400/25">
            {monogram}
          </span>
        </span>
      )}

      {/* Decorative dots */}
      <svg
        className="absolute inset-0 h-full w-full text-rose-300/70"
        viewBox="0 0 200 112"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="30" cy="20" r="2" />
        <circle cx="170" cy="26" r="3" />
        <circle cx="50" cy="92" r="2.5" />
        <circle cx="150" cy="84" r="2" />
      </svg>
    </div>
  );
}
