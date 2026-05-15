"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Play, Check, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/cn";

export type Lesson = {
  slug: string;
  title: string;
  duration: string;
  status: "completed" | "current" | "todo" | "locked";
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

  return (
    <div className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[19px] text-ink-900">
          Program Curriculum
        </h3>
        <button
          type="button"
          onClick={expandAll}
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
        >
          {allOpen ? "Collapse All" : "Expand All"}
        </button>
      </header>

      <ul className="divide-y divide-ink-100">
        {modules.map((m) => {
          const isOpen = expanded.has(m.number);
          const isBonus = !!m.bonus;
          const isPro = !!m.pro_only;
          return (
            <li key={m.number} className={cn(isBonus && "bg-rose-50/40 -mx-5 px-5 rounded-md mt-2")}>
              <button
                type="button"
                onClick={() => toggle(m.number)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 py-3.5 text-left cursor-pointer"
              >
                <span
                  className={cn(
                    "size-7 rounded-full inline-flex items-center justify-center text-[11.5px] font-semibold shrink-0",
                    isBonus
                      ? "bg-cream-200 text-ink-700 border border-rose-200"
                      : "bg-rose-500 text-white",
                  )}
                >
                  {isBonus ? <Lock className="size-3.5" strokeWidth={2} /> : m.number}
                </span>
                {isBonus && (
                  <span className="chip chip-gold text-[10px]">BONUS</span>
                )}
                <span className="flex-1 text-[14px] font-semibold text-ink-900">
                  {m.title}
                </span>
                {isPro && (
                  <span className="chip chip-rose text-[10px]">Pro Only</span>
                )}
                <span className="text-[12px] text-ink-500">
                  {m.lessons.length} Lessons
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-ink-500 transition-transform shrink-0",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>

              {isOpen && (
                <ul className="pb-3">
                  {m.lessons.map((l) => (
                    <LessonRow
                      key={l.slug}
                      lesson={l}
                      moduleNumber={m.number}
                      programSlug={programSlug}
                      locked={isPro}
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LessonRow({
  lesson,
  moduleNumber,
  programSlug,
  locked,
}: {
  lesson: Lesson;
  moduleNumber: number;
  programSlug: string;
  locked: boolean;
}) {
  const isCurrent = lesson.status === "current";
  const isDone = lesson.status === "completed";
  const isLocked = locked || lesson.status === "locked";

  const inner = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-[10px] transition-colors",
        isCurrent
          ? "bg-rose-50 border border-rose-200"
          : "hover:bg-cream-100",
      )}
    >
      <span
        className={cn(
          "size-6 rounded-full inline-flex items-center justify-center shrink-0",
          isDone
            ? "bg-rose-100 text-rose-600"
            : isCurrent
              ? "bg-rose-500 text-white"
              : isLocked
                ? "bg-cream-200 text-ink-400"
                : "bg-cream-100 text-ink-400 border border-ink-200",
        )}
      >
        {isDone ? (
          <Check className="size-3" strokeWidth={3} />
        ) : isLocked ? (
          <Lock className="size-3" strokeWidth={2} />
        ) : isCurrent ? (
          <Play className="size-3 ml-0.5" fill="currentColor" />
        ) : (
          <Circle className="size-2.5" strokeWidth={2} />
        )}
      </span>
      <span
        className={cn(
          "text-[12px] text-ink-500 tabular-nums",
        )}
      >
        {moduleNumber}.{lesson.slug.match(/^\d+$/) ? lesson.slug : ""}
      </span>
      <span
        className={cn(
          "flex-1 text-[13.5px]",
          isCurrent ? "font-semibold text-ink-900" : isLocked ? "text-ink-400" : "text-ink-700",
        )}
      >
        {lesson.title}
      </span>
      <span className="text-[11.5px] text-ink-500 tabular-nums">
        {lesson.duration}
      </span>
    </div>
  );

  if (isLocked) return <li className="my-1 cursor-not-allowed opacity-80">{inner}</li>;

  return (
    <li className="my-1">
      <Link href={`/tutorials/${lesson.slug}`} className="block">
        {inner}
      </Link>
    </li>
  );
}
