"use client";

import { useState } from "react";
import {
  GripVertical,
  ChevronRight,
  BookOpen,
  MoreVertical,
  Play,
} from "lucide-react";
import { cn } from "@/lib/cn";

type LessonItem = {
  slug: string;
  title: string;
  duration: string;
  status?: string;
};
type ModuleItem = {
  number: number;
  title: string;
  lessons: LessonItem[];
};

/* ─────────────────────────────────────────────────────────────────────────
   Expandable module/lesson outline shown in the admin program setup page.
   Drag handles are visual — actual reorder lands when we wire DnD.
   ───────────────────────────────────────────────────────────────────────── */

export function CurriculumOutline({ modules }: { modules: ModuleItem[] }) {
  // Default-expand the first module so admins land on something useful.
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(modules[0] ? [modules[0].number] : []),
  );

  function toggle(num: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-[12px] bg-cream-100/60 border border-dashed border-ink-200 px-6 py-10 text-center">
        <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
          <BookOpen className="size-5" strokeWidth={1.9} />
        </span>
        <p className="text-[13.5px] font-semibold text-ink-900 mb-1">
          No modules yet
        </p>
        <p className="text-[12.5px] text-ink-500">
          Add lessons in the Lessons admin to build the curriculum.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {modules.map((m) => {
        const isOpen = expanded.has(m.number);
        const totalMinutes = m.lessons.reduce(
          (sum, l) => sum + parseMinutes(l.duration),
          0,
        );
        return (
          <li
            key={m.number}
            className={cn(
              "rounded-[12px] border transition-colors",
              isOpen
                ? "border-rose-200 bg-rose-50/40"
                : "border-ink-100 bg-white",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(m.number)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-cream-100/50 transition-colors cursor-pointer rounded-[12px]"
            >
              <GripVertical
                className="size-4 text-ink-300 shrink-0 cursor-grab"
                strokeWidth={2}
                aria-hidden
              />
              <ChevronRight
                className={cn(
                  "size-4 text-ink-500 shrink-0 transition-transform",
                  isOpen && "rotate-90",
                )}
                strokeWidth={2}
                aria-hidden
              />
              <span className="size-7 rounded-[8px] bg-rose-100 text-rose-700 inline-flex items-center justify-center shrink-0">
                <BookOpen className="size-3.5" strokeWidth={2} />
              </span>
              <span className="flex-1 text-[13.5px] font-semibold text-ink-900 truncate">
                Module {m.number}: {m.title}
              </span>
              <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
                {m.lessons.length} lessons
              </span>
              <span className="inline-flex items-center h-6 px-2 rounded-[6px] bg-cream-100 text-ink-700 text-[11px] font-medium tabular-nums shrink-0">
                {totalMinutes} min
              </span>
              <span
                role="button"
                tabIndex={-1}
                className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="Module actions"
              >
                <MoreVertical className="size-4" strokeWidth={2} />
              </span>
            </button>

            {isOpen && (
              <ul className="border-t border-rose-200/60 px-3 py-2 space-y-0.5">
                {m.lessons.map((l, j) => (
                  <li
                    key={l.slug}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] hover:bg-white transition-colors"
                  >
                    <GripVertical
                      className="size-3.5 text-ink-300 shrink-0 cursor-grab"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span className="size-5 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                      <Play
                        className="size-2.5 ml-0.5"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </span>
                    <span className="text-[12.5px] text-ink-500 tabular-nums w-10 shrink-0">
                      {m.number}.{j + 1}
                    </span>
                    <span className="flex-1 text-[13px] text-ink-900 truncate">
                      {l.title}
                    </span>
                    <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
                      {l.duration}
                    </span>
                    <span className="inline-flex items-center h-5 px-1.5 rounded-[5px] bg-ink-100 text-ink-600 text-[10.5px] font-semibold shrink-0">
                      Draft
                    </span>
                    <button
                      type="button"
                      className="size-6 rounded-[6px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 shrink-0 cursor-pointer"
                      aria-label="Lesson actions"
                    >
                      <MoreVertical className="size-3.5" strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function parseMinutes(d: string): number {
  // Supports "6 min", "12:45", or a bare number.
  const minMatch = d.match(/^(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10);
  const colonMatch = d.split(":")[0];
  const n = parseInt(colonMatch, 10);
  return Number.isFinite(n) ? n : 0;
}
