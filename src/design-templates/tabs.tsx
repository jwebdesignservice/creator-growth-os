/* Tabs ─────────────────────────────────────────────────────────────────
   Underline tab strip for switching between content panels. Carries proper
   tablist / tab / tabpanel semantics, a keyboard-focus ring, and an optional
   count badge (as used by the app's "Tasks (6)" tab).
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const TABS: { label: string; count?: number }[] = [
  { label: "Overview" },
  { label: "Activity", count: 3 },
  { label: "Settings" },
  { label: "Billing" },
];

export function TabStrip() {
  const [active, setActive] = useState(0);
  return (
    <div className="w-full max-w-2xl">
      <div role="tablist" aria-label="Account sections" className="flex items-center gap-1 border-b border-ink-100">
        {TABS.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              id={`dt-tab-${i}`}
              aria-selected={isActive}
              aria-controls={`dt-panel-${i}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative inline-flex items-center gap-2 h-10 px-3 text-[13.5px] font-medium rounded-t-[8px] cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200",
                isActive ? "text-rose-700" : "text-ink-500 hover:text-ink-900 hover:bg-cream-100/60",
              )}
            >
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-bold tabular-nums",
                    isActive ? "bg-rose-100 text-rose-700" : "bg-ink-100 text-ink-500",
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span aria-hidden className="absolute -bottom-px left-0 right-0 h-[2px] bg-rose-600 rounded-t" />
              )}
            </button>
          );
        })}
      </div>
      <div
        id={`dt-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`dt-tab-${active}`}
        className="card p-5 mt-4"
      >
        <h4 className="text-h5 text-ink-900 mb-1">{TABS[active].label}</h4>
        <p className="text-[13px] text-ink-500 leading-snug">
          Each tab reveals its own panel while keeping the surrounding layout
          steady — only this region changes as you switch.
        </p>
      </div>
    </div>
  );
}
