"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import {
  DEFAULT_PERFORMANCE_FILTERS,
  buildPerformanceSearch,
  type PerformanceFilters,
} from "@/lib/dev-dashboard/performance-filters";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

const SERVICE_OPTIONS: Option[] = [
  { value: "",              label: "All services" },
  { value: "frontend",      label: "frontend" },
  { value: "backend-api",   label: "backend-api" },
  { value: "auth-service",  label: "auth-service" },
  { value: "notifications", label: "notifications" },
  { value: "payments",      label: "payments" },
  { value: "database",      label: "database" },
];
const ROUTE_OPTIONS: Option[] = [
  { value: "",                       label: "All routes" },
  { value: "POST /api/upload",       label: "POST /api/upload" },
  { value: "GET /api/analytics",     label: "GET /api/analytics" },
  { value: "GET /api/notifications", label: "GET /api/notifications" },
  { value: "POST /api/webhooks",     label: "POST /api/webhooks" },
  { value: "GET /api/dashboard",     label: "GET /api/dashboard" },
];
const ENVIRONMENT_OPTIONS: Option[] = [
  { value: "Production",  label: "Production"  },
  { value: "Staging",     label: "Staging"     },
  { value: "Preview",     label: "Preview"     },
  { value: "Development", label: "Development" },
];
const TIME_RANGE_OPTIONS: Option[] = [
  { value: "Last 1 hour",   label: "Last 1 hour"   },
  { value: "Last 6 hours",  label: "Last 6 hours"  },
  { value: "Last 24 hours", label: "Last 24 hours" },
  { value: "Last 7 days",   label: "Last 7 days"   },
  { value: "Last 30 days",  label: "Last 30 days"  },
];
const GRANULARITY_OPTIONS: Option[] = [
  { value: "1m",  label: "1m"  },
  { value: "5m",  label: "5m"  },
  { value: "15m", label: "15m" },
  { value: "1h",  label: "1h"  },
  { value: "1d",  label: "1d"  },
];

/**
 * URL-driven filter row for /dev/performance. Every change navigates to a
 * new `?...` search-string so the page re-renders from the server with the
 * applied filters. Compare toggle does the same — when enabled, queries
 * also load the previous period for overlays.
 */
export function PerformanceFilterBar({ filters }: { filters: PerformanceFilters }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Local mirror of the search box so typing is responsive. When `filters.q`
  // changes from elsewhere (Reset, back/forward, a saved view), re-derive
  // `q` during render — the recommended pattern in the React docs, avoids
  // the cascading-render cost of doing the same work in an effect.
  const [q, setQ] = useState(filters.q);
  const [prevQ, setPrevQ] = useState(filters.q);
  if (filters.q !== prevQ) {
    setPrevQ(filters.q);
    setQ(filters.q);
  }

  function navigate(next: Partial<PerformanceFilters>) {
    const merged = { ...filters, ...next };
    startTransition(() => {
      router.push(`/dev/performance${buildPerformanceSearch(merged)}`, { scroll: false });
    });
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({ q });
  }

  function reset() {
    setQ("");
    startTransition(() => {
      router.push("/dev/performance", { scroll: false });
    });
  }

  return (
    <section className="dev-card p-3 flex flex-wrap items-end gap-3">
      {/* Search */}
      <form onSubmit={onSearchSubmit} className="relative flex-1 min-w-[260px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
          strokeWidth={1.9}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search routes, services, endpoints…"
          aria-label="Search performance"
          className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
        />
      </form>

      <FilterSelect
        label="Service"
        value={filters.service}
        options={SERVICE_OPTIONS}
        onChange={(v) => navigate({ service: v })}
      />
      <FilterSelect
        label="Route"
        value={filters.route}
        options={ROUTE_OPTIONS}
        onChange={(v) => navigate({ route: v })}
      />
      <FilterSelect
        label="Environment"
        value={filters.environment}
        options={ENVIRONMENT_OPTIONS}
        onChange={(v) => navigate({ environment: v as PerformanceFilters["environment"] })}
        statusDot
      />
      <FilterSelect
        label="Time Range"
        value={filters.timeRange}
        options={TIME_RANGE_OPTIONS}
        onChange={(v) => navigate({ timeRange: v as PerformanceFilters["timeRange"] })}
      />
      <FilterSelect
        label="Granularity"
        value={filters.granularity}
        options={GRANULARITY_OPTIONS}
        onChange={(v) => navigate({ granularity: v as PerformanceFilters["granularity"] })}
      />

      {/* Compare toggle — flips ?cmp=1 on/off; the page loads compare
          series and the chart cards render them as dashed overlays. */}
      <button
        type="button"
        role="switch"
        aria-checked={filters.compare}
        onClick={() => navigate({ compare: !filters.compare })}
        className="inline-flex items-center gap-2.5 h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
      >
        <span className="text-[var(--dev-text-secondary)]">Compare</span>
        <span
          className={cn(
            "relative inline-block w-8 h-[18px] rounded-full transition-colors",
            filters.compare ? "bg-[var(--dev-accent)]" : "bg-[var(--dev-surface-elev)]",
          )}
        >
          <span
            className={cn(
              "absolute top-[2px] size-3.5 rounded-full bg-white transition-transform",
              filters.compare ? "translate-x-[18px]" : "translate-x-[2px]",
            )}
          />
        </span>
      </button>

      {/* Reset filters — navigates to /dev/performance with no params. */}
      <button
        type="button"
        onClick={reset}
        disabled={isAtDefaults(filters)}
        className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-accent-border)] text-[12.5px] font-semibold text-[var(--dev-accent-text)] hover:bg-[var(--dev-accent-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RotateCcw className="size-3.5" strokeWidth={2} />
        Reset filters
      </button>
    </section>
  );
}

function isAtDefaults(f: PerformanceFilters): boolean {
  const d = DEFAULT_PERFORMANCE_FILTERS;
  return (
    f.q === d.q &&
    f.service === d.service &&
    f.route === d.route &&
    f.environment === d.environment &&
    f.timeRange === d.timeRange &&
    f.granularity === d.granularity &&
    f.compare === d.compare &&
    f.sortBy === d.sortBy &&
    f.sortDir === d.sortDir
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  statusDot = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  statusDot?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <div className="relative">
        {statusDot && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[var(--dev-success-text)]"
            aria-hidden
          />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={cn(
            "appearance-none w-full h-10 pr-9 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer",
            statusDot ? "pl-6" : "pl-3",
          )}
        >
          {options.map((o) => (
            <option
              key={o.value || "__all"}
              value={o.value}
              className="bg-[var(--dev-surface)] text-[var(--dev-text-primary)]"
            >
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--dev-text-muted)]"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}
