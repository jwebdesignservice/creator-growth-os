type Slice = {
  value: number;
  color: string;
};

type Props = {
  slices: Slice[];
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Multi-segment donut rendered as a pure-SVG ring with proportional arc
 * lengths. Used by the Errors (24h) and QA Readiness cards.
 */
export function DevDonut({
  slices,
  size = 160,
  strokeWidth = 18,
  trackColor = "var(--dev-surface-elev)",
  children,
  className,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;

  // Precompute each slice's dash/offset before render so we don't mutate
  // outside-of-state during the render pass.
  const segments = slices.reduce<
    { dash: number; gap: number; offset: number; color: string }[]
  >((arr, s) => {
    const portion = s.value / total;
    const dash = portion * circumference;
    const gap = circumference - dash;
    const acc = arr.reduce((sum, prev) => sum + prev.dash, 0);
    arr.push({ dash, gap, offset: -acc, color: s.color });
    return arr;
  }, []);

  return (
    <div className={"relative inline-flex items-center justify-center " + (className ?? "")} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
