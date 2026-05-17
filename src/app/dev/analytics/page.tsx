import {
  Plus,
  Download,
  Search,
  ChevronDown,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { DevSparkline } from "@/components/dev-dashboard/dev-sparkline";
import { TrafficTrendsCard } from "@/components/dev-dashboard/sections/traffic-trends-card";
import { TrafficSourcesCard } from "@/components/dev-dashboard/sections/traffic-sources-card";
import { DeviceBreakdownCard } from "@/components/dev-dashboard/sections/device-breakdown-card";
import { TopPagesCard } from "@/components/dev-dashboard/sections/top-pages-card";
import { UserFunnelCard } from "@/components/dev-dashboard/sections/user-funnel-card";
import { FeatureUsageCard } from "@/components/dev-dashboard/sections/feature-usage-card";
import { RegionalUsageCard } from "@/components/dev-dashboard/sections/regional-usage-card";
import { RetentionEngagementCard } from "@/components/dev-dashboard/sections/retention-engagement-card";
import { RecentEventsTable } from "@/components/dev-dashboard/sections/recent-events-table";
import { ANALYTICS_METRICS } from "@/lib/dev-dashboard/analytics-data";
import type { AnalyticsMetric } from "@/lib/dev-dashboard/analytics-data";

export const metadata = { title: "Analytics · Dev Dashboard" };

const SERIES_COLOR: Record<AnalyticsMetric["seriesColor"], string> = {
  blue:   "var(--dev-chart-blue)",
  green:  "var(--dev-chart-green)",
  amber:  "var(--dev-chart-amber)",
  purple: "var(--dev-chart-purple)",
};

const DELTA_COLOR: Record<AnalyticsMetric["deltaTone"], string> = {
  success: "text-[var(--dev-success-text)]",
  warning: "text-[var(--dev-warning-text)]",
  danger:  "text-[var(--dev-danger-text)]",
  neutral: "text-[var(--dev-text-secondary)]",
};

export default function DevAnalyticsPage() {
  return (
    <div className="space-y-[var(--mobile-section-gap)] sm:space-y-5">
      <DevPageHeader
        title="Analytics"
        subtitle="Track product usage, engagement trends, traffic patterns, and feature adoption across the platform."
        action={
          <div className="flex items-center gap-2">
            <HeaderButton variant="ghost">
              <Plus className="size-3.5" strokeWidth={2} />
              Create Report
            </HeaderButton>
            <HeaderButton variant="ghost">
              <Download className="size-3.5" strokeWidth={2} />
              Export Data
            </HeaderButton>
          </div>
        }
      />

      {/* 1. Metric strip — 6 tiles auto-fit */}
      <MetricStrip />

      {/* 2. Filter row — search + 4 selects + compare toggle + reset */}
      <FilterRow />

      {/* 3. Trends (wide) + Sources (donut) + Device Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-[var(--mobile-grid-gap)] sm:gap-4">
        <div className="md:col-span-6 xl:col-span-6">
          <TrafficTrendsCard />
        </div>
        <div className="md:col-span-3 xl:col-span-3">
          <TrafficSourcesCard />
        </div>
        <div className="md:col-span-3 xl:col-span-3">
          <DeviceBreakdownCard />
        </div>
      </section>

      {/* 4. Top Pages + Funnel + Feature + Regional + Retention */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-[var(--mobile-grid-gap)] sm:gap-4">
        <div className="xl:col-span-3">
          <TopPagesCard />
        </div>
        <div className="xl:col-span-3">
          <UserFunnelCard />
        </div>
        <div className="xl:col-span-2">
          <FeatureUsageCard />
        </div>
        <div className="xl:col-span-2">
          <RegionalUsageCard />
        </div>
        <div className="xl:col-span-2">
          <RetentionEngagementCard />
        </div>
      </section>

      {/* 5. Recent events table — full-width */}
      <RecentEventsTable />
    </div>
  );
}

/* ── Metric strip ─────────────────────────────────────────────────────────
   6 tiles. Each tile shows label + delta on top, big value on the left of
   the next row, and a small sparkline filling the right. Auto-fit grid so
   it lays out 1/2/3/6 columns as the viewport grows.                        */
function MetricStrip() {
  return (
    <section
      className="grid gap-[var(--mobile-grid-gap)] sm:gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))" }}
    >
      {ANALYTICS_METRICS.map((m) => (
        <MetricTile key={m.key} m={m} />
      ))}
    </section>
  );
}

function MetricTile({ m }: { m: AnalyticsMetric }) {
  const color = SERIES_COLOR[m.seriesColor];
  return (
    <div className="dev-card p-4 flex flex-col gap-3 min-h-[132px]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] text-[var(--dev-text-muted)] font-medium leading-tight">
          {m.label}
        </span>
        <span
          className={
            "text-[11.5px] font-semibold tabular-nums whitespace-nowrap " +
            DELTA_COLOR[m.deltaTone]
          }
        >
          {m.delta}
          <span className="ml-1 text-[10.5px] font-medium text-[var(--dev-text-muted)]">
            {m.deltaBaseline}
          </span>
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-[26px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {m.value}
        </div>
      </div>
      <div className="-mx-1 mt-auto">
        <DevSparkline
          data={m.series}
          color={color}
          gradientId={`analytics-spark-${m.key}`}
          height={44}
        />
      </div>
    </div>
  );
}

/* ── Filter row ─────────────────────────────────────────────────────────── */
function FilterRow() {
  return (
    <section className="flex flex-wrap items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-[420px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search pages, events, funnels, or users..."
          aria-label="Search analytics"
          className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] focus:outline-none focus:border-[var(--dev-accent-border)] focus:ring-2 focus:ring-[var(--dev-accent-soft)] transition-colors"
        />
      </div>

      <FilterSelect
        value="Last 30 days"
        leading={<CalendarDays className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.8} />}
      />
      <FilterSelect value="All traffic" />
      <FilterSelect value="All devices" />
      <FilterSelect value="Global" />

      <CompareToggle />

      <button
        type="button"
        className="ml-auto inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[13px] font-medium text-[var(--dev-text-primary)] transition-colors"
      >
        <RotateCcw className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.8} />
        Reset filters
      </button>
    </section>
  );
}

function FilterSelect({
  value,
  leading,
}: {
  value: string;
  leading?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 h-10 px-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[13px] font-medium text-[var(--dev-text-primary)] transition-colors"
    >
      {leading}
      <span>{value}</span>
      <ChevronDown className="size-3.5 text-[var(--dev-text-muted)] ml-1" strokeWidth={2} />
    </button>
  );
}

/* Static, visual-only toggle in the "on" state — matches the rendered ref */
function CompareToggle() {
  return (
    <div className="inline-flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-[10px]">
      <span
        role="switch"
        aria-checked
        className="relative inline-block w-9 h-5 rounded-full bg-[var(--dev-accent)]"
      >
        <span className="absolute top-0.5 left-[18px] size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
      </span>
      <span className="text-[13px] font-medium text-[var(--dev-text-primary)]">
        Compare to previous period
      </span>
    </div>
  );
}

/* ── Header buttons ─────────────────────────────────────────────────────── */
function HeaderButton({
  children,
  variant = "ghost",
}: {
  children: React.ReactNode;
  variant?: "ghost" | "primary";
}) {
  const base =
    "inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] text-[12.5px] font-medium transition-colors";
  const tone =
    variant === "primary"
      ? "bg-[var(--dev-accent)] text-white hover:bg-[var(--dev-accent-hover)]"
      : "bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[var(--dev-text-primary)]";
  return (
    <button type="button" className={base + " " + tone}>
      {children}
    </button>
  );
}
