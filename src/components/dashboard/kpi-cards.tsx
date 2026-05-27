import Link from "next/link";
import {
  Sparkles,
  CalendarDays,
  Info,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { Donut } from "./donut";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/cn";

export type ChecklistItem = { label: string; done: boolean };

export type Kpi = {
  followers: number;
  /** Followers history (oldest→newest) for the Audience Growth sparkline. */
  followersSeries: number[];
  tasksCompleted: number;
  tasksTotal: number;
  /** Up to 4 items shown in Today's Progress. */
  checklist: ChecklistItem[];
  postsThisWeek: number;
  /** 7 values, Mon→Sun, for the Content Activity bars. */
  contentActivity: number[];
  /** Latest weekly revenue from performance_entries, or null when none. */
  revenue: number | null;
};

export function KpiCards({ kpi }: { kpi: Kpi }) {
  const taskPct =
    kpi.tasksTotal > 0
      ? Math.round((kpi.tasksCompleted / kpi.tasksTotal) * 100)
      : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-grid-gap-sm)] items-stretch">
      <AudienceGrowthCard
        followers={kpi.followers}
        series={kpi.followersSeries}
      />
      <TodaysProgressCard
        completed={kpi.tasksCompleted}
        total={kpi.tasksTotal}
        percent={taskPct}
        checklist={kpi.checklist}
      />
      <ContentActivityCard
        posts={kpi.postsThisWeek}
        activity={kpi.contentActivity}
      />
      <RevenueGoalCard revenue={kpi.revenue} />
    </section>
  );
}

/* ─── Shared bits ────────────────────────────────────────────────────────── */

function CardHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <h3 className="text-[14px] font-semibold text-ink-900">{title}</h3>
      <span
        title={hint}
        className="inline-flex text-ink-300 hover:text-ink-500 transition-colors cursor-help"
      >
        <Info className="size-3.5" strokeWidth={2} aria-label={hint} />
      </span>
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[30px] font-semibold text-ink-900 leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[12.5px] text-ink-500 mt-1.5">{label}</div>
    </div>
  );
}

function CardCTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-auto inline-flex w-full items-center justify-center h-10 rounded-full border border-ink-200 bg-white hover:bg-cream-100 text-[13px] font-medium text-ink-900 transition-colors"
    >
      {label}
    </Link>
  );
}

/* ─── 1. Audience Growth ─────────────────────────────────────────────────── */

function AudienceGrowthCard({
  followers,
  series,
}: {
  followers: number;
  series: number[];
}) {
  // Illustrative growth curve until the user has a real follower history.
  const data = series.length >= 2 ? series : [8, 10, 9, 14, 13, 18, 16, 22, 21, 28];

  return (
    <div className="card p-5 flex flex-col">
      <CardHeader
        title="Audience Growth"
        hint="Your total following across connected platforms."
      />
      <BigStat value={formatCompact(followers)} label="Total Followers" />

      <div className="mt-4 pt-4 border-t border-ink-100 flex-1 flex flex-col">
        <div className="flex items-start gap-2 mb-3">
          <Sparkles className="size-4 text-rose-500 shrink-0 mt-0.5" strokeWidth={2} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-ink-900">
              Grow your audience
            </div>
            <p className="text-[11.5px] text-ink-500 leading-snug">
              Start creating consistently and connect with your community.
            </p>
          </div>
        </div>

        <Sparkline
          data={data}
          width={260}
          height={56}
          className="w-full h-14 mb-3"
        />

        <CardCTA href="/tutorials" label="View Growth Tips" />
      </div>
    </div>
  );
}

/* ─── 2. Today's Progress ────────────────────────────────────────────────── */

