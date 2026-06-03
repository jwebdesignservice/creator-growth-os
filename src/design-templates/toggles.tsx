/* Toggles ──────────────────────────────────────────────────────────────
   Switches, checkboxes and radios — each shown across its real states
   (on / off / disabled) with labels and helper text. Checkboxes and radios
   use `accent-rose-600` so the control is brand-coloured natively, without
   depending on a forms plugin.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

function Switch({
  defaultOn = false,
  disabled = false,
}: {
  defaultOn?: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        on ? "bg-rose-600" : "bg-ink-200",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function ToggleSwitch() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <span>
          <span className="block text-[13.5px] font-medium text-ink-900">Email notifications</span>
          <span className="block text-[12px] text-ink-500">Weekly digest and task reminders.</span>
        </span>
        <Switch defaultOn />
      </label>
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <span className="block text-[13.5px] font-medium text-ink-900">Product tips</span>
        <Switch />
      </label>
      <label className="flex items-center justify-between gap-4">
        <span className="block text-[13.5px] font-medium text-ink-400">SMS alerts (coming soon)</span>
        <Switch disabled />
      </label>
    </div>
  );
}

export function Checkbox() {
  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked
          className="mt-0.5 size-4 rounded-[5px] border-ink-300 accent-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        />
        <span>
          <span className="block text-[13.5px] text-ink-900 leading-tight">Email me product updates</span>
          <span className="block text-[12px] text-ink-500">No more than once a week.</span>
        </span>
      </label>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="size-4 rounded-[5px] border-ink-300 accent-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        />
        <span className="text-[13.5px] text-ink-900">Remember this device</span>
      </label>
      <label className="flex items-center gap-2.5 cursor-not-allowed">
        <input type="checkbox" disabled className="size-4 rounded-[5px] border-ink-200 accent-rose-600 opacity-60" />
        <span className="text-[13.5px] text-ink-400">Locked option</span>
      </label>
    </div>
  );
}

export function RadioGroup() {
  const options = [
    { label: "Weekly", hint: "Recommended" },
    { label: "Monthly", hint: "" },
    { label: "Quarterly", hint: "" },
  ];
  return (
    <div className="space-y-2.5">
      {options.map((o, i) => (
        <label key={o.label} className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="cadence-demo"
            defaultChecked={i === 0}
            className="size-4 border-ink-300 accent-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          />
          <span className="text-[13.5px] text-ink-900">{o.label}</span>
          {o.hint && (
            <span className="text-[11px] font-semibold text-rose-600">{o.hint}</span>
          )}
        </label>
      ))}
      <label className="flex items-center gap-2.5 cursor-not-allowed">
        <input type="radio" name="cadence-demo" disabled className="size-4 border-ink-200 accent-rose-600 opacity-60" />
        <span className="text-[13.5px] text-ink-400">Yearly (Pro only)</span>
      </label>
    </div>
  );
}
