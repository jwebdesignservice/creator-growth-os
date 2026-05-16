/**
 * Build a smooth SVG path from a numeric series.
 * `width` × `height` are the viewport. Optional `padY` keeps the line off
 * the top/bottom edges.
 */
export function sparklinePath(
  series: number[],
  width: number,
  height: number,
  padY = 2,
): string {
  if (series.length === 0) return "";
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = series.length > 1 ? width / (series.length - 1) : 0;

  const points = series.map((v, i) => {
    const x = i * stepX;
    const y = padY + (1 - (v - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });

  return points
    .map(([x, y], i) => (i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : `L ${x.toFixed(2)} ${y.toFixed(2)}`))
    .join(" ");
}

/**
 * Build the closed-area path under a sparkline, useful for gradient fills.
 */
export function sparklineAreaPath(
  series: number[],
  width: number,
  height: number,
  padY = 2,
): string {
  const line = sparklinePath(series, width, height, padY);
  if (!line) return "";
  return `${line} L ${width.toFixed(2)} ${height.toFixed(2)} L 0 ${height.toFixed(2)} Z`;
}

/** Pretty-print a delta value with sign. */
export function formatDelta(delta: number, unit = "%"): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "" : "";
  return `${sign}${delta}${unit}`;
}
