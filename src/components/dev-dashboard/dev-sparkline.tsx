import { sparklineAreaPath, sparklinePath } from "@/lib/dev-dashboard/dev-utils";

type Props = {
  data: number[];
  width?: number;
  height?: number;
  color: string;
  gradientId: string;
  className?: string;
};

/**
 * Small sparkline with a soft gradient fill underneath the line.
 * Pure SVG — no chart library dependency.
 */
export function DevSparkline({
  data,
  width = 240,
  height = 56,
  color,
  gradientId,
  className,
}: Props) {
  if (data.length === 0) return null;
  const line = sparklinePath(data, width, height, 4);
  const area = sparklineAreaPath(data, width, height, 4);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
