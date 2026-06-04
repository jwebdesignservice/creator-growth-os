"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Mission, MissionType, Difficulty } from "./mission-card";

/**
 * Today's focus — a compact, sortable data table of the user's open missions
 * (Overview tab). Column headers sort the list (newest design pattern); the
 * active sort header is tinted rose with a direction arrow.
 */

type SortKey = "title" | "minutes" | "points";
type SortDir = "asc" | "desc";

const TYPE_LABEL: Record<MissionType, string> = {
  posting: "Posting",
  strategy: "Strategy",
  engagement: "Engagement",
  performance: "Performance",
  monetization: "Monetization",
  confidence: "Confidence",
};
const TYPE_PILL: Record<MissionType, string> = {
  posting: "bg-rose-100 text-rose-700",
  strategy: "bg-[#F6ECD3] text-[#8A6A1F]",
  engagement: "bg-[#EFE7F7] text-[#6B49A0]",
  performance: "bg-[#E3EDF8] text-[#355F90]",
  monetization: "bg-[#E2F0E5] text-[#2C7D47]",
  confidence: "bg-[#DCF0EE] text-[#287B73]",
};

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
const DIFF_PILL: Record<Difficulty, string> = {
  easy: "bg-[#E2F0E5] text-[#2C7D47]",
  medium: "bg-[#F6ECD3] text-[#8A6A1F]",
  hard: "bg-rose-100 text-rose-700",
};

const PILL =
  "inline-flex items-center h-[22px] px-2.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap";

export function TodayFocusTable({ tasks }: { tasks: Mission[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...tasks].sort((a, b) => {
    const cmp =
      sortKey === "title"
        ? a.title.localeCompare(b.title)
        : a[sortKey] - b[sortKey];
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "title" ? "asc" : "desc");
    }
  }

  return (
    <div className="card rounded-[16px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[660px] border-collapse">
          <thead>
            <tr className="border-b border-ink-100">
              <SortTh
                label="Task"
                active={sortKey === "title"}
                dir={sortDir}
                onClick={() => toggleSort("title")}
                className="text-left pl-5"
              />
              <SortTh
                label="Time"
                active={sortKey === "minutes"}
                dir={sortDir}
                onClick={() => toggleSort("minutes")}
              />
              <SortTh
                label="Points"
                active={sortKey === "points"}
                dir={sortDir}
                onClick={() => toggleSort("points")}
              />
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 py-3 px-4">
                Type
              </th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 py-3 px-4">
                Difficulty
              </th>
              <th className="text-right text-[11px] uppercase tracking-wider font-semibold text-ink-500 py-3 pr-5 pl-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {sorted.map((m) => (
              <tr
                key={m.id}
                className="hover:bg-cream-50/70 transition-colors"
              >
                <td className="py-4 pl-5 pr-4 max-w-[340px]">
                  <Link href="/missions?tab=tasks" className="block group">
                    <div className="text-[14px] font-semibold text-ink-900 group-hover:text-rose-700 transition-colors truncate">
                      {m.title}
                    </div>
                    <div className="text-[12.5px] text-ink-500 truncate">
                      {m.description}
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700">
                    <Clock className="size-3.5 text-ink-400" strokeWidth={2} />
                    {m.minutes} min
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-900 tabular-nums">
                    <Star
                      className="size-3.5 text-amber-400"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                    {m.points} pts
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={cn(PILL, TYPE_PILL[m.type])}>
                    {TYPE_LABEL[m.type]}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={cn(PILL, DIFF_PILL[m.difficulty])}>
                    {DIFF_LABEL[m.difficulty]}
                  </span>
                </td>
                <td className="py-4 pr-5 pl-4 text-right">
                  <Link
                    href="/missions?tab=tasks"
                    aria-label={`Open ${m.title}`}
                    className="inline-flex items-center justify-center size-8 rounded-[8px] text-ink-400 hover:text-ink-900 hover:bg-cream-200 transition-colors"
                  >
                    <MoreHorizontal className="size-4" strokeWidth={2} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortTh({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={cn("py-3 px-4", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer",
          active ? "text-rose-600" : "text-ink-500 hover:text-ink-800",
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="size-3" strokeWidth={2.5} />
          ) : (
            <ArrowDown className="size-3" strokeWidth={2.5} />
          )
        ) : (
          <ArrowUpDown className="size-3 text-ink-300" strokeWidth={2} />
        )}
      </button>
    </th>
  );
}
