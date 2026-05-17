"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import {
  buildAuthSearch,
  parseAuthFilters,
  ENVIRONMENT_OPTIONS,
  PROVIDER_OPTIONS,
  STATUS_OPTIONS,
  TIMEFRAME_OPTIONS,
  type AuthFilterState,
} from "@/lib/dev-dashboard/auth-filters";

/**
 * Filter / search controls for /dev/auth.
 *
 * Source of truth: the URL search params. Every change rebuilds the params
 * and calls router.replace(), which re-runs the server page with the new
 * filters and re-fetches all the cards/table in parallel.
 */
export function AuthFilterBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const filters = useMemo(
    () => parseAuthFilters(Object.fromEntries(sp.entries())),
    [sp],
  );

  function update(patch: Partial<AuthFilterState>) {
    const next: Partial<AuthFilterState> = { ...filters, ...patch, page: 1 };
    const params = buildAuthSearch(next);
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
    <section className="flex flex-wrap items-end gap-2.5">
      <SearchInput value={filters.q} onChange={(q) => update({ q })} />

      <FilterSelect
        label="Provider"
        value={filters.provider}
        options={PROVIDER_OPTIONS}
        onChange={(v) => update({ provider: v as AuthFilterState["provider"] })}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => update({ status: v as AuthFilterState["status"] })}
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
          update({ timeframeHours: Number(v) as AuthFilterState["timeframeHours"] })
        }
      />

      <SuspiciousOnlyToggle
        enabled={filters.suspiciousOnly}
        onToggle={() => update({ suspiciousOnly: !filters.suspiciousOnly })}
      />

      <button
        type="button"
        onClick={reset}
        className="ml-auto inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Reset filters
      </button>
    </section>
  );
}

/* ── Search input (debounced) ────────────────────────────────────────────── */

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Local mirror of the URL value so the input stays responsive while the
  // debounced URL update is in flight. When the URL changes externally
  // (e.g. Reset filters), re-sync during render — React's recommended pattern
  // for "storing information from previous renders".
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setLocal(value);
    setPrevValue(value);
  }

  const timer = useRef<number | null>(null);

  function onInput(v: string) {
    setLocal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v), 250);
  }

  return (
    <div className="relative flex-1 min-w-[220px] max-w-[440px]">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
        strokeWidth={1.9}
        aria-hidden
      />
      <input
        type="search"
        aria-label="Search auth events"
        value={local}
        onChange={(e) => onInput(e.target.value)}
        placeholder="Search users, emails, sessions, events, or providers…"
        className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
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
    <div className="flex flex-col gap-1 min-w-[150px]">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="appearance-none w-full h-10 pl-3 pr-9 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer"
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

/* ── Suspicious-only toggle ──────────────────────────────────────────────── */

function SuspiciousOnlyToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="inline-flex items-center gap-2.5 h-10 px-3 rounded-[10px] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
    >
      <span
        className={
          "relative inline-block w-8 h-[18px] rounded-full transition-colors " +
          (enabled ? "bg-[var(--dev-accent)]" : "bg-[var(--dev-surface-elev)]")
        }
      >
        <span
          className={
            "absolute top-[2px] size-3.5 rounded-full bg-white transition-transform " +
            (enabled ? "translate-x-[18px]" : "translate-x-[2px]")
          }
        />
      </span>
      Show only suspicious activity
    </button>
  );
}
