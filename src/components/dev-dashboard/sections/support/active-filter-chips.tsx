"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { X } from "lucide-react";
import {
  DEFAULT_SUPPORT_FILTERS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TIMEFRAME_OPTIONS,
  buildSupportSearch,
  parseSupportFilters,
  type SupportFilterState,
} from "@/lib/dev-dashboard/support-filters";

type AssignableUser = { id: string; label: string };

type Props = {
  /** Used to label the assignee chip with the user's full name. */
  assignableUsers: AssignableUser[];
};

/**
 * Compact summary of the currently-applied filters, rendered above the queue
 * table. Each chip has an ✕ that clears just that one filter; URL state is
 * the source of truth so chips re-derive themselves when other controls
 * push updates.
 */
export function ActiveFilterChips({ assignableUsers }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const filters = useMemo(
    () => parseSupportFilters(Object.fromEntries(sp.entries())),
    [sp],
  );

  function clear(patch: Partial<SupportFilterState>) {
    const next = { ...filters, ...patch, page: 1 };
    const params = buildSupportSearch(next);
    const search = params.toString();
    startTransition(() => {
      router.replace(search ? `?${search}` : "/dev/support", { scroll: false });
    });
  }

  const chips: { key: string; label: string; onClear: () => void }[] = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `Search: "${filters.q}"`,
      onClear: () => clear({ q: "" }),
    });
  }
  if (filters.priority !== DEFAULT_SUPPORT_FILTERS.priority) {
    const opt = PRIORITY_OPTIONS.find((o) => o.value === filters.priority);
    chips.push({
      key: "priority",
      label: `Priority: ${opt?.label ?? filters.priority}`,
      onClear: () => clear({ priority: "all" }),
    });
  }
  if (filters.status !== DEFAULT_SUPPORT_FILTERS.status) {
    const opt = STATUS_OPTIONS.find((o) => o.value === filters.status);
    chips.push({
      key: "status",
      label: `Status: ${opt?.label ?? filters.status}`,
      onClear: () => clear({ status: "all" }),
    });
  }
  if (filters.category !== DEFAULT_SUPPORT_FILTERS.category) {
    chips.push({
      key: "category",
      label: `Category: ${filters.category}`,
      onClear: () => clear({ category: "all" }),
    });
  }
  if (filters.assignee !== DEFAULT_SUPPORT_FILTERS.assignee) {
    const label =
      filters.assignee === "unassigned"
        ? "Unassigned"
        : assignableUsers.find((u) => u.id === filters.assignee)?.label ?? "—";
    chips.push({
      key: "assignee",
      label: `Assignee: ${label}`,
      onClear: () => clear({ assignee: "all" }),
    });
  }
  if (filters.timeframeDays !== DEFAULT_SUPPORT_FILTERS.timeframeDays) {
    const opt = TIMEFRAME_OPTIONS.find((o) => o.value === filters.timeframeDays);
    chips.push({
      key: "timeframe",
      label: opt?.label ?? `Last ${filters.timeframeDays}d`,
      onClear: () => clear({ timeframeDays: DEFAULT_SUPPORT_FILTERS.timeframeDays }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mr-1">
        Active filters
      </span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onClear}
          aria-label={`Clear ${c.label}`}
          className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border border-[var(--dev-accent-border)] text-[11.5px] font-medium hover:bg-[var(--dev-accent-soft)]/70 transition-colors"
        >
          <span className="truncate max-w-[180px]">{c.label}</span>
          <span className="inline-flex items-center justify-center size-4 rounded-full bg-[var(--dev-accent)]/15">
            <X className="size-2.5" strokeWidth={2.5} />
          </span>
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => clear({ ...DEFAULT_SUPPORT_FILTERS, ticket: filters.ticket })}
          className="ml-1 text-[11.5px] font-medium text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] underline-offset-2 hover:underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
