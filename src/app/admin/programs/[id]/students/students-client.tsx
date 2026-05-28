"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  Users,
  Activity,
  Trophy,
  TriangleAlert,
  UserPlus,
  Upload,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  BarChart3,
  CheckCircle2,
  Eye,
  Trash2,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { MultiDonut } from "@/components/dashboard/donut";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Program → Students surface.

   Fully interactive frontend: a deterministic 326-member dataset (the first
   6 rows match the design mockup exactly) drives the table search / filter /
   sort / pagination, the four headline metric cards, and the right-rail
   distribution + completion + quick-action cards. Everything is derived from
   the same dataset so the numbers stay internally consistent.

   No backend yet — swap `ALL_MEMBERS` for a server query + pass counts as
   props when a real enrollment table lands.
   ───────────────────────────────────────────────────────────────────────── */

type Plan = "Free" | "Basic" | "Pro" | "Diamond";
type MemberStatus =
  | "on-track"
  | "needs-attention"
  | "completed"
  | "inactive"
  | "at-risk";

type Member = {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  progress: number; // 0–100
  currentLesson: string;
  tasksCompleted: number;
  tasksTotal: number;
  lastActiveDays: number; // 0 = today
  status: MemberStatus;
};

const PAGE_SIZE = 6;

/* ── Display config ─────────────────────────────────────────────────── */

const STATUS_META: Record<MemberStatus, { label: string; pill: string }> = {
  "on-track":        { label: "On track",        pill: "bg-emerald-100 text-emerald-700" },
  "needs-attention": { label: "Needs attention", pill: "bg-amber-100   text-amber-700"   },
  "completed":       { label: "Completed",        pill: "bg-violet-100  text-violet-700"  },
  "inactive":        { label: "Inactive",         pill: "bg-ink-100     text-ink-500"     },
  "at-risk":         { label: "At risk",          pill: "bg-rose-100    text-rose-700"    },
};

const PLAN_BAR: Record<Plan, string> = {
  Free:    "bg-ink-300",
  Basic:   "bg-amber-400",
  Pro:     "bg-rose-500",
  Diamond: "bg-indigo-400",
};

/* Completion-overview donut palette. */
const SLICE_COMPLETED   = "#8b7fd1"; // violet
const SLICE_IN_PROGRESS = "#e0698a"; // rose
const SLICE_NOT_STARTED = "#d9d2c7"; // cream/ink

/* ── Filter / sort option config ────────────────────────────────────── */

type StatusTab = "all" | "active" | "at-risk" | "completed";
const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "active",    label: "Active"    },
  { key: "at-risk",   label: "At risk"   },
  { key: "completed", label: "Completed" },
];

type PlanFilter = "all" | Plan;
const PLAN_FILTERS: { key: PlanFilter; label: string }[] = [
  { key: "all",     label: "All plans" },
  { key: "Free",    label: "Free"      },
  { key: "Basic",   label: "Basic"     },
  { key: "Pro",     label: "Pro"       },
  { key: "Diamond", label: "Diamond"   },
];

type SortKey =
  | "last-active"
  | "name-asc"
  | "progress-desc"
  | "progress-asc"
  | "tasks-desc";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "last-active",   label: "Last active"        },
  { key: "name-asc",      label: "Name (A–Z)"         },
  { key: "progress-desc", label: "Progress (high)"    },
  { key: "progress-asc",  label: "Progress (low)"     },
  { key: "tasks-desc",    label: "Tasks completed"    },
];

/* ─────────────────────────────────────────────────────────────────────────
   Root
   ───────────────────────────────────────────────────────────────────────── */

