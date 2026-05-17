"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Tooltip series row: one line in the hover popover.
 * `value` is the formatted string; `color` matches the chart series stroke.
 */
export type HoverSeries = {
  label:    string;
  color:    string;
  /** Plain number per bucket — used to position the marker dot. */
  values:   number[];
  /** Function from raw value → display string (e.g. "212 ms", "0.42%"). */
  format:   (v: number) => string;
};

type Props = {
  /** Number of buckets (length of any series.values). */
  buckets:  number;
  /** Total chart height in CSS pixels — matches the SVG's container height. */
  height:   number;
  /** y-max used by the chart, so we can compute marker Y positions. */
  yMax:     number;
  padY?:    number;
  /** Each line in the tooltip. */
  series:   HoverSeries[];
  /** x-axis label list. We display the matching label as the tooltip header. */
  xLabels?: string[];
  className?: string;
};

/**
 * Transparent overlay that captures mouse moves and renders a hover
 * tooltip listing the value of every series at the hovered bucket.
 *
 * Visual additions:
 *   - vertical guide line at the hovered bucket
 *   - one marker dot per series at the bucket's Y position
 *   - floating tooltip card that flips left/right to stay in-bounds
 *
 * Pure presentational — no data fetching, no router calls. Designed to
 * be wrapped around the existing SVG charts without changing their
 * markup.
 */
export function ChartHoverOverlay({
  buckets,
  height,
  yMax,
  padY = 8,
  series,
  xLabels,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track the hovered bucket index. `null` = not hovering.
  const [idx, setIdx] = useState<number | null>(null);
  // Mouse X within the container (in CSS px) — drives the tooltip position.
  const [mouseX, setMouseX] = useState(0);
  const [width, setWidth] = useState(0);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    const ratio = rect.width === 0 ? 0 : clamped / rect.width;
    const i = Math.min(buckets - 1, Math.max(0, Math.round(ratio * (buckets - 1))));
    setIdx(i);
    setMouseX(clamped);
    setWidth(rect.width);
  }

  function onLeave() {
    setIdx(null);
  }

  const guideLeft = (() => {
    if (idx == null || buckets <= 1 || width === 0) return 0;
    return (idx / (buckets - 1)) * width;
  })();

  // Decide whether to flip the tooltip left of the cursor when near the
  // right edge so it never clips the card boundary.
  const tooltipFlip = mouseX > width * 0.7;

  // Marker Y positions per series (in CSS px within the chart area).
  const inner = height - padY * 2;
  function toY(value: number): number {
    if (yMax <= 0) return height / 2;
    return padY + (1 - value / yMax) * inner;
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) onMove({ clientX: t.clientX } as unknown as React.MouseEvent<HTMLDivElement>);
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) onMove({ clientX: t.clientX } as unknown as React.MouseEvent<HTMLDivElement>);
      }}
      onTouchEnd={onLeave}
      className={cn("absolute inset-0 z-10", className)}
      // Pass-through pointer when not hovering so the underlying svg can
      // still be interacted with via tab if we ever add focusable points.
      aria-hidden
    >
      {idx != null && (
        <>
          {/* Vertical guide line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-[var(--dev-border-strong)] pointer-events-none"
            style={{ left: guideLeft }}
          />

          {/* Series marker dots */}
          {series.map((s) => {
            const v = s.values[idx];
            if (v == null) return null;
            return (
              <span
                key={s.label}
                className="absolute size-2.5 rounded-full ring-2 ring-[var(--dev-bg)] pointer-events-none"
                style={{
                  left:    guideLeft - 5,
                  top:     toY(v) - 5,
                  background: s.color,
                }}
              />
            );
          })}

          {/* Tooltip card */}
          <div
            role="tooltip"
            className={cn(
              "absolute z-20 min-w-[140px] max-w-[220px] rounded-[10px] border border-[var(--dev-border-strong)] bg-[var(--dev-surface-elev)] shadow-lg px-3 py-2.5 pointer-events-none",
              "text-[12px] text-[var(--dev-text-primary)]",
            )}
            style={{
              left:      tooltipFlip ? undefined : guideLeft + 12,
              right:     tooltipFlip ? width - guideLeft + 12 : undefined,
              top:       Math.max(4, Math.min(height - 96, idx != null ? toY(series[0]?.values[idx] ?? yMax / 2) - 12 : 0)),
            }}
          >
            {xLabels?.[Math.min(idx, xLabels.length - 1)] && (
              <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1 tabular-nums">
                {xLabels[Math.min(idx, xLabels.length - 1)]}
              </div>
            )}
            <ul className="space-y-1">
              {series.map((s) => {
                const v = s.values[idx];
                return (
                  <li key={s.label} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="text-[var(--dev-text-secondary)]">{s.label}</span>
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--dev-text-primary)]">
                      {v == null ? "—" : s.format(v)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
