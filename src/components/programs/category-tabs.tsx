"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/cn";

type Filter =
  | "all"
  | "starter"
  | "growth"
  | "authority"
  | "monetization"
  | "pro";

const TABS: { key: Filter; label: string; pro?: boolean }[] = [
  { key: "all", label: "All Programs" },
  { key: "starter", label: "Starter Creator" },
  { key: "growth", label: "Growth Creator" },
  { key: "authority", label: "Authority Creator" },
  { key: "monetization", label: "Monetization Creator" },
  { key: "pro", label: "Pro Only", pro: true },
];

type Props = {
  value: Filter;
  onChange: (next: Filter) => void;
};

/**
 * Client filter pills used by the Programs library. The parent owns the
 * filtered list so the cards re-render without remounting.
 */
export function CategoryTabs({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13px] font-medium border transition-colors cursor-pointer",
              active
                ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                : "bg-white border-ink-100 text-ink-700 hover:bg-cream-100",
            )}
          >
            {t.pro && (
              <Crown
                className={cn(
                  "size-3.5",
                  active ? "text-white" : "text-gold-500",
                )}
                strokeWidth={2}
              />
            )}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export type { Filter };