export function StudentsClient() {
  const members = ALL_MEMBERS;

  const [query, setQuery]         = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [planFilter, setPlan]     = useState<PlanFilter>("all");
  const [sortKey, setSortKey]     = useState<SortKey>("last-active");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("asc");
  const [page, setPage]           = useState(1);
  const [toast, setToast]         = useState<string | null>(null);

  /* Any filter change resets to page 1 — done in the setters (no effect) to
     avoid a setState-in-effect cascade. */
  function applyQuery(v: string)        { setQuery(v); setPage(1); }
  function applyStatusTab(v: StatusTab) { setStatusTab(v); setPage(1); }
  function applyPlan(v: PlanFilter)     { setPlan(v); setPage(1); }
  function applySort(v: SortKey)        { setSortKey(v); setPage(1); }

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ── Headline metrics (derived) ───────────────────────────────────── */
  const metrics = useMemo(() => {
    const enrolled  = members.length;
    const active    = members.filter((m) => m.lastActiveDays <= 7).length;
    const completed = members.filter((m) => m.status === "completed").length;
    const atRisk    = members.filter((m) => m.status === "at-risk").length;
    return { enrolled, active, completed, atRisk };
  }, [members]);

  /* ── Plan distribution (derived) ──────────────────────────────────── */
  const planDist = useMemo(() => {
    const order: Plan[] = ["Free", "Basic", "Pro", "Diamond"];
    return order.map((plan) => {
      const count = members.filter((m) => m.plan === plan).length;
      return { plan, count, percent: Math.round((count / members.length) * 100) };
    });
  }, [members]);

  /* ── Completion overview (derived) ────────────────────────────────── */
  const completion = useMemo(() => {
    const completed  = members.filter((m) => m.status === "completed").length;
    const notStarted = members.filter((m) => m.status === "inactive").length;
    const inProgress = members.length - completed - notStarted;
    const pct = (n: number) => Math.round((n / members.length) * 100);
    return {
      completed,
      inProgress,
      notStarted,
      total: members.length,
      pctCompleted:  pct(completed),
      pctInProgress: pct(inProgress),
      pctNotStarted: pct(notStarted),
    };
  }, [members]);

  /* ── Filter → sort pipeline ───────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = members.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) {
        return false;
      }
      if (planFilter !== "all" && m.plan !== planFilter) return false;
      if (statusTab === "active"    && m.lastActiveDays > 7)        return false;
      if (statusTab === "at-risk"   && m.status !== "at-risk")      return false;
      if (statusTab === "completed" && m.status !== "completed")    return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    list = list.slice().sort((a, b) => {
      switch (sortKey) {
        case "name-asc":      return a.name.localeCompare(b.name) * dir;
        case "progress-desc": return (b.progress - a.progress) * dir;
        case "progress-asc":  return (a.progress - b.progress) * dir;
        case "tasks-desc":    return (b.tasksCompleted - a.tasksCompleted) * dir;
        case "last-active":
        default:              return (a.lastActiveDays - b.lastActiveDays) * dir;
      }
    });
    return list;
  }, [members, query, planFilter, statusTab, sortKey, sortDir]);

  /* ── Pagination ───────────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = start + pageRows.length;

  /* ── Export current view as CSV ────────────────────────────────────── */
  function exportCsv() {
    const cols = ["Name", "Email", "Plan", "Progress", "Current lesson", "Tasks", "Last active", "Status"];
    const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const rows = filtered.map((m) =>
      [
        m.name,
        m.email,
        m.plan,
        `${m.progress}%`,
        m.currentLesson,
        `${m.tasksCompleted}/${m.tasksTotal}`,
        lastActiveLabel(m.lastActiveDays),
        STATUS_META[m.status].label,
      ].map(escape).join(","),
    );
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `program-students-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast(`Exported ${filtered.length} members`);
  }

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] sm:text-[32px] text-ink-900 leading-tight">
            Students
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-500 leading-relaxed max-w-xl">
            Manage members enrolled in this program, monitor progress, and
            identify who needs attention.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setToast("Invite flow coming soon")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors shadow-sm"
          >
            <UserPlus className="size-4" strokeWidth={2} aria-hidden />
            Invite members
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13.5px] font-medium hover:bg-cream-100 transition-colors"
          >
            <Upload className="size-4 text-ink-500" strokeWidth={2} aria-hidden />
            Export
          </button>
          <HeaderMoreMenu onAction={(msg) => setToast(msg)} onExport={exportCsv} />
        </div>
      </header>

      {/* ── Metric cards ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Enrolled members"
          value={metrics.enrolled}
          delta="12%"
          deltaDir="up"
          deltaGood
          baseline="vs last 30 days"
        />
        <MetricCard
          icon={Activity}
          label="Active this week"
          value={metrics.active}
          delta="8%"
          deltaDir="up"
          deltaGood
          baseline="vs last 7 days"
        />
        <MetricCard
          icon={Trophy}
          label="Completed program"
          value={metrics.completed}
          delta="15%"
          deltaDir="up"
          deltaGood
          baseline="vs last 30 days"
        />
        <MetricCard
          icon={TriangleAlert}
          label="At risk"
          value={metrics.atRisk}
          delta="5%"
          deltaDir="down"
          deltaGood
          baseline="vs last 7 days"
        />
      </section>

      {/* ── Program members table — full responsive width ────────────── */}
      <section className="card p-5 sm:p-6 min-w-0">
          <h2 className="font-display text-[20px] text-ink-900 mb-4">
            Program members
          </h2>

          {/* Controls */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-ink-400"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => applyQuery(e.target.value)}
                  placeholder="Search by name or email"
                  aria-label="Search members"
                  className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
                />
              </div>
              {/* Sort direction toggle */}
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                title={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
                aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
                className="inline-flex items-center justify-center size-10 rounded-[10px] bg-white border border-ink-200 text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
              >
                <ArrowUpDown className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-between">
              {/* Status tabs */}
              <div className="inline-flex items-center gap-1 p-1 rounded-[12px] bg-cream-100 border border-ink-100">
                {STATUS_TABS.map((t) => {
                  const active = statusTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => applyStatusTab(t.key)}
                      aria-pressed={active}
                      className={cn(
                        "h-8 px-3 rounded-[9px] text-[12.5px] font-medium transition-colors",
                        active
                          ? "bg-rose-100 text-rose-700"
                          : "text-ink-600 hover:text-ink-900 hover:bg-cream-200/70",
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Plan + sort dropdowns */}
              <div className="flex items-center gap-2">
                <SelectControl
                  value={planFilter}
                  onChange={(v) => applyPlan(v)}
                  options={PLAN_FILTERS}
                  ariaLabel="Filter by plan"
                />
                <SelectControl
                  value={sortKey}
                  onChange={(v) => applySort(v)}
                  options={SORT_OPTIONS}
                  ariaLabel="Sort members"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[920px] text-left">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500 font-bold">
                  <Th>Member</Th>
                  <Th>Plan</Th>
                  <Th>Progress</Th>
                  <Th>Current lesson</Th>
                  <Th>Tasks completed</Th>
                  <Th>Last active</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-2">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[13px] text-ink-500">
                      No members match your filters.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((m) => (
                    <MemberRow key={m.id} member={m} onToast={(msg) => setToast(msg)} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="mt-4 pt-4 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[12.5px] text-ink-500 tabular-nums">
              Showing {showingFrom} to {showingTo} of {filtered.length.toLocaleString()} members
            </span>
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={(p) => setPage(p)}
            />
          </div>
        </section>

      {/* ── Insights row: distribution · completion · quick actions ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <PlanDistributionCard
          dist={planDist}
          total={members.length}
          onViewAll={() => applyStatusTab("all")}
        />
        <CompletionOverviewCard completion={completion} />
        <QuickActionsCard onAction={(msg) => setToast(msg)} />
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink-900 text-white text-[12.5px] shadow-card"
        >
          <CheckCircle2 className="size-3.5 text-emerald-300" strokeWidth={2.5} aria-hidden />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Metric card
   ───────────────────────────────────────────────────────────────────────── */

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaDir,
  deltaGood,
  baseline,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  delta: string;
  deltaDir: "up" | "down";
  deltaGood: boolean;
  baseline: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <span
          className="size-11 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0"
          aria-hidden
        >
          <Icon className="size-[20px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="text-[12.5px] text-ink-500 font-medium">{label}</div>
          <div className="mt-0.5 text-[30px] font-bold text-ink-900 leading-none tabular-nums">
            {value.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[12px]">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-semibold tabular-nums",
            deltaGood ? "text-emerald-600" : "text-rose-600",
          )}
        >
          {deltaDir === "up" ? "↗" : "↘"} {delta}
        </span>
        <span className="text-ink-400">{baseline}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Member row
   ───────────────────────────────────────────────────────────────────────── */

function MemberRow({
  member: m,
  onToast,
}: {
  member: Member;
  onToast: (msg: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const status = STATUS_META[m.status];

  return (
    <tr className="border-t border-ink-100 hover:bg-cream-50/60 transition-colors">
      {/* Member */}
      <Td>
        <div className="flex items-center gap-3 min-w-0 py-1">
          <Avatar name={m.name} size={36} />
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-ink-900 leading-tight truncate">
              {m.name}
            </div>
            <div className="text-[12px] text-ink-500 leading-tight truncate">
              {m.email}
            </div>
          </div>
        </div>
      </Td>

      {/* Plan */}
      <Td className="text-[13px] text-ink-700 whitespace-nowrap">{m.plan}</Td>

      {/* Progress */}
      <Td className="min-w-[120px]">
        <div className="text-[12.5px] font-semibold text-ink-900 tabular-nums leading-none mb-1.5">
          {m.progress}%
        </div>
        <div className="h-1.5 w-[88px] rounded-full bg-cream-200 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              m.status === "completed" ? "bg-violet-500" : "bg-rose-500",
            )}
            style={{ width: `${m.progress}%` }}
          />
        </div>
      </Td>

      {/* Current lesson */}
      <Td className="text-[12.5px] text-ink-700 whitespace-nowrap">{m.currentLesson}</Td>

      {/* Tasks */}
      <Td className="text-[12.5px] text-ink-700 tabular-nums whitespace-nowrap">
        {m.tasksCompleted}/{m.tasksTotal}
      </Td>

      {/* Last active */}
      <Td className="text-[12.5px] text-ink-500 whitespace-nowrap">
        {lastActiveLabel(m.lastActiveDays)}
      </Td>

      {/* Status */}
      <Td>
        <span
          className={cn(
            "inline-flex items-center px-2.5 h-[24px] rounded-full text-[11.5px] font-semibold whitespace-nowrap",
            status.pill,
          )}
        >
          {status.label}
        </span>
      </Td>

      {/* Actions */}
      <Td className="text-right pr-2">
        <div ref={menuRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Actions for ${m.name}`}
            className={cn(
              "size-8 rounded-[8px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors",
              menuOpen && "bg-cream-100 text-ink-900",
            )}
          >
            <MoreHorizontal className="size-4" strokeWidth={2} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+4px)] z-20 w-[190px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
            >
              <RowMenuItem
                icon={Eye}
                label="View progress"
                onClick={() => { setMenuOpen(false); onToast(`Opening ${m.name}'s progress`); }}
              />
              <RowMenuItem
                icon={MessageSquare}
                label="Message member"
                onClick={() => { setMenuOpen(false); onToast(`Message to ${m.name} (demo)`); }}
              />
              <RowMenuItem
                icon={Mail}
                label="Copy email"
                onClick={() => {
                  setMenuOpen(false);
                  void navigator.clipboard.writeText(m.email).then(
                    () => onToast("Email copied"),
                    () => onToast("Could not copy"),
                  );
                }}
              />
              <div aria-hidden className="my-1 mx-2 border-t border-ink-100" />
              <RowMenuItem
                icon={Trash2}
                label="Remove from program"
                danger
                onClick={() => { setMenuOpen(false); onToast(`Removed ${m.name} (demo)`); }}
              />
            </div>
          )}
        </div>
      </Td>
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right-rail cards
   ───────────────────────────────────────────────────────────────────────── */

