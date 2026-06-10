import type { CSSProperties } from "react";

/**
 * Animated circular progress — the headline % lives in its centre. Shared by
 * the section heroes (Posting "My Plans", Tasks "Overview"). The arc sweeps
 * in on load via the `plan-ring-arc` keyframes in globals.css.
 */
export function ProgressRing({
  pct,
  label,
  gradientId = "progressRingGrad",
}: {
  pct: number;
  /** Accessible description, e.g. "20% of this plan published". */
  label: string;
  /** Unique per page — SVG gradient ids collide across instances. */
  gradientId?: string;
}) {
  const R = 20;
  const CIRC = 2 * Math.PI * R;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = CIRC * (1 - clamped / 100);
  return (
    <div className="relative size-12 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
        <circle cx="24" cy="24" r={R} fill="none" stroke="var(--cream-200)" strokeWidth="5" />
        {clamped > 0 && (
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            className="plan-ring-arc"
            style={{ "--ring-circ": `${CIRC}` } as CSSProperties}
          />
        )}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--rose-400)" />
            <stop offset="100%" stopColor="var(--rose-600)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-ink-900 tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}
