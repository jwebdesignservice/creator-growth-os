"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ClipboardCheck,
  CalendarDays,
  AlertTriangle,
  Clock,
  TrendingUp,
  Search,
  X,
  RefreshCw,
  Download,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/app-shell/avatar";
import type {
  AdminPlanRow,
  AdminPlanHealth,
  AdminPostingKpis,
  AdminReviewState,
} from "@/lib/admin/posting-queries";
import { PostingPlanDrawer } from "./posting-plan-drawer";

type FilterKey =
  | "all"
  | "needs_review"
  | "missing_content"
  | "inactive"
  | "this_week"
  | "on_track";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_review", label: "Needs review" },
  { key: "missing_content", label: "Missing posts" },
  { key: "inactive", label: "Inactive" },
  { key: "this_week", label: "This week" },
  { key: "on_track", label: "On track" },
];

export function PostingOverview({
  plans,
  kpis,
  ok,
}: {
  plans: AdminPlanRow[];
  kpis: AdminPostingKpis;
  ok: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const week = useMemo(() => currentWeekRange(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((p) => {
      if (q) {
        const hit =
          p.creatorName.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q);
        if (!hit) return false;
      }
      switch (filter) {
        case "needs_review":
          return p.health === "needs_review";
        case "missing_content":
          return p.health === "missing_content";
        case "inactive":
          return p.health === "inactive";
        case "on_track":
          return p.health === "on_track";
        case "this_week": {
          const t = new Date(`${p.weekStart}T00:00:00`).getTime();
          return t >= week.start && t <= week.end;
        }
        default:
          return true;
      }
    });
  }, [plans, filter, query, week]);

  const selected = selectedId
    ? plans.find((p) => p.id === selectedId) ?? null
    : null;

  // Reset to page 1 whenever the filtered set changes (filter/search/page size).
  const resetKey = `${filter}|${query.trim().toLowerCase()}|${pageSize}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  // Pagination math (clamped so a shrinking list never strands the page).
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);
  const startNum = total === 0 ? 0 : startIdx + 1;
  const endNum = Math.min(startIdx + pageSize, total);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="space-y-6 container-app">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">
            Content Planning Overview
          </h1>
          <p className="text-ink-500 text-[14px] max-w-2xl leading-relaxed">
            Monitor creator posting plans, review weekly progress, and follow up
            where creators need support.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilter("needs_review")}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium transition-colors"
          >
            <ClipboardCheck className="size-4" strokeWidth={2} />
            Review plans
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[12px] bg-white border border-ink-100 text-ink-700 text-[13px] font-medium hover:bg-cream-100 transition-colors"
            title="Reload the latest plan data"
          >
            <RefreshCw className="size-4" strokeWidth={2} />
            Refresh
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[12px] bg-white border border-ink-100 text-ink-400 text-[13px] font-medium cursor-not-allowed"
            title="Export coming soon"
          >
            {/* TODO(admin-posting): wire CSV export of the filtered overview. */}
            <Download className="size-4" strokeWidth={2} />
            Export
          </button>
        </div>
      </header>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        <Kpi
          icon={CalendarCheck}
          tone="emerald"
          label="Active plans"
          value={kpis.activePlans}
        />
        <Kpi
          icon={ClipboardCheck}
          tone="amber"
          label="Needing review"
          value={kpis.needingReview}
        />
        <Kpi
          icon={CalendarDays}
          tone="rose"
          label="Posts this week"
          value={kpis.postsThisWeek}
        />
        <Kpi
          icon={AlertTriangle}
          tone="rose"
          label="Missing content"
          value={kpis.creatorsMissingContent}
          sub="creators"
        />
        <Kpi
          icon={Clock}
          tone="ink"
          label="Inactive 7+ days"
          value={kpis.inactiveCreators}
          sub="creators"
        />
        <Kpi
          icon={TrendingUp}
          tone="emerald"
          label="Avg completion"
          value={`${kpis.avgCompletion}%`}
        />
      </section>

      {/* ── Filters + search ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center h-9 px-3.5 rounded-full text-[13px] font-medium border transition-colors cursor-pointer",
                  active
                    ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                    : "bg-white border-ink-100 text-ink-700 hover:bg-cream-100",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-ink-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creator or plan…"
            aria-label="Search by creator or plan title"
            className="w-full lg:w-[280px] h-10 pl-9 pr-8 rounded-[12px] bg-white border border-ink-100 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-6 inline-flex items-center justify-center rounded-full text-ink-400 hover:text-ink-700 hover:bg-cream-200 transition-colors"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── Operations table ───────────────────────────────────────────── */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-h4 text-ink-900">Creator plans</h2>
          <span className="text-[12px] text-ink-500 tabular-nums">
            {filtered.length} {filtered.length === 1 ? "plan" : "plans"}
          </span>
        </header>

        {!ok ? (
          <EmptyState
            title="Couldn't load posting data"
            body="Something went wrong fetching plans. Try refreshing the page."
          />
        ) : plans.length === 0 ? (
          <EmptyState
            title="No posting plans yet"
            body="When creators build their weekly posting plans, they'll appear here for oversight and review."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={emptyTitle(filter, query)}
            body={emptyBody(filter, query)}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[860px]">
                <thead>
                  <tr className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide bg-cream-50">
                    <th className="px-4 py-3">Creator</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Week</th>
                    <th className="px-4 py-3">Completion</th>
                    <th className="px-4 py-3">Last activity</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="px-4 py-3">Health</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {paged.map((p) => {
                    const inactive =
                      p.health === "inactive" || p.health === "draft_only";
                    return (
                      <tr
                        key={p.id}
                        className="text-[13px] text-ink-800 hover:bg-cream-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={p.creatorName}
                              src={p.creatorAvatar ?? undefined}
                              size={36}
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-ink-900 truncate max-w-[150px]">
                                {p.creatorName}
                              </div>
                              {p.creatorEmail && (
                                <div className="text-[11.5px] text-ink-400 truncate max-w-[150px]">
                                  {p.creatorEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink-900 truncate max-w-[200px]">
                            {p.title}
                          </div>
                          {p.category && (
                            <div className="text-[11.5px] text-ink-400 capitalize">
                              {p.category}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className="size-3.5 text-ink-400"
                              strokeWidth={2}
                            />
                            <span className="tabular-nums">
                              {formatWeek(p.weekStart)}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <CompletionBar percent={p.completion} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-ink-600 text-[12.5px]">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock
                              className="size-3.5 text-ink-400"
                              strokeWidth={2}
                            />
                            {formatRelative(p.lastActivity)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ReviewBadge state={p.reviewState} />
                        </td>
                        <td className="px-4 py-3">
                          <HealthBadge health={p.health} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedId(p.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-white border text-[12.5px] font-medium transition-colors",
                              inactive
                                ? "border-ink-200 text-ink-800 hover:bg-cream-100"
                                : "border-rose-200 text-rose-700 hover:bg-rose-50",
                            )}
                          >
                            {inactive ? (
                              <ExternalLink className="size-3.5" strokeWidth={2} />
                            ) : (
                              <Eye className="size-3.5" strokeWidth={2} />
                            )}
                            {inactive ? "Open plan" : "Review"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-ink-100">
              <span className="text-[12.5px] text-ink-500 tabular-nums order-2 sm:order-1">
                Showing {startNum} to {endNum} of {total}{" "}
                {total === 1 ? "plan" : "plans"}
              </span>

              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setPage((n) => Math.max(1, n - 1))}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                  className="size-8 rounded-[8px] inline-flex items-center justify-center border border-ink-200 text-ink-600 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                </button>
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === safePage ? "page" : undefined}
                    className={cn(
                      "min-w-8 h-8 px-2 rounded-[8px] text-[12.5px] font-medium transition-colors",
                      n === safePage
                        ? "bg-rose-600 text-white"
                        : "text-ink-600 hover:bg-cream-100",
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                  className="size-8 rounded-[8px] inline-flex items-center justify-center border border-ink-200 text-ink-600 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="size-4" strokeWidth={2} />
                </button>
              </div>

              <div className="flex items-center gap-2 order-3">
                <span className="text-[12.5px] text-ink-500 whitespace-nowrap">
                  Rows per page
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Rows per page"
                  className="h-8 pl-2.5 pr-7 rounded-[8px] bg-white border border-ink-200 text-[12.5px] text-ink-800 cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </>
        )}
      </section>

      <PostingPlanDrawer
        plan={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

/* ── KPI tile ─────────────────────────────────────────────────────────── */

const KPI_TONE: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-600",
  ink: "bg-ink-100 text-ink-600",
};

function Kpi({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  tone: keyof typeof KPI_TONE | string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <span
        className={cn(
          "size-9 rounded-[10px] inline-flex items-center justify-center",
          KPI_TONE[tone] ?? KPI_TONE.rose,
        )}
        aria-hidden
      >
        <Icon className="size-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <div className="text-h3 text-ink-900 tabular-nums leading-none">
          {value}
        </div>
        <div className="text-[11.5px] text-ink-500 font-medium mt-1.5 leading-snug">
          {label}
          {sub && <span className="text-ink-400"> · {sub}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Badges + bars ────────────────────────────────────────────────────── */

const HEALTH_META: Record<
  AdminPlanHealth,
  { label: string; cls: string }
> = {
  on_track: { label: "On track", cls: "bg-emerald-100 text-emerald-700" },
  needs_review: { label: "Needs review", cls: "bg-amber-100 text-amber-700" },
  missing_content: { label: "Missing content", cls: "bg-rose-100 text-rose-700" },
  inactive: { label: "Inactive", cls: "bg-ink-100 text-ink-600" },
  draft_only: { label: "Draft only", cls: "bg-ink-100 text-ink-500" },
};

function HealthBadge({ health }: { health: AdminPlanHealth }) {
  const m = HEALTH_META[health];
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

const REVIEW_META: Record<
  AdminReviewState,
  { label: string; cls: string }
> = {
  not_reviewed: { label: "Not reviewed", cls: "bg-ink-100 text-ink-500" },
  reviewed: { label: "Reviewed", cls: "bg-emerald-100 text-emerald-700" },
  needs_changes: { label: "Needs changes", cls: "bg-amber-100 text-amber-700" },
};

function ReviewBadge({ state }: { state: AdminReviewState }) {
  const m = REVIEW_META[state];
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-medium whitespace-nowrap",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

function CompletionBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            percent >= 80
              ? "bg-emerald-500"
              : percent >= 40
                ? "bg-rose-500"
                : "bg-amber-500",
          )}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className="text-[12px] text-ink-600 tabular-nums w-9 text-right">
        {percent}%
      </span>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-6 py-14 flex flex-col items-center text-center">
      <span className="size-12 rounded-full bg-cream-200 inline-flex items-center justify-center mb-3">
        <Inbox className="size-5 text-ink-400" strokeWidth={1.7} />
      </span>
      <div className="text-[14px] font-semibold text-ink-800">{title}</div>
      <p className="text-[13px] text-ink-500 mt-1 max-w-sm leading-snug">
        {body}
      </p>
    </div>
  );
}

function emptyTitle(filter: FilterKey, query: string): string {
  if (query.trim()) return "No matches";
  switch (filter) {
    case "needs_review":
      return "Nothing to review";
    case "missing_content":
      return "All caught up on content";
    case "inactive":
      return "Everyone's active";
    case "this_week":
      return "No plans this week";
    case "on_track":
      return "No plans fully on track yet";
    default:
      return "No plans";
  }
}

function emptyBody(filter: FilterKey, query: string): string {
  if (query.trim())
    return `No creators or plans match “${query.trim()}”. Try a different search.`;
  switch (filter) {
    case "needs_review":
      return "No plans need a review pass right now. You're all caught up.";
    case "missing_content":
      return "Every active creator has enough content scheduled this week.";
    case "inactive":
      return "No creators have gone quiet for 7+ days.";
    case "this_week":
      return "No posting plans are scheduled for the current calendar week.";
    case "on_track":
      return "No plans are fully on track yet — check the other filters to follow up.";
    default:
      return "There are no posting plans to show.";
  }
}

/* ── Formatting helpers ───────────────────────────────────────────────── */

function formatWeek(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return weekStart;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const ms = Math.max(0, Date.now() - then);
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const mo = Math.floor(days / 30);
  return mo === 1 ? "1 month ago" : `${mo} months ago`;
}

function currentWeekRange(): { start: number; end: number } {
  const now = new Date();
  const day = now.getDay();
  const sinceMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - sinceMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.getTime(), end: sunday.getTime() };
}
