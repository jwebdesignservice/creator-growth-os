/* Color picker ────────────────────────────────────────────────────────────────
   Color-selection surfaces — a swatch grid (brand accent) and a picker popover
   with a saturation field + hex input. For brand / theme customization.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Check, Pipette } from "lucide-react";

const SWATCHES = [
  "#E11D48", "#F43F5E", "#FB7185", "#F59E0B", "#10B981",
  "#14B8A6", "#3B82F6", "#6366F1", "#8B5CF6", "#0F172A",
];

/* 1 · Swatch grid — pick a brand accent. Selected = outline; focus = ring
   (different mechanisms, so the two never collide). */
export function ColorSwatches() {
  const selected = "#E11D48";
  return (
    <div className="w-[300px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="text-[12px] font-medium text-ink-700 mb-2.5">Brand accent</div>
      <div className="grid grid-cols-5 gap-2.5">
        {SWATCHES.map((c) => {
          const isSel = c === selected;
          return (
            <button
              key={c}
              type="button"
              aria-label={c}
              aria-pressed={isSel}
              style={{ backgroundColor: c }}
              className={`size-10 rounded-[10px] inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink-400 ${isSel ? "outline outline-2 outline-offset-2 outline-ink-900" : ""}`}
            >
              {isSel && <Check className="size-4 text-white drop-shadow" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 flex items-center gap-2 h-10 px-3 rounded-[10px] border border-ink-200">
        <span className="size-5 rounded-[6px]" style={{ backgroundColor: selected }} />
        <span className="font-mono text-[13px] text-ink-700">{selected}</span>
      </div>
    </div>
  );
}

/* 2 · Picker popover — saturation field + hue + hex. */
export function ColorPickerPopover() {
  return (
    <div className="w-[260px] max-w-full rounded-[14px] border border-ink-100 bg-white shadow-card p-3">
      {/* Saturation / value field */}
      <div
        className="relative h-32 rounded-[10px] overflow-hidden mb-3 cursor-crosshair"
        style={{ background: "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, #E11D48)" }}
      >
        <span className="absolute size-3.5 rounded-full border-2 border-white shadow ring-1 ring-ink-900/10" style={{ left: "70%", top: "30%" }} />
      </div>
      {/* Hue slider */}
      <div
        className="relative h-3 rounded-full mb-3 cursor-pointer"
        style={{ background: "linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444)" }}
      >
        <span className="absolute top-1/2 -translate-y-1/2 size-4 rounded-full bg-white border border-ink-200 shadow" style={{ left: "4%" }} />
      </div>
      {/* Hex + eyedropper */}
      <div className="flex items-center gap-2">
        <span className="size-8 rounded-[8px] shrink-0" style={{ backgroundColor: "#E11D48" }} />
        <input
          defaultValue="#E11D48"
          aria-label="Hex value"
          className="flex-1 min-w-0 h-9 px-2.5 rounded-[8px] border border-ink-200 font-mono text-[12.5px] text-ink-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
        <button
          type="button"
          aria-label="Pick color from screen"
          className="size-9 rounded-[8px] border border-ink-200 inline-flex items-center justify-center text-ink-500 cursor-pointer transition-colors hover:bg-cream-100 hover:text-ink-700 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <Pipette className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
