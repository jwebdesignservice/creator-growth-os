"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Play, Check, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

export type RailLesson = {
  slug: string;
  title: string;
  duration: string;
  status: string;
};
export type RailModule = {
  number: number;
  title: string;
  lessons: RailLesson[];
};

function minutesOf(d: string): number {
  const [m] = d.split(":");
  const n = parseInt(m ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}

function fmtDur(total: number): string {
  if (total <= 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m}min`;
}

/**
 * "Course content" rail — flush, line-divided (no card chrome): a bold
 * header over hairline-divided module groups, each expanding to lesson rows.
 * Rows carry a left accent + tint when current, a numbered title with a
 * status/duration line under it, and a status icon on the right
 * (✓ completed · ▶ playable · 🔒 locked).
 */
export function CourseContentRail({
  modules,
  programSlug,
  currentSlug,
}: {
  modules: RailModule[];
  programSlug: string;
  currentSlug: string;
}) {
  const currentModule =
    modules.find((m) => m.lessons.some((l) => l.slug === currentSlug))
      ?.number ?? modules[0]?.number;
  const [open, setOpen] = useState<Set<number>>(
    new Set(currentModule != null ? [currentModule] : []),
  );

  function toggle(n: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  // Text/content is inset by PADX; structural lines + row highlights span the
  // full panel width (these elements carry no horizontal padding, so their
  // borders/backgrounds bleed edge-to-edge while PADX insets the text).
  const PADX = "px-5 lg:pl-6 lg:pr-[var(--space-page-x)]";

  return (
    <section>
      <h2
        className={cn(
          "text-[20px] font-bold text-ink-900 pb-3.5 border-b-2 border-ink-100",
          PADX,
        )}
      >
        Course content
      </h2>

      <ul className="divide-y divide-ink-100">
        {modules.map((m) => {
          const isOpen = open.has(m.number);
          const done = m.lessons.filter((l) => l.status === "completed").length;
          const dur = fmtDur(
            m.lessons.reduce((s, l) => s + minutesOf(l.duration), 0),
          );
          return (
            <li key={m.number}>
              <button
                type="button"
                onClick={() => toggle(m.number)}
                aria-expanded={isOpen}
                className={cn(
                  "w-full flex items-center gap-3 py-3.5 text-left cursor-pointer group/mod",
                  PADX,
                )}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-ink-900 truncate group-hover/mod:text-rose-700 transition-colors">
                    {m.title}
                  </span>
                  <span className="block mt-0.5 text-[11.5px] text-ink-500 tabular-nums">
                    {done}/{m.lessons.length} · {dur} Total
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-ink-500 shrink-0 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <ul className="pb-3">
                    {m.lessons.map((l, i) => {
                      const isCurrent = l.slug === currentSlug;
                      const isDone = l.status === "completed";
                      const isLocked = l.status === "locked";

                      const row = (
                        <span
                          className={cn(
                            "flex items-center gap-3 border-l-[3px] py-3 transition-colors",
                            PADX,
                            isCurrent
                              ? "border-rose-600 bg-rose-50/80"
                              : isLocked
                                ? "border-transparent opacity-60"
                                : "border-transparent hover:bg-cream-50",
                          )}
                        >
                          <span className="flex-1 min-w-0">
                            <span
                              className={cn(
                                "block truncate text-[12.5px]",
                                isCurrent
                                  ? "font-semibold text-rose-700"
                                  : "font-medium text-ink-800",
                              )}
                            >
                              {String(i + 1).padStart(2, "0")}: {l.title}
                            </span>
                            <span className="block mt-0.5 text-[11px] text-ink-500 tabular-nums">
                              {isDone
                                ? "Completed"
                                : isCurrent
                                  ? "Now playing"
                                  : l.duration || "—"}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-full shrink-0",
                              isDone
                                ? "bg-rose-500 text-white"
                                : isCurrent
                                  ? "border-[1.5px] border-rose-500 text-rose-600 bg-white"
                                  : isLocked
                                    ? "border border-ink-200 bg-white text-ink-400"
                                    : "border border-ink-300 bg-white text-ink-500",
                            )}
                          >
                            {isDone ? (
                              <Check className="size-3" strokeWidth={3} />
                            ) : isLocked ? (
                              <Lock className="size-2.5" strokeWidth={2.2} />
                            ) : (
                              <Play
                                className="size-2.5 translate-x-px"
                                fill="currentColor"
                                strokeWidth={0}
                              />
                            )}
                          </span>
                        </span>
                      );

                      return (
                        <li key={l.slug}>
                          {isLocked ? (
                            row
                          ) : (
                            <Link
                              href={`/programs/${programSlug}/${l.slug}`}
                              className="block"
                            >
                              {row}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
