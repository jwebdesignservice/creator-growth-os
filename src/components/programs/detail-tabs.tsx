"use client";

import { useState, type ReactNode } from "react";
import { LayoutGrid, ListTree, FolderClosed, CheckSquare } from "lucide-react";
import { cn } from "@/lib/cn";

type Tab = "overview" | "curriculum" | "resources" | "tasks";

type Props = {
  tasksCount?: number;
  overview: ReactNode;
  curriculum: ReactNode;
  resources: ReactNode;
  tasks: ReactNode;
};

export function DetailTabs({
  tasksCount,
  overview,
  curriculum,
  resources,
  tasks,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "curriculum", label: "Curriculum", icon: ListTree },
    { key: "resources", label: "Resources & Notes", icon: FolderClosed },
    { key: "tasks", label: "Tasks", icon: CheckSquare, badge: tasksCount },
  ];

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-ink-100 mb-6 flex-wrap">
        {tabs.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "h-11 px-4 inline-flex items-center gap-2 text-[13.5px] font-medium border-b-2 -mb-px cursor-pointer transition-colors",
                active
                  ? "text-rose-700 border-rose-500"
                  : "text-ink-500 hover:text-ink-900 border-transparent",
              )}
            >
              <Icon className="size-4" strokeWidth={1.8} />
              {t.label}
              {typeof t.badge === "number" && t.badge > 0 && (
                <span className="text-ink-500 font-normal">({t.badge})</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "overview" && overview}
      {tab === "curriculum" && curriculum}
      {tab === "resources" && resources}
      {tab === "tasks" && tasks}
    </div>
  );
}
