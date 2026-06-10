"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Check,
  Lock,
  BookOpen,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type Lesson = {
  slug: string;
  title: string;
  duration: string;
  status: "completed" | "current" | "todo" | "locked";
  coverUrl?: string | null;
};

export type Module = {
  number: number;
  title: string;
  lessons: Lesson[];
  bonus?: boolean;
  pro_only?: boolean;
};

type Props = {
  modules: Module[];
  programSlug: string;
  /** Module number to start expanded */
  initialExpanded?: number;
};

/**
 * Program curriculum — full-width module accordion. Each module header
 * carries its own completion meta + mini progress bar; lessons render as
 * media rows (cover thumbnail, title, duration, status chip) that open the
 * in-program player. Sections expand/collapse with the grid-rows trick so
 * the motion is smooth without height measuring.
 */
export function CurriculumAccordion({
  modules,
  programSlug,
  initialExpanded = 1,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set([initialExpanded]),
  );
  const [allOpen, setAllOpen] = useState(false);

  function toggle(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function expandAll() {
    if (allOpen) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(modules.map((m) => m.number)));
    }
    setAllOpen(!allOpen);
  }

  const allLessons = modules.flatMap((m) => m.lessons);
  const doneCount = allLessons.filter((l) => l.status === "completed").length;
  const totalCount = allLessons.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // No real lessons yet — show an honest empty state rather than fabricated
  // placeholder lessons. Keeps completion/progress tied to real data only.
  if (modules.length === 0) {
    return (
      <div className="card p-5">
        <header className="mb-3">
          <h3 className="text-h4 text-ink-900">Program Curriculum</h3>
        </header>
        <div className="rounded-[14px] bg-cream-50 border border-cream-200 text-center px-4 py-10">
          <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3 mx-auto">
            <BookOpen className="size-5" strokeWidth={1.9} aria-hidden />
          </span>
          <h4 className="text-[15px] font-semibold text-ink-900 mb-1">
            Lessons coming soon
          </h4>
          <p className="text-[13px] text-ink-500 max-w-sm mx-auto leading-snug">
            This program&apos;s curriculum is being prepared. Lessons will appear
            here as soon as they&apos;re published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* ── Header band — title · overall progress · expand all ───────── */}
      <header className="flex items-center justify-between gap-4 flex-wrap px-5 sm:px-6 py-4 border-b border-ink-100">
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900 leading-tight">
            Program Curriculum
          </h3>
          <p className="text-[12px] text-ink-500 mt-0.5">
            {modules.length} module{modules.length === 1 ? "" : "s"} ·{" "}
            {totalCount} lesson{totalCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="text-[12px] text-ink-500 whitespace-nowrap">
              <span className="font-bold text-ink-900 tabular-nums">
                {doneCount}
              </span>{" "}
              of {totalCount} completed
            </span>
            <span className="w-28 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <span
                className="block h-full rounded-full bg-rose-500 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </span>
          </div>
          <button
            type="button"
            onClick={expandAll}
            className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700 cursor-pointer whitespace-nowrap"
          >
            {allOpen ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </header>

      {/* ── Modules ────────────────────────────────────────────────────── */}
      <ul className="divide-y divide-ink-100 px-5 sm:px-6">
        {modules.map((m) => {
          const isOpen = expanded.has(m.number);
          const isBonus = !!m.bonus;
          const isPro = !!m.pro_only;
          const mDone = m.lessons.filter((l) => l.status === "completed").length;
          const mPct =
            m.lessons.length > 0
              ? Math.round((mDone / m.lessons.length) * 100)
              : 0;
          return (
            <li key={m.number}>
              <button
                type="button"
                onClick={() => toggle(m.number)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3.5 py-4 text-left cursor-pointer group/header"
              >
                <span
                  className={cn(
                    "size-9 rounded-[11px] inline-flex items-center justify-center text-[13px] font-bold shrink-0",
                    isBonus
                      ? "bg-cream-200 text-ink-700 border border-rose-200"
                      : "bg-rose-500 text-white",
                  )}
                >
                  {isBonus ? <Lock className="size-4" strokeWidth={2} /> : m.number}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14.5px] font-semibold text-ink-900 group-hover/header:text-rose-700 transition-colors">
                      {m.title}
                    </span>
                    {isBonus && <span className="chip chip-gold text-[10px]">BONUS</span>}
                    {isPro && <span className="chip chip-rose text-[10px]">Pro Only</span>}
                  </span>
                  <span className="flex items-center gap-2.5 mt-1">
                    <span className="text-[11.5px] text-ink-500 tabular-nums whitespace-nowrap">
                      {mDone}/{m.lessons.length} completed
                    </span>
                    <span className="w-24 h-1 rounded-full bg-cream-200 overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-rose-500 transition-[width] duration-500"
                        style={{ width: `${mPct}%` }}
                      />
                    </span>
                  </span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 whitespace-nowrap">
                  {m.lessons.length} Lesson{m.lessons.length === 1 ? "" : "s"}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-ink-500 transition-transform duration-300 shrink-0",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>

              {/* Smooth expand/collapse */}
              <div
                className="grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <ul className="pb-4 space-y-1.5">
                    {m.lessons.map((l, i) => (
                      <LessonRow
                        key={l.slug}
                        lesson={l}
                        index={i}
                        programSlug={programSlug}
                        locked={isPro}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Lesson media row ──────────────────────────────────────────────────── */

function LessonRow({
  lesson,
  index,
  programSlug,
  locked,
}: {
  lesson: Lesson;
  index: number;
  programSlug: string;
  locked: boolean;
}) {
  const isCurrent = lesson.status === "current";
  const isDone = lesson.status === "completed";
  const isLocked = locked || lesson.status === "locked";

  const inner = (
    <div
      className={cn(
        "group flex items-center gap-3.5 px-2.5 py-2.5 rounded-[12px] transition-colors",
        isCurrent
          ? "bg-rose-50/80 ring-1 ring-rose-200"
          : !isLocked && "hover:bg-cream-50",
      )}
    >
      {/* Cover thumbnail — real cover, or a quiet gradient placeholder */}
      <span className="relative h-[46px] w-[76px] rounded-[9px] overflow-hidden shrink-0 bg-gradient-to-br from-cream-200 via-cream-100 to-rose-100/50">
        {lesson.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lesson.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            lesson.coverUrl && "bg-ink-900/20",
          )}
        >
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full shadow-[0_2px_8px_-2px_rgba(26,24,22,0.4)] transition-transform duration-300",
              isDone
                ? "bg-rose-500 text-white"
                : isLocked
                  ? "bg-white/90 text-ink-400"
                  : "bg-white/95 text-rose-600 group-hover:scale-110",
            )}
          >
            {isDone ? (
              <Check className="size-3.5" strokeWidth={3} />
            ) : isLocked ? (
              <Lock className="size-3" strokeWidth={2.2} />
            ) : (
              <Play className="size-3 translate-x-[1px]" fill="currentColor" strokeWidth={0} />
            )}
          </span>
        </span>
      </span>

      {/* Title + meta */}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[13.5px] truncate",
              isCurrent
                ? "font-semibold text-ink-900"
                : isLocked
                  ? "text-ink-400"
                  : "font-medium text-ink-800",
            )}
          >
            {lesson.title}
          </span>
          {isCurrent && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-rose-500 text-white px-2 py-[2px] text-[9.5px] font-bold uppercase tracking-[0.08em]">
              Up next
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5 mt-0.5 text-[11.5px] text-ink-500">
          <span className="tabular-nums">Lesson {index + 1}</span>
          {lesson.duration && (
            <>
              <span aria-hidden className="size-[3px] rounded-full bg-ink-300" />
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="size-3 text-ink-400" strokeWidth={2} />
                {lesson.duration}
              </span>
            </>
          )}
        </span>
      </span>

      {/* Status chip + open affordance */}
      {isDone && (
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-[10.5px] font-semibold">
          <Check className="size-3" strokeWidth={3} />
          Completed
        </span>
      )}
      {isLocked && (
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-cream-100 text-ink-500 px-2.5 py-1 text-[10.5px] font-semibold">
          <Lock className="size-3" strokeWidth={2.2} />
          Locked
        </span>
      )}
      {!isLocked && (
        <ChevronRight
          className="size-4 text-ink-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition shrink-0"
          strokeWidth={2}
        />
      )}
    </div>
  );

  if (isLocked) {
    return <li className="cursor-not-allowed opacity-75">{inner}</li>;
  }

  return (
    <li>
      {/* Stay inside the program — open the in-program lesson player rather
          than bouncing the user out into the standalone Tutorials route. */}
      <Link href={`/programs/${programSlug}/${lesson.slug}`} className="block">
        {inner}
      </Link>
    </li>
  );
}
