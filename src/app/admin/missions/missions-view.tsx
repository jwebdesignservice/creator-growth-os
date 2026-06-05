"use client";

import { useMemo, useRef, useState } from "react";
import {
  ClipboardCheck,
  LayoutGrid,
  Sun,
  CalendarDays,
  CalendarRange,
  Clock,
  Plus,
  Zap,
  Users,
} from "lucide-react";
import {
  AdminSegmentShell,
  type AdminSegment,
} from "@/components/admin/segment-shell";
import { CreateMissionForm } from "./create-form";
import { TemplateRow } from "./template-row";
import type { AdminMissionRow, MissionSchedulingStats } from "@/lib/tasks/queries";

type Tab = "all" | "daily" | "weekly" | "monthly" | "scheduled" | "assigned";

const SEGMENTS: AdminSegment[] = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "daily", label: "Daily", icon: Sun },
  { key: "weekly", label: "Weekly", icon: CalendarDays },
  { key: "monthly", label: "Monthly", icon: CalendarRange },
  { key: "scheduled", label: "Scheduled", icon: Clock },
  { key: "assigned", label: "Assigned", icon: Users },
];

function planOf(r: AdminMissionRow): string | null {
  for (const rule of r.rules)
    if (rule.ruleType === "include" && rule.targetType === "plan" && rule.targetValue?.plan)
      return String(rule.targetValue.plan);
  return null;
}
function categoryOf(r: AdminMissionRow): string | null {
  for (const rule of r.rules)
    if (rule.ruleType === "include" && rule.targetType === "category" && rule.targetValue?.category)
      return String(rule.targetValue.category);
  return null;
}

export function MissionsView({
  rows,
  stats,
}: {
  rows: AdminMissionRow[];
  stats: MissionSchedulingStats;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [editing, setEditing] = useState<AdminMissionRow | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const taskTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.template.taskType))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    let list = rows.slice();
    if (tab === "daily" || tab === "weekly" || tab === "monthly")
      list = list.filter((r) => r.template.frequency === tab);
    else if (tab === "scheduled") list = list.filter((r) => r.template.autoAssign);
    else if (tab === "assigned") list = list.filter((r) => r.assignedUsers > 0);

    if (typeFilter !== "all") list = list.filter((r) => r.template.taskType === typeFilter);
    if (planFilter !== "all") list = list.filter((r) => planOf(r) === planFilter);
    if (categoryFilter !== "all") list = list.filter((r) => categoryOf(r) === categoryFilter);

    list.sort((a, b) => {
      if (sort === "points") return b.template.points - a.template.points;
      if (sort === "title") return a.template.title.localeCompare(b.template.title);
      const ta = new Date(a.template.createdAt).getTime();
      const tb = new Date(b.template.createdAt).getTime();
      return sort === "oldest" ? ta - tb : tb - ta;
    });
    return list;
  }, [rows, tab, typeFilter, planFilter, categoryFilter, sort]);

  function startEdit(r: AdminMissionRow) {
    setEditing(r);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function startCreate() {
    setEditing(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <AdminSegmentShell
      icon={ClipboardCheck}
      title="Missions"
      segments={SEGMENTS}
      activeKey={tab}
      onSelect={(k) => setTab(k as Tab)}
    >
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <ClipboardCheck className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-h1 text-ink-900 leading-tight">Mission Templates</h1>
            <p className="text-ink-500 text-[14px]">
              Create daily, weekly, monthly, and scheduled task templates and automate
              assignments.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors shadow-sm"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Create task template
        </button>
      </header>

      {/* Secondary filters — the All/Daily/… segments now live in the left rail */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[{ value: "all", label: "All types" }, ...taskTypes.map((t) => ({ value: t, label: t }))]}
          />
          <FilterSelect
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { value: "all", label: "All plans" },
              { value: "free", label: "Free" },
              { value: "basic", label: "Basic" },
              { value: "pro", label: "Pro" },
            ]}
          />
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { value: "all", label: "All categories" },
              { value: "starter", label: "Starter" },
              { value: "growth", label: "Growth" },
              { value: "monetization", label: "Monetization" },
              { value: "scale", label: "Scale" },
            ]}
          />
          <FilterSelect
            value={sort}
            onChange={setSort}
            options={[
              { value: "newest", label: "Sort: Newest" },
              { value: "oldest", label: "Sort: Oldest" },
              { value: "points", label: "Sort: Points" },
              { value: "title", label: "Sort: A → Z" },
            ]}
          />
      </div>

      {/* Create card + right rail */}
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div ref={formRef} className="scroll-mt-6">
          <CreateMissionForm editing={editing} onDone={() => setEditing(null)} />
        </div>
        <div className="space-y-5">
          <SchedulingOverview stats={stats} />
          <AutomationSummary stats={stats} />
        </div>
      </div>

      {/* Templates table */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-h4 text-ink-900">Task templates</h2>
          <span className="text-[12px] text-ink-500 tabular-nums">
            {filtered.length} {filtered.length === 1 ? "template" : "templates"}
          </span>
        </header>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No templates match these filters. Create one above to get started.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {filtered.map((r) => (
              <TemplateRow key={r.template.id} row={r} onEdit={startEdit} />
            ))}
          </ul>
        )}
      </section>
    </div>
    </AdminSegmentShell>
  );
}

