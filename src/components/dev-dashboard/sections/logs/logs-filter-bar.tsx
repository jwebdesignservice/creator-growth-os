"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, RotateCcw, Pause } from "lucide-react";
import {
  DEFAULT_LOGS_FILTERS,
  buildLogsSearch,
  type LogsFilters,
} from "@/lib/dev-dashboard/logs-filters";
import { cn } from "@/lib/cn";

const SERVICE_OPTIONS = [
  { value: "",              label: "All services" },
  { value: "frontend",      label: "frontend" },
  { value: "backend-api",   label: "backend-api" },
  { value: "auth",          label: "auth" },
  { value: "database",      label: "database" },
  { value: "notifications", label: "notifications" },
  { value: "payments",      label: "payments" },
  { value: "storage",       label: "storage" },
];
const LEVEL_OPTIONS = [
  { value: "",      label: "All levels" },
  { value: "ERROR", label: "ERROR" },
  { value: "WARN",  label: "WARN" },
  { value: "INFO",  label: "INFO" },
  { value: "DEBUG", label: "DEBUG" },
];
const SOURCE_OPTIONS = [
  { value: "",             label: "All sources" },
  { value: "web",          label: "web" },
  { value: "api",          label: "api" },
  { value: "worker",       label: "worker" },
  { value: "auth-service", label: "auth-service" },
  { value: "postgres",     label: "postgres" },
  { value: "stripe",       label: "stripe" },
  { value: "s3",           label: "s3" },
];
const ENVIRONMENT_OPTIONS = [
  { value: "Production",  label: "Production"  },
  { value: "Staging",     label: "Staging"     },
  { value: "Preview",     label: "Preview"     },
  { value: "Development", label: "Development" },
];
const TIMEFRAME_OPTIONS = [
  { value: "Last 15 minutes", label: "Last 15 minutes" },
  { value: "Last 30 minutes", label: "Last 30 minutes" },
  { value: "Last 1 hour",     label: "Last 1 hour"     },
  { value: "Last 6 hours",    label: "Last 6 hours"    },
  { value: "Last 24 hours",   label: "Last 24 hours"   },
  { value: "Last 7 days",     label: "Last 7 days"     },
];

/**
 * URL-driven filter row for /dev/logs. Every change navigates to a new
 * `?...` search-string so the page can re-fetch from the server with the
 * applied filters. Live tailing and Pause stream are local-only — they're
 * UI affordances for a future Realtime subscription (Phase 2) and don't
 * need to round-trip through the URL.
 */
export function LogsFilterBar({ filters }: { filters: LogsFilters }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Local mirror of the search box so typing is responsive; the URL update
  // is debounced to avoid a navigation per keystroke.
  const [q, setQ] = useState(filters.q);
  const [liveTailing, setLiveTailing] = useState(true);
  const [paused, setPaused] = useState(false);

  // Keep local mirror in sync if the URL changes from elsewhere
  // (e.g. clicking a saved view, "Clear filters", or back/forward).
  useEffect(() => {
    setQ(filters.q);
  }, [filters.q]);

  function navigate(next: Partial<LogsFilters>) {
    const merged = { ...filters, ...next, page: 1, selectedId: null };
    startTransition(() => {
      router.push(`/dev/logs${buildLogsSearch(merged)}`, { scroll: false });
    });
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({ q });
  }

  function reset() {
    setQ("");
    setLiveTailing(true);
    setPaused(false);
    startTransition(() => {
      router.push("/dev/logs", { scroll: false });
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
          placeholder="Search message, trace ID, route, user, service, or error code…"
          aria-label="Search logs"
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
        label="Level"
        value={filters.level}
        options={LEVEL_OPTIONS}
        onChange={(v) => navigate({ level: v as LogsFilters["level"] })}
      />
      <FilterSelect
        label="Source"
        value={filters.source}
        options={SOURCE_OPTIONS}
        onChange={(v) => navigate({ source: v })}
      />
      <FilterSelect
        label="Environment"
        value={filters.environment}
        options={ENVIRONMENT_OPTIONS}
        onChange={(v) => navigate({ environment: v as LogsFilters["environment"] })}
        statusDot
      />
      <FilterSelect
        label="Timeframe"
        value={filters.timeframe}
        options={TIMEFRAME_OPTIONS}
        onChange={(v) => navigate({ timeframe: v as LogsFilters["timeframe"] })}
      />

      {/* Live tailing toggle — local; Realtime hookup comes in Phase 2. */}
      <button
        type="button"
        role="switch"
        aria-checked={liveTailing}
        onClick={() => setLiveTailing((v) => !v)}
        className="inline-flex items-center gap-2.5 h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
      >
        <span className="text-[var(--dev-text-secondary)]">Live tailing</span>
        <span
          className={cn(
            "relative inline-block w-8 h-[18px] rounded-full transition-colors",
            liveTailing ? "bg-[var(--dev-success)]" : "bg-[var(--dev-surface-elev)]",
          )}
        >
          <span
            className={cn(
              "absolute top-[2px] size-3.5 rounded-full bg-white transition-transform",
              liveTailing ? "translate-x-[18px]" : "translate-x-[2px]",
            )}
          />
        </span>
      </button>

      {/* Clear filters — navigates to /dev/logs with no params. */}
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Clear filters
      </button>

      {/* Pause / resume stream — local affordance for Phase 2. */}
      <button
        type="button"
        onClick={() => setPaused((v) => !v)}
        aria-pressed={paused}
        className={cn(
          "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] text-[12.5px] font-semibold border transition-colors",
          paused
            ? "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white hover:bg-[var(--dev-accent-hover)]"
            : "bg-[var(--dev-surface-soft)] border-[var(--dev-accent-border)] text-[var(--dev-accent-text)] hover:bg-[var(--dev-accent-soft)]",
        )}
      >
        <Pause className="size-3.5" strokeWidth={2} />
        {paused ? "Resume stream" : "Pause stream"}
      </button>
    </section>
  );
}

/* ── Select component ────────────────────────────────────────────────── */

type Option = { value: string; label: string };

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
              key={o.value}
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

export { DEFAULT_LOGS_FILTERS };
