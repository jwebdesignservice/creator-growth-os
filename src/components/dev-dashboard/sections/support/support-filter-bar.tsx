"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TIMEFRAME_OPTIONS,
  buildSupportSearch,
  parseSupportFilters,
  type SupportFilterState,
} from "@/lib/dev-dashboard/support-filters";
import type { SupportFilterOptions } from "@/lib/dev-dashboard/support-queries";

type Props = {
  options: SupportFilterOptions;
};

/**
 * Support filter / control row. URL is the source of truth — the search
 * input debounces to 250ms before pushing the URL update. The page
 * re-parses searchParams and re-fetches with the new filters.
 */
export function SupportFilterBar({ options }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const filters = useMemo(
    () => parseSupportFilters(Object.fromEntries(sp.entries())),
    [sp],
  );

  function update(patch: Partial<SupportFilterState>) {
    const next: Partial<SupportFilterState> = { ...filters, ...patch, page: 1 };
    const params = buildSupportSearch(next);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  function reset() {
    startTransition(() => router.replace("?", { scroll: false }));
  }

  const categoryOptions = [
    { value: "all", label: "All" },
    ...options.categories.map((c) => ({ value: c, label: c })),
  ];
  const assigneeOptions = [
    { value: "all", label: "All" },
    { value: "unassigned", label: "Unassigned" },
    ...options.assignees.map((a) => ({ value: a.id, label: a.label })),
  ];

  return (
    <section className="dev-card p-3 flex flex-wrap items-end gap-x-4 gap-y-3">
      {/* Primary: search (taller, elevated surface, takes the most width) */}
      <SearchInput value={filters.q} onChange={(q) => update({ q })} />

      {/* Secondary cluster: filters grouped tighter so they read as one unit
          distinct from the primary search and the trailing reset action. */}
      <div className="flex flex-wrap items-end gap-2 flex-1 min-w-[280px]">
        <FilterSelect
          label="Priority"
          value={filters.priority}
          options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => update({ priority: v as SupportFilterState["priority"] })}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => update({ status: v as SupportFilterState["status"] })}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          options={categoryOptions}
          onChange={(v) => update({ category: v })}
        />
        <FilterSelect
          label="Assignee"
          value={filters.assignee}
          options={assigneeOptions}
          onChange={(v) => update({ assignee: v })}
        />
        <FilterSelect
          label="Timeframe"
          value={String(filters.timeframeDays)}
          options={TIMEFRAME_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
          onChange={(v) =>
            update({ timeframeDays: Number(v) as SupportFilterState["timeframeDays"] })
          }
        />
      </div>

      {/* Utility: reset sits to the trailing edge as a subtle ghost action */}
      <button
        type="button"
        onClick={reset}
        aria-label="Reset filters"
        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] border border-transparent text-[12.5px] font-medium text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] hover:border-[var(--dev-border)] transition-colors self-end"
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Reset
      </button>
    </section>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setLocal(value);
  }
  const timer = useRef<number | null>(null);

  function onInput(v: string) {
    setLocal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v), 250);
  }

  return (
    <div className="relative flex-[2] min-w-[260px] max-w-[440px] self-end">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--dev-text-secondary)]"
        strokeWidth={1.9}
        aria-hidden
      />
      <input
        type="search"
        value={local}
        onChange={(e) => onInput(e.target.value)}
        aria-label="Search tickets"
        placeholder="Search ticket ID, client, or issue..."
        className="w-full h-11 pl-10 pr-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13.5px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
      />
    </div>
  );
}

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
    <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
      <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="appearance-none w-full h-10 pl-3 pr-8 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[12.5px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[var(--dev-surface)] text-[var(--dev-text-primary)]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
      </div>
    </div>
  );
}
