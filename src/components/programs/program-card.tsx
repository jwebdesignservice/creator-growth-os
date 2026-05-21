import Link from "next/link";
import { Lock, BookOpen, CheckSquare, CalendarDays, CheckCircle2 } from "lucide-react";
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
  category_label?: string;
  status: "in_progress" | "not_started" | "pro_only" | "completed";
  progress?: number;
  total_lessons?: number;
  total_tasks?: number;
  estimated_days?: number;
};

/**
 * Program card — YouTube-inspired layout.
 *
 * Borderless (no card chrome): a rounded 16:9 "thumbnail" carries the
 * artwork, a dark days badge in the corner mirrors YouTube's duration
 * pill. Title + meta sit directly on the page background below, but unlike
 * a raw video listing we keep the full course info: a clean lessons/tasks
 * stat row and an explicit progress bar with its percentage.
 */
export function ProgramCard({ program }: { program: ProgramRow }) {
  const isPro        = program.status === "pro_only";
  const isCompleted  = program.status === "completed";
  const isInProgress = program.status === "in_progress";
  const href = isPro ? "/billing?upgrade=pro" : `/programs/${program.slug}`;
  const progress = Math.min(100, Math.max(0, program.progress ?? 0));

  return (
    <Link href={href} className="group flex flex-col gap-3">
      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <CoverArt hue={program.cover_hue} status={program.status} />

        {/* Status badge (top-left) — only for states worth calling out. */}
        {isInProgress && (
          <span className="absolute top-2.5 left-2.5 chip chip-rose text-[10px] font-semibold uppercase tracking-wide shadow-soft">
            In progress
          </span>
        )}
        {isCompleted && (
          <span className="absolute top-2.5 left-2.5 chip chip-success text-[10px] font-semibold uppercase tracking-wide shadow-soft">
            Completed
          </span>
        )}

      </div>

      {/* ── Meta (borderless, on the page background) ─────────────────── */}
      <div className="flex flex-col gap-2.5 px-0.5">
        {/* Title + category */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-ink-900 leading-snug line-clamp-2 group-hover:text-rose-700 transition-colors">
            {program.title}
          </h3>
          {program.category_label && !isPro && (
            <span className="chip chip-rose shrink-0">
              {program.category_label}
            </span>
          )}
        </div>

        {/* Short description */}
        {program.description && (
          <p className="text-[12.5px] text-ink-500 leading-snug line-clamp-2">
            {program.description}
          </p>
        )}

        {/* Stat row — lessons / tasks / duration. */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-ink-500">
          {typeof program.total_lessons === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-ink-400" strokeWidth={1.8} />
              {program.total_lessons} Lessons
            </span>
          )}
          {typeof program.total_tasks === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <CheckSquare className="size-3.5 text-ink-400" strokeWidth={1.8} />
              {program.total_tasks} Tasks
            </span>
          )}
          {typeof program.estimated_days === "number" && program.estimated_days > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-ink-400" strokeWidth={1.8} />
              {formatDuration(program.estimated_days)}
            </span>
          )}
        </div>

        {/* Progress / Pro CTA */}
        {isPro ? (
          <div className="h-9 inline-flex items-center justify-center w-full rounded-[10px] bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-medium">
            <Lock className="size-3.5 mr-1.5" strokeWidth={2} />
            Upgrade to Pro
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden flex-1">
              <div
                className={cn("h-full rounded-full", isCompleted ? "bg-success" : "bg-rose-500")}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[11.5px] font-semibold tabular-nums shrink-0 inline-flex items-center gap-1",
                isCompleted ? "text-success" : "text-ink-500",
              )}
            >
              {isCompleted && <CheckCircle2 className="size-3.5" strokeWidth={2} />}
              {progress}%
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function CoverArt({
  hue = "cream",
  status,
}: {
  hue?: "rose" | "cream" | "warm";
  status: ProgramRow["status"];
}) {
  const palette =
    hue === "rose"
      ? "from-rose-100/70 via-rose-50 to-cream-200"
      : hue === "warm"
        ? "from-cream-200 via-rose-100/40 to-cream-300"
        : "from-cream-200 via-cream-100 to-rose-100/40";

  const isPro = status === "pro_only";
  return (
    <div
      className={cn(
        "absolute inset-0 transition-[filter,transform] duration-300 group-hover:brightness-[0.98]",
        `bg-gradient-to-br ${palette}`,
      )}
    >
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

      {isPro && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-14 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-soft">
            <Lock className="size-6 text-rose-600" strokeWidth={2} />
          </div>
        </div>
      )}
    </div>
  );
}
