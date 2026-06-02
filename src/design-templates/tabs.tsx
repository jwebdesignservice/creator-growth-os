/* Tabs ─────────────────────────────────────────────────────────────────
   Tab strips for switching between content panels.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";

const TABS = ["Overview", "Activity", "Settings", "Billing"];

export function TabStrip() {
  const [active, setActive] = useState(0);
  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-1 border-b border-ink-100">
        {TABS.map((label, i) => {
          const isActive = i === active;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActive(i)}
              className={
                "relative h-10 px-3 text-[13.5px] font-medium transition-colors " +
                (isActive ? "text-rose-700" : "text-ink-500 hover:text-ink-900")
              }
            >
              {label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-600 rounded-t"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="card p-5 mt-4">
        <h4 className="text-h5 text-ink-900 mb-1">{TABS[active]}</h4>
        <p className="text-[13px] text-ink-500 leading-snug">
          Content for {TABS[active]}. Swap this for the real per-tab
          panel when you wire it into a page.
        </p>
      </div>
    </div>
  );
}
