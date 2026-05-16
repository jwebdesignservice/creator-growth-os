"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "my_plans", label: "My Plans" },
  { key: "calendar", label: "Content Calendar" },
  { key: "templates", label: "Templates" },
  { key: "best_times", label: "Best Times" },
  { key: "analytics", label: "Analytics" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type Props = {
  defaultTab?: TabKey;
};

export function PostingTabs({ defaultTab = "my_plans" }: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab);

  return (
    <div className="border-b border-ink-100">
      <ul className="flex items-center gap-1 flex-wrap">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <li key={t.key}>
              <button
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "h-11 px-4 inline-flex items-center text-[13.5px] font-medium border-b-2 -mb-px cursor-pointer transition-colors",
                  active
                    ? "text-rose-700 border-rose-500"
                    : "text-ink-500 hover:text-ink-900 border-transparent",
                )}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
