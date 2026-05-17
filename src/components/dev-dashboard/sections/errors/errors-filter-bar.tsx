"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import {
  DEFAULT_ERRORS_FILTERS,
  ENVIRONMENT_OPTIONS,
  SEVERITY_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  TIMEFRAME_OPTIONS,
  buildErrorsSearch,
  parseErrorsFilters,
  type ErrorsFilterState,
} from "@/lib/dev-dashboard/errors-filters";

/**
 * Filter / search / grouping controls for /dev/errors.
 *
 * Source of truth: the URL search params (parsed via parseErrorsFilters).
 * Every change rebuilds the params and calls router.replace(), which
 * triggers a server re-render of the page component with the new filters.
 */
export function ErrorsFilterBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  // Re-derive on every render so external URL changes (e.g. a sibling
  // pagination control) flow back into the inputs without manual syncing.
  const filters = useMemo(
    () => parseErrorsFilters(Object.fromEntries(sp.entries())),
    [sp],
  );

  function update(patch: Partial<ErrorsFilterState>) {
    // Any filter change resets to page 1; pagination is also a URL param.
    const next: Partial<ErrorsFilterState> = { ...filters, ...patch, page: 1 };
    const params = buildErrorsSearch(next);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  function reset() {
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  }

  return (
    <section className="dev-card p-3 flex flex-wrap items-end gap-3">
      <SearchInput value={filters.q} onChange={(q) => update({ q })} />

      <FilterSelect
        label="Severity"
        value={filters.severity}
        options={SEVERITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(v) => update({ severity: v as ErrorsFilterState["severity"] })}
      />
      <FilterSelect
        label="Source"
        value={filters.source}
        options={SOURCE_OPTIONS}
        onChange={(v) => update({ source: v })}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(v) => update({ status: v as ErrorsFilterState["status"] })}
      />
      <FilterSelect
        label="Environment"
        value={filters.environment}
        options={ENVIRONMENT_OPTIONS}
        onChange={(v) => update({ environment: v })}
      />
      <FilterSelect
        label="Timeframe"
        value={String(filters.timeframeHours)}
        options={TIMEFRAME_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
        onChange={(v) =>
          update({ timeframeHours: Number(v) as ErrorsFilterState["timeframeHours"] })
        }
      />

      <button
        type="button"
        role="switch"
        aria-checked={filters.groupedByFingerprint}
        onClick={() => update({ groupedByFingerprint: !filters.groupedByFingerprint })}
        className="inline-flex items-center gap-2.5 h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
      >
        <span
          className={
            "relative inline-block w-8 h-[18px] rounded-full transition-colors " +
            (filters.groupedByFingerprint ? "bg-[var(--dev-accent)]" : "bg-[var(--dev-surface-elev)]")
          }
        >
          <span
            className={
              "absolute top-[2px] size-3.5 rounded-full bg-white transition-transform " +
              (filters.groupedByFingerprint ? "translate-x-[18px]" : "translate-x-[2px]")
            }
          />
        </span>
        Grouped by fingerprint
      </button>

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Reset filters
      </button>
    </section>
  );
}

/* ── Search input with debounce ──────────────────────────────────────────── */

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  // Track the prop value we've already mirrored locally. When `value`
  // shifts under us (e.g. reset filters), re-derive `local` during render
  // rather than via an effect — recommended pattern in the React docs.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }
  const timer = useRef<number | null>(null);

  function onInput(v: string) {
    setLocal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      onChange(v);
    }, 250);
  }

  return (
    <div className="relative flex-1 min-w-[240px]">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
        strokeWidth={1.9}
      />
      <input
        type="search"
        value={local}
        onChange={(e) => onInput(e.target.value)}
        placeholder="Search errors by message, code, route, user, or fingerprint…"
        className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
      />
    </div>
  );
}

/* ── Native select styled like the design ────────────────────────────────── */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="appearance-none w-full h-10 pl-3 pr-9 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[var(--dev-surface)] text-[var(--dev-text-primary)]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
      </div>
    </div>
  );
}

// Re-export the default for callers that want to render a non-interactive
// preview (none currently, but keeps the export stable for future use).
export { DEFAULT_ERRORS_FILTERS };
