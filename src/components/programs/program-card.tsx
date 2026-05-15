import Link from "next/link";
import { Lock, BookOpen, CheckSquare, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

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

export function ProgramCard({ program }: { program: ProgramRow }) {
  const isPro = program.status === "pro_only";
  const href = isPro ? "/billing?upgrade=pro" : `/programs/${program.slug}`;
  return (
    <Link
      href={href}
      className="card overflow-hidden hover:shadow-card transition-shadow group flex flex-col"
    >
      <CoverArt hue={program.cover_hue} status={program.status} />

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="text-[14px] font-semibold text-ink-900 leading-snug">
            {program.title}
          </div>
          {program.category_label && !isPro && (
            <span className="chip chip-rose shrink-0">
              {program.category_label}
            </span>
          )}
        </div>
        <div className="text-[12px] text-ink-500 leading-snug mb-3 line-clamp-2 flex-1">
          {program.description}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-ink-500 mb-3">
          {typeof program.total_lessons === "number" && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3" strokeWidth={1.8} />
              {program.total_lessons} Lessons
            </span>
          )}
          {typeof program.total_tasks === "number" && (
            <span className="inline-flex items-center gap-1">
              <CheckSquare className="size-3" strokeWidth={1.8} />
              {program.total_tasks} Tasks
            </span>
          )}
          {typeof program.estimated_days === "number" && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" strokeWidth={1.8} />
              {program.estimated_days} Days
            </span>
          )}
        </div>

        {isPro ? (
          <div className="h-9 inline-flex items-center justify-center w-full rounded-[10px] bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-medium">
            <Lock className="size-3.5 mr-1.5" strokeWidth={2} />
            Upgrade to Pro
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden flex-1">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${program.progress ?? 0}%` }}
              />
            </div>
            <span className="text-[11px] text-ink-500 font-medium tabular-nums shrink-0">
              {program.progress ?? 0}%
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
        "h-[140px] relative overflow-hidden",
        `bg-gradient-to-br ${palette}`,
      )}
    >
      {/* Decorative dots */}
      <svg
        className="absolute inset-0 text-rose-300/70"
        viewBox="0 0 200 140"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="30" cy="20" r="2" />
        <circle cx="170" cy="30" r="3" />
        <circle cx="50" cy="110" r="2.5" />
        <circle cx="150" cy="100" r="2" />
      </svg>

      {/* Status pill */}
      <span
        className={cn(
          "absolute top-3 left-3 chip text-[10.5px] font-semibold uppercase tracking-wide",
          isPro
            ? "chip-rose"
            : status === "in_progress"
              ? "chip-rose"
              : status === "completed"
                ? "chip-success"
                : "chip-gold",
        )}
      >
        {isPro
          ? "PRO ONLY"
          : status === "in_progress"
            ? "IN PROGRESS"
            : status === "completed"
              ? "COMPLETED"
              : "NOT STARTED"}
      </span>

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
