"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Download,
  Users,
  CheckCircle2,
  TrendingUp,
  Activity,
  Info,
  Clock,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MultiDonut } from "@/components/dashboard/donut";

/* ─────────────────────────────────────────────────────────────────────────
   Program Reports dashboard — fully real.

   Every number on this page is computed server-side in `page.tsx` from the
   live tables that are guaranteed-applied (programs, lessons, lesson_progress,
   profiles) and handed down as `data`. There is no seeded/mock data: when a
   program has no members or activity, the page renders honest zeros / empty
   states rather than invented figures. Charts are dependency-free inline SVG.
   ───────────────────────────────────────────────────────────────────────── */

export type ReportsStudent = {
  id: string;
  name: string;
  initials: string;
  progress: number;
  last: string;
  status: "in_progress" | "not_started" | "completed";
  risk: "low" | "medium" | "high";
};

export type ReportsData = {
  programId: string;
  programSlug: string;
  rangeLabel: string;
  kpis: {
    enrolled: number;
    completionRate: number; // %
    avgProgress: number; // %
    activeWeek: number;
  };
  distribution: {
    completed: number;
    inProgress: number;
    notStarted: number;
    total: number;
  };
  lessons: { name: string; pct: number }[];
  trend: { label: string; value: number }[]; // weekly completion counts
  engagement: {
    avgWatch: string;
    totalCompletions: number;
    activeWeek: number;
    avgProgress: number;
  };
  students: ReportsStudent[];
  recommendations: { title: string; body: string }[];
};

const SLICE_COMPLETED = "#be123c";
const SLICE_IN_PROGRESS = "#fb7185";
const SLICE_NOT_STARTED = "#fecdd3";

/* ─────────────────────────────────────────────────────────────────────── */

