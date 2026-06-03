/* Charts ────────────────────────────────────────────────────────────────
   Lightweight SVG/CSS data-viz used across the dashboard and performance
   surfaces — sparklines, progress rings, mini bar charts, and a stacked
   distribution bar. Calm rose/cream palette, no chart library.
   ───────────────────────────────────────────────────────────────────── */

export function Sparkline() {
  const data = [12, 18, 14, 22, 19, 28, 24, 33, 30, 38, 34, 42];
  const width = 240;
  const height = 64;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="card p-4 w-[300px]">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] text-ink-500">Followers · 12w</span>
        <span className="text-[13px] font-semibold text-success">+38%</span>
      </div>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={`0,${height} ${points} ${width},${height}`}
          className="fill-rose-100/70 stroke-none"
        />
        <polyline
          points={points}
          className="fill-none stroke-rose-500"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function DonutRing() {
  const percent = 72;
  const size = 132;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div
      role="img"
      aria-label={`${percent}% complete`}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-cream-200"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-rose-500"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-h3 text-ink-900 tabular-nums leading-none">{percent}%</span>
        <span className="text-[11px] text-ink-500 mt-1">Complete</span>
      </div>
    </div>
  );
}

export function BarChart() {
  const bars = [
    { d: "Mon", v: 42 },
    { d: "Tue", v: 65 },
    { d: "Wed", v: 50 },
    { d: "Thu", v: 80 },
    { d: "Fri", v: 72 },
    { d: "Sat", v: 95 },
    { d: "Sun", v: 60 },
  ];
  const max = Math.max(...bars.map((b) => b.v));
  return (
    <div className="card p-5 w-[360px]">
      <h3 className="text-h5 text-ink-900 mb-4">Posts per day</h3>
      <div className="flex items-end justify-between gap-2 h-[132px]">
        {bars.map((b) => (
          <div key={b.d} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end h-full">
              <div
                className="w-full rounded-t-[6px] bg-rose-500/85 hover:bg-rose-500 transition-colors"
                style={{ height: `${(b.v / max) * 100}%` }}
                title={`${b.d}: ${b.v}`}
              />
            </div>
            <span className="text-[10.5px] text-ink-400">{b.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SegmentedBar() {
  const segs = [
    { label: "Free", value: 58, bar: "bg-ink-300", dot: "bg-ink-300" },
    { label: "Basic", value: 30, bar: "bg-rose-400", dot: "bg-rose-400" },
    { label: "Pro", value: 12, bar: "bg-rose-600", dot: "bg-rose-600" },
  ];
  const total = segs.reduce((n, s) => n + s.value, 0);
  return (
    <div className="card p-5 w-[360px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-h5 text-ink-900">Plan distribution</h3>
        <span className="text-[12px] text-ink-500 tabular-nums">{total}%</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-cream-200">
        {segs.map((s) => (
          <div
            key={s.label}
            className={s.bar}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-[12px]">
            <span className={"size-2.5 rounded-full shrink-0 " + s.dot} />
            <span className="text-ink-700">{s.label}</span>
            <span className="ml-auto text-ink-400 tabular-nums">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
