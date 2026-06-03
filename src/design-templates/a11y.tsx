/* Accessibility ─────────────────────────────────────────────────────────
   Core a11y guidance grounded in the app's real tokens: focus rings (rose
   focus-visible treatment used app-wide), interaction states, minimum
   touch targets (44px from --btn-height-touch), and text/background
   contrast pairs that meet WCAG AA. Exported as a gallery category and
   re-spread via FOUNDATION_CATEGORIES.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { Accessibility, type LucideIcon } from "lucide-react";

function FocusStates() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <button
        type="button"
        className="h-10 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-medium ring-2 ring-rose-300 ring-offset-2 ring-offset-cream-50"
      >
        Focused button
      </button>
      <div className="h-10 w-44 rounded-[10px] border border-ink-200 bg-white ring-2 ring-rose-200 ring-offset-1 ring-offset-cream-50" />
    </div>
  );
}

const STATES = [
  { label: "Default", cls: "bg-rose-600 text-white" },
  { label: "Hover", cls: "bg-rose-700 text-white" },
  { label: "Active", cls: "bg-rose-800 text-white" },
  { label: "Disabled", cls: "bg-cream-200 text-ink-400 cursor-not-allowed" },
];

function InteractionStates() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {STATES.map((s) => (
        <span
          key={s.label}
          className={`h-9 px-4 rounded-[10px] text-[12.5px] font-medium inline-flex items-center ${s.cls}`}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}

function TouchTargets() {
  return (
    <div className="flex items-end gap-5">
      <div className="flex flex-col items-center gap-1.5">
        <span className="size-11 rounded-[10px] bg-rose-100 border border-dashed border-rose-300 flex items-center justify-center text-[10px] font-semibold text-rose-700 tabular-nums">
          44
        </span>
        <span className="text-[10.5px] text-ink-400">min target</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="size-12 rounded-[10px] bg-rose-100 border border-dashed border-rose-300 flex items-center justify-center text-[10px] font-semibold text-rose-700 tabular-nums">
          48
        </span>
        <span className="text-[10.5px] text-ink-400">comfortable</span>
      </div>
    </div>
  );
}

const CONTRAST_PAIRS = [
  { bg: "bg-cream-50", text: "text-ink-900", label: "Ink on cream" },
  { bg: "bg-white", text: "text-ink-700", label: "Body on white" },
  { bg: "bg-rose-600", text: "text-white", label: "On brand" },
  { bg: "bg-ink-900", text: "text-cream-100", label: "On dark" },
];

function ContrastPairs() {
  return (
    <div className="flex flex-wrap gap-3">
      {CONTRAST_PAIRS.map((p) => (
        <div
          key={p.label}
          className={`w-[124px] h-16 rounded-lg border border-ink-100 flex flex-col items-center justify-center gap-0.5 ${p.bg}`}
        >
          <span className={`text-[15px] font-semibold ${p.text}`}>Aa</span>
          <span className={`text-[10px] ${p.text}`}>{p.label} · AA</span>
        </div>
      ))}
    </div>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type A11yCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const A11Y_CATEGORIES: A11yCategory[] = [
  {
    id: "accessibility",
    label: "Accessibility",
    icon: Accessibility,
    blurb: "Focus rings, interaction states, touch targets, contrast.",
    items: [
      { label: "Focus rings", code: "FocusStates", node: <FocusStates /> },
      { label: "Interaction states", code: "InteractionStates", node: <InteractionStates /> },
      { label: "Touch targets", code: "TouchTargets", node: <TouchTargets /> },
      { label: "Contrast pairs", code: "ContrastPairs", node: <ContrastPairs /> },
    ],
  },
];
