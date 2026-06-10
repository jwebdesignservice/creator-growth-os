"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Heart,
  Eye,
  Clapperboard,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  LineChart,
  Check,
  RefreshCw,
  Plug,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCompact } from "@/lib/format";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { syncPlatform, disconnectPlatform } from "@/lib/social/actions";
import type { PerformanceEntry } from "@/lib/performance/queries";
import type { SocialConnection } from "@/lib/social/queries";

/**
 * "This Week's Overview" — a single unified panel that combines the headline
 * stats (left, stacked) with the followers trend chart (right), plus a range
 * segmented control and a platform filter. Replaces the old 4 KPI tiles + the
 * separate trend chart. All numbers come from the real weekly entries.
 */

const DAY_MS = 86_400_000;

const RANGES = [
  { key: "week", label: "This Week", days: 7 },
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

type Delta = { dir: "up" | "down" | "flat"; text: string };
type Stat = { icon: LucideIcon; label: string; value: string; delta: Delta };

function entryMs(e: PerformanceEntry): number {
  return new Date(e.week_start + "T00:00:00Z").getTime();
}
const num = (v: number | null | undefined) => Number(v ?? 0);

type MetricKey =
  | "followers"
  | "engagement_rate"
  | "profile_visits"
  | "posts_published";

/** The metrics the trend line can plot, with their tooltip wording. */
const METRICS: {
  key: MetricKey;
  label: string;
  /** Tooltip body given the point's value + its gain vs the previous point. */
  tip: (value: number, gain: number) => string;
}[] = [
  {
    key: "followers",
    label: "Followers",
    tip: (_v, g) =>
      `${g >= 0 ? "+" : ""}${formatNumber(Math.round(g))} followers`,
  },
  {
    key: "engagement_rate",
    label: "Engagement",
    tip: (v) => `${v.toFixed(1)}% engagement`,
  },
  {
    key: "profile_visits",
    label: "Profile Visits",
    tip: (v) => `${formatNumber(Math.round(v))} profile visits`,
  },
  {
    key: "posts_published",
    label: "Content Published",
    tip: (v) => `${Math.round(v)} ${Math.round(v) === 1 ? "post" : "posts"}`,
  },
];

export function WeeklyOverview({
  entries,
  platforms = [],
  connected = null,
}: {
  entries: PerformanceEntry[];
  platforms?: string[];
  connected?: { platform: SocialConnection["platform"]; label: string } | null;
}) {
  const [range, setRange] = useState<RangeKey>("week");
  const [metric, setMetric] = useState<MetricKey>("followers");
  const [metricOpen, setMetricOpen] = useState(false);
  const [platform, setPlatform] = useState("all");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [busy, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Date.now() is impure — snapshot once at mount.
  const [todayMs] = useState(() => Date.now());

  function refresh() {
    if (!connected) return;
    startTransition(async () => {
      await syncPlatform(connected.platform);
    });
  }
  function runDisconnect() {
    if (!connected) return;
    startTransition(async () => {
      await disconnectPlatform(connected.platform);
      setConfirmOpen(false);
    });
  }

  const cfg = RANGES.find((r) => r.key === range)!;
  const latestMs = entries.length
    ? Math.max(...entries.map(entryMs))
    : todayMs;
  const endpointMs = Math.max(todayMs, latestMs);
  const cutoffMs = endpointMs - cfg.days * DAY_MS;

  const windowed = entries
    .filter((e) => {
      const t = entryMs(e);
      return t >= cutoffMs && t <= endpointMs;
    })
    .sort((a, b) => entryMs(a) - entryMs(b));

  // If the window is too thin to be useful, fall back to the full series so
  // the panel still shows something meaningful (weekly snapshots are sparse).
  const ordered =
    windowed.length >= 2
      ? windowed
      : [...entries].sort((a, b) => entryMs(a) - entryMs(b));

  const latest = ordered[ordered.length - 1] ?? null;
  const baseline = ordered.length >= 2 ? ordered[0] : null;
  const stats = buildStats(latest, baseline);

  return (
    <section className="card rounded-[20px] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-ink-900 leading-tight">
            This Week&apos;s Overview
          </h2>
          <p className="text-[13px] text-ink-500 mt-1">
            Track what&apos;s working. Tune what&apos;s not.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Range segmented control */}
          <div
            role="tablist"
            aria-label="Time range"
            className="inline-flex items-center p-1 rounded-[12px] bg-cream-100 border border-ink-100"
          >
            {RANGES.map((r) => {
              const active = range === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRange(r.key)}
                  className={cn(
                    "h-8 px-3.5 rounded-[9px] text-[12.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap",
                    active
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-900",
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Platform filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPlatformOpen((v) => !v)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
            >
              {platform === "all" ? "All Platforms" : platform}
              <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
            </button>
            {platformOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[190px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
                {["all", ...platforms].map((p) => {
                  const isActive = platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPlatform(p);
                        setPlatformOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 text-left px-3 py-2 text-[13px] hover:bg-cream-100 cursor-pointer",
                        isActive
                          ? "text-rose-700 font-semibold"
                          : "text-ink-700",
                      )}
                    >
                      {p === "all" ? "All Platforms" : p}
                      {isActive && (
                        <Check className="size-3.5 text-rose-500" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body: stats (left) + chart (right) */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-4 lg:gap-5">
        <div className="space-y-3">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>

        <div className="rounded-[16px] border border-ink-100 p-4 sm:p-5 min-h-[320px] flex flex-col">
          {ordered.length >= 2 ? (
            <>
              {/* Metric switcher — choose which metric the line plots. */}
              <div className="flex items-center justify-end mb-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMetricOpen((v) => !v)}
                    className="inline-flex items-center gap-2 h-8 px-3 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-semibold text-ink-700 hover:bg-cream-100 cursor-pointer"
                  >
                    {METRICS.find((m) => m.key === metric)!.label}
                    <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
                  </button>
                  {metricOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[190px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
                      {METRICS.map((m) => {
                        const isActive = metric === m.key;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => {
                              setMetric(m.key);
                              setMetricOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 text-left px-3 py-2 text-[13px] hover:bg-cream-100 cursor-pointer",
                              isActive
                                ? "text-rose-700 font-semibold"
                                : "text-ink-700",
                            )}
                          >
                            {m.label}
                            {isActive && (
                              <Check
                                className="size-3.5 text-rose-500"
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <OverviewChart entries={ordered} metric={metric} />
            </>
          ) : (
            <ChartEmpty hasAny={entries.length > 0} showConnect={!connected} />
          )}
        </div>
      </div>

      {/* Connected controls — refresh stats or disconnect the account. */}
      {connected && (
        <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500">
            <span className="size-1.5 rounded-full bg-success" />
            Synced from {connected.label}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={busy}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <RefreshCw
                className={cn("size-3.5", busy && "animate-spin")}
                strokeWidth={2}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={busy}
              className="inline-flex items-center h-9 px-3.5 rounded-[10px] bg-white border border-ink-100 text-[13px] font-medium text-ink-500 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 cursor-pointer transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {connected && (
        <ConfirmDialog
          open={confirmOpen}
          title={`Disconnect ${connected.label}?`}
          message="Your past analytics stay in the dashboard, but new data won't sync until you reconnect."
          confirmLabel="Disconnect"
          onConfirm={runDisconnect}
          onCancel={() => setConfirmOpen(false)}
          pending={busy}
        />
      )}
    </section>
  );
}

/* ─── Stat card ────────────────────────────────────────────────────────── */

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <div className="rounded-[14px] border border-ink-100 p-3.5 flex items-center gap-3">
      <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-ink-500 truncate">{stat.label}</div>
        <div className="text-[20px] font-bold text-ink-900 tabular-nums leading-tight">
          {stat.value}
        </div>
      </div>
      <DeltaPill delta={stat.delta} />
    </div>
  );
}

function DeltaPill({ delta }: { delta: Delta }) {
  if (delta.dir === "flat") {
    return <Minus className="size-4 text-ink-300 shrink-0" strokeWidth={2.5} />;
  }
  const up = delta.dir === "up";
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[12.5px] font-semibold tabular-nums shrink-0",
        up ? "text-success" : "text-rose-600",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
      {delta.text}
    </span>
  );
}

/* ─── Chart ────────────────────────────────────────────────────────────── */

const W = 600;
const H = 248;
const PAD_X = 6;
const PAD_TOP = 16;
const PAD_BOTTOM = 8;

function OverviewChart({
  entries,
  metric,
}: {
  entries: PerformanceEntry[];
  metric: MetricKey;
}) {
  const cfg = METRICS.find((m) => m.key === metric)!;
  const values = entries.map((e) => num(e[metric]));
  const dates = entries.map((e) => e.week_start);
  const n = values.length;
  // Default the tooltip to the most-recent point (like the reference).
  const [hovered, setHovered] = useState<number>(n - 1);

  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;
  const top = spread > 0 ? max + spread * 0.18 : max * 1.15 || 1;
  const bottom = spread > 0 ? Math.max(0, min - spread * 0.18) : 0;
  const span = top - bottom || 1;

  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const pts = values.map((v, i) => {
    const x = PAD_X + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = PAD_TOP + (1 - (v - bottom) / span) * innerH;
    return { x, y, v, date: dates[i] };
  });

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${pts[n - 1].x.toFixed(1)} ${H - PAD_BOTTOM} L ${pts[0].x.toFixed(1)} ${H - PAD_BOTTOM} Z`;

  const hp = pts[hovered];
  const gain = hovered > 0 ? values[hovered] - values[hovered - 1] : values[hovered];

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="relative flex-1 min-h-[240px]"
        onPointerLeave={() => setHovered(n - 1)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="ov-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--rose-300)" stopOpacity="0.4" />
              <stop offset="1" stopColor="var(--rose-300)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = PAD_TOP + p * innerH;
            return (
              <line
                key={i}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={y}
                y2={y}
                stroke="var(--ink-100)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <path d={area} fill="url(#ov-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--rose-500)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Markers (DOM so they stay perfectly round) */}
        {pts.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute rounded-full bg-white -translate-x-1/2 -translate-y-1/2 transition-all",
              i === hovered
                ? "size-3.5 ring-[3px] ring-rose-500"
                : "size-2.5 border-2 border-rose-500",
            )}
            style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
          />
        ))}

        {/* Hover hit-columns */}
        {pts.map((p, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${longDate(p.date)}: ${cfg.label}`}
            className="absolute top-0 bottom-0 -translate-x-1/2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            style={{ left: `${(p.x / W) * 100}%`, width: `${100 / n}%` }}
            onPointerEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
          />
        ))}

        {/* Tooltip */}
        {hp && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `clamp(60px, ${(hp.x / W) * 100}%, calc(100% - 60px))`,
              top: `${(hp.y / H) * 100}%`,
              marginTop: -14,
            }}
            role="tooltip"
          >
            <div className="relative bg-ink-900 text-white rounded-[10px] px-3 py-2 shadow-lg text-center min-w-[112px]">
              <div className="text-[11px] text-white/55 leading-tight">
                {weekday(hp.date)}
              </div>
              <div className="text-[13px] font-semibold leading-tight mt-0.5 tabular-nums">
                {cfg.tip(hp.v, gain)}
              </div>
              <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 size-2 bg-ink-900 rotate-45" />
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex mt-3">
        {pts.map((p, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 text-center text-[10.5px] tabular-nums",
              i === hovered ? "text-ink-700 font-semibold" : "text-ink-400",
            )}
          >
            {shortDate(p.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartEmpty({
  hasAny,
  showConnect,
}: {
  hasAny: boolean;
  showConnect: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
      <span className="size-11 rounded-full bg-rose-100 inline-flex items-center justify-center mb-3">
        <LineChart className="size-5 text-rose-600" strokeWidth={2} />
      </span>
      <h4 className="text-[15px] font-semibold text-ink-900 mb-1">
        {hasAny ? "Not enough data yet" : "No performance data yet"}
      </h4>
      <p className="text-[13px] text-ink-500 max-w-xs leading-relaxed">
        {hasAny
          ? "Trends appear once you have at least two snapshots — log one below or connect an account."
          : "Connect a social account to start seeing your weekly trend, or log your numbers below."}
      </p>
      {showConnect && (
        <Link
          href="/performance?tab=accounts"
          className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
        >
          <Plug className="size-4" strokeWidth={2} />
          Connect a social account
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}

/* ─── Data helpers ─────────────────────────────────────────────────────── */

function buildStats(
  latest: PerformanceEntry | null,
  baseline: PerformanceEntry | null,
): Stat[] {
  const f = num(latest?.followers);
  const fb = num(baseline?.followers);
  const followersGain = baseline ? f - fb : 0;

  return [
    {
      icon: Users,
      label: "Followers Gained",
      value: baseline ? signed(followersGain) : formatCompact(f),
      delta: pctDelta(fb, f, !!baseline),
    },
    {
      icon: Heart,
      label: "Engagement Rate",
      value:
        latest?.engagement_rate != null
          ? `${num(latest.engagement_rate).toFixed(1)}%`
          : "—",
      delta: pctDelta(
        num(baseline?.engagement_rate),
        num(latest?.engagement_rate),
        !!baseline,
      ),
    },
    {
      icon: Eye,
      label: "Profile Visits",
      value:
        latest?.profile_visits != null
          ? formatNumber(num(latest.profile_visits))
          : "—",
      delta: pctDelta(
        num(baseline?.profile_visits),
        num(latest?.profile_visits),
        !!baseline,
      ),
    },
    {
      icon: Clapperboard,
      label: "Content Published",
      value:
        latest?.posts_published != null
          ? String(num(latest.posts_published))
          : "—",
      delta: absDelta(
        num(baseline?.posts_published),
        num(latest?.posts_published),
        !!baseline,
      ),
    },
  ];
}

function pctDelta(prev: number, curr: number, hasBaseline: boolean): Delta {
  if (!hasBaseline || prev === 0) return { dir: "flat", text: "" };
  const pct = ((curr - prev) / prev) * 100;
  if (Math.abs(pct) < 0.05) return { dir: "flat", text: "" };
  const rounded =
    Math.abs(pct) >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10;
  return {
    dir: pct > 0 ? "up" : "down",
    text: `${pct > 0 ? "+" : ""}${rounded}%`,
  };
}

function absDelta(prev: number, curr: number, hasBaseline: boolean): Delta {
  if (!hasBaseline) return { dir: "flat", text: "" };
  const d = curr - prev;
  if (d === 0) return { dir: "flat", text: "" };
  return { dir: d > 0 ? "up" : "down", text: `${d > 0 ? "+" : ""}${d}` };
}

function signed(n: number): string {
  return `${n >= 0 ? "+" : ""}${formatNumber(n)}`;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function longDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function weekday(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}
