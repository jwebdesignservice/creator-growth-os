/* Buttons ──────────────────────────────────────────────────────────────
   Variants for call-to-action, secondary, tertiary, ghost, danger, and
   disabled. Sizes: sm (h-8), md (h-10), lg (h-12). Iterate freely.
   ───────────────────────────────────────────────────────────────────── */

import { ArrowRight, Plus, Trash2 } from "lucide-react";

export function PrimaryButton({ children = "Primary" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-medium shadow-sm transition-colors"
    >
      {children}
      <ArrowRight className="size-3.5" strokeWidth={2} />
    </button>
  );
}

export function SecondaryButton({ children = "Secondary" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13.5px] font-medium transition-colors"
    >
      {children}
    </button>
  );
}

export function GhostButton({ children = "Ghost" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-10 px-3 rounded-[10px] hover:bg-cream-200 text-ink-700 text-[13.5px] font-medium transition-colors"
    >
      {children}
    </button>
  );
}

export function DangerButton({ children = "Delete" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 text-[13.5px] font-medium transition-colors"
    >
      <Trash2 className="size-3.5" strokeWidth={2} />
      {children}
    </button>
  );
}

export function IconButton() {
  return (
    <button
      type="button"
      aria-label="Add"
      className="inline-flex items-center justify-center size-10 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
    >
      <Plus className="size-4" strokeWidth={2.2} />
    </button>
  );
}

export function DisabledButton() {
  return (
    <button
      type="button"
      disabled
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-cream-200 text-ink-400 text-[13.5px] font-medium cursor-not-allowed"
    >
      Disabled
    </button>
  );
}
