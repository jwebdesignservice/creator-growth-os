import { cn } from "@/lib/cn";

type Props = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  fillClassName?: string;
  children?: React.ReactNode;
};

export function Donut({
  percent,
  size = 64,
  strokeWidth = 8,
  trackClassName = "stroke-cream-200",
  fillClassName = "stroke-rose-500",
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-none", trackClassName)}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-none transition-all duration-700", fillClassName)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

type Slice = { value: number; color: string; label?: string };

export function MultiDonut({
  slices,
  size = 140,
  strokeWidth = 18,
  children,
}: {
  slices: Slice[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;

  let acc = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-cream-200"
          strokeWidth={strokeWidth}
        />
        {slices.map((slice, i) => {
          const portion = slice.value / total;
          const dash = portion * circumference;
          const gap = circumference - dash;
          const offset = -acc * circumference;
          acc += portion;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="fill-none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
