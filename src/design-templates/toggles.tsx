/* Toggles ──────────────────────────────────────────────────────────────
   Toggle switches, checkboxes, radio buttons.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";

export function ToggleSwitch() {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
        (on ? "bg-rose-600" : "bg-ink-200")
      }
    >
      <span
        className={
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform " +
          (on ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}

export function Checkbox() {
  return (
    <label className="inline-flex items-center gap-2 text-[13.5px] text-ink-900 cursor-pointer">
      <input
        type="checkbox"
        defaultChecked
        className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-200"
      />
      Remember me
    </label>
  );
}

export function RadioGroup() {
  return (
    <div className="space-y-2">
      {["Weekly", "Monthly", "Quarterly"].map((label, i) => (
        <label
          key={label}
          className="inline-flex items-center gap-2 text-[13.5px] text-ink-900 cursor-pointer mr-4"
        >
          <input
            type="radio"
            name="cadence-demo"
            defaultChecked={i === 0}
            className="size-4 border-ink-300 text-rose-600 focus:ring-rose-200"
          />
          {label}
        </label>
      ))}
    </div>
  );
}
