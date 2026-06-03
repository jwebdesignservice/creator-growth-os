/* Pickers ─────────────────────────────────────────────────────────────────
   Selection popovers — a date-range picker, a time picker, and a searchable
   combobox. Complements the month mini-calendar and the native select.
   Every option is a real, focusable control with the shared focus ring.
   ───────────────────────────────────────────────────────────────────── */

import { ChevronLeft, ChevronRight, Clock, Search, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV =
  "size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200";
const OPTION =
  "flex items-center justify-between px-3 h-9 mx-1 w-[calc(100%-0.5rem)] rounded-[8px] text-[13px] text-left cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200";

export function DateRangePicker() {
  const blanks = 2;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const from = 12;
  const to = 18;
  return (
    <div className="card p-4 w-[300px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13.5px] font-semibold text-ink-900">May 2026</span>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" className={NAV}><ChevronLeft className="size-4" strokeWidth={2} /></button>
          <button type="button" aria-label="Next month" className={NAV}><ChevronRight className="size-4" strokeWidth={2} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-center text-[10px] font-semibold text-ink-400">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: blanks }).map((_, i) => <span key={"b" + i} />)}
        {days.map((n) => {
          const inRange = n >= from && n <= to;
          const isEnd = n === from || n === to;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={isEnd}
              className={cn(
                "h-8 flex items-center justify-center text-[12px] tabular-nums cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-300 rounded-full",
                inRange && !isEnd && "bg-rose-100",
                n === from && "bg-rose-100 rounded-l-full rounded-r-none",
                n === to && "bg-rose-100 rounded-r-full rounded-l-none",
              )}
            >
              <span
                className={cn(
                  "size-8 inline-flex items-center justify-center rounded-full transition-colors",
                  isEnd ? "bg-rose-600 text-white font-semibold" : inRange ? "text-rose-700" : "text-ink-700 hover:bg-cream-100",
                )}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100 text-[12px]">
        <div className="flex-1 h-8 rounded-[8px] border border-ink-200 px-2.5 flex items-center text-ink-700">May 12</div>
        <span className="text-ink-400">→</span>
        <div className="flex-1 h-8 rounded-[8px] border border-ink-200 px-2.5 flex items-center text-ink-700">May 18</div>
      </div>
    </div>
  );
}

export function TimePicker() {
  const times = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"];
  const sel = "10:00 AM";
  return (
    <div className="w-[200px] max-w-full rounded-[12px] border border-ink-100 bg-white shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 h-10 border-b border-ink-100">
        <Clock className="size-4 text-ink-400" strokeWidth={2} />
        <span className="text-[13px] text-ink-900">Pick a time</span>
      </div>
      <div className="py-1">
        {times.map((t) => (
          <button
            key={t}
            type="button"
            className={cn(OPTION, t === sel ? "bg-rose-50 text-rose-700 font-semibold" : "text-ink-700 hover:bg-cream-100")}
          >
            {t}
            {t === sel && <Check className="size-3.5" strokeWidth={2.5} />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Combobox() {
  const opts = [
    { label: "Instagram", sel: true },
    { label: "TikTok", sel: false },
    { label: "YouTube", sel: false },
    { label: "LinkedIn", sel: false },
  ];
  return (
    <div className="w-[280px] max-w-full rounded-[12px] border border-ink-100 bg-white shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 h-10 border-b border-ink-100">
        <Search className="size-4 text-ink-400" strokeWidth={2} />
        <span className="flex-1 text-[13px] text-ink-900">i</span>
        <span className="text-[11px] text-ink-300 tabular-nums">4</span>
      </div>
      <div className="py-1">
        {opts.map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={o.sel}
            className={cn(OPTION, o.sel ? "bg-rose-50 text-rose-700 font-medium" : "text-ink-700 hover:bg-cream-100")}
          >
            {o.label}
            {o.sel && <Check className="size-3.5 text-rose-600" strokeWidth={2.5} />}
          </button>
        ))}
      </div>
    </div>
  );
}
