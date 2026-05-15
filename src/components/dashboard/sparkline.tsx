type Props = {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  stroke?: string;
  fill?: string;
};

export function Sparkline({
  data,
  width = 110,
  height = 36,
  className,
  stroke = "var(--rose-500)",
  fill = "var(--rose-100)",
}: Props) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);

  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={fill}
        fillOpacity="0.7"
      />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
