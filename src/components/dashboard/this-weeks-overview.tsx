"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  UserRound,
  Clapperboard,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ArrowRight,
  LineChart,
} from "lucide-react";
import { InstagramIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   ThisWeeksOverview — dashboard performance snapshot.

   Fully client-computed from the raw weekly entries:
   • Range tabs (This Week / Last 7 Days / Last 30 Days) are real calendar
     windows — distinct and correct, not identical slices.
   • The platform dropdown filters by each connected account's follower share
     (engagement rate, a ratio, is left unscaled).
   • Deltas compare the latest value in the window against the entry just
     before the window — i.e. the change over the selected period.
   ───────────────────────────────────────────────────────────────────────── */

export type OverviewEntry = {
  /** Week-start ISO date, yyyy-mm-dd. */
  date: string;
  followers: number;
  profileVisits: number;
  engagementRate: number;
  contentPublished: number;
};

export type PlatformOption = { label: string; weight: number };

type RangeKey = "week" | "last7" | "last30";

const TABS: { key: RangeKey; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
];

const DAY = 86_400_000;

export function ThisWeeksOverview({
  entries,
  platforms,
}: {
  entries: OverviewEntry[];
  platforms: PlatformOption[];
}) {
  const [range, setRange] = useState<RangeKey>("week");
  const [platform, setPlatform] = useState(platforms[0]?.label ?? "All Platforms");
  // Snapshot "now" once so the windows are stable across re-renders.
  const [nowMs] = useState(() => Date.now());

  const weight = platforms.find((p) => p.label === platform)?.weight ?? 1;

  const { stats, series, empty } = useMemo(
    () => computeRange(entries, range, weight, nowMs),
    [entries, range, weight, nowMs],
  );

  return (
    <section className="card p-[var(--space-card-padding)]">
      <header className="mb-5">
        <h3 className="font-display text-[20px] text-ink-900">
          This Week&apos;s Overview
        </h3>
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <div
            role="tablist"
            aria-label="Overview range"
            className="inline-flex items-center gap-0.5 p-0.5 rounded-[12px] bg-cream-100 border border-ink-100"
          >
            {TABS.map((t) => {
              const active = range === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRange(t.key)}
                  className={cn(
                    "inline-flex items-center h-8 px-3 rounded-[9px] text-[12.5px] font-semibold transition-colors cursor-pointer",
                    active
                      ? "bg-rose-100 text-rose-700"
                      : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <PlatformSelect
            value={platform}
            options={platforms.map((p) => p.label)}
            onChange={setPlatform}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6 items-start">
        {/* Left — stat list */}
        <div className="flex flex-col">
          <div className="rounded-[16px] border border-ink-100 divide-y divide-ink-100 overflow-hidden">
            {stats.map((s) => (
              <StatRow key={s.key} stat={s} />
            ))}
          </div>
          <Link
            href="/performance"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            View full performance
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Right — chart */}
        <OverviewChart series={series} empty={empty} />
      </div>
    </section>
  );
}

/* ─── Range computation ──────────────────────────────────────────────────── */

type Stat = {
  key: "followers" | "engagement" | "visits" | "content";
  label: string;
  value: string;
  deltaLabel: string;
  direction: "up" | "down" | "flat";
};
type Point = { label: string; value: number };

function computeRange(
  entries: OverviewEntry[],
  range: RangeKey,
  weight: number,
  nowMs: number,
): { stats: Stat[]; series: Point[]; empty: boolean } {
  const sorted = [...entries].sort((a, b) => dateMs(a.date) - dateMs(b.date));
  const latestMs = sorted.length ? dateMs(sorted[sorted.length - 1].date) : nowMs;
  const endpoint = Math.max(nowMs, latestMs);
  const windowStart =
    range === "week"
      ? startOfWeekMs(endpoint)
      : range === "last7"
        ? endpoint - 6 * DAY
        : endpoint - 29 * DAY;

  const win = sorted.filter((e) => {
    const t = dateMs(e.date);
    return t >= windowStart && t <= endpoint;
  });
  const base = [...sorted].reverse().find((e) => dateMs(e.date) < windowStart) ?? null;

  const scale = (n: number) => Math.round(n * weight);
  const series: Point[] = win.map((e) => ({
    label: fmtDate(e.date),
    value: scale(e.followers),
  }));

  if (win.length === 0) {
    return { stats: emptyStats(), series: [], empty: true };
  }

  const last = win[win.length - 1];
  const baseRef = base ?? win[0];
  const hasBase = base !== null;

  const pct = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : 0);
  const dir = (n: number): Stat["direction"] =>
    n > 0.05 ? "up" : n < -0.05 ? "down" : "flat";
  const delta = (
    value: number | null,
    direction: Stat["direction"],
  ): { deltaLabel: string; direction: Stat["direction"] } =>
    hasBase && value !== null
      ? { deltaLabel: `${Math.abs(round1(value))}%`, direction }
      : { deltaLabel: "—", direction: "flat" };

  const gained = scale(last.followers) - scale(baseRef.followers);
  const gainedPct = pct(last.followers, baseRef.followers);
  const engDelta = last.engagementRate - baseRef.engagementRate;
  const visitsPct = pct(last.profileVisits, baseRef.profileVisits);
  const contentPct = pct(last.contentPublished, baseRef.contentPublished);

  return {
    empty: false,
    series,
    stats: [
      {
        key: "followers",
        label: "Followers Gained",
        value: `${gained >= 0 ? "+" : "−"}${Math.abs(gained).toLocaleString()}`,
        ...delta(gainedPct, dir(gained)),
      },
      {
        key: "engagement",
        label: "Engagement Rate",
        value: `${last.engagementRate.toFixed(1)}%`,
        ...delta(engDelta, dir(engDelta)),
      },
      {
        key: "visits",
        label: "Profile Visits",
        value: scale(last.profileVisits).toLocaleString(),
        ...delta(visitsPct, dir(visitsPct)),
      },
      {
        key: "content",
        label: "Content Published",
        value: scale(last.contentPublished).toLocaleString(),
        ...delta(contentPct, dir(contentPct)),
      },
    ],
  };
}

function emptyStats(): Stat[] {
  const labels: [Stat["key"], string][] = [
    ["followers", "Followers Gained"],
    ["engagement", "Engagement Rate"],
    ["visits", "Profile Visits"],
    ["content", "Content Published"],
  ];
  return labels.map(([key, label]) => ({
    key,
    label,
    value: "—",
    deltaLabel: "—",
    direction: "flat" as const,
  }));
}

/* ─── Platform dropdown ──────────────────────────────────────────────────── */

function PlatformSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // A single option (just "All Platforms") → render a static chip, no menu.
  if (options.length <= 1) {
    return (
      <span className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-500">
        {value}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
      >
        {value}
        <ChevronDown
          className={cn(
            "size-3.5 text-ink-500 transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-[170px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="option"
              aria-selected={value === o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={cn(
                "block w-full text-left px-3 py-1.5 text-[13px] hover:bg-cream-100 cursor-pointer",
                value === o ? "text-rose-700 font-semibold" : "text-ink-700",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Stat row ───────────────────────────────────────────────────────────── */

function statIcon(key: Stat["key"]) {
  switch (key) {
    case "followers":
      return <InstagramIcon size={15} className="text-rose-600" />;
    case "engagement":
      return <Heart className="size-[15px]" strokeWidth={2} fill="currentColor" />;
    case "visits":
      return <UserRound className="size-[15px]" strokeWidth={2} />;
    case "content":
      return <Clapperboard className="size-[15px]" strokeWidth={2} />;
  }
}

function StatRow({ stat }: { stat: Stat }) {
  const up = stat.direction === "up";
  const down = stat.direction === "down";
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white">
      <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        {statIcon(stat.key)}
      </span>
      <span className="flex-1 min-w-0 text-[13px] text-ink-700 truncate">
        {stat.label}
      </span>
      <span className="text-[15px] font-bold text-ink-900 tabular-nums">
        {stat.value}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums w-[58px] justify-end shrink-0",
          up ? "text-success" : down ? "text-rose-600" : "text-ink-400",
        )}
      >
        {up ? (
          <ArrowUp className="size-3" strokeWidth={2.5} />
        ) : down ? (
          <ArrowDown className="size-3" strokeWidth={2.5} />
        ) : null}
        {stat.deltaLabel}
      </span>
    </div>
  );
}

/* ─── Chart ──────────────────────────────────────────────────────────────── */

const W = 640;
const H = 240;
const PAD = { t: 14, r: 14, b: 28, l: 14 };

function OverviewChart({ series, empty }: { series: Point[]; empty: boolean }) {
  const [hover, setHover] = useState<number | null>(null);

  if (empty || series.length === 0) {
    return (
      <div className="rounded-[14px] bg-cream-100/60 border border-dashed border-ink-200 flex flex-col items-center justify-center text-center min-h-[240px] px-6">
        <span className="size-10 rounded-full bg-rose-100 inline-flex items-center justify-center mb-3">
          <LineChart className="size-5 text-rose-600" strokeWidth={2} />
        </span>
        <p className="text-[13px] text-ink-600 max-w-xs leading-snug mb-3">
          No performance logged in this range yet.
        </p>
        <Link
          href="/performance"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
        >
          Log performance
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  const values = series.map((p) => p.value);
  const { max: niceMax, ticks } = niceAxis(Math.max(1, ...values));

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const single = values.length === 1;
  const stepX = single ? 0 : innerW / (values.length - 1);

  const pts = values.map((v, i) => ({
    x: single ? PAD.l + innerW / 2 : PAD.l + i * stepX,
    y: PAD.t + (1 - v / niceMax) * innerH,
    v,
    label: series[i].label,
  }));

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    pts.length >= 2
      ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD.b} L ${pts[0].x.toFixed(1)} ${H - PAD.b} Z`
      : "";

  const hp = hover != null ? pts[hover] : null;

  return (
    <div className="flex min-w-0" onPointerLeave={() => setHover(null)}>
      {/* Y-axis labels */}
      <div
        className="flex flex-col-reverse justify-between pr-2 text-[10.5px] text-ink-400 tabular-nums shrink-0"
        style={{
          height: 240,
          paddingTop: (PAD.t / H) * 240,
          paddingBottom: (PAD.b / H) * 240,
        }}
        aria-hidden
      >
        {ticks.map((t, i) => (
          <span key={i} className="leading-none">
            {formatCompact(t)}
          </span>
        ))}
      </div>

      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[240px] block"
          role="img"
          aria-label="Followers trend"
        >
          <defs>
            <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose-400)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--rose-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t, i) => {
            const y = PAD.t + (1 - t / niceMax) * innerH;
            return (
              <line
                key={i}
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="var(--ink-100)"
                strokeDasharray={i === 0 ? undefined : "3 3"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {area && <path d={area} fill="url(#ovGrad)" />}
          {pts.length >= 2 && (
            <path
              d={line}
              fill="none"
              stroke="var(--rose-500)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {hp && (
            <line
              x1={hp.x}
              x2={hp.x}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke="var(--rose-300)"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === hover ? 5 : single ? 5 : 3.5}
              fill="var(--rose-500)"
              stroke="white"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {pts.map((p, i) => {
            const show =
              pts.length <= 8 ||
              i === 0 ||
              i === pts.length - 1 ||
              i === Math.floor((pts.length - 1) / 2);
            if (!show) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={H - 8}
                textAnchor={
                  single
                    ? "middle"
                    : i === 0
                      ? "start"
                      : i === pts.length - 1
                        ? "end"
                        : "middle"
                }
                fontSize="11"
                fill="var(--ink-400)"
              >
                {p.label}
              </text>
            );
          })}

          {pts.map((p, i) => {
            const hw = (stepX || innerW) / 2;
            const x = Math.max(0, p.x - hw);
            const w = Math.min(W - x, stepX || innerW);
            return (
              <rect
                key={i}
                x={x}
                y={0}
                width={w}
                height={H}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${p.label}: ${p.v.toLocaleString()} followers`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((cur) => (cur === i ? null : cur))}
                onTouchStart={() => setHover(i)}
                className="cursor-pointer focus:outline-none"
              />
            );
          })}
        </svg>

        {hp && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `clamp(60px, ${(hp.x / W) * 100}%, calc(100% - 60px))`,
              top: `${(hp.y / H) * 100}%`,
              marginTop: -10,
            }}
            role="tooltip"
          >
            <div className="bg-white rounded-[10px] border border-ink-100 shadow-md px-3 py-2 text-center min-w-[112px]">
              <div className="text-[11.5px] font-semibold text-ink-900 leading-tight">
                {hp.label}
              </div>
              <div className="text-[12px] text-ink-700 tabular-nums">
                {hp.v.toLocaleString()} followers
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function dateMs(iso: string): number {
  return Date.parse(iso + "T00:00:00Z");
}

function startOfWeekMs(ms: number): number {
  const d = new Date(ms);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function niceAxis(max: number): { max: number; ticks: number[] } {
  const target = Math.max(1, max);
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  const steps: number[] = [];
  for (const p of [pow, pow * 10]) {
    for (const m of [0.5, 1, 2, 2.5, 5]) steps.push(m * p);
  }
  steps.sort((a, b) => a - b);
  const step =
    steps.find((s) => Math.ceil(target / s) <= 4) ?? steps[steps.length - 1];
  const niceMax = Math.ceil(target / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + 1e-9; v += step) ticks.push(Math.round(v));
  return { max: niceMax, ticks };
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000)
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return Math.round(n).toString();
}
