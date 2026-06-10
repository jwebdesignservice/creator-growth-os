"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { MissionCard, type Mission, type MissionType } from "./mission-card";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import { cn } from "@/lib/cn";

/**
 * The Tasks tab — the mission cards with an in-tab filter row (Today / This
 * Week / All Missions / Completed) plus a type filter in the header. Stats and
 * the challenge live in the Mission Activity tab; this view stays focused on
 * the work itself.
 */

type TimeFilter = "today" | "week" | "all" | "completed";

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "all", label: "All Missions" },
  { key: "completed", label: "Completed" },
];

const TYPE_FILTERS: (MissionType | "all")[] = [
  "all",
  "posting",
  "strategy",
  "engagement",
  "performance",
  "monetization",
  "confidence",
];

type Props = {
  missions: Mission[];
  onToggle: (id: string, completed: boolean) => Promise<unknown>;
  onDelete?: (id: string) => Promise<unknown>;
  canDelete?: boolean;
};

export function TasksList({ missions, onToggle, onDelete, canDelete }: Props) {
  const [time, setTime] = useState<TimeFilter>("today");
  const [typeFilter, setTypeFilter] = useState<MissionType | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const counts = useMemo(
    () => ({
      today: missions.filter((m) => !m.completed).length,
      completed: missions.filter((m) => m.completed).length,
      total: missions.length,
    }),
    [missions],
  );

  const visible = useMemo(() => {
    let rows = missions;
    if (time === "today") rows = rows.filter((m) => !m.completed);
    if (time === "completed") rows = rows.filter((m) => m.completed);
    if (typeFilter !== "all") rows = rows.filter((m) => m.type === typeFilter);
    return rows;
  }, [missions, time, typeFilter]);

  return (
    <div className="space-y-4">
      <WorkspaceHeader title="Tasks">
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
          >
            <span className="capitalize">
              {typeFilter === "all" ? "All types" : typeFilter}
            </span>
            <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[170px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTypeFilter(t);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-1.5 text-[13px] capitalize cursor-pointer hover:bg-cream-100",
                    typeFilter === t
                      ? "text-rose-700 font-semibold"
                      : "text-ink-700",
                  )}
                >
                  {t === "all" ? "All types" : t}
                </button>
              ))}
            </div>
          )}
        </div>
      </WorkspaceHeader>

      {/* Time filter row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TIME_FILTERS.map((f) => {
          const active = time === f.key;
          const badge =
            f.key === "today"
              ? counts.today
              : f.key === "completed"
                ? counts.completed
                : f.key === "all"
                  ? counts.total
                  : null;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setTime(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer",
                active
                  ? "bg-rose-600 text-white"
                  : "bg-white border border-ink-100 text-ink-600 hover:bg-cream-100 hover:text-ink-900",
              )}
            >
              {f.label}
              {badge !== null && badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-semibold",
                    active ? "bg-white/25 text-white" : "bg-cream-200 text-ink-700",
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mission grid */}
      {visible.length === 0 ? (
        <EmptyState time={time} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {visible.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              onToggle={onToggle}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ time }: { time: TimeFilter }) {
  const copy =
    time === "today"
      ? "All caught up — no missions remaining today. 🎉"
      : time === "completed"
        ? "Nothing completed yet. Knock out your first mission to get the streak going."
        : "Nothing here yet. Check back soon.";
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
        <Sparkles className="size-5" strokeWidth={1.8} />
      </div>
      <p className="text-ink-700 text-[14px]">{copy}</p>
    </div>
  );
}