function TodaysProgressCard({
  completed,
  total,
  percent,
  checklist,
}: {
  completed: number;
  total: number;
  percent: number;
  checklist: ChecklistItem[];
}) {
  return (
    <div className="card p-5 flex flex-col">
      <CardHeader
        title="Today's Progress"
        hint="Tasks completed from today's plan."
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[30px] font-semibold text-ink-900 leading-none tabular-nums">
            {completed}
            <span className="text-[20px] text-ink-400 font-medium"> / {total}</span>
          </div>
          <div className="text-[12.5px] text-ink-500 mt-1.5">Tasks Completed</div>
        </div>
        <Donut percent={percent} size={56} strokeWidth={6}>
          <span className="text-[12px] font-semibold text-ink-900 tabular-nums">
            {percent}%
          </span>
        </Donut>
      </div>

      <ul className="mt-4 pt-4 border-t border-ink-100 space-y-2.5 flex-1">
        {checklist.slice(0, 4).map((item, i) => (
          <li key={i} className="flex items-center gap-2.5">
            {item.done ? (
              <CheckCircle2 className="size-[18px] text-rose-500 shrink-0" strokeWidth={2} />
            ) : (
              <Circle className="size-[18px] text-ink-300 shrink-0" strokeWidth={2} />
            )}
            <span
              className={cn(
                "text-[12.5px] truncate",
                item.done ? "text-ink-400 line-through" : "text-ink-700",
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <CardCTA href="/missions" label="View Today's Plan" />
    </div>
  );
}

/* ─── 3. Content Activity ────────────────────────────────────────────────── */

function ContentActivityCard({
  posts,
  activity,
}: {
  posts: number;
  activity: number[];
}) {
  return (
    <div className="card p-5 flex flex-col">
      <CardHeader
        title="Content Activity"
        hint="Posts scheduled or published this week."
      />

      <div className="flex items-start justify-between gap-3">
        <BigStat value={String(posts)} label="Posts This Week" />
        <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <CalendarDays className="size-5" strokeWidth={1.9} />
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-ink-100 flex-1 flex flex-col">
        <WeekBars data={activity} />
        <CardCTA href="/posting" label="Plan Your Content" />
      </div>
    </div>
  );
}

function WeekBars({ data }: { data: number[] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(1, ...data);
  const safe = days.map((_, i) => data[i] ?? 0);

  return (
    <div className="flex items-stretch gap-2 mb-4">
      <div className="flex flex-col justify-end text-[10px] text-ink-400 pb-5 tabular-nums">
        0
      </div>
      <div className="flex-1 grid grid-cols-7 gap-2">
        {safe.map((v, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative w-full h-[64px] flex items-end justify-center border-b border-ink-100">
              {/* dashed per-day guide */}
              <span
                aria-hidden
                className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-ink-100"
              />
              {v > 0 && (
                <div
                  className="relative w-2.5 rounded-t-[3px] bg-rose-400"
                  style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
                  title={`${v} ${v === 1 ? "post" : "posts"}`}
                />
              )}
            </div>
            <span className="mt-1.5 text-[10px] text-ink-400">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. Revenue Goal ────────────────────────────────────────────────────── */

function RevenueGoalCard({
  revenue,
}: {
  revenue: number | null;
}) {
  // Empty state when the user hasn't logged any revenue yet. Avoids
  // a fake goal-progress number that would be wrong every time.
  if (!revenue || revenue <= 0) {
    return (
      <div className="card p-5 flex flex-col">
        <CardHeader
          title="Revenue"
          hint="Log your weekly revenue on the Performance page."
        />
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
          <div className="text-[30px] font-semibold text-ink-300 leading-none tabular-nums">—</div>
          <p className="text-[12.5px] text-ink-500 max-w-[28ch]">
            No revenue logged yet. Add a weekly entry to start tracking your
            income trend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 flex flex-col">
      <CardHeader
        title="Revenue"
        hint="Latest weekly revenue from your Performance entries."
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[30px] font-semibold text-ink-900 leading-none tabular-nums">
            ${formatCompact(revenue)}
          </div>
          <div className="text-[12.5px] text-ink-500 mt-1.5">this week</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-ink-100 flex-1 flex flex-col justify-end">
        <CardCTA href="/monetization" label="View Monetization Hub" />
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
