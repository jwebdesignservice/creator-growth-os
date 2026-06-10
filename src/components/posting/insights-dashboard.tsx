"use client";

/* Posting Insights dashboard ───────────────────────────────────────────────
   A creator-facing analytics overview laid out like a reports dashboard —
   wide KPI overview + a narrow action panel, then balanced breakdown rows —
   in the Profluencer rose/cream language, tuned to be genuinely useful:

     • The period switcher (7 / 28 / 90 days) recomputes the WHOLE surface —
       headline KPIs + trend, platform reach, top content, audience geo,
       format mix and the engagement trend all respond.
     • Every metric carries period-over-period context (delta pills) and a
       benchmark where it adds meaning.
     • The "Key takeaways" panel and the consistency nudge link to real
       destinations (calendar / plans / programs) so insight → action.

   Local widget library (./insights-widgets):
     • RetentionCohort     → audience-retention cohort
     • BestTimeHeatmap     → best time to post
     • FormatPerformance   → format engagement bars
     • ContributionHeatmap → posting activity

   Deterministic sample data (no Math.random / Date) — the page's "Preview"
   framing keeps it honest until the analytics pipeline lands.
   ───────────────────────────────────────────────────────────────────────── */

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Check,
  ArrowRight,
  Clock,
  Video,
  Users,
  Flame,
  Target,
  Lightbulb,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BestTimeHeatmap,
  FormatPerformance,
  ContributionHeatmap,
  RetentionCohort,
} from "./insights-widgets";

/* ─── Period model — one source of truth, drives every card ───────────── */

type PeriodKey = "7d" | "28d" | "90d";
type Kpi = { label: string; value: string; delta: number; up: boolean };

const PERIODS: Record<
  PeriodKey,
  {
    tab: string;
    range: string;
    mult: number; // scales the breakdown values vs the 28-day baseline
    posts: number;
    kpis: Kpi[];
    chart: number[];
    xLabels: string[];
  }
> = {
  "7d": {
    tab: "7 days",
    range: "May 28 – Jun 3, 2026",
    mult: 0.26,
    posts: 17,
    kpis: [
      { label: "Reach", value: "6.2K", delta: 9, up: true },
      { label: "New followers", value: "+428", delta: 14, up: true },
      { label: "Avg. engagement", value: "6.1%", delta: 4, up: true },
    ],
    chart: [80, 120, 96, 150, 110, 175, 132],
    xLabels: ["May 28", "May 30", "Jun 1", "Jun 3"],
  },
  "28d": {
    tab: "28 days",
    range: "May 7 – Jun 3, 2026",
    mult: 1,
    posts: 68,
    kpis: [
      { label: "Reach", value: "24.8K", delta: 12, up: true },
      { label: "New followers", value: "+1.8K", delta: 6, up: true },
      { label: "Avg. engagement", value: "5.7%", delta: 3, up: true },
    ],
    chart: [110, 140, 420, 250, 190, 165, 205, 175, 150, 200, 150, 135, 185, 160],
    xLabels: ["May 7", "May 14", "May 21", "May 28", "Jun 3"],
  },
  "90d": {
    tab: "90 days",
    range: "Mar 6 – Jun 3, 2026",
    mult: 2.9,
    posts: 218,
    kpis: [
      { label: "Reach", value: "71.4K", delta: 21, up: true },
      { label: "New followers", value: "+5.1K", delta: 11, up: true },
      { label: "Avg. engagement", value: "5.2%", delta: 2, up: false },
    ],
    chart: [70, 95, 120, 105, 150, 175, 160, 210, 240, 230, 280, 305],
    xLabels: ["Mar", "Apr", "May", "Jun"],
  },
};

// Relative breakdowns (mix stays stable; absolute values scale by period.mult).
const PLATFORMS = [
  { label: "Instagram", base: 14200, pct: 100, delta: 18, up: true },
  { label: "TikTok", base: 9800, pct: 69, delta: 9, up: true },
  { label: "YouTube", base: 6400, pct: 45, delta: 4, up: false },
  { label: "X / Twitter", base: 2100, pct: 15, delta: 2, up: true },
  { label: "LinkedIn", base: 980, pct: 7, delta: 12, up: true },
  { label: "Facebook", base: 410, pct: 3, delta: 8, up: false },
];