function PlanDistributionCard({
  dist,
  total,
  onViewAll,
}: {
  dist: { plan: Plan; count: number; percent: number }[];
  total: number;
  onViewAll: () => void;
}) {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900">Plan distribution</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[12px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
        >
          View all
        </button>
      </header>
      <ul className="space-y-3">
        {dist.map((d) => (
          <li key={d.plan}>
            <div className="flex items-center justify-between text-[12.5px] mb-1">
              <span className="text-ink-700 font-medium">{d.plan}</span>
              <span className="text-ink-500 tabular-nums">
                {d.count} ({d.percent}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div
                className={cn("h-full rounded-full", PLAN_BAR[d.plan])}
                style={{ width: `${d.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-[12.5px]">
        <span className="text-ink-500">Total</span>
        <span className="font-bold text-ink-900 tabular-nums">{total}</span>
      </div>
    </section>
  );
}

function CompletionOverviewCard({
  completion,
}: {
  completion: {
    completed: number;
    inProgress: number;
    notStarted: number;
    total: number;
    pctCompleted: number;
    pctInProgress: number;
    pctNotStarted: number;
  };
}) {
  return (
    <section className="card p-5">
      <h3 className="text-[14px] font-bold text-ink-900 mb-4">Completion overview</h3>
      <div className="flex items-center gap-4">
        <MultiDonut
          size={104}
          strokeWidth={14}
          slices={[
            { value: completion.completed,  color: SLICE_COMPLETED   },
            { value: completion.inProgress, color: SLICE_IN_PROGRESS },
            { value: completion.notStarted, color: SLICE_NOT_STARTED },
          ]}
        />
        <ul className="flex-1 min-w-0 space-y-2 text-[12.5px]">
          <LegendRow color={SLICE_COMPLETED}   label="Completed"   value={completion.completed}  pct={completion.pctCompleted} />
          <LegendRow color={SLICE_IN_PROGRESS} label="In progress" value={completion.inProgress} pct={completion.pctInProgress} />
          <LegendRow color={SLICE_NOT_STARTED} label="Not started" value={completion.notStarted} pct={completion.pctNotStarted} />
        </ul>
      </div>
      <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-[12.5px]">
        <span className="text-ink-500">Total</span>
        <span className="font-bold text-ink-900 tabular-nums">{completion.total}</span>
      </div>
    </section>
  );
}

function LegendRow({
  color,
  label,
  value,
  pct,
}: {
  color: string;
  label: string;
  value: number;
  pct: number;
}) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-2.5 rounded-full shrink-0" style={{ background: color }} aria-hidden />
      <span className="text-ink-700 flex-1 min-w-0 truncate">{label}</span>
      <span className="text-ink-500 tabular-nums shrink-0">
        {value} ({pct}%)
      </span>
    </li>
  );
}

function QuickActionsCard({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <section className="card p-5">
      <h3 className="text-[14px] font-bold text-ink-900 mb-3">Quick actions</h3>
      <ul className="space-y-1">
        <QuickAction
          icon={Mail}
          title="Message inactive members"
          subtitle="Reach out to members inactive for 7+ days"
          onClick={() => onAction("Composing message to inactive members (demo)")}
        />
        <QuickAction
          icon={Trophy}
          title="Review completions"
          subtitle="See who recently completed the program"
          onClick={() => onAction("Showing recent completions (demo)")}
        />
        <QuickAction
          icon={BarChart3}
          title="View reports"
          subtitle="Detailed analytics and engagement"
          onClick={() => onAction("Opening reports (demo)")}
        />
      </ul>
    </section>
  );
}

function QuickAction({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-start gap-3 px-2.5 py-2.5 -mx-1 rounded-[10px] text-left hover:bg-cream-100 transition-colors group"
      >
        <span className="size-8 rounded-[9px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0" aria-hidden>
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink-900 leading-tight group-hover:text-rose-700 transition-colors">
            {title}
          </span>
          <span className="block text-[11.5px] text-ink-500 leading-snug mt-0.5">
            {subtitle}
          </span>
        </span>
        <ChevronRight className="size-4 text-ink-300 shrink-0 mt-0.5 group-hover:text-rose-500 transition-colors" strokeWidth={2} aria-hidden />
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Small primitives
   ───────────────────────────────────────────────────────────────────────── */

function HeaderMoreMenu({
  onAction,
  onExport,
}: {
  onAction: (msg: string) => void;
  onExport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className={cn(
          "inline-flex items-center justify-center size-10 rounded-[12px] bg-white border border-ink-200 text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors",
          open && "bg-cream-100 text-ink-900",
        )}
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-20 w-[200px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
          <RowMenuItem icon={Upload} label="Export CSV" onClick={() => { setOpen(false); onExport(); }} />
          <RowMenuItem icon={Mail} label="Email all members" onClick={() => { setOpen(false); onAction("Compose to all members (demo)"); }} />
          <RowMenuItem icon={BarChart3} label="View reports" onClick={() => { setOpen(false); onAction("Opening reports (demo)"); }} />
        </div>
      )}
    </div>
  );
}

function RowMenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] transition-colors",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-700 hover:bg-cream-100",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      {label}
    </button>
  );
}

function SelectControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { key: T; label: string }[];
  ariaLabel: string;
}) {
  const current = options.find((o) => o.key === value);
  return (
    <label className="relative inline-flex items-center h-10 rounded-[10px] bg-white border border-ink-200 hover:border-rose-200 text-[12.5px] font-medium text-ink-900 transition-colors cursor-pointer">
      <span className="pl-3 pr-7 truncate max-w-[160px]">{current?.label ?? options[0].label}</span>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-400" strokeWidth={2.2} aria-hidden />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  // Compact strip: 1 2 3 … last (when there are many pages).
  const pages: (number | "…")[] = [];
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "…", total);
  }

  return (
    <div className="inline-flex items-center gap-1">
      <PageBtn
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </PageBtn>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="inline-flex items-center justify-center min-w-[32px] h-8 text-[12.5px] text-ink-400">…</span>
        ) : (
          <PageBtn key={p} active={p === current} onClick={() => onChange(p)}>
            {p}
          </PageBtn>
        ),
      )}
      <PageBtn
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        ariaLabel="Next page"
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </PageBtn>
    </div>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-[8px] text-[12.5px] font-medium tabular-nums transition-colors",
        active
          ? "bg-rose-600 text-white"
          : "bg-white border border-ink-200 text-ink-700 hover:bg-cream-100 hover:text-ink-900",
        disabled && "opacity-40 cursor-not-allowed hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("font-bold py-2 px-2.5 align-middle whitespace-nowrap", className)}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

function lastActiveLabel(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Deterministic mock dataset (326 members).
   First 6 rows mirror the design mockup exactly; the rest are generated so
   that search / filter / sort / pagination operate on real volume and the
   derived metrics + distributions match the reference figures.
   ───────────────────────────────────────────────────────────────────────── */

const ALL_MEMBERS: Member[] = buildMembers();

function buildMembers(): Member[] {
  const fixed: Member[] = [
    { id: "m1", name: "Sophie Miller", email: "sophie.miller@email.com", plan: "Pro",     progress: 82,  currentLesson: "Lesson 6: Content Hooks",    tasksCompleted: 18, tasksTotal: 22, lastActiveDays: 0, status: "on-track" },
    { id: "m2", name: "Daniel Kim",    email: "daniel.kim@email.com",    plan: "Basic",   progress: 46,  currentLesson: "Lesson 3: Positioning",      tasksCompleted: 9,  tasksTotal: 20, lastActiveDays: 2, status: "needs-attention" },
    { id: "m3", name: "Emma Rossi",    email: "emma.rossi@email.com",    plan: "Diamond", progress: 100, currentLesson: "Completed",                  tasksCompleted: 22, tasksTotal: 22, lastActiveDays: 0, status: "completed" },
    { id: "m4", name: "Marcus Lee",    email: "marcus.lee@email.com",    plan: "Free",    progress: 18,  currentLesson: "Lesson 1: Niche",            tasksCompleted: 3,  tasksTotal: 18, lastActiveDays: 5, status: "inactive" },
    { id: "m5", name: "Olivia Brown",  email: "olivia.brown@email.com",  plan: "Basic",   progress: 67,  currentLesson: "Lesson 5: Outreach",         tasksCompleted: 14, tasksTotal: 20, lastActiveDays: 1, status: "on-track" },
    { id: "m6", name: "Noah Patel",    email: "noah.patel@email.com",    plan: "Pro",     progress: 29,  currentLesson: "Lesson 2: Content Pillars",  tasksCompleted: 6,  tasksTotal: 19, lastActiveDays: 4, status: "at-risk" },
  ];

  const rng = mulberry32(20260528);

  // Remaining plan + status pools to hit exact program-wide totals.
  // Targets: Free 48 / Basic 112 / Pro 108 / Diamond 58 (= 326).
  const planPool = shuffle(
    [
      ...Array<Plan>(47).fill("Free"),
      ...Array<Plan>(110).fill("Basic"),
      ...Array<Plan>(106).fill("Pro"),
      ...Array<Plan>(57).fill("Diamond"),
    ],
    rng,
  );
  // Targets: completed 86 / inactive 29 / at-risk 29 / needs-attention 60 / on-track 122.
  const statusPool = shuffle(
    [
      ...Array<MemberStatus>(85).fill("completed"),
      ...Array<MemberStatus>(28).fill("inactive"),
      ...Array<MemberStatus>(28).fill("at-risk"),
      ...Array<MemberStatus>(59).fill("needs-attention"),
      ...Array<MemberStatus>(120).fill("on-track"),
    ],
    rng,
  );

  const FIRST = ["Ava","Liam","Mia","Ethan","Zoe","Lucas","Aria","Mason","Ivy","Leo","Nora","Owen","Ella","Kai","Maya","Felix","Lena","Hugo","Isla","Theo","Ruby","Jonas","Clara","Milo","Sara","Elias","Tara","Noel","Vera","Axel","Nina","Remy","Cora","Otto","June","Pablo","Eve","Dario","Lola","Sven","Anika","Bo","Freya","Caleb","Suki","Diego","Yara","Finn","Mara","Reza"];
  const LAST = ["Andersen","Bauer","Costa","Dubois","Eriksen","Fischer","Garcia","Haas","Ibarra","Jensen","Klein","Lindgren","Moreau","Novak","Olsen","Pereira","Quinn","Rossi","Schmidt","Tanaka","Ueda","Vargas","Weber","Xu","Yilmaz","Zhang","Adler","Berg","Cruz","Dahl"];
  const LESSONS = [
    "Lesson 1: Niche",
    "Lesson 2: Content Pillars",
    "Lesson 3: Positioning",
    "Lesson 4: Storytelling",
    "Lesson 5: Outreach",
    "Lesson 6: Content Hooks",
    "Lesson 7: Monetization",
    "Lesson 8: Scaling",
  ];

  // Decide which non-inactive members count as "active this week" so the
  // derived metric lands on 214 (6 fixed are all active → need 208 of 320).
  // completed + on-track are always active; pick 3 more from the rest.
  const generated: Member[] = [];
  let extraActiveBudget = 3; // needs-attention/at-risk allowed to be "active"

  for (let i = 0; i < 320; i++) {
    const plan = planPool[i];
    const status = statusPool[i];
    const first = FIRST[Math.floor(rng() * FIRST.length)];
    const last = LAST[Math.floor(rng() * LAST.length)];
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@email.com`;

    let progress: number;
    let lessonIdx: number;
    let active: boolean;

    switch (status) {
      case "completed":
        progress = 100; lessonIdx = -1; active = true; break;
      case "on-track":
        progress = 55 + Math.floor(rng() * 40); lessonIdx = 4 + Math.floor(rng() * 3); active = true; break;
      case "needs-attention":
        progress = 40 + Math.floor(rng() * 20); lessonIdx = 2 + Math.floor(rng() * 2);
        // Deterministically spend the small "active" budget on the first few
        // needs-attention members so the derived "Active this week" metric
        // lands on exactly 214 regardless of rng draws.
        active = extraActiveBudget > 0; if (active) extraActiveBudget--; break;
      case "at-risk":
        progress = 20 + Math.floor(rng() * 25); lessonIdx = 1 + Math.floor(rng() * 2);
        active = false; break;
      case "inactive":
      default:
        progress = Math.floor(rng() * 18); lessonIdx = Math.floor(rng() * 2); active = false; break;
    }

    const lastActiveDays = active
      ? (status === "completed" || status === "on-track"
          ? Math.floor(rng() * 4)         // 0–3
          : 4 + Math.floor(rng() * 4))    // 4–7
      : 8 + Math.floor(rng() * 40);       // 8–47

    const tasksTotal = 18 + Math.floor(rng() * 5); // 18–22
    const tasksCompleted =
      status === "completed" ? tasksTotal : Math.round((progress / 100) * tasksTotal);

    generated.push({
      id: `m${i + 7}`,
      name,
      email,
      plan,
      progress,
      currentLesson: status === "completed" ? "Completed" : LESSONS[Math.max(0, lessonIdx)],
      tasksCompleted,
      tasksTotal,
      lastActiveDays,
      status,
    });
  }

  return [...fixed, ...generated];
}

/* Seeded PRNG (mulberry32) — deterministic so SSR and client render the
   identical dataset, avoiding hydration mismatch. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
