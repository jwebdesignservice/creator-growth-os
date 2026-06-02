/* Feedback ──────────────────────────────────────────────────────────────
   States that tell the user what's happening: empty states, dismissible
   banners, progress bars, loading skeletons, and an expandable FAQ
   accordion. The accordion holds local open state → client module.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { Inbox, Plus, Info, X, ChevronDown } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center max-w-[360px] py-6">
      <span className="size-14 rounded-2xl bg-cream-200 text-ink-400 flex items-center justify-center mb-4">
        <Inbox className="size-7" strokeWidth={1.6} />
      </span>
      <h3 className="text-h5 text-ink-900">No programs yet</h3>
      <p className="text-[13px] text-ink-500 mt-1 leading-snug">
        Create your first program to start enrolling members and tracking
        their progress.
      </p>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-medium shadow-sm transition-colors"
      >
        <Plus className="size-4" strokeWidth={2.2} />
        New program
      </button>
    </div>
  );
}

export function Banner() {
  return (
    <div className="w-[520px] max-w-full flex items-start gap-3 rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3.5">
      <Info className="size-5 text-rose-600 shrink-0 mt-0.5" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-ink-900">
          Your TikTok connection expired
        </p>
        <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
          Reconnect to keep your weekly performance metrics up to date.
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center h-8 px-3 rounded-[9px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
        >
          Reconnect
        </button>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="shrink-0 inline-flex items-center justify-center size-7 rounded-full hover:bg-rose-100 text-rose-500 transition-colors"
      >
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function ProgressBars() {
  return (
    <div className="w-[320px] max-w-full space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[12.5px]">
          <span className="text-ink-700 font-medium">Course progress</span>
          <span className="text-ink-900 font-semibold tabular-nums">68%</span>
        </div>
        <div className="h-2.5 rounded-full bg-cream-200 overflow-hidden">
          <div className="h-full rounded-full bg-rose-600" style={{ width: "68%" }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5 text-[12.5px]">
          <span className="text-ink-700 font-medium">Storage used</span>
          <span className="text-ink-900 font-semibold tabular-nums">2.1 / 5 GB</span>
        </div>
        <div className="h-2.5 rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: "42%" }}
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList() {
  const widths = ["60%", "75%", "50%"];
  return (
    <div className="w-[360px] max-w-full card p-4 space-y-3">
      {widths.map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-cream-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div
              className="h-3 rounded bg-cream-200 animate-pulse"
              style={{ width: w }}
            />
            <div
              className="h-2.5 rounded bg-cream-200/70 animate-pulse"
              style={{ width: "40%" }}
            />
          </div>
          <div className="h-7 w-16 rounded-full bg-cream-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function Accordion() {
  const items = [
    {
      q: "How is program access granted?",
      a: "Access is based on each member's plan tier — Free, Basic, Pro, or Diamond — not per-program purchase.",
    },
    {
      q: "Can I export member progress?",
      a: "Yes. Use the Export button on the Students page to download a CSV of every member and their completion.",
    },
    {
      q: "How do I reorder lessons?",
      a: "Open the curriculum editor and drag lessons by the grip handle to set their order.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <div className="w-[460px] max-w-full card divide-y divide-ink-100 overflow-hidden">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex items-center justify-between w-full gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-[13.5px] font-semibold text-ink-900">
                {it.q}
              </span>
              <ChevronDown
                className={
                  "size-4 text-ink-400 shrink-0 transition-transform " +
                  (isOpen ? "rotate-180" : "")
                }
                strokeWidth={2}
              />
            </button>
            {isOpen && (
              <p className="px-4 pb-4 -mt-1 text-[13px] text-ink-500 leading-snug">
                {it.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
