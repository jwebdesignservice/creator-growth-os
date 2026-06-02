"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Heart,
  Info,
  Layers,
  Minus,
  Radio,
  TrendingUp,
  Users,
  Wallet,
  Eye,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  AdminPerformanceData,
  AdminPerfWeek,
  PlatformBreakdownRow,
} from "@/lib/performance/admin-queries";

/* ─────────────────────────────────────────────────────────────────────────
   Admin performance dashboard — a financial-style overview of platform-wide
   creator performance. Layout mirrors a Whop-style revenue console (hero
   "This week" block + balance rail, a Stats control bar, and a grid of
   metric cards with per-card trend charts). Every figure is wired to real
   aggregates passed in from the server; metrics with no source render an
   honest "No data available" state rather than fabricated numbers.

   All range / granularity / metric switching is pure client-side math off
   the 16-week series, so it's instant.
   ───────────────────────────────────────────────────────────────────────── */

type MetricKey =
  | "revenue"
  | "views"
  | "followers"
  | "reach"
  | "engagement"
  | "creators";

type MetricDef = {
  key: MetricKey;
  label: string;
  icon: LucideIcon;
  agg: "sum" | "avg";
  value: (w: AdminPerfWeek) => number;
  has: (w: AdminPerfWeek) => boolean;
  format: (n: number) => string;
  formatAxis: (n: number) => string;
};

const fmtInt = (n: number) => Math.round(n).toLocaleString();
const fmtCompact = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (a >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return Math.round(n).toLocaleString();
};
const fmtKr = (n: number) => `${Math.round(n).toLocaleString()} kr`;
const fmtKrCompact = (n: number) => `${fmtCompact(n)} kr`;
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const METRICS: Record<MetricKey, MetricDef> = {
  revenue: {
    key: "revenue",
    label: "Reported revenue",
    icon: Wallet,
    agg: "sum",
    value: (w) => w.revenue,
    has: (w) => w.entries > 0,
    format: fmtKr,
    formatAxis: fmtKrCompact,
  },
  views: {
    key: "views",
    label: "Total views",
    icon: Eye,
    agg: "sum",
    value: (w) => w.views,
    has: (w) => w.entries > 0,
    format: fmtInt,
    formatAxis: fmtCompact,
  },
  followers: {
    key: "followers",
    label: "Followers",
    icon: TrendingUp,
    agg: "sum",
    value: (w) => w.followers,
    has: (w) => w.entries > 0,
    format: fmtInt,
    formatAxis: fmtCompact,
  },
  reach: {
    key: "reach",
    label: "Total reach",
    icon: Radio,
    agg: "sum",
    value: (w) => w.reach,
    has: (w) => w.entries > 0,
    format: fmtInt,
    formatAxis: fmtCompact,
  },
  engagement: {
    key: "engagement",
    label: "Engagement",
    icon: Heart,
    agg: "avg",
    value: (w) => w.engagement ?? 0,
    has: (w) => w.engagement != null,
    format: fmtPct,
    formatAxis: (n) => `${n.toFixed(1)}%`,
  },
  creators: {
    key: "creators",
    label: "Active creators",
    icon: Users,
    agg: "avg",
    value: (w) => w.creators,
    has: (w) => w.entries > 0,
    format: (n) => fmtInt(Math.round(n)),
    formatAxis: (n) => Math.round(n).toString(),
  },
};

const HERO_OPTIONS: MetricKey[] = [
  "revenue",
  "views",
  "followers",
  "reach",
  "engagement",
];
const CARD_KEYS: MetricKey[] = [
  "revenue",
  "views",
  "creators",
  "followers",
  "engagement",
];

const RANGE_OPTIONS = [4, 8, 12, 16] as const;
type RangeWeeks = (typeof RANGE_OPTIONS)[number];
type Granularity = "weekly" | "monthly";

const PLATFORM_COLOR: Record<string, string> = {
  manual: "bg-ink-400",
  instagram: "bg-rose-500",
  youtube: "bg-rose-600",
  facebook: "bg-sky-500",
  tiktok: "bg-ink-900",
  linkedin: "bg-sky-600",
  snapchat: "bg-amber-400",
  twitter: "bg-ink-700",
  x: "bg-ink-700",
};

/* ─── helpers ────────────────────────────────────────────────────────────── */

type Bucket = { label: string; weeks: AdminPerfWeek[] };

