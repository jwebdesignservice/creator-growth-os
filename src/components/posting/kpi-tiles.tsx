import {
  CalendarDays,
  Target,
  Clock,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type Props = {
  thisWeekPlanned: number;
  /** Goal days/week. Null until the user sets one in Settings. */
  consistencyDaysPerWeek: number | null;
  /** Best posting time computed from past performance. Null until enough data. */
  bestTime: string | null;
  /** Engagement-rate target. Null until set in Settings. */
  engagementGoal: number | null;
};

export function PostingKpiTiles({
  thisWeekPlanned,
  consistencyDaysPerWeek,
  bestTime,
  engagementGoal,
}: Props) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Real metric — count of items planned this week */}
      <KpiCard
        icon={CalendarDays}
        label="This Week's Posts"
        value={String(thisWeekPlanned)}
        sub="Planned"
        emptyHint="Create a posting plan to start counting."
        isEmpty={false}
      />

      <KpiCard
        icon={Target}
        label="Consistency Goal"
        value={
          consistencyDaysPerWeek != null
            ? String(consistencyDaysPerWeek)
            : null
        }
        sub="days / week"
        emptyHint="Set a weekly posting goal in Settings."
        isEmpty={consistencyDaysPerWeek == null}
      />

      <KpiCard
        icon={Clock}
        label="Best Time to Post"
        value={bestTime}
        sub="Today"
        emptyHint="We'll learn your best time once you have a few weeks of posts."
        isEmpty={bestTime == null}
      />

      <KpiCard
        icon={TrendingUp}
        label="Engagement Goal"
        value={engagementGoal != null ? `${engagementGoal}%` : null}
        sub="This Week"
        emptyHint="Set an engagement target in Settings."
        isEmpty={engagementGoal == null}
      />
    </section>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  emptyHint,
  isEmpty,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  sub: string;
  emptyHint: string;
  isEmpty: boolean;
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

      {isEmpty ? (
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[30px] font-bold text-ink-300 leading-none tabular-nums">
            —
          </div>
          <p className="text-[12px] text-ink-500 leading-snug">{emptyHint}</p>
        </div>
      ) : (
        <>
          <div className="text-[30px] font-bold text-ink-900 leading-none tabular-nums">
            {value}
          </div>
          <div className="text-[12.5px] text-ink-500 mt-1.5">{sub}</div>
        </>
      )}
    </div>
  );
}
