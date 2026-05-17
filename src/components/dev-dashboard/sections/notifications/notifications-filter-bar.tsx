"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, RotateCcw, Loader2, Check } from "lucide-react";
import { markAllDevNotificationsRead } from "@/lib/dev-dashboard/dev-notifications-actions";
import type { DevNotificationFilters } from "@/lib/dev-dashboard/dev-notifications-queries";
import { cn } from "@/lib/cn";

const CATEGORY_OPTIONS = [
  { value: "",         label: "All categories" },
  { value: "incident", label: "Incident"       },
  { value: "deploy",   label: "Deploy"         },
  { value: "security", label: "Security"       },
  { value: "billing",  label: "Billing"        },
  { value: "system",   label: "System"         },
  { value: "audit",    label: "Audit"          },
];

const SEVERITY_OPTIONS = [
  { value: "",         label: "All severities" },
  { value: "critical", label: "Critical"       },
  { value: "high",     label: "High"           },
  { value: "medium",   label: "Medium"         },
  { value: "low",      label: "Low"            },
  { value: "info",     label: "Info"           },
];

const STATUS_OPTIONS = [
  { value: "all",      label: "All (active)" },
  { value: "unread",   label: "Unread"       },
  { value: "read",     label: "Read"         },
  { value: "archived", label: "Archived"     },
];

/**
 * URL-driven filter row for /dev/notifications.
 * Mirrors the /dev/logs pattern: every dropdown navigates to a new
 * search-string so the server re-fetches the matching set.
 */
export function NotificationsFilterBar({
  filters,
  unreadCount,
}: {
  filters: DevNotificationFilters;
  unreadCount: number;
}) {
  const router = useRouter();
  const [, startNav] = useTransition();
  const [isPending, startMarkAll] = useTransition();
  const [q, setQ] = useState(filters.q);

  useEffect(() => { setQ(filters.q); }, [filters.q]);

  function buildHref(next: Partial<DevNotificationFilters>): string {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.q)        sp.set("q",        merged.q);
    if (merged.category) sp.set("category", merged.category);
    if (merged.severity) sp.set("severity", merged.severity);
    if (merged.status && merged.status !== "all") sp.set("status", merged.status);
    const s = sp.toString();
    return `/dev/notifications${s ? `?${s}` : ""}`;
  }

  function navigate(next: Partial<DevNotificationFilters>) {
    startNav(() => router.push(buildHref(next), { scroll: false }));
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({ q });
  }

  function reset() {
    setQ("");
    startNav(() => router.push("/dev/notifications", { scroll: false }));
  }

  function markAllRead() {
    startMarkAll(async () => {
      const res = await markAllDevNotificationsRead();
      if (!res.ok) console.error("[dev-notifications] mark all read:", res.error);
      // revalidatePath in the action triggers a refresh; force the route
      // tree to re-fetch in case the user stays on the same URL.
      router.refresh();
    });
  }

  return (
    <section className="dev-card p-3 flex flex-wrap items-end gap-3">
      {/* Search */}
      <form onSubmit={onSearchSubmit} className="relative flex-1 min-w-[240px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[15px] text-[var(--dev-text-muted)]"
          strokeWidth={1.9}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, body, or source…"
          aria-label="Search notifications"
          className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
        />
      </form>

      <FilterSelect
        label="Category"
        value={filters.category}
        options={CATEGORY_OPTIONS}
        onChange={(v) => navigate({ category: v as DevNotificationFilters["category"] })}
      />
      <FilterSelect
        label="Severity"
        value={filters.severity}
        options={SEVERITY_OPTIONS}
        onChange={(v) => navigate({ severity: v as DevNotificationFilters["severity"] })}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => navigate({ status: v as DevNotificationFilters["status"] })}
      />

      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Clear filters
      </button>

      <button
        type="button"
        onClick={markAllRead}
        disabled={isPending || unreadCount === 0}
        className={cn(
          "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] text-[12.5px] font-semibold border transition-colors",
          unreadCount === 0
            ? "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-faint)] cursor-not-allowed"
            : "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white hover:bg-[var(--dev-accent-hover)] disabled:opacity-70",
        )}
      >
        {isPending
          ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          : <Check className="size-3.5" strokeWidth={2} />}
        Mark all read
        {unreadCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/20 text-[10.5px] font-semibold tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>
    </section>
  );
}

/* ─── Select component ─────────────────────────────────────────────── */

type Option = { value: string; label: string };

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
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
          className="appearance-none w-full h-10 pl-3 pr-9 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer"
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