function makeBuckets(weeks: AdminPerfWeek[], gran: Granularity): Bucket[] {
  if (gran === "weekly") {
    return weeks.map((w) => ({ label: fmtWeek(w.weekStart), weeks: [w] }));
  }
  const map = new Map<string, Bucket & { sortKey: number }>();
  for (const w of weeks) {
    const d = new Date(`${w.weekStart}T00:00:00Z`);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const ex =
      map.get(key) ??
      ({
        label,
        sortKey: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1),
        weeks: [],
      } as Bucket & { sortKey: number });
    ex.weeks.push(w);
    map.set(key, ex);
  }
  return [...map.values()]
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ label, weeks }) => ({ label, weeks }));
}

function aggregate(weeks: AdminPerfWeek[], def: MetricDef): number {
  if (def.agg === "avg") {
    const ws = weeks.filter(def.has);
    if (ws.length === 0) return 0;
    return ws.reduce((a, w) => a + def.value(w), 0) / ws.length;
  }
  return weeks.reduce((a, w) => a + def.value(w), 0);
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0 && curr === 0) return null;
  if (prev === 0) return 100;
  return Math.round(((curr - prev) / prev) * 100);
}

function fmtWeek(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function weekRangeLabel(iso: string): string {
  const s = new Date(`${iso}T00:00:00Z`);
  const e = new Date(s);
  e.setUTCDate(e.getUTCDate() + 6);
  const f = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
  return s.getUTCMonth() === e.getUTCMonth()
    ? `${f(s, { month: "short", day: "numeric" })} – ${f(e, { day: "numeric" })}`
    : `${f(s, { month: "short", day: "numeric" })} – ${f(e, { month: "short", day: "numeric" })}`;
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function niceAxis(max: number): { max: number; ticks: number[] } {
  const target = Math.max(1, max);
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  const steps: number[] = [];
  for (const p of [pow, pow * 10]) for (const m of [0.5, 1, 2, 2.5, 5]) steps.push(m * p);
  steps.sort((a, b) => a - b);
  const step = steps.find((s) => Math.ceil(target / s) <= 4) ?? steps[steps.length - 1];
  const niceMax = Math.ceil(target / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + 1e-9; v += step) ticks.push(Math.round(v));
  return { max: niceMax, ticks };
}

/* ─── root ───────────────────────────────────────────────────────────────── */

export function PerformanceDashboard({ data }: { data: AdminPerformanceData }) {
  const [heroMetric, setHeroMetric] = useState<MetricKey>("revenue");
  const [rangeWeeks, setRangeWeeks] = useState<RangeWeeks>(8);
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [bannerOpen, setBannerOpen] = useState(true);

  const heroDef = METRICS[heroMetric];
  const thisWeek = data.weeks[data.weeks.length - 1];
  const lastWeek = data.weeks[data.weeks.length - 2];

  const heroPoints = useMemo(
    () =>
      data.weeks.slice(-12).map((w) => ({
        label: fmtWeek(w.weekStart),
        value: heroDef.value(w),
      })),
    [data.weeks, heroDef],
  );

  const windowWeeks = useMemo(
    () => data.weeks.slice(-rangeWeeks),
    [data.weeks, rangeWeeks],
  );
  const prevWeeks = useMemo(
    () =>
      data.weeks.slice(
        Math.max(0, data.weeks.length - rangeWeeks * 2),
        data.weeks.length - rangeWeeks,
      ),
    [data.weeks, rangeWeeks],
  );
  const buckets = useMemo(
    () => makeBuckets(windowWeeks, granularity),
    [windowWeeks, granularity],
  );

  const thisVal = heroDef.has(thisWeek) ? heroDef.format(heroDef.value(thisWeek)) : "—";
  const lastVal = heroDef.has(lastWeek) ? heroDef.format(heroDef.value(lastWeek)) : "—";
  const heroDelta =
    heroDef.has(thisWeek) && heroDef.has(lastWeek)
      ? pctDelta(heroDef.value(thisWeek), heroDef.value(lastWeek))
      : null;

  const hasAnyData = data.totals.entries > 0;

  return (
    <div className="space-y-5">
      {/* ── Hero: This week + balance rail ─────────────────────────────── */}
      <section className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_300px]">
          {/* Left — headline + chart */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-bold text-ink-900">This week</h2>
              <div className="flex items-center gap-2">
                <MetricSelect value={heroMetric} onChange={setHeroMetric} options={HERO_OPTIONS} />
                <Link
                  href="/admin/announcements"
                  className="size-9 rounded-[10px] border border-ink-100 text-ink-400 hover:text-rose-600 hover:border-rose-200 inline-flex items-center justify-center transition-colors"
                  aria-label="Announcements"
                >
                  <Bell className="size-4" strokeWidth={2} />
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-x-10 gap-y-4 mt-4">
              <div>
                <div className="text-[12px] text-ink-500">{heroDef.label}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[26px] font-bold text-ink-900 tabular-nums leading-none">
                    {thisVal}
                  </span>
                  {heroDelta != null && <DeltaPill delta={heroDelta} />}
                </div>
                <div className="text-[11px] text-ink-400 mt-1.5">
                  {weekRangeLabel(thisWeek.weekStart)}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-ink-500">Last week</div>
                <div className="text-[26px] font-bold text-ink-400 tabular-nums leading-none mt-0.5">
                  {lastVal}
                </div>
                <div className="text-[11px] text-ink-400 mt-1.5">
                  {weekRangeLabel(lastWeek.weekStart)}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <AreaTrend points={heroPoints} format={heroDef.formatAxis} height={210} showYAxis />
              <div className="flex justify-between mt-2 text-[10.5px] text-ink-400 tabular-nums">
                <span>{heroPoints[0]?.label}</span>
                <span>{heroPoints[heroPoints.length - 1]?.label}</span>
              </div>
            </div>
          </div>

          {/* Right — balance rail */}
          <div className="border-t lg:border-t-0 lg:border-l border-ink-100 p-5 sm:p-6 flex flex-col bg-cream-50/40">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-500">Reported revenue</span>
              <Link href="/admin/users" className="text-[12px] font-semibold text-rose-600 hover:text-rose-700">
                View
              </Link>
            </div>
            <div className="text-[24px] font-bold text-ink-900 tabular-nums mt-1">
              {fmtKr(data.totals.revenue)}
            </div>
            <div className="text-[12px] text-ink-400 mt-0.5">
              {data.totals.entries} {data.totals.entries === 1 ? "entry" : "entries"} ·{" "}
              {data.totals.activeCreators}{" "}
              {data.totals.activeCreators === 1 ? "creator" : "creators"}
            </div>
            <Link
              href="/admin/users"
              className="mt-3 inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-rose-50 text-rose-700 hover:bg-rose-100 text-[12.5px] font-semibold transition-colors"
            >
              <Users className="size-3.5" strokeWidth={2} />
              View all creators
            </Link>

            <div className="border-t border-ink-100 my-4" />

            <div className="flex items-center justify-between">
              <span className="text-[12px] text-ink-500">Active creators</span>
              <Link href="/admin/users" className="text-[12px] font-semibold text-rose-600 hover:text-rose-700">
                View
              </Link>
            </div>
            <div className="text-[18px] font-bold text-ink-900 tabular-nums mt-1">
              {data.totals.activeCreators}
            </div>
            <div className="text-[11px] text-ink-400 mt-1">
              Submitted across {data.totals.entries}{" "}
              {data.totals.entries === 1 ? "entry" : "entries"}
            </div>

            <div className="text-[10.5px] text-ink-400 mt-auto pt-4">
              Window · last {data.weeksCount} weeks
            </div>
          </div>
        </div>
      </section>

      {/* ── Context banner ─────────────────────────────────────────────── */}
      {bannerOpen && (
        <div className="rounded-[14px] border border-ink-100 bg-cream-50 px-4 py-3 flex items-start gap-3">
          <Info className="size-4 text-rose-500 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-[12.5px] text-ink-600 leading-relaxed flex-1">
            {hasAnyData ? (
              <>
                Aggregated from{" "}
                <span className="font-semibold text-ink-800">
                  {data.totals.entries} weekly{" "}
                  {data.totals.entries === 1 ? "submission" : "submissions"}
                </span>{" "}
                by {data.totals.activeCreators}{" "}
                {data.totals.activeCreators === 1 ? "creator" : "creators"} over
                the last {data.weeksCount} weeks. Metrics with no source show as
                “No data available”.
              </>
            ) : (
              <>
                No creator performance entries in the last {data.weeksCount}{" "}
                weeks yet. Weekly submissions from creators populate these charts
                automatically — no data is fabricated.
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setBannerOpen(false)}
            className="text-ink-400 hover:text-ink-700 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <h2 className="text-[18px] font-bold text-ink-900">Stats</h2>
        <span className="text-[11.5px] text-ink-400">
          Updated {relTime(data.generatedAt)}
        </span>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <RangeSelect value={rangeWeeks} onChange={setRangeWeeks} />
        <span className="text-[12px] text-ink-400 hidden sm:inline">
          compared to <span className="font-semibold text-ink-600">previous period</span>
        </span>
        <GranularityToggle value={granularity} onChange={setGranularity} />
        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-600">
          <Users className="size-3.5 text-ink-400" strokeWidth={2} />
          All creators
        </span>
        <Link
          href="/admin/users"
          className="ml-auto inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-ink-900 text-cream-100 hover:bg-ink-700 text-[12.5px] font-semibold transition-colors"
        >
          View users
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARD_KEYS.map((key) => (
          <MetricCard
            key={key}
            def={METRICS[key]}
            buckets={buckets}
            windowWeeks={windowWeeks}
            prevWeeks={prevWeeks}
          />
        ))}
        <BreakdownCard rows={data.platformBreakdown} />
      </div>
    </div>
  );
}

/* ─── metric card ────────────────────────────────────────────────────────── */

function MetricCard({
  def,
  buckets,
  windowWeeks,
  prevWeeks,
}: {
  def: MetricDef;
  buckets: Bucket[];
  windowWeeks: AdminPerfWeek[];
  prevWeeks: AdminPerfWeek[];
}) {
  const points = buckets.map((b) => ({
    label: b.label,
    value: aggregate(b.weeks, def),
  }));
  const curr = aggregate(windowWeeks, def);
  const prev = aggregate(prevWeeks, def);
  const delta = pctDelta(curr, prev);
  const Icon = def.icon;

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-700">
          <span className="size-6 rounded-[7px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Icon className="size-3.5" strokeWidth={2} />
          </span>
          {def.label}
        </div>
        <DeltaPill delta={delta} />
      </div>
      <div className="text-[22px] font-bold text-ink-900 tabular-nums mt-2">
        {def.format(curr)}
      </div>
      <div className="mt-3">
        <AreaTrend points={points} format={def.formatAxis} height={108} />
        <div className="flex justify-between mt-1.5 text-[10.5px] text-ink-400 tabular-nums">
          <span>{points[0]?.label}</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ rows }: { rows: PlatformBreakdownRow[] }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-700">
        <span className="size-6 rounded-[7px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Layers className="size-3.5" strokeWidth={2} />
        </span>
        Entries by platform
      </div>
      {rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[140px]">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-200/80 text-ink-400 text-[11px] font-medium">
            No data available
          </span>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.platform}>
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="flex items-center gap-2 text-ink-700">
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      PLATFORM_COLOR[r.platform] ?? "bg-ink-300",
                    )}
                  />
                  {r.label}
                </span>
                <span className="text-ink-900 font-semibold tabular-nums">
                  {r.entries}{" "}
                  <span className="text-ink-400 font-normal">
                    ({Math.round(r.pct)}%)
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className={cn(
                    "h-full",
                    PLATFORM_COLOR[r.platform] ?? "bg-ink-300",
                  )}
                  style={{ width: `${Math.max(2, r.pct)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── delta pill ─────────────────────────────────────────────────────────── */

function DeltaPill({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="text-[11px] text-ink-400">—</span>;
  }
  const flat = delta === 0;
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full",
        flat
          ? "text-ink-500 bg-cream-200"
          : up
            ? "text-emerald-600 bg-emerald-500/10"
            : "text-rose-600 bg-rose-50",
      )}
    >
      {flat ? (
        <Minus className="size-3" strokeWidth={2.5} />
      ) : up ? (
        <ArrowUpRight className="size-3" strokeWidth={2.5} />
      ) : (
        <ArrowDownRight className="size-3" strokeWidth={2.5} />
      )}
      {Math.abs(delta)}%
    </span>
  );
}

/* ─── controls ───────────────────────────────────────────────────────────── */

function MetricSelect({
  value,
  onChange,
  options,
}: {
  value: MetricKey;
  onChange: (v: MetricKey) => void;
  options: MetricKey[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MetricKey)}
        className="appearance-none h-9 pl-3 pr-8 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-900 hover:bg-cream-100 transition-colors cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        aria-label="Hero metric"
      >
        {options.map((k) => (
          <option key={k} value={k}>
            {METRICS[k].label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-ink-500 pointer-events-none"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

function RangeSelect({
  value,
  onChange,
}: {
  value: RangeWeeks;
  onChange: (v: RangeWeeks) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as RangeWeeks)}
        className="appearance-none h-9 pl-3 pr-8 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-900 hover:bg-cream-100 transition-colors cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        aria-label="Date range"
      >
        {RANGE_OPTIONS.map((w) => (
          <option key={w} value={w}>
            Last {w} weeks
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-ink-500 pointer-events-none"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

function GranularityToggle({
  value,
  onChange,
}: {
  value: Granularity;
  onChange: (v: Granularity) => void;
}) {
  const items: Granularity[] = ["weekly", "monthly"];
  return (
    <div
      role="tablist"
      aria-label="Granularity"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-[10px] bg-cream-100 border border-ink-100"
    >
      {items.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(g)}
            className={cn(
              "inline-flex items-center h-8 px-3.5 rounded-[8px] text-[12.5px] font-semibold capitalize transition-colors cursor-pointer",
              active ? "bg-ink-900 text-cream-100 shadow-sm" : "text-ink-500 hover:text-ink-900",
            )}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}

/* ─── chart ──────────────────────────────────────────────────────────────── */

function AreaTrend({
  points,
  format,
  height,
  showYAxis = false,
}: {
  points: { label: string; value: number }[];
  format: (n: number) => string;
  height: number;
  showYAxis?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = 200;
  const PAD = { t: 14, r: 8, b: 8, l: 8 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const values = points.map((p) => p.value);
  const maxV = Math.max(0, ...values);
  const empty = maxV <= 0;
  const { max: niceMax, ticks } = niceAxis(Math.max(1, maxV));

  const n = values.length;
  const stepX = n <= 1 ? 0 : innerW / (n - 1);
  const xOf = (i: number) => (n <= 1 ? PAD.l + innerW / 2 : PAD.l + i * stepX);
  const yOf = (v: number) => PAD.t + (1 - v / niceMax) * innerH;

  const pts = points.map((p, i) => ({ x: xOf(i), y: yOf(p.value), ...p }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area =
    pts.length >= 2
      ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PAD.b} L ${pts[0].x.toFixed(1)} ${H - PAD.b} Z`
      : "";
  const hp = !empty && hover != null ? pts[hover] : null;

  return (
    <div className="flex min-w-0" onPointerLeave={() => setHover(null)}>
      {showYAxis && (
        <div
          className="flex flex-col-reverse justify-between pr-2 text-[10px] text-ink-400 tabular-nums shrink-0"
          style={{
            height,
            paddingTop: (PAD.t / H) * height,
            paddingBottom: (PAD.b / H) * height,
          }}
          aria-hidden
        >
          {ticks.map((t, i) => (
            <span key={i} className="leading-none">
              {empty ? " " : format(t)}
            </span>
          ))}
        </div>
      )}

      <div className="relative flex-1 min-w-0" style={{ height }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-full block"
          aria-hidden
        >
          <defs>
            <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose-400)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--rose-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t, i) => {
            const y = yOf(t);
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

          {!empty && area && <path d={area} fill={`url(#g${gid})`} />}
          {!empty && pts.length >= 2 && (
            <path
              d={line}
              fill="none"
              stroke="var(--rose-500)"
              strokeWidth={2.25}
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

          {!empty &&
            pts.map((p, i) => {
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
                  onPointerEnter={() => setHover(i)}
                  onTouchStart={() => setHover(i)}
                  className="cursor-pointer"
                />
              );
            })}
        </svg>

        {hp && (
          <span
            className="pointer-events-none absolute size-2.5 rounded-full bg-[var(--rose-500)] ring-2 ring-white -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(hp.x / W) * 100}%`, top: `${(hp.y / H) * 100}%` }}
          />
        )}
        {hp && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `clamp(46px, ${(hp.x / W) * 100}%, calc(100% - 46px))`,
              top: `${(hp.y / H) * 100}%`,
              marginTop: -8,
            }}
            role="tooltip"
          >
            <div className="bg-white rounded-[9px] border border-ink-100 shadow-md px-2.5 py-1.5 text-center min-w-[88px]">
              <div className="text-[11px] font-semibold text-ink-900 leading-tight">
                {hp.label}
              </div>
              <div className="text-[12.5px] font-bold text-rose-600 tabular-nums mt-0.5">
                {format(hp.value)}
              </div>
            </div>
          </div>
        )}

        {empty && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cream-200/80 text-ink-400 text-[11px] font-medium">
              No data available
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
