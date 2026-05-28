"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  Info,
  Clock,
  NotebookPen,
  FileText,
  Bell,
  ClipboardCheck,
  Layers,
  KeyRound,
  GraduationCap,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MultiDonut } from "@/components/dashboard/donut";

/* ─────────────────────────────────────────────────────────────────────────
   Program Reports dashboard.

   Frontend-only analytics surface — the numbers are seeded to a realistic
   snapshot (matching the design reference) since there's no analytics
   pipeline yet. A backend pass can later swap the constants below for live
   aggregates without touching the layout. All charts are dependency-free
   inline SVG.
   ───────────────────────────────────────────────────────────────────────── */

const PREV_RANGE = "vs Apr 14 – May 11";

const KPIS = [
  {
    key: "enrolled",
    label: "Enrolled students",
    icon: Users,
    value: "128",
    delta: 12,
    spark: [88, 96, 101, 110, 116, 121, 128],
  },
  {
    key: "completion",
    label: "Completion rate",
    icon: CheckCircle2,
    value: "74%",
    delta: 8,
    spark: [52, 58, 61, 66, 69, 72, 74],
  },
  {
    key: "progress",
    label: "Avg. progress",
    icon: TrendingUp,
    value: "68%",
    delta: 6,
    spark: [49, 53, 57, 60, 63, 66, 68],
  },
  {
    key: "cta",
    label: "CTA conversion",
    icon: Target,
    value: "21%",
    delta: -3,
    spark: [26, 25, 24, 23, 24, 22, 21],
  },
] as const;

const TREND = {
  labels: [
    "Apr 14-20",
    "Apr 21-27",
    "Apr 28-May 4",
    "May 5-11",
    "May 12-18",
    "May 19-25",
    "May 26-Jun 1",
    "Jun 2-8",
  ],
  values: [38, 53, 61, 67, 74, 76, 77, 72],
  forecastFromIndex: 6, // the final segment (→ Jun 2-8) is a dashed forecast
  defaultActive: 4, // "May 12-18"
};

const TOTAL_STUDENTS = 128;
const DISTRIBUTION = [
  { key: "completed",  label: "Completed",   count: 74, pct: 58, color: "#be123c" },
  { key: "inprogress", label: "In progress", count: 34, pct: 27, color: "#fb7185" },
  { key: "notstarted", label: "Not started", count: 20, pct: 15, color: "#fecdd3" },
];

const LESSONS: { name: string; pct: number; icon: LucideIcon }[] = [
  { name: "Setup guide", pct: 92, icon: ClipboardCheck },
  { name: "Curriculum",  pct: 78, icon: Layers },
  { name: "Access",      pct: 65, icon: KeyRound },
  { name: "Students",    pct: 59, icon: GraduationCap },
];

const ENGAGEMENT: {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
}[] = [
  { label: "Avg. watch time",  value: "24m 36s", delta: 15, icon: Clock },
  { label: "Notes taken",      value: "312",     delta: 18, icon: NotebookPen },
  { label: "Resources opened", value: "486",     delta: 22, icon: FileText },
  { label: "Reminders sent",   value: "184",     delta: -5, icon: Bell },
];

type StudentStatus = "in_progress" | "not_started" | "completed";
type RiskLevel = "low" | "medium" | "high";

const STUDENTS: {
  name: string;
  initials: string;
  progress: number;
  last: string;
  status: StudentStatus;
  risk: RiskLevel;
}[] = [
  { name: "Sarah Chen",   initials: "SC", progress: 92, last: "Jun 7, 2025",  status: "in_progress", risk: "low" },
  { name: "James Miller", initials: "JM", progress: 61, last: "Jun 5, 2025",  status: "in_progress", risk: "medium" },
  { name: "Aisha Lopez",  initials: "AL", progress: 34, last: "May 31, 2025", status: "in_progress", risk: "high" },
  { name: "David Taylor", initials: "DT", progress: 10, last: "May 20, 2025", status: "not_started", risk: "high" },
  { name: "Katie Lee",    initials: "KL", progress: 78, last: "Jun 6, 2025",  status: "in_progress", risk: "low" },
];

