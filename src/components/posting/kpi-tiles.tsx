import {
  CalendarDays,
  Target,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Flame,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  thisWeekPlanned: number;
  consistencyDaysPerWeek: number;
  bestTime: string;
  engagementGoal: number;
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
// Demo week pattern for the consistency card — done · today · upcoming.
const CONSISTENCY_STATES: ("done" | "today" | "future")[] = [
  "done",
  "done",
  "done",
  "today",
  "future",
  "future",
  "future",
];

// Engagement bar scale (matches the mockup: 0% … avg 6% … 12%).
const ENGAGEMENT_MAX = 12;
const ENGAGEMENT_AVG = 6;

export function PostingKpiTiles({
  thisWeekPlanned,
  consistencyDaysPerWeek,
  bestTime,
  engagementGoal,
}: Props) {
  const fillPct = Math.min(100, Math.max(0, (engagementGoal / ENGAGEMENT_MAX) * 100));
  const avgPct = (ENGAGEMENT_AVG / ENGAGEMENT_MAX) * 100;
  const labelPct = Math.min(94, Math.max(6, fillPct));

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* This Week's Posts */}
      <KpiCard
        icon={CalendarDays}
        label="This Week's Posts"
        value={String(thisWeekPlanned)}
        sub="Planned"
        footer={
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-success-bg text-success inline-flex items-center justify-center shrink-0">
              <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-[12px] text-ink-500">
              <span className="font-semibold text-ink-700">2</span> above last week
            </span>
          </div>
        }
      />

      {/* Consistency Goal */}
      <KpiCard
        icon={Target}
        label="Consistency Goal"
        value={String(consistencyDaysPerWeek)}
        sub="days / week"
        footer={
          <div className="flex items-center gap-2">
            <Flame
              className="size-4 text-rose-500 shrink-0"
              fill="currentColor"
              strokeWidth={1.6}
            />
            <span className="text-[12px] text-ink-500">
              Current streak:{" "}
              <span className="font-semibold text-rose-600">3 days</span>
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-1.5">
          {CONSISTENCY_STATES.map((state, i) => (
            <span
              key={i}
              className={cn(
                "h-8 rounded-[8px] inline-flex items-center justify-center text-[12px] font-semibold",
                state === "done" && "bg-rose-500 text-white",
                state === "today" && "bg-rose-200 text-rose-700",
                state === "future" &&
                  "bg-white border border-ink-200 text-ink-400",
              )}
            >
              {DAY_LABELS[i]}
            </span>
          ))}
        </div>
      </KpiCard>

      {/* Best Time to Post */}
      <KpiCard
        icon={Clock}
        label="Best Time to Post"
        value={bestTime}
        sub="Today"
        footer={
          <div className="flex items-center gap-2">
            <Users className="size-4 text-ink-400 shrink-0" strokeWidth={1.9} />
            <span className="text-[12px] text-ink-500">
              Highest audience activity
            </span>
          </div>
        }
      >
        <ActivityChart />
      </KpiCard>

      {/* Engagement Goal */}
      <KpiCard
        icon={TrendingUp}
        label="Engagement Goal"
        value={`${engagementGoal}%`}
        sub="This Week"
        footer={
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-success-bg text-success inline-flex items-center justify-center shrink-0">
              <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-[12px] text-ink-500">
              <span className="font-semibold text-ink-700">+2.4%</span> vs last
              week
            </span>
          </div>
        }
      >
        <div>
          <div className="relative h-4">
            <span
              className="absolute -translate-x-1/2 text-[11px] font-semibold text-rose-600 tabular-nums"
              style={{ left: `${labelPct}%` }}
            >
              {engagementGoal}%
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-cream-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-rose-500"
              style={{ width: `${fillPct}%` }}
            />
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-3 bg-ink-300 rounded-full"
              style={{ left: `${avgPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10.5px] text-ink-400">
            <span>0%</span>
            <span>Average {ENGAGEMENT_AVG}%</span>
            <span>{ENGAGEMENT_MAX}%</span>
          </div>
        </div>
      </KpiCard>
    </section>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  children,
  footer,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="size-11 rounded-[14px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Icon className="size-[22px]" strokeWidth={1.9} />
        </span>
        <span className="text-[13px] font-semibold text-ink-700 leading-tight">
          {label}
        </span>
      </div>

      <div className="text-[30px] font-bold text-ink-900 leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[12.5px] text-ink-500 mt-1.5">{sub}</div>

      {children && <div className="mt-4">{children}</div>}

      <div className="mt-auto pt-4 border-t border-ink-100">{footer}</div>
    </div>
  );
}

function ActivityChart() {
  // Decorative audience-activity curve peaking mid-afternoon. Uniform scaling
  // (h-auto) keeps the peak dot perfectly round at any card width.
  const line =
    "M0,50 C28,49 48,45 72,41 C96,37 116,28 138,20 C143,18 147,14 150,14 C156,14 174,22 196,28 C214,33 228,37 240,40";
  const area = `${line} L240,64 L0,64 Z`;
  return (
    <div>
      <svg
        viewBox="0 0 240 64"
        className="w-full h-auto text-rose-500"
        role="img"
        aria-label="Audience activity through the day"
      >
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--rose-400)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--rose-400)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#activityFill)" />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="150"
          y1="14"
          x2="150"
          y2="58"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.45"
        />
        <circle cx="150" cy="14" r="6" fill="currentColor" opacity="0.18" />
        <circle cx="150" cy="14" r="3.5" fill="currentColor" />
      </svg>
      <div className="flex items-center justify-between mt-1 text-[10px] text-ink-400">
        <span>12 AM</span>
        <span>12 PM</span>
        <span>12 AM</span>
      </div>
    </div>
  );
}
