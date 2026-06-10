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
 * Program card — a framed "course tile" with real depth and a status-aware
 * footer.
 *
 * Structure: a white frame (p-3) holds a rounded 16:9 thumbnail; glassy
 * overlay pills carry status (top-left), Pro (top-right) and duration
 * (bottom-right, YouTube-style). Below: an uppercase category eyebrow,
 * title, two-line description and a lessons/tasks meta row. A hairline
 * divider then anchors a consistent footer that adapts per status —
 * progress + "Continue", "Start program", "Review", "Upgrade" or the
 * Start-Here lock note — so every card ends with a clear next action.
 * The whole card is one link; hover lifts it, scales the artwork a touch
 * and nudges the footer arrow.
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
      className="group flex h-full flex-col rounded-[18px] border border-ink-100 bg-white p-3 shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-[0_22px_44px_-24px_rgba(26,24,22,0.42),0_6px_14px_-8px_rgba(26,24,22,0.14)]"
    >
      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div className="relative aspect-video overflow-hidden rounded-[12px] bg-cream-100">
        <CoverArt
          hue={program.cover_hue}
          status={program.status}
          coverImageUrl={program.cover_image_url}
        />

        {/* inset hairline — seats the artwork in its frame */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px] ring-1 ring-inset ring-ink-900/[0.07]"
        />

        {/* Status pill (top-left) — glassy, reads on any artwork */}
        {isInProgress && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-800 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.3)] ring-1 ring-ink-900/[0.06] backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-rose-500" />
            In progress
          </span>
        )}
        {isCompleted && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-800 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.3)] ring-1 ring-ink-900/[0.06] backdrop-blur-sm">
            <CheckCircle2 className="size-3 text-success" strokeWidth={2.5} />
            Completed
          </span>
        )}

        {/* Pro pill (top-right) */}
        {isPro && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-700 shadow-[0_2px_10px_-2px_rgba(26,24,22,0.3)] ring-1 ring-amber-500/25 backdrop-blur-sm">
            <Crown className="size-3" strokeWidth={2.5} />
            Pro
          </span>
        )}

        {/* Duration pill (bottom-right, YouTube-style) */}
        {duration && !isLocked && (
          <span className="absolute bottom-2.5 right-2.5 rounded-[7px] bg-ink-900/72 px-2 py-[3px] text-[11px] font-semibold tracking-[0.01em] text-white backdrop-blur-sm">
            {duration}
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
      <div className="flex flex-1 flex-col px-1 pb-0.5 pt-3">
        {/* Category eyebrow — editorial, never squeezes the title */}
        {program.category_label && (
          <span className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-rose-600/85">
            {program.category_label}
          </span>
        )}

        <h3 className="text-[15.5px] font-semibold leading-snug text-ink-900 line-clamp-2 transition-colors group-hover:text-rose-700">
          {program.title}
        </h3>

        {program.description && (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500 line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Meta row — lessons / tasks */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] font-medium text-ink-500">
          {typeof program.total_lessons === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-ink-400" strokeWidth={1.8} />
              {program.total_lessons}{" "}
              {program.total_lessons === 1 ? "lesson" : "lessons"}
            </span>
          )}
          {typeof program.total_tasks === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <CheckSquare className="size-3.5 text-ink-400" strokeWidth={1.8} />
              {program.total_tasks} {program.total_tasks === 1 ? "task" : "tasks"}
            </span>
          )}
        </div>

        {/* ── Footer — divided, status-aware, consistent height ───── */}
        <div className="mt-auto pt-3.5">
          <div className="flex h-8 items-center gap-2.5 border-t border-ink-100/90 pt-3">
            {isLocked ? (
              <>
                <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-ink-500">
                  <Lock className="size-3.5 shrink-0 text-ink-400" strokeWidth={2} />
                  <span className="truncate">Complete Start Here to unlock</span>
                </span>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-rose-700">
                  Start Here
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </span>
              </>
            ) : isPro ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-500">
                  <Lock className="size-3.5 text-amber-600/80" strokeWidth={2} />
                  Pro membership
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-700">
                  Upgrade
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </span>
              </>
            ) : isNotStarted ? (
              <>
                <span className="text-[12.5px] font-semibold text-ink-700 transition-colors group-hover:text-rose-700">
                  Start program
                </span>
                <span className="ml-auto inline-flex size-7 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-all duration-200 group-hover:border-rose-600 group-hover:bg-rose-600 group-hover:text-white">
                  <ArrowRight className="size-3.5" strokeWidth={2.5} />
                </span>
              </>
            ) : (
              <>
                {/* in progress / completed — progress + contextual action */}
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200 ring-1 ring-inset ring-ink-900/[0.03]">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isCompleted
                        ? "bg-success"
                        : "bg-gradient-to-r from-rose-600 to-rose-400",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold tabular-nums",
                    isCompleted ? "text-success" : "text-ink-500",
                  )}
                >
                  {isCompleted && (
                    <CheckCircle2 className="size-3.5" strokeWidth={2} />
                  )}
                  {progress}%
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-rose-700">
                  {isCompleted ? "Review" : "Continue"}
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CoverArt({
  hue = "cream",
  status,
  coverImageUrl,
}: {
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
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {/* bottom scrim so the duration pill always reads on photos */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/30 to-transparent"
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
        "absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]",
        `bg-gradient-to-br ${palette}`,
      )}
    >
      {/* soft radial highlight — gives the flat gradient a light source */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 75% at 78% 18%, rgba(255,255,255,0.55), transparent 62%)," +
            "radial-gradient(45% 60% at 12% 92%, rgba(225,118,132,0.14), transparent 60%)",
        }}
      />

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
