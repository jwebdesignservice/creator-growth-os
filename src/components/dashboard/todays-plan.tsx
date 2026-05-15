"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type TodayTask = {
  id: string;
  title: string;
  completed: boolean;
};

export function TodaysPlan({ tasks: initialTasks }: { tasks: TodayTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="card p-5 flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h3 className="font-display text-[19px] text-ink-900">Today&apos;s Plan</h3>
        <span className="chip chip-rose">{tasks.length} tasks</span>
      </header>

      <ul className="space-y-2.5 flex-1">
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() =>
                setTasks((arr) =>
                  arr.map((x) =>
                    x.id === t.id ? { ...x, completed: !x.completed } : x,
                  ),
                )
              }
              className="flex items-start gap-3 w-full text-left group"
            >
              <span
                className={cn(
                  "mt-0.5 size-[18px] rounded-full border-2 inline-flex items-center justify-center shrink-0 transition-colors",
                  t.completed
                    ? "bg-rose-500 border-rose-500"
                    : "border-ink-300 group-hover:border-rose-400",
                )}
              >
                {t.completed && (
                  <Check className="size-3 text-white" strokeWidth={3} />
                )}
              </span>
              <span
                className={cn(
                  "text-[13.5px] leading-snug",
                  t.completed
                    ? "text-ink-400 line-through"
                    : "text-ink-700",
                )}
              >
                {t.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Link
        href="/missions"
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
      >
        View full plan <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>

      {completed === tasks.length && tasks.length > 0 && (
        <div className="mt-3 text-[11.5px] text-success font-medium">
          🎉 You completed today&apos;s plan!
        </div>
      )}
    </div>
  );
}
