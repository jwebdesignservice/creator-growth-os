/* Tooltips ─────────────────────────────────────────────────────────────
   CSS-only tooltips that appear on hover and keyboard focus, with a small
   caret. Reusable above or below the trigger — handy for icon buttons,
   KPI labels, and truncated text.
   ───────────────────────────────────────────────────────────────────── */

import { Info } from "lucide-react";
import { cn } from "@/lib/cn";

function Tip({
  label,
  side = "top",
  children,
}: {
  label: string;
  side?: "top" | "bottom";
  children: React.ReactNode;
}) {
  return (
    <span className="relative inline-flex items-center group">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 z-10 px-2.5 py-1.5 rounded-[8px] bg-ink-900 text-white text-[11.5px] font-medium whitespace-nowrap opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {label}
        {/* caret */}
        <span
          aria-hidden
          className={cn(
            "absolute left-1/2 -translate-x-1/2 size-2 rotate-45 bg-ink-900",
            side === "top" ? "top-full -mt-1" : "bottom-full -mb-1",
          )}
        />
      </span>
    </span>
  );
}

export function TooltipAbove() {
  return (
    <div className="flex items-center gap-8">
      <Tip label="Reach is total unique accounts that saw your content." side="top">
        <button
          type="button"
          aria-label="More info"
          className="inline-flex items-center justify-center size-7 rounded-full hover:bg-cream-200 text-ink-500 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <Info className="size-4" strokeWidth={2} />
        </button>
      </Tip>

      <Tip label="Available on the Pro plan." side="bottom">
        <button
          type="button"
          className="inline-flex items-center h-6 px-2.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold uppercase tracking-wide cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          Pro
        </button>
      </Tip>
    </div>
  );
}
