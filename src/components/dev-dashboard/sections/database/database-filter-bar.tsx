import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { DATABASE_FILTERS_DEFAULTS } from "@/lib/dev-dashboard/mock-data";

/**
 * Static filter row for /dev/database — mirrors the visual pattern of the
 * Users / Auth filter bars but is intentionally non-interactive for now
 * (mock-only phase). When the backend is wired, swap the buttons for
 * controlled `<select>` elements like the other live filter bars.
 */
export function DatabaseFilterBar() {
  const f = DATABASE_FILTERS_DEFAULTS;
  return (
    <section className="flex flex-wrap items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px] max-w-[420px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
          strokeWidth={1.9}
          aria-hidden
        />
        <input
          type="search"
          aria-label="Search tables, queries, functions, policies"
          placeholder="Search tables, queries, functions, policies…"
          className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
        />
      </div>

      <FilterSelect value={f.table} />
      <FilterSelect value={f.queryType} />
      <FilterSelect value={f.status} />
      <FilterSelect value={f.environment} />
      <FilterSelect value={f.timeframe} />

      <button
        type="button"
        className="ml-auto inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Reset filters
      </button>
    </section>
  );
}

function FilterSelect({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-between gap-2 min-w-[150px] h-10 px-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] transition-colors"
    >
      <span className="text-[13px] text-[var(--dev-text-primary)] font-medium truncate">
        {value}
      </span>
      <ChevronDown className="size-3.5 text-[var(--dev-text-muted)] shrink-0" strokeWidth={2} />
    </button>
  );
}