const TOP_CONTENT = [
  { label: "How I plan a week of content", base: 4200, pct: 100 },
  { label: "3 hooks that doubled my saves", base: 3100, pct: 74 },
  { label: "My filming setup tour", base: 2400, pct: 57 },
  { label: "Batch-editing in 30 minutes", base: 1800, pct: 43 },
  { label: "Turning a comment into a Reel", base: 1200, pct: 29 },
];

const COUNTRIES = [
  { name: "Norway", code: "NO", base: 1900, pct: 100 },
  { name: "United States", code: "US", base: 610, pct: 32 },
  { name: "United Kingdom", code: "UK", base: 280, pct: 15 },
  { name: "Netherlands", code: "NL", base: 210, pct: 11 },
  { name: "Ireland", code: "IE", base: 180, pct: 9 },
  { name: "Germany", code: "DE", base: 150, pct: 8 },
  { name: "Denmark", code: "DK", base: 120, pct: 6 },
];

function fmtK(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}

/* ─── Root ────────────────────────────────────────────────────────────── */

export function InsightsDashboard() {
  const [period, setPeriod] = useState<PeriodKey>("28d");
  const p = PERIODS[period];

  return (
    <div className="space-y-4">
      {/* ── Period toolbar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-cream-100 border border-ink-100">
          {(Object.keys(PERIODS) as PeriodKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPeriod(k)}
              aria-pressed={period === k}
              className={cn(
                "h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer",
                period === k
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              {PERIODS[k].tab}
            </button>
          ))}
        </div>
        <span className="text-[12.5px] text-ink-500">
          Last {p.tab} · <span className="text-ink-700 font-medium">{p.range}</span>
        </span>
      </div>

      {/* ── Row 1 — overview (2/3) + key takeaways (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <OverviewCard className="lg:col-span-2" period={p} />
        <TakeawaysCard />
      </div>

      {/* ── Row 2 — reach by platform + audience retention (both tall) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <BarTable
          title="Reach by platform"
          leftHeader="Platform"
          unit="Reach"
          headRight={<Delta pct={p.kpis[0].delta} up={p.kpis[0].up} />}
          rows={PLATFORMS.map((pl) => ({
            label: pl.label,
            value: fmtK(pl.base * p.mult),
            pct: pl.pct,
            delta: pl.delta,
            up: pl.up,
          }))}
        />
        <RetentionCohort className="w-full max-w-none" />
      </div>

      {/* ── Row 3 — engagement trend + audience by country ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <EngagementCard period={p} />
        <GeoCard mult={p.mult} />
      </div>

      {/* ── Row 4 — two heatmaps (matched height) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <BestTimeHeatmap className="w-full max-w-none" />
        <ContributionHeatmap className="w-full max-w-none" />
      </div>

      {/* ── Row 5 — format performance + format-mix donut (both short) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <FormatPerformance className="w-full max-w-none" />
        <FormatMixDonut total={p.posts} />
      </div>

      {/* ── Row 6 — top content + posting consistency ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <BarTable
          title="Top content by reach"
          leftHeader="Content"
          unit="Reach"
          rows={TOP_CONTENT.map((t) => ({
            label: t.label,
            value: fmtK(t.base * p.mult),
            pct: t.pct,
          }))}
        />
        <ConsistencyCard />
      </div>

      {/* ── Footer ── */}
      <div className="pt-2 text-center text-[12px] text-ink-400">
        Preview data — your real numbers fill in as you post · Profluencer
      </div>
    </div>
  );
}

/* ─── Shared bits ─────────────────────────────────────────────────────── */

