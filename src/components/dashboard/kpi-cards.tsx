import {
  Flame,
  PlayCircle,
  TrendingUp,
  CheckCircle2,
  ArrowUp,
} from "lucide-react";
import { Donut } from "./donut";

type Kpi = {
  program_progress: number;
  daily_streak: number;
  videos_watched: number;
  weekly_progress: number;
  weekly_progress_delta: number;
  tasks_completed: number;
  tasks_total: number;
};

export function KpiCards({ kpi }: { kpi: Kpi }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Program progress */}
      <KpiCard
        media={
          <Donut percent={kpi.program_progress} size={64} strokeWidth={7}>
            <span className="text-[13px] font-semibold text-ink-900">
              {kpi.program_progress}%
            </span>
          </Donut>
        }
        label="Program Progress"
        primary={`${kpi.program_progress}%`}
        sub="Overall progress"
      />

      <KpiCard
        media={<IconBubble><Flame className="size-5 text-rose-600" strokeWidth={2} fill="currentColor" /></IconBubble>}
        label="Daily Streak"
        primary={String(kpi.daily_streak)}
        sub="days in a row"
      />

      <KpiCard
        media={<IconBubble><PlayCircle className="size-5 text-rose-600" strokeWidth={1.6} /></IconBubble>}
        label="Videos Watched"
        primary={String(kpi.videos_watched)}
        sub="total videos"
      />

      <KpiCard
        media={<IconBubble><TrendingUp className="size-5 text-rose-600" strokeWidth={2} /></IconBubble>}
        label="Weekly Progress"
        primary={`${kpi.weekly_progress}%`}
        sub={
          <span className="inline-flex items-center gap-0.5 text-success text-[11.5px] font-medium">
            <ArrowUp className="size-3" strokeWidth={2.5} />
            {kpi.weekly_progress_delta}% vs last week
          </span>
        }
      />

      <KpiCard
        media={<IconBubble><CheckCircle2 className="size-5 text-rose-600" strokeWidth={1.8} /></IconBubble>}
        label="Tasks Completed"
        primary={String(kpi.tasks_completed)}
        sub={`of ${kpi.tasks_total} tasks`}
      />
    </section>
  );
}

function IconBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="size-12 rounded-full bg-rose-100/70 flex items-center justify-center">
      {children}
    </div>
  );
}

function KpiCard({
  media,
  label,
  primary,
  sub,
}: {
  media: React.ReactNode;
  label: string;
  primary: string;
  sub: React.ReactNode;
}) {
  return (
    <div className="card p-4 flex items-center gap-3.5">
      <div className="shrink-0">{media}</div>
      <div className="min-w-0">
        <div className="text-[12px] text-ink-500 font-medium leading-tight mb-1">
          {label}
        </div>
        <div className="text-[22px] font-semibold text-ink-900 leading-none mb-1">
          {primary}
        </div>
        <div className="text-[11.5px] text-ink-500">{sub}</div>
      </div>
    </div>
  );
}
