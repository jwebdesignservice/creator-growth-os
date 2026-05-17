import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { USERS_FILTERS_DEFAULTS } from "@/lib/dev-dashboard/mock-data";

export function UsersFilterBar() {
  const f = USERS_FILTERS_DEFAULTS;
  return (
    <section className="flex flex-wrap items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-[420px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
          strokeWidth={1.9}
          aria-hidden
        />
        <input
          type="search"
          aria-label="Search users"
          placeholder="Search users by name, email, ID, handle, or plan…"
          className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
        />
      </div>

      <FilterSelect value={f.plan} />
      <FilterSelect value={f.status} />
      <FilterSelect value={f.category} />
      <FilterSelect value={f.region} />
      <FilterSelect value={f.timeframe} />

      <FlaggedOnlyToggle enabled={f.flaggedOnly} />

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
      className="inline-flex items-center justify-between gap-2 min-w-[140px] h-10 px-3 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] transition-colors"
    >
      <span className="text-[13px] text-[var(--dev-text-primary)] font-medium truncate">
        {value}
      </span>
      <ChevronDown className="size-3.5 text-[var(--dev-text-muted)] shrink-0" strokeWidth={2} />
    </button>
  );
}

function FlaggedOnlyToggle({ enabled }: { enabled: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
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
      Show only flagged users
    </button>
  );
}