function Delta({ pct, up }: { pct: number; up: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 h-5 rounded-full text-[11px] font-semibold tabular-nums shrink-0",
        up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
      )}
      title={`${up ? "Up" : "Down"} ${pct}% vs previous period`}
    >
      {up ? (
        <TrendingUp className="size-3" strokeWidth={2.4} />
      ) : (
        <TrendingDown className="size-3" strokeWidth={2.4} />
      )}
      {pct}%
    </span>
  );
}

function DashCard({
  title,
  sub,
  children,
  className,
  headRight,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  className?: string;
  headRight?: React.ReactNode;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-h5 text-ink-900 leading-tight">{title}</h3>
          {sub && <p className="text-[11.5px] text-ink-400 mt-0.5">{sub}</p>}
        </div>
        {headRight}
      </div>
      {children}
    </div>
  );
}

/* ─── 1 · Overview — metric tabs + area trend (period-aware) ──────────── */

function OverviewCard({
  className,
  period,
}: {
  className?: string;
  period: (typeof PERIODS)[PeriodKey];
}) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-5">
        {period.kpis.map((m, i) => (
          <div
            key={m.label}
            className={cn("pb-2 border-b-2", i === 0 ? "border-rose-500" : "border-transparent")}
          >
            <div className="text-[12px] text-ink-500">{m.label}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={cn(
                  "text-[26px] font-bold tabular-nums leading-none",
                  i === 0 ? "text-rose-600" : "text-ink-900",
                )}
              >
                {m.value}
              </span>
              <Delta pct={m.delta} up={m.up} />
            </div>
          </div>
        ))}
      </div>
      <AreaChart data={period.chart} xLabels={period.xLabels} />
    </div>
  );
}

