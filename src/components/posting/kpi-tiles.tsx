import { CalendarDays, Target, Clock, TrendingUp, type LucideIcon } from "lucide-react";

type Props = {
  thisWeekPlanned: number;
  consistencyDaysPerWeek: number;
  bestTime: string;
  engagementGoal: number;
};

export function PostingKpiTiles({
  thisWeekPlanned,
  consistencyDaysPerWeek,
  bestTime,
  engagementGoal,
}: Props) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Tile
        icon={CalendarDays}
        label="This Week's Posts"
        primary={String(thisWeekPlanned)}
        sub="Planned"
      />
      <Tile
        icon={Target}
        label="Consistency Goal"
        primary={`${consistencyDaysPerWeek}`}
        sub="days / week"
      />
      <Tile
        icon={Clock}
        label="Best Time to Post"
        primary={bestTime}
        sub="Today"
      />
      <Tile
        icon={TrendingUp}
        label="Engagement Goal"
        primary={`${engagementGoal}%`}
        sub="This Week"
      />
    </section>
  );
}

function Tile({
  icon: Icon,
  label,
  primary,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  primary: string;
  sub: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="text-[12px] text-ink-500 font-medium leading-tight mb-1">
          {label}
        </div>
        <div className="text-[22px] font-semibold text-ink-900 leading-none mb-1 tabular-nums">
          {primary}
        </div>
        <div className="text-[11.5px] text-ink-500">{sub}</div>
      </div>
    </div>
  );
}
