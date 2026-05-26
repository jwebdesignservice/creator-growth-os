"use client";

import { useState } from "react";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Play,
  FileText,
  Plus,
  Upload,
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
   Curriculum editor — module + lesson list with expand/collapse, drag
   handles (visual), and per-module action row. State is local until DnD
   reorder + lesson CRUD land.
   ───────────────────────────────────────────────────────────────────────── */

export function ModuleList({ modules }: { modules: ModuleItem[] }) {
  // First module expanded by default for fast scanning.
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(modules[0] ? [modules[0].number] : []),
  );

  function toggle(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  if (modules.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-[14px] font-semibold text-ink-900 mb-1">
          No modules yet
        </p>
        <p className="text-[13px] text-ink-500">
          Add your first module below to start structuring the curriculum.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {modules.map((m) => {
        const isOpen = expanded.has(m.number);
        const totalMin = m.lessons.reduce(
          (sum, l) => sum + parseMinutes(l.duration),
          0,
        );
        return (
          <li key={m.number} className="card overflow-hidden">
            {/* Module header */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
              <GripVertical
                className="size-4 text-ink-300 shrink-0 cursor-grab"
                strokeWidth={2}
                aria-hidden
              />
              <span className="size-7 rounded-[8px] bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[12.5px] font-bold shrink-0 tabular-nums">
                {m.number}
              </span>
              <button
                type="button"
                onClick={() => toggle(m.number)}
                className="flex-1 min-w-0 text-left text-[15px] font-bold text-ink-900 truncate hover:text-rose-700 transition-colors cursor-pointer"
              >
                Module {m.number}: {m.title}
              </button>
              <span className="text-[12.5px] text-ink-500 tabular-nums shrink-0 hidden sm:inline">
                {m.lessons.length} lessons
              </span>
              <span aria-hidden className="text-ink-300 hidden sm:inline">
                ·
              </span>
              <span className="text-[12.5px] text-ink-500 tabular-nums shrink-0 hidden sm:inline">
                {totalMin} min
              </span>
              <ModuleStatusPill />
              <button
                type="button"
                onClick={() => toggle(m.number)}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Collapse module" : "Expand module"}
                className="size-8 rounded-full border border-ink-200 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-colors shrink-0 cursor-pointer"
              >
                {isOpen ? (
                  <ChevronUp className="size-4" strokeWidth={2} />
                ) : (
                  <ChevronDown className="size-4" strokeWidth={2} />
                )}
              </button>
            </div>

            {/* Lessons */}
            {isOpen && (
              <>
                <ul className="border-t border-ink-100 divide-y divide-ink-100">
                  {m.lessons.map((l, j) => {
                    const idx = j + 1;
                    return (
                      <li
                        key={l.slug}
                        className="flex items-center gap-3 px-4 sm:px-5 py-3 transition-colors hover:bg-cream-50/70"
                      >
                        <GripVertical
                          className="size-3.5 text-ink-300 shrink-0 cursor-grab"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <span className="text-[12.5px] text-ink-500 tabular-nums w-9 shrink-0">
                          {m.number}.{idx}
                        </span>
                        <span className="flex-1 text-[13.5px] font-medium text-ink-900 truncate">
                          {l.title}
                        </span>
                        <LessonTypeBadge />
                        <span className="text-[12px] text-ink-500 tabular-nums w-14 text-right shrink-0">
                          {formatMinutes(l.duration)}
                        </span>
                        <LessonStatusPill status="draft" />
                        <button
                          type="button"
                          aria-label="Lesson actions"
                          className="size-7 rounded-[6px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 shrink-0 cursor-pointer"
                        >
                          <MoreVertical className="size-4" strokeWidth={2} />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Per-module actions */}
                <div className="flex items-center gap-5 flex-wrap px-4 sm:px-5 py-3 border-t border-ink-100 bg-cream-50/40">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                    Add lesson
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-700 hover:text-ink-900 transition-colors cursor-pointer"
                  >
                    <Upload className="size-3.5" strokeWidth={2} />
                    Bulk upload
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-700 hover:text-ink-900 transition-colors cursor-pointer"
                  >
                    <FileText className="size-3.5" strokeWidth={2} />
                    Section summary
                  </button>
                </div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ─── Bits ───────────────────────────────────────────────────────────────── */

function ModuleStatusPill() {
  // Visual placeholder until module-level publish state lands.
  return (
    <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] bg-white border border-ink-200 text-[12px] font-semibold text-ink-700 shrink-0 cursor-default">
      Draft
      <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
    </span>
  );
}

function LessonTypeBadge() {
  // Lessons in the schema don't carry a content type yet — defaulting to
  // Video Lesson (the dominant kind) keeps this honest until that lands.
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-500 w-28 shrink-0">
      <Play className="size-3" fill="currentColor" strokeWidth={0} aria-hidden />
      Video Lesson
    </span>
  );
}

function LessonStatusPill({ status }: { status: "draft" | "published" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-[78px] h-6 rounded-full text-[10.5px] font-semibold shrink-0",
        status === "published"
          ? "bg-success-bg text-success border border-success/20"
          : "bg-rose-50 text-rose-700 border border-rose-200",
      )}
    >
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

function parseMinutes(d: string): number {
  const minMatch = d.match(/^(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10);
  const n = parseInt(d.split(":")[0], 10);
  return Number.isFinite(n) ? n : 0;
}

function formatMinutes(d: string): string {
  return `${parseMinutes(d)} min`;
}