function AreaChart({ data, xLabels }: { data: number[]; xLabels: string[] }) {
  const W = 600;
  const H = 172;
  const pad = 10;
  const max = Math.max(...data);
  const stepX = W / (data.length - 1);
  const yOf = (v: number) => H - (v / max) * (H - pad * 2) - pad;
  const pts = data.map((v, i) => `${i * stepX},${yOf(v)}`).join(" ");
  // Peak marker — the standout day, placed via % (x) + px (y) over the chart.
  const peakIdx = data.indexOf(max);
  const peakLeft = ((peakIdx * stepX) / W) * 100;
  const peakTop = yOf(max);
  return (
    <div className="relative flex-1 min-w-0">
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden
        className="text-rose-400 overflow-visible"
      >
        <defs>
          <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={W}
            y1={H * g}
            y2={H * g}
            className="stroke-cream-200"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <polyline points={`0,${H} ${pts} ${W},${H}`} fill="url(#reachGrad)" className="stroke-none" />
        <polyline
          points={pts}
          className="fill-none stroke-rose-500"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden
        className="absolute size-2.5 rounded-full bg-rose-500 ring-2 ring-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${peakLeft}%`, top: `${peakTop}px` }}
      />
      <div className="flex justify-between mt-1.5 text-[10.5px] text-ink-400">
        {xLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── 2 · Key takeaways — turn metrics into next actions ──────────────── */

function TakeawaysCard() {
  const items: { icon: LucideIcon; text: React.ReactNode; action: string; href: string }[] = [
    {
      icon: Clock,
      text: (
        <>
          Your <b className="text-ink-900">Saturday 6 PM</b> slot reaches{" "}
          <b className="text-ink-900">+38%</b> more accounts. Move one weekly Reel there.
        </>
      ),
      action: "Schedule a Reel",
      href: "/posting?view=calendar",
    },
    {
      icon: Video,
      text: (
        <>
          <b className="text-ink-900">Reels</b> drive 3× the engagement of static Posts. Lean into them.
        </>
      ),
      action: "Plan more Reels",
      href: "/posting",
    },
    {
      icon: Users,
      text: (
        <>
          Retention dips to <b className="text-ink-900">50%</b> by week 2 — a series keeps viewers coming back.
        </>
      ),
      action: "Start a series",
      href: "/programs",
    },
  ];
  return (
    <DashCard
      title="Key takeaways"
      headRight={
        <span className="size-7 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Lightbulb className="size-4" strokeWidth={1.9} />
        </span>
      }
    >
      <ul className="space-y-3.5">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <li key={i} className="flex items-start gap-3">
              <span className="size-8 rounded-[10px] bg-cream-100 text-rose-500 inline-flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="size-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] text-ink-700 leading-snug">{it.text}</p>
                <Link
                  href={it.href}
                  className="inline-flex items-center gap-1 mt-1 text-[11.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  {it.action}
                  <ArrowRight className="size-3" strokeWidth={2.4} />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}

/* ─── 3 · Bar table (platform reach + top content) ───────────────────── */

function BarTable({
  title,
  leftHeader,
  unit,
  rows,
  headRight,
}: {
  title: string;
  leftHeader: string;
  unit: string;
  rows: { label: string; value: string; pct: number; delta?: number; up?: boolean }[];
  headRight?: React.ReactNode;
}) {
  return (
    <DashCard title={title} headRight={headRight}>
      <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-wide text-ink-400 pb-2 border-b border-ink-100">
        <span>{leftHeader}</span>
        <span>{unit}</span>
      </div>
      <div className="divide-y divide-ink-100">
        {rows.map((r) => (
          <div key={r.label} className="py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-ink-700 truncate">{r.label}</span>
              <span className="inline-flex items-center gap-2 shrink-0">
                {r.delta != null && <Delta pct={r.delta} up={!!r.up} />}
                <span className="text-[13px] text-ink-900 font-semibold tabular-nums w-12 text-right">
                  {r.value}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

/* ─── 4 · Geo — map + country list (period-aware) ─────────────────────── */

function GeoCard({ mult }: { mult: number }) {
  return (
    <DashCard
      title="Audience by country"
      sub="Where your reach comes from"
      headRight={
        <span className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-cream-100 text-ink-500 text-[11.5px] font-medium shrink-0">
          <Globe className="size-3.5 text-rose-500" strokeWidth={2} />
          42 countries
        </span>
      }
    >
      <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-wide text-ink-400 pb-2 border-b border-ink-100">
        <span>Country</span>
        <span>Reach</span>
      </div>
      <div className="divide-y divide-ink-100">
        {COUNTRIES.map((c) => (
          <div key={c.name} className="flex items-center gap-3 py-2">
            <span className="text-[10px] font-bold text-ink-500 bg-cream-100 rounded-[6px] w-7 h-5 inline-flex items-center justify-center shrink-0">
              {c.code}
            </span>
            <span className="text-[13px] text-ink-700 w-32 truncate shrink-0">{c.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${c.pct}%` }} />
            </div>
            <span className="text-[12.5px] text-ink-900 font-semibold tabular-nums w-12 text-right shrink-0">
              {fmtK(c.base * mult)}
            </span>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

/* ─── 5 · Engagement rate — this period vs previous + benchmark ───────── */

function EngagementCard({ period }: { period: (typeof PERIODS)[PeriodKey] }) {
  const W = 560;
  const H = 150;
  const pad = 8;
  const cur = period.chart;
  const prev = cur.map((v) => v * 0.86);
  const max = Math.max(...cur);
  const toPoints = (d: number[]) => {
    const stepX = W / (d.length - 1);
    return d.map((v, i) => `${i * stepX},${H - (v / max) * (H - pad * 2) - pad}`).join(" ");
  };
  const eng = period.kpis[2];
  return (
    <DashCard title="Engagement rate over time" headRight={<Delta pct={eng.delta} up={eng.up} />}>
      <div className="flex items-baseline gap-2">
        <span className="text-[24px] font-bold text-ink-900 tabular-nums leading-none">
          {eng.value}
        </span>
        <span className="text-[12px] text-ink-500">avg this period</span>
      </div>
      <p className="inline-flex items-center gap-1 text-[11.5px] text-emerald-600 font-medium mt-1.5 mb-3">
        <Check className="size-3.5" strokeWidth={2.6} />
        Above the 3% creator average
      </p>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        {[0, 0.33, 0.66, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={W}
            y1={H * g}
            y2={H * g}
            className="stroke-cream-200"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <polyline
          points={toPoints(prev)}
          className="fill-none stroke-ink-300"
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={toPoints(cur)}
          className="fill-none stroke-rose-500"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between mt-1.5 text-[10.5px] text-ink-400">
        {period.xLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ink-100">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-700">
          <span className="w-4 h-0.5 rounded bg-rose-500" />
          This period
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
          <span className="w-4 border-t-2 border-dashed border-ink-300" />
          Previous
        </span>
      </div>
    </DashCard>
  );
}

/* ─── 6 · Format-mix donut (period-aware total) ───────────────────────── */

function FormatMixDonut({ total }: { total: number }) {
  const segs = [
    { label: "Reels", pct: 46, stroke: "stroke-violet-500", dot: "bg-violet-500" },
    { label: "Carousels", pct: 28, stroke: "stroke-sky-500", dot: "bg-sky-500" },
    { label: "Stories", pct: 16, stroke: "stroke-amber-500", dot: "bg-amber-500" },
    { label: "Posts", pct: 10, stroke: "stroke-rose-400", dot: "bg-rose-400" },
  ];
  const size = 150;
  const sw = 18;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <DashCard title="Content mix by format" sub="Share of posts published">
      <div className="flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90" aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              className="fill-none stroke-cream-200"
              strokeWidth={sw}
            />
            {segs.map((s) => {
              const dash = (s.pct / 100) * c;
              const el = (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  className={cn("fill-none", s.stroke)}
                  strokeWidth={sw}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold text-ink-900 leading-none tabular-nums">
              {total}
            </span>
            <span className="text-[11px] text-ink-500 mt-1">posts</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 min-w-0">
          {segs.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 text-[12.5px]">
              <span className={cn("size-2.5 rounded-full shrink-0", s.dot)} />
              <span className="text-ink-700 flex-1 truncate">{s.label}</span>
              <span className="text-ink-900 font-semibold tabular-nums">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </DashCard>
  );
}

/* ─── 7 · Posting consistency — goal + streak ─────────────────────────── */

function ConsistencyCard() {
  const goal = 5;
  const done = 4;
  const pct = Math.round((done / goal) * 100);
  const week = [
    { d: "M", on: true },
    { d: "T", on: true },
    { d: "W", on: false },
    { d: "T", on: true },
    { d: "F", on: true },
    { d: "S", on: false },
    { d: "S", on: false },
  ];
  return (
    <DashCard
      title="Posting consistency"
      sub="This week's goal"
      headRight={
        <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-rose-50 text-rose-600 text-[11.5px] font-semibold shrink-0">
          <Flame className="size-3.5" strokeWidth={2} />
          6-week streak
        </span>
      }
    >
      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="flex items-baseline gap-1.5">
          <Target className="size-4 text-rose-500 self-center" strokeWidth={2} />
          <span className="text-[26px] font-bold text-ink-900 tabular-nums leading-none">
            {done}
          </span>
          <span className="text-[13px] text-ink-500">of {goal} posts</span>
        </div>
        <span className="text-[12px] font-medium text-ink-500 tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden mb-4">
        <div className="h-full rounded-full bg-rose-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((w, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "w-full h-8 rounded-[8px] inline-flex items-center justify-center text-[11px] font-semibold",
                w.on ? "bg-rose-500 text-white" : "bg-cream-100 text-ink-300 border border-cream-200",
              )}
            >
              {w.on ? "✓" : ""}
            </span>
            <span className="text-[10.5px] text-ink-400">{w.d}</span>
          </div>
        ))}
      </div>
      <Link
        href="/posting?view=calendar"
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:text-rose-700 transition-colors mt-3"
      >
        Plan a Saturday Reel to keep the streak
        <ArrowRight className="size-3" strokeWidth={2.4} />
      </Link>
    </DashCard>
  );
}
