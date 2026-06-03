/* Forms ─────────────────────────────────────────────────────────────────
   Form building blocks beyond the basic text input: a labelled select, a
   file dropzone, and a multi-select filter chip row. FilterChips holds
   selection state → client module.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { ChevronDown, UploadCloud, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function SelectField() {
  return (
    <div className="w-[280px] max-w-full">
      <label
        htmlFor="plan-select"
        className="block text-[12.5px] font-medium text-ink-700 mb-1.5"
      >
        Membership plan
      </label>
      <div className="relative">
        <select
          id="plan-select"
          defaultValue="pro"
          className="w-full h-11 pl-3.5 pr-10 rounded-[12px] bg-white border border-ink-200 text-[13.5px] text-ink-900 appearance-none cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
        >
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400"
          strokeWidth={2}
        />
      </div>
      <p className="mt-1.5 text-[11.5px] text-ink-400">
        Controls which programs this member can access.
      </p>
    </div>
  );
}

export function FileDropzone() {
  return (
    <div className="w-[360px] max-w-full">
      <div
        role="button"
        tabIndex={0}
        className="rounded-[14px] border-2 border-dashed border-ink-200 bg-cream-50 hover:border-rose-300 hover:bg-rose-50/40 transition-colors px-6 py-8 flex flex-col items-center text-center cursor-pointer focus:outline-none focus-visible:border-rose-400 focus-visible:ring-2 focus-visible:ring-rose-200"
      >
        <span className="size-12 rounded-full bg-white border border-ink-100 text-rose-600 flex items-center justify-center mb-3">
          <UploadCloud className="size-6" strokeWidth={1.8} />
        </span>
        <p className="text-[13.5px] font-semibold text-ink-900">
          Drop your video here
        </p>
        <p className="text-[12px] text-ink-500 mt-0.5">
          or <span className="text-rose-600 font-medium">browse files</span> —
          MP4 up to 2&nbsp;GB
        </p>
      </div>
    </div>
  );
}

export function FilterChips() {
  const all = ["Active", "At risk", "Inactive", "Completed", "Pro plan"];
  const [sel, setSel] = useState<string[]>(["Active", "Completed"]);
  const toggle = (c: string) =>
    setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  return (
    <div className="flex flex-wrap items-center gap-2 max-w-[440px]">
      {all.map((c) => {
        const on = sel.includes(c);
        return (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            aria-pressed={on}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-medium border cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
              on
                ? "bg-rose-600 border-rose-600 text-white"
                : "bg-white border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900",
            )}
          >
            {on && <Check className="size-3.5" strokeWidth={2.5} />}
            {c}
          </button>
        );
      })}
      {sel.length > 0 && (
        <button
          type="button"
          onClick={() => setSel([])}
          className="inline-flex items-center h-8 px-2.5 text-[12.5px] font-semibold text-ink-500 hover:text-rose-600 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 rounded-full"
        >
          Clear ({sel.length})
        </button>
      )}
    </div>
  );
}