/* ── Right-rail cards (live data) ────────────────────────────────────────── */

function SchedulingOverview({ stats }: { stats: MissionSchedulingStats }) {
  const rows: { key: string; label: string; icon: typeof Sun; count: number }[] = [
    { key: "daily", label: "Daily", icon: Sun, count: stats.byFrequency.daily },
    { key: "weekly", label: "Weekly", icon: CalendarDays, count: stats.byFrequency.weekly },
    { key: "monthly", label: "Monthly", icon: CalendarRange, count: stats.byFrequency.monthly },
    { key: "once", label: "One-time", icon: Clock, count: stats.byFrequency.once },
  ];
  const total = stats.activeTemplates || 1;
  return (
    <section className="card p-5">
      <header className="flex items-center gap-2 mb-4">
        <CalendarDays className="size-4 text-rose-500" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-ink-900">Scheduling overview</h3>
      </header>
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">
          Active templates
        </div>
        <div className="text-[32px] font-bold text-ink-900 leading-none tabular-nums mt-1">
          {stats.activeTemplates}
        </div>
      </div>
      <ul className="space-y-2.5">
        {rows.map((r) => {
          const Icon = r.icon;
          const pct = Math.round((r.count / total) * 100);
          return (
            <li key={r.key} className="flex items-center gap-3">
              <span className="size-8 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <span className="flex-1 text-[13px] text-ink-700">{r.label}</span>
              <span className="text-[13px] font-semibold text-ink-900 tabular-nums">{r.count}</span>
              <span className="text-[11.5px] text-ink-400 tabular-nums w-9 text-right">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AutomationSummary({ stats }: { stats: MissionSchedulingStats }) {
  const pct =
    stats.activeTemplates > 0
      ? Math.round((stats.autoAssignTemplates / stats.activeTemplates) * 100)
      : 0;
  return (
    <section className="card p-5">
      <header className="flex items-center gap-2 mb-4">
        <Zap className="size-4 text-rose-500" strokeWidth={2} fill="currentColor" />
        <h3 className="text-[14px] font-bold text-ink-900">Automation summary</h3>
      </header>
      <div className="space-y-4">
        <div>
          <div className="text-[12px] text-ink-500">Auto-assigned tasks</div>
          <div className="text-[26px] font-bold text-ink-900 leading-none tabular-nums mt-1">
            {stats.autoAssignedTasks}
          </div>
          <div className="text-[11.5px] text-ink-400 mt-1">
            {pct}% of active templates auto-assign
          </div>
        </div>
        <div className="pt-3 border-t border-ink-100">
          <div className="text-[12px] text-ink-500 inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-ink-400" strokeWidth={2} />
            Users affected
          </div>
          <div className="text-[26px] font-bold text-ink-900 leading-none tabular-nums mt-1">
            {stats.usersAffected.toLocaleString()}
          </div>
          <div className="text-[11.5px] text-ink-400 mt-1">across all plans</div>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[12.5px] text-ink-700 cursor-pointer focus:outline-none focus:border-rose-300"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