const RECOMMENDATIONS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Clock,          title: "12 students are behind on completion", body: "Send a reminder to re-engage learners." },
  { icon: ClipboardCheck, title: "Setup guide is your top performing lesson", body: "92% completion rate this period." },
  { icon: Target,         title: "CTA conversion dropped by 3%", body: "Review and test alternate CTAs." },
  { icon: Bell,           title: "Follow up with high-risk students", body: "3 students haven't been active in 14+ days." },
];

/* ─────────────────────────────────────────────────────────────────────────
   Root
   ───────────────────────────────────────────────────────────────────────── */

export function ReportsView({ programId }: { programId: string }) {
  const [grain, setGrain] = useState("Weekly");
  const [lessonFilter, setLessonFilter] = useState("All lessons");

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <span className="size-14 rounded-[16px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <BarChart3 className="size-7" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h1 className="text-page-title text-ink-900 leading-tight">Reports</h1>
            <p className="text-[13.5px] text-ink-500 mt-1 max-w-md leading-snug">
              Track performance, learner engagement, and completion across
              this program.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Calendar className="size-4 text-ink-500" strokeWidth={2} />
            May 12 – Jun 8, 2025
            <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Filter className="size-4 text-ink-500" strokeWidth={2} />
            Filters
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Download className="size-4 text-ink-500" strokeWidth={2} />
            Export
          </button>
        </div>
      </header>

      {/* ── KPI row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <article key={k.key} className="card p-5">
            <div className="flex items-start gap-3">
              <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <k.icon className="size-[18px]" strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-ink-500 leading-tight">
                  {k.label}
                </div>
                <div className="text-[28px] font-bold text-ink-900 leading-none mt-1.5 tabular-nums">
                  {k.value}
                </div>
                <div className="mt-2">
                  <Delta value={k.delta} suffix={PREV_RANGE} />
                </div>
              </div>
              <Sparkline values={[...k.spark]} className="w-[84px] h-11 self-center shrink-0" />
            </div>
          </article>
        ))}
      </div>

      {/* ── Trend + distribution ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <SectionHeader
            title="Completion trend"
            subtitle="Weekly completion rate over time"
            right={
              <MiniSelect
                value={grain}
                onChange={setGrain}
                options={["Weekly", "Monthly"]}
              />
            }
          />
          <TrendChart />
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader
            title="Program performance"
            subtitle="Distribution of student progress"
          />
          <div className="flex items-center gap-5 flex-wrap">
            <MultiDonut
              slices={DISTRIBUTION.map((d) => ({ value: d.count, color: d.color }))}
              size={150}
              strokeWidth={20}
            >
              <span className="text-[24px] font-bold text-ink-900 leading-none tabular-nums">
                {TOTAL_STUDENTS}
              </span>
              <span className="text-[11px] text-ink-500 mt-0.5">Students</span>
            </MultiDonut>
            <ul className="flex-1 min-w-[140px] space-y-3">
              {DISTRIBUTION.map((d) => (
                <li key={d.key} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                    aria-hidden
                  />
                  <span className="text-ink-700 flex-1">{d.label}</span>
                  <span className="font-semibold text-ink-900 tabular-nums">
                    {d.count}
                  </span>
                  <span className="text-ink-400 tabular-nums w-11 text-right">
                    ({d.pct}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 pt-4 border-t border-ink-100">
            <Delta value={9} suffix={`more completed ${PREV_RANGE}`} />
          </p>
        </section>
      </div>

      {/* ── Lesson performance + Engagement ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-5 items-start">
        <section className="card p-5 sm:p-6">
          <SectionHeader
            title="Lesson performance"
            subtitle="Average completion rate by lesson"
            right={
              <MiniSelect
                value={lessonFilter}
                onChange={setLessonFilter}
                options={["All lessons", "Published", "Drafts"]}
              />
            }
          />
          <ul className="space-y-4">
            {LESSONS.map((l) => (
              <li key={l.name} className="flex items-center gap-3">
                <l.icon className="size-4 text-rose-500 shrink-0" strokeWidth={2} />
                <span className="w-[84px] shrink-0 text-[12.5px] text-ink-700 truncate">
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
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader
            title="Engagement snapshot"
            subtitle="Key engagement metrics"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5 sm:divide-x divide-ink-100">
            {ENGAGEMENT.map((m, i) => (
              <div
                key={m.label}
                className={cn("min-w-0", i > 0 && "sm:pl-4")}
              >
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-[9px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                    <m.icon className="size-4" strokeWidth={2} />
                  </span>
                  <span className="text-[12px] text-ink-500 leading-tight">
                    {m.label}
                  </span>
                </div>
                <div className="text-[20px] font-bold text-ink-900 tabular-nums mt-2">
                  {m.value}
                </div>
                <div className="mt-1">
                  <Delta value={m.delta} suffix="vs prev. period" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Student progress + Recommendations ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <SectionHeader
            title="Student progress"
            subtitle="Overview of student progress and activity"
          />
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.08em] text-ink-400">
                  <th className="font-semibold pb-2.5 px-1">Student</th>
                  <th className="font-semibold pb-2.5 px-1">Progress</th>
                  <th className="font-semibold pb-2.5 px-1">Last activity</th>
                  <th className="font-semibold pb-2.5 px-1">Status</th>
                  <th className="font-semibold pb-2.5 px-1">Risk level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {STUDENTS.map((s) => (
                  <tr key={s.name} className="text-[12.5px]">
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
                        <span className="w-9 font-semibold text-ink-900 tabular-nums">
                          {s.progress}%
                        </span>
                        <span className="w-20 h-1.5 rounded-full bg-cream-200 overflow-hidden inline-block">
                          <span
                            className="block h-full rounded-full bg-rose-500"
                            style={{ width: `${s.progress}%` }}
                          />
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-1 text-ink-600 whitespace-nowrap">
                      {s.last}
                    </td>
                    <td className="py-3 px-1">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-1">
                      <RiskBadge risk={s.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link
              href={`/admin/programs/${programId}/students`}
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              View all students
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <SectionHeader
            title="Recommendations"
            subtitle="Actionable insights to improve outcomes"
          />
          <ul className="space-y-1">
            {RECOMMENDATIONS.map((r) => (
              <li key={r.title}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-2.5 -mx-1 rounded-[12px] hover:bg-cream-100 transition-colors text-left"
                >
                  <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                    <r.icon className="size-[17px]" strokeWidth={2} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-ink-900 leading-snug">
                      {r.title}
                    </span>
                    <span className="block text-[12px] text-ink-500 leading-snug mt-0.5">
                      {r.body}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────────────── */

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div className="min-w-0">
        <h3 className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-900">
          {title}
          <Info className="size-3.5 text-ink-300" strokeWidth={2} aria-hidden />
        </h3>
        {subtitle && (
          <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </header>
  );
}

function Delta({ value, suffix }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-[12px] leading-tight">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-semibold",
          up ? "text-success" : "text-rose-600",
        )}
      >
        {up ? (
          <ArrowUp className="size-3" strokeWidth={2.5} />
        ) : (
          <ArrowDown className="size-3" strokeWidth={2.5} />
        )}
        {Math.abs(value)}%
      </span>
      {suffix && <span className="text-ink-400">{suffix}</span>}
    </span>
  );
}

function MiniSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-8 pl-3 pr-8 rounded-[8px] border border-ink-200 bg-white text-[12px] font-medium text-ink-700 cursor-pointer focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-ink-400"
        strokeWidth={2}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: StudentStatus }) {
  const map: Record<StudentStatus, { label: string; cls: string }> = {
    in_progress: { label: "In progress", cls: "bg-success-bg text-success border-success/20" },
    completed:   { label: "Completed",   cls: "bg-success-bg text-success border-success/20" },
    not_started: { label: "Not started", cls: "bg-ink-100 text-ink-500 border-ink-200" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border", m.cls)}>
      {m.label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const map: Record<RiskLevel, { label: string; cls: string }> = {
    low:    { label: "Low",    cls: "bg-success-bg text-success border-success/20" },
    medium: { label: "Medium", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    high:   { label: "High",   cls: "bg-rose-100 text-rose-700 border-rose-200" },
  };
  const m = map[risk];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border", m.cls)}>
      {m.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Charts (dependency-free inline SVG)
   ───────────────────────────────────────────────────────────────────────── */

function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const w = 96;
  const h = 44;
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  const gid = useId();

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e11d48" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke="#e11d48"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrendChart() {
  const [active, setActive] = useState<number | null>(null);
  const idx = active ?? TREND.defaultActive;

  const W = 720;
  const H = 300;
  const L = 42;
  const R = 16;
  const T = 16;
  const B = 42;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const n = TREND.values.length;

  const xAt = (i: number) => L + (i * plotW) / (n - 1);
  const yAt = (v: number) => T + (1 - v / 100) * plotH;

  const pts = TREND.values.map((v, i) => [xAt(i), yAt(v)] as const);
  const solidPts = pts.slice(0, TREND.forecastFromIndex + 1);
  const dashPts = pts.slice(TREND.forecastFromIndex);

  const toPath = (p: readonly (readonly [number, number])[]) =>
    p
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

  const solidLine = toPath(solidPts);
  const baseY = T + plotH;
  const area = `${solidLine} L${solidPts[solidPts.length - 1][0].toFixed(1)},${baseY} L${solidPts[0][0].toFixed(1)},${baseY} Z`;

  const gid = useId();
  const [ax, ay] = pts[idx];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y labels */}
        {[0, 25, 50, 75, 100].map((g) => {
          const gy = yAt(g);
          return (
            <g key={g}>
              <line x1={L} y1={gy} x2={W - R} y2={gy} stroke="#f1e7e4" strokeWidth={1} />
              <text x={L - 8} y={gy + 3.5} textAnchor="end" fontSize="10.5" fill="#a89e9b">
                {g}%
              </text>
            </g>
          );
        })}

        {/* area + lines */}
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={solidLine}
          fill="none"
          stroke="#e11d48"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={toPath(dashPts)}
          fill="none"
          stroke="#e11d48"
          strokeWidth={2.5}
          strokeDasharray="5 5"
          strokeLinecap="round"
          opacity={0.45}
        />

        {/* active vertical guide */}
        <line x1={ax} y1={T} x2={ax} y2={baseY} stroke="#f2b8c4" strokeWidth={1} strokeDasharray="3 3" />

        {/* dots + hover targets */}
        {pts.map(([px, py], i) => (
          <g key={i}>
            {i === idx ? (
              <circle cx={px} cy={py} r={6.5} fill="#fff" stroke="#e11d48" strokeWidth={3} />
            ) : (
              <circle cx={px} cy={py} r={3.5} fill="#e11d48" />
            )}
            <circle
              cx={px}
              cy={py}
              r={18}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              style={{ cursor: "pointer" }}
            />
          </g>
        ))}

        {/* x labels */}
        {TREND.labels.map((lab, i) => (
          <text
            key={lab}
            x={xAt(i)}
            y={H - 14}
            textAnchor="middle"
            fontSize="9.5"
            fill="#a89e9b"
          >
            {lab}
          </text>
        ))}
      </svg>

      {/* tooltip */}
      <div
        className="absolute pointer-events-none transition-[left,top] duration-150"
        style={{
          left: `${(ax / W) * 100}%`,
          top: `${(ay / H) * 100}%`,
          transform: "translate(-50%, -135%)",
        }}
      >
        <div className="rounded-[8px] bg-white border border-ink-100 shadow-card px-2.5 py-1.5 text-center whitespace-nowrap">
          <div className="text-[10.5px] text-ink-500">{TREND.labels[idx]}</div>
          <div className="text-[13px] font-bold text-ink-900 tabular-nums leading-tight">
            {TREND.values[idx]}%
          </div>
        </div>
      </div>
    </div>
  );
}
