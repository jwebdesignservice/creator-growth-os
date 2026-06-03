/* Buttons ──────────────────────────────────────────────────────────────
   Variants for call-to-action, secondary, tertiary, ghost, danger, and
   disabled. Sizes: sm (h-8), md (h-10), lg (h-12). Iterate freely.

   Every variant shares one state model — hover, active (pressed), and a
   visible keyboard-focus ring — so emphasis differs but interaction feels
   identical across the set.
   ───────────────────────────────────────────────────────────────────── */

import { ArrowRight, Plus, Trash2 } from "lucide-react";

// Shared interaction states. `focus-visible` keeps the ring keyboard-only so
// it never shows on mouse press; the offset colour matches the gallery panel.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-medium cursor-pointer transition-colors duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50";

export function PrimaryButton({ children = "Primary" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`${BASE} h-10 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-300`}
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
      className={`${BASE} h-10 px-4 bg-white border border-ink-200 hover:bg-cream-100 active:bg-cream-200 text-ink-900 focus-visible:ring-rose-200`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children = "Ghost" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`${BASE} h-10 px-3 hover:bg-cream-200 active:bg-cream-300 text-ink-700 focus-visible:ring-rose-200`}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children = "Delete" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`${BASE} h-10 px-4 bg-rose-50 border border-rose-100 hover:bg-rose-100 active:bg-rose-200 text-rose-700 focus-visible:ring-rose-300`}
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
      className={`${BASE} size-10 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-300`}
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
      aria-disabled="true"
      className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-cream-200 text-ink-400 text-[13.5px] font-medium cursor-not-allowed select-none opacity-80"
    >
      Disabled
    </button>
  );
}