export function ReportsView({ data }: { data: ReportsData }) {
  const dist = data.distribution;
  const distTotal = dist.total || 1;
  const pct = (n: number) => Math.round((n / distTotal) * 100);

  function exportCsv() {
    const rows: string[][] = [
      ["Metric", "Value"],
      ["Enrolled members", String(data.kpis.enrolled)],
      ["Completion rate", `${data.kpis.completionRate}%`],
      ["Average progress", `${data.kpis.avgProgress}%`],
      ["Active this week", String(data.kpis.activeWeek)],
      ["Completed", String(dist.completed)],
      ["In progress", String(dist.inProgress)],
      ["Not started", String(dist.notStarted)],
      ["Avg. watch time", data.engagement.avgWatch],
      ["Total lesson completions", String(data.engagement.totalCompletions)],
    ];
    const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `program-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <span className="size-14 rounded-[16px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <BarChart3 className="size-7" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h1 className="text-page-title text-ink-900 leading-tight">Reports</h1>
            <p className="text-[13.5px] text-ink-500 mt-1 max-w-md leading-snug">
              Live performance, engagement, and completion across this program.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-ink-100 bg-cream-50 text-[13px] font-medium text-ink-500">
            <Clock className="size-4" strokeWidth={2} />
            {data.rangeLabel}
          </span>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Download className="size-4 text-ink-500" strokeWidth={2} />
            Export
          </button>
        </div>
      </header>

      {/* KPI row — real values, no invented deltas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Enrolled members" value={data.kpis.enrolled} caption="with access to this program" />
        <Kpi icon={CheckCircle2} label="Completion rate" value={`${data.kpis.completionRate}%`} caption="finished every lesson" />
        <Kpi icon={TrendingUp} label="Avg. progress" value={`${data.kpis.avgProgress}%`} caption="across enrolled members" />
        <Kpi icon={Activity} label="Active this week" value={data.kpis.activeWeek} caption="active in the last 7 days" />
      </div>

      {/* Trend + distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <SectionHeader title="Completion trend" subtitle="Lesson completions per week (last 8 weeks)" />
          {data.trend.some((t) => t.value > 0) ? (
            <TrendChart trend={data.trend} />
          ) : (
            <EmptyChart label="No completions recorded in this window yet." />
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader title="Program performance" subtitle="Distribution of member progress" />
          {dist.total > 0 ? (
            <>
              <div className="flex items-center gap-5 flex-wrap">
                <MultiDonut
                  slices={[
                    { value: dist.completed, color: SLICE_COMPLETED },
                    { value: dist.inProgress, color: SLICE_IN_PROGRESS },
                    { value: dist.notStarted, color: SLICE_NOT_STARTED },
                  ]}
                  size={150}
                  strokeWidth={20}
                >
                  <span className="text-[24px] font-bold text-ink-900 leading-none tabular-nums">
                    {dist.total}
                  </span>
                  <span className="text-[11px] text-ink-500 mt-0.5">Members</span>
                </MultiDonut>
                <ul className="flex-1 min-w-[140px] space-y-3">
                  <LegendRow color={SLICE_COMPLETED} label="Completed" count={dist.completed} pct={pct(dist.completed)} />
                  <LegendRow color={SLICE_IN_PROGRESS} label="In progress" count={dist.inProgress} pct={pct(dist.inProgress)} />
                  <LegendRow color={SLICE_NOT_STARTED} label="Not started" count={dist.notStarted} pct={pct(dist.notStarted)} />
                </ul>
              </div>
            </>
          ) : (
            <EmptyChart label="No members have access to this program yet." />
          )}
        </section>
      </div>

      {/* Lesson performance + engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-5 items-start">
        <section className="card p-5 sm:p-6">
          <SectionHeader title="Lesson performance" subtitle="Completion rate by lesson" />
          {data.lessons.length > 0 ? (
            <ul className="space-y-4">
              {data.lessons.map((l) => (
                <li key={l.name} className="flex items-center gap-3">
                  <Layers className="size-4 text-rose-500 shrink-0" strokeWidth={2} />
                  <span className="w-[120px] shrink-0 text-[12.5px] text-ink-700 truncate" title={l.name}>
                    {l.name}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-[width] duration-500"
                      style={{ width: `${l.pct}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[12.5px] font-semibold text-ink-900 tabular-nums">
                    {l.pct}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyChart label="This program has no lessons yet." />
          )}
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader title="Engagement snapshot" subtitle="Key engagement metrics" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 sm:divide-x divide-ink-100">
            <EngStat icon={Clock} label="Avg. watch time" value={data.engagement.avgWatch} index={0} />
            <EngStat icon={CheckCircle2} label="Lesson completions" value={String(data.engagement.totalCompletions)} index={1} />
            <EngStat icon={Activity} label="Active this week" value={String(data.engagement.activeWeek)} index={2} />
            <EngStat icon={TrendingUp} label="Avg. progress" value={`${data.engagement.avgProgress}%`} index={3} />
          </div>
        </section>
      </div>

      {/* Student progress + recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <SectionHeader title="Student progress" subtitle="Members making the most progress" />
          {data.students.length > 0 ? (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-[0.08em] text-ink-400">
                    <th className="font-semibold pb-2.5 px-1">Member</th>
                    <th className="font-semibold pb-2.5 px-1">Progress</th>
                    <th className="font-semibold pb-2.5 px-1">Last activity</th>
                    <th className="font-semibold pb-2.5 px-1">Status</th>
                    <th className="font-semibold pb-2.5 px-1">Risk level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.students.map((s) => (
                    <tr key={s.id} className="text-[12.5px]">
                      <td className="py-3 px-1">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="size-7 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[10.5px] font-bold shrink-0">
                            {s.initials}
                          </span>
                          <span className="font-medium text-ink-900">{s.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-1">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-9 font-semibold text-ink-900 tabular-nums">{s.progress}%</span>
                          <span className="w-20 h-1.5 rounded-full bg-cream-200 overflow-hidden inline-block">
                            <span className="block h-full rounded-full bg-rose-500" style={{ width: `${s.progress}%` }} />
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-1 text-ink-600 whitespace-nowrap">{s.last}</td>
                      <td className="py-3 px-1"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-1"><RiskBadge risk={s.risk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChart label="No members with access to this program yet." />
          )}
          <div className="mt-3 text-right">
            <Link
              href={`/admin/programs/${data.programId}/students`}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              View all students
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader title="Recommendations" subtitle="Insights derived from live data" />
          {data.recommendations.length > 0 ? (
            <ul className="space-y-1">
              {data.recommendations.map((r) => (
                <li key={r.title}>
                  <div className="w-full flex items-start gap-3 p-2.5 -mx-1 rounded-[12px]">
                    <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                      <Info className="size-[17px]" strokeWidth={2} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-semibold text-ink-900 leading-snug">{r.title}</span>
                      <span className="block text-[12px] text-ink-500 leading-snug mt-0.5">{r.body}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyChart label="No recommendations right now — everything looks healthy." />
          )}
        </section>
      </div>
    </div>
  );
}

/* ── reusable bits ──────────────────────────────────────────────────────── */

function Kpi({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  caption?: string;
}) {
  return (
    <article className="card p-5">
      <div className="flex items-start gap-3">
        <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0 text-[12.5px] text-ink-500 leading-tight pt-1">{label}</div>
      </div>
      <div className="text-[28px] font-bold text-ink-900 leading-none mt-3 tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {caption && <div className="mt-2 text-[12px] text-ink-400 leading-snug">{caption}</div>}
    </article>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div className="min-w-0">
        <h3 className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-900">
          {title}
          <Info className="size-3.5 text-ink-300" strokeWidth={2} aria-hidden />
        </h3>
        {subtitle && <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
    </header>
  );
}

function LegendRow({
  color,
  label,
  count,
  pct,
}: {
  color: string;
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <li className="flex items-center gap-2.5 text-[13px]">
      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden />
      <span className="text-ink-700 flex-1">{label}</span>
      <span className="font-semibold text-ink-900 tabular-nums">{count}</span>
      <span className="text-ink-400 tabular-nums w-11 text-right">({pct}%)</span>
    </li>
  );
}

function EngStat({
  icon: Icon,
  label,
  value,
  index,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  index: number;
}) {
  return (
    <div className={cn("min-w-0", index > 0 && "sm:pl-4")}>
      <div className="flex items-center gap-2">
        <span className="size-8 rounded-[9px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <span className="text-[12px] text-ink-500 leading-tight">{label}</span>
      </div>
      <div className="text-[20px] font-bold text-ink-900 tabular-nums mt-2">{value}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-ink-200 bg-cream-50/40 px-4 py-10 text-center text-[12.5px] text-ink-500">
      {label}
    </div>
  );
}

function StatusBadge({ status }: { status: ReportsStudent["status"] }) {
  const map: Record<ReportsStudent["status"], { label: string; cls: string }> = {
    in_progress: { label: "In progress", cls: "bg-success-bg text-success border-success/20" },
    completed: { label: "Completed", cls: "bg-success-bg text-success border-success/20" },
    not_started: { label: "Not started", cls: "bg-ink-100 text-ink-500 border-ink-200" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border", m.cls)}>
      {m.label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: ReportsStudent["risk"] }) {
  const map: Record<ReportsStudent["risk"], { label: string; cls: string }> = {
    low: { label: "Low", cls: "bg-success-bg text-success border-success/20" },
    medium: { label: "Medium", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    high: { label: "High", cls: "bg-rose-100 text-rose-700 border-rose-200" },
  };
  const m = map[risk];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border", m.cls)}>
      {m.label}
    </span>
  );
}

/* ── trend chart (dependency-free inline SVG, with hover) ─────────────────── */

function TrendChart({ trend }: { trend: { label: string; value: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const W = 720;
  const H = 280;
  const L = 36;
  const R = 16;
  const T = 16;
  const B = 40;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const n = trend.length;
  const maxV = Math.max(1, ...trend.map((t) => t.value));

  const xAt = (i: number) => (n <= 1 ? L + plotW / 2 : L + (i * plotW) / (n - 1));
  const yAt = (v: number) => T + (1 - v / maxV) * plotH;

  const pts = trend.map((t, i) => [xAt(i), yAt(t.value)] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const baseY = T + plotH;
  const area =
    pts.length > 0
      ? `${line} L${pts[pts.length - 1][0].toFixed(1)},${baseY} L${pts[0][0].toFixed(1)},${baseY} Z`
      : "";
  const gid = useId();
  const idx = active ?? n - 1;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setActive(null)}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((g) => {
          const gy = T + (1 - g) * plotH;
          return (
            <g key={g}>
              <line x1={L} y1={gy} x2={W - R} y2={gy} stroke="#f1e7e4" strokeWidth={1} />
              <text x={L - 8} y={gy + 3.5} textAnchor="end" fontSize="10.5" fill="#a89e9b">
                {Math.round(maxV * g)}
              </text>
            </g>
          );
        })}

        {area && <path d={area} fill={`url(#${gid})`} />}
        {line && (
          <path d={line} fill="none" stroke="#e11d48" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        )}

        {pts.map(([px, py], i) => (
          <g key={i}>
            {i === idx ? (
              <circle cx={px} cy={py} r={6.5} fill="#fff" stroke="#e11d48" strokeWidth={3} />
            ) : (
              <circle cx={px} cy={py} r={3.5} fill="#e11d48" />
            )}
            <circle cx={px} cy={py} r={18} fill="transparent" onMouseEnter={() => setActive(i)} style={{ cursor: "pointer" }} />
          </g>
        ))}

        {trend.map((t, i) => (
          <text key={t.label} x={xAt(i)} y={H - 14} textAnchor="middle" fontSize="9.5" fill="#a89e9b">
            {t.label}
          </text>
        ))}
      </svg>

      {pts[idx] && (
        <div
          className="absolute pointer-events-none transition-[left,top] duration-150"
          style={{ left: `${(pts[idx][0] / W) * 100}%`, top: `${(pts[idx][1] / H) * 100}%`, transform: "translate(-50%, -135%)" }}
        >
          <div className="rounded-[8px] bg-white border border-ink-100 shadow-card px-2.5 py-1.5 text-center whitespace-nowrap">
            <div className="text-[10.5px] text-ink-500">{trend[idx].label}</div>
            <div className="text-[13px] font-bold text-ink-900 tabular-nums leading-tight">
              {trend[idx].value} completion{trend[idx].value === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
