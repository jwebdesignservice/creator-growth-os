"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { Search, ChevronDown } from "lucide-react";
import {
  buildQaSearch,
  parseQaFilters,
  QA_ENVIRONMENT_OPTIONS,
  QA_OWNER_OPTIONS,
  QA_STATUS_OPTIONS,
  QA_VIEW_OPTIONS,
  type QaFilterState,
} from "@/lib/dev-dashboard/qa-filters";
import { CreateQaRunButton } from "./create-qa-run-button";
import { ExportChecklistButton } from "./export-checklist-button";

type Props = {
  /** Release options sourced from the DB (or a single-item fallback). */
  releaseOptions: { value: string; label: string }[];
};

/**
 * QA filter / control row.
 *
 * Source of truth: the URL search params. Every change rebuilds the params
 * and calls router.replace(); the page server component re-renders with the
 * new filters applied to every query.
 */
export function QaFilterBar({ releaseOptions }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const filters = useMemo(
    () => parseQaFilters(Object.fromEntries(sp.entries())),
    [sp],
  );

  function update(patch: Partial<QaFilterState>) {
    const next: Partial<QaFilterState> = { ...filters, ...patch };
    const params = buildQaSearch(next);
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <section className="dev-card p-3 flex flex-wrap items-end gap-3">
      <SearchInput value={filters.q} onChange={(q) => update({ q })} />

      <FilterSelect
        label="Release"
        value={filters.release}
        options={releaseOptions}
        onChange={(v) => update({ release: v, expanded: [] })}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={QA_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(v) => update({ status: v as QaFilterState["status"] })}
      />
      <FilterSelect
        label="Owner"
        value={filters.owner}
        options={QA_OWNER_OPTIONS}
        onChange={(v) => update({ owner: v })}
      />
      <FilterSelect
        label="Environment"
        value={filters.environment}
        options={QA_ENVIRONMENT_OPTIONS}
        onChange={(v) => update({ environment: v })}
      />
      <FilterSelect
        label="View"
        value={filters.view}
        options={QA_VIEW_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(v) => update({ view: v as QaFilterState["view"] })}
      />

      <div className="flex items-end gap-2 ml-auto">
        <CreateQaRunButton release={filters.release} />
        <ExportChecklistButton release={filters.release} />
      </div>
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
  // "Adjust state during render" — keep local mirrored when the URL value
  // shifts externally (e.g. after a router.refresh).
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setLocal(value);
  }
  const timer = useRef<number | null>(null);

  function onInput(v: string) {
    setLocal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v), 250);
  }

  return (
    <div className="relative flex-1 min-w-[240px]">
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
        strokeWidth={1.9}
        aria-hidden
      />
      <input
        type="search"
        aria-label="Search checklist"
        value={local}
        onChange={(e) => onInput(e.target.value)}
        placeholder="Search checklist items, owners, areas..."
        className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
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
