/* Tooltips ─────────────────────────────────────────────────────────────
   CSS-only tooltips (hover/focus). Useful for icon buttons + KPI tiles.
   ───────────────────────────────────────────────────────────────────── */

import { Info } from "lucide-react";

export function TooltipAbove() {
  return (
    <span className="relative inline-flex items-center group">
      <button
        type="button"
        className="inline-flex items-center justify-center size-7 rounded-full hover:bg-cream-200 text-ink-500"
        aria-label="More info"
      >
        <Info className="size-4" strokeWidth={2} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-[8px] bg-ink-900 text-white text-[11.5px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
      >
        Reach is total unique accounts that saw your content.
      </span>
    </span>
  );
}
