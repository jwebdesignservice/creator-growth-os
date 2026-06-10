"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, Check, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export type LearnOutcome = {
  /** Pre-rendered icon node (LucideIcon components aren't serializable
   *  across the server→client boundary, so the page renders them). */
  icon: ReactNode;
  title: string;
  desc: string;
};

/**
 * "What You'll Learn" as a single collapsible row — collapsed it reads as a
 * quiet summary line under the hero; expanding reveals the outcome list. The
 * open/close animates via the grid-template-rows 0fr→1fr trick (no height
 * measuring, reduced-motion safe since it's just a CSS transition).
 */
export function LearnCollapsible({
  outcomes,
  completed,
  flush = false,
}: {
  outcomes: LearnOutcome[];
  completed: number;
  /** Render without card chrome — for attaching inside another card
   *  (e.g. as the program hero's footer row). */
  flush?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const total = outcomes.length;

  return (
    <section className={flush ? "overflow-hidden" : "card overflow-hidden"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3.5 p-4 sm:px-5 text-left hover:bg-cream-50/70 transition-colors cursor-pointer"
      >
        <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <BookOpen className="size-5" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[18px] text-ink-900 leading-tight">
            What You&apos;ll Learn
          </span>
          <span className="block text-[12px] text-ink-500 mt-0.5 truncate">
            {total} outcome{total === 1 ? "" : "s"} — the skills this program
            builds
          </span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-[12px] font-semibold whitespace-nowrap shrink-0">
          <Sparkles className="size-3.5" strokeWidth={2} />
          {completed} / {total}
        </span>
        <ChevronDown
          className={cn(
            "size-5 text-ink-400 shrink-0 transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <ul className="border-t border-ink-100">
            {outcomes.map((o, i) => {
              const isDone = i < completed;
              return (
                <li
                  key={o.title}
                  className={cn(
                    "flex items-center gap-4 p-4 sm:px-5",
                    i > 0 && "border-t border-ink-100",
                  )}
                >
                  <span className="size-10 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                    {o.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-ink-900 leading-snug">
                      {o.title}
                    </span>
                    <span className="block text-[12px] text-ink-500 leading-snug mt-0.5">
                      {o.desc}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "size-7 rounded-full inline-flex items-center justify-center shrink-0",
                      isDone
                        ? "bg-rose-100 text-rose-600"
                        : "bg-cream-100 text-ink-300",
                    )}
                    aria-label={isDone ? "Mastered" : "Not yet mastered"}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
