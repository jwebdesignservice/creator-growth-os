import Link from "next/link";
import { Fragment } from "react";
import {
  Target,
  Flame,
  Star,
  BarChart3,
  Shield,
  Check,
  CalendarDays,
  FileText,
  ChevronRight,
  ArrowRight,
  Award,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Donut } from "@/components/dashboard/donut";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import { cn } from "@/lib/cn";

/**
 * Mission Activity tab — the premium "gamification" view: a 14-day activity
 * chart with headline stats, the streak / points / progress stat cards, and
 * the active challenge. Server-rendered + presentational.
 */

export type ActivityDay = {
  /** Short weekday letter (e.g. "M"). */
  weekday: string;
  /** Full label for the tooltip (e.g. "Mon 3 Jun"). */
  fullLabel: string;
  count: number;
  isToday: boolean;
};

type Props = {
  series: ActivityDay[];
  weekTotal: number;
  streakCurrent: number;
  streakLast7: { weekday: string; done: boolean }[];
  points: number;
  completedCount: number;
  totalCount: number;
  progressPct: number;
};

export function MissionActivity({
  series,
  weekTotal,
  streakCurrent,
  streakLast7,
  points,
  completedCount,
  totalCount,
  progressPct,
}: Props) {
  // Challenge progress — derived from the real daily-completion streak
  // (consecutive active days, capped at the challenge length), not a
  // hardcoded placeholder.
  const challengeDays = Math.min(streakCurrent, CHALLENGE_TOTAL_DAYS);

  return (
    <div className="space-y-5">
      <WorkspaceHeader title="Mission Activity" />

      <ActivityChart series={series} weekTotal={weekTotal} streakCurrent={streakCurrent} />

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<Target className="size-4 text-rose-500" strokeWidth={2} />}
          label="Today's Progress"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-1">
            <Donut percent={progressPct} size={72} strokeWidth={8}>
              <span className="text-[15px] font-bold text-ink-900">
                {progressPct}%
              </span>
            </Donut>
            <span className="text-[11.5px] text-ink-500">
              {completedCount} of {totalCount} done
            </span>
          </div>
        </StatCard>

        <StatCard
          icon={
            <Flame
              className="size-4 text-rose-500"
              fill="currentColor"
              strokeWidth={1.6}
            />
          }
          label="Daily Streak"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[32px] font-bold text-rose-600 leading-none">
              {streakCurrent}
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">
              {streakCurrent === 1 ? "day in a row" : "days in a row"}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 mt-3">
            {streakLast7.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "size-5 rounded-full inline-flex items-center justify-center",
                    d.done
                      ? "bg-rose-500 text-white"
                      : "bg-cream-200 text-transparent",
                  )}
                >
                  {d.done && <Check className="size-[11px]" strokeWidth={3} />}
                </span>
                <span className="text-[9px] font-semibold text-ink-400 uppercase">
                  {d.weekday}
                </span>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard
          icon={<Star className="size-4 text-rose-500" strokeWidth={2} />}
          label="Points Today"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[32px] font-bold text-ink-900 leading-none">
              {points}
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">points earned</span>
          </div>
          <div className="mt-3 w-full flex items-center justify-center gap-1.5 h-8 px-3 rounded-full border border-rose-200 text-rose-600 text-[11px] font-semibold whitespace-nowrap">
            <Star className="size-3 shrink-0" fill="currentColor" strokeWidth={0} />
            Keep it up
          </div>
        </StatCard>

        <StatCard
          icon={<BarChart3 className="size-4 text-rose-500" strokeWidth={2} />}
          label="This Week"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[32px] font-bold text-rose-600 leading-none tabular-nums">
              {weekTotal}
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">
              missions completed
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-ink-500">
            <TrendingUp className="size-3.5 text-rose-500" strokeWidth={2} />
            Last 7 days
          </div>
        </StatCard>

        <StatCard
          icon={<Shield className="size-4 text-rose-500" strokeWidth={2} />}
          label="Active Challenge"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[26px] font-bold text-rose-600 leading-none">
              {challengeDays} / {CHALLENGE_TOTAL_DAYS}
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">days completed</span>
          </div>
          <div className="mt-3">
            <div className="h-2 rounded-full bg-cream-200 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{
                  width: `${Math.round(
                    (challengeDays / CHALLENGE_TOTAL_DAYS) * 100,
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10.5px] text-ink-500">
              7-Day Posting Challenge
            </span>
          </div>
        </StatCard>
      </section>

      <ChallengeBanner completedDays={challengeDays} />
    </div>
  );
}

/* ─── Premium activity chart ──────────────────────────────────────────── */

function ActivityChart({
  series,
  weekTotal,
  streakCurrent,
}: {
  series: ActivityDay[];
  weekTotal: number;
  streakCurrent: number;
}) {
  const max = Math.max(1, ...series.map((d) => d.count));
  const total = series.reduce((sum, d) => sum + d.count, 0);
  const best = Math.max(0, ...series.map((d) => d.count));

  return (
    <section className="card rounded-[20px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Activity className="size-[18px]" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold text-ink-900 leading-tight">
              Daily activity
            </h3>
            <p className="text-[12px] text-ink-500">Last {series.length} days</p>
          </div>
        </div>

        {/* Headline stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <SummaryStat icon={Flame} value={`${streakCurrent}d`} label="Streak" />
          <SummaryStat icon={TrendingUp} value={String(weekTotal)} label="This week" />
          <SummaryStat icon={BarChart3} value={String(best)} label="Best day" />
          <SummaryStat icon={Star} value={String(total)} label="Total" />
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5 sm:gap-2 h-40">
        {series.map((d, i) => (
          <div
            key={i}
            className="group flex-1 flex flex-col items-center justify-end gap-2 h-full"
          >
            <div className="relative w-full flex-1 flex items-end justify-center">
              {d.count > 0 && (
                <span className="absolute -top-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-ink-700 tabular-nums">
                  {d.count}
                </span>
              )}
              <div
                title={`${d.fullLabel}: ${d.count} ${d.count === 1 ? "mission" : "missions"}`}
                className={cn(
                  "w-full rounded-t-md transition-all",
                  d.count > 0
                    ? "bg-gradient-to-t from-rose-500 to-rose-300"
                    : "bg-cream-200",
                  d.isToday && "ring-2 ring-rose-300 ring-offset-1",
                )}
                style={{ height: `${(d.count / max) * 100 + 4}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[9.5px] font-medium",
                d.isToday ? "text-rose-600 font-semibold" : "text-ink-400",
              )}
            >
              {d.weekday}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-full bg-cream-100 border border-ink-100">
      <Icon className="size-3.5 text-rose-500 shrink-0" strokeWidth={2} />
      <span className="text-[12.5px] font-bold text-ink-900 tabular-nums leading-none">
        {value}
      </span>
      <span className="text-[11px] text-ink-500 leading-none">{label}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 flex flex-col">
      <div className="flex items-center gap-1.5 mb-2.5">
        {icon}
        <span className="text-[12.5px] font-semibold text-ink-700">{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── 7-Day Challenge banner (moved from the missions board) ──────────── */

const CHALLENGE_TOTAL_DAYS = 7;

function ChallengeBanner({ completedDays }: { completedDays: number }) {
  const total = CHALLENGE_TOTAL_DAYS;
  const completed = completedDays;
  const daysLeft = Math.max(0, total - completed);
  const days = Array.from({ length: total }, (_, i) => ({
    n: i + 1,
    done: i < completed,
  }));

  return (
    <section className="card rounded-[24px] p-5 sm:p-7 lg:p-8">
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <span className="chip chip-rose inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-rose-500" aria-hidden />
            Active Challenge · {completed} of {total} days
          </span>

          <h3 className="text-h2 sm:text-[32px] text-ink-900 leading-tight mt-3 mb-2">
            7-Day Posting Challenge
          </h3>
          <p className="text-ink-500 text-[13.5px] leading-relaxed max-w-xl">
            Post once per day for 7 days, log your performance, and capture a
            short reflection. Build the habit, win the badge.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[13px] font-semibold text-ink-900">
                Your progress
              </span>
              <span className="text-[13px] font-medium text-rose-600 tabular-nums">
                {completed} of {total} days completed
              </span>
            </div>

            <div className="flex items-start">
              {days.map((d, i) => (
                <Fragment key={d.n}>
                  {i > 0 && (
                    <div
                      className={cn(
                        "flex-1 h-[2px] mt-[15px] sm:mt-[17px] rounded-full",
                        d.done ? "bg-rose-500" : "bg-cream-300",
                      )}
                      aria-hidden
                    />
                  )}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center size-8 sm:size-9 rounded-full text-[12.5px] font-semibold tabular-nums transition-colors",
                        d.done
                          ? "bg-rose-500 text-white"
                          : "bg-cream-100 border border-cream-300 text-ink-400",
                      )}
                    >
                      {d.done ? <Check className="size-4" strokeWidth={3} /> : d.n}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] sm:text-[12px] font-medium whitespace-nowrap",
                        d.done ? "text-rose-600" : "text-ink-400",
                      )}
                    >
                      Day {d.n}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 lg:border-l lg:border-cream-200 lg:pl-8">
          <TrophyBadge />
          <div className="w-full inline-flex items-center gap-2.5 rounded-[14px] bg-rose-50 border border-rose-100 px-4 py-3">
            <Award
              className="size-5 text-rose-500 shrink-0"
              strokeWidth={1.8}
              aria-hidden
            />
            <span className="text-[13px] font-medium text-ink-700 leading-snug">
              Consistency today, impact tomorrow.
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-200 mt-7 pt-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Link
              href="/missions?tab=tasks"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors"
            >
              <CalendarDays className="size-4" strokeWidth={2} />
              Continue Challenge
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
            <Link
              href="/missions?tab=tasks"
              className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
            >
              <FileText className="size-4 text-ink-500" strokeWidth={1.8} />
              View challenge details
              <ChevronRight className="size-4 text-ink-400" strokeWidth={2} />
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <CalendarDays className="size-5 text-rose-500 shrink-0" strokeWidth={2} />
            <div className="leading-tight">
              <div className="text-[13.5px] font-semibold text-ink-900 whitespace-nowrap">
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left
              </div>
              <div className="text-[12px] text-ink-500 whitespace-nowrap">
                Stay consistent
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Illustrated trophy badge — gold cup + maroon plinth with a star, soft
   laurel leaves, and confetti, on a rose disc. Inline SVG so it renders
   identically across platforms. Purely decorative. */
function TrophyBadge() {
  return (
    <div className="inline-flex items-center justify-center size-32 rounded-full bg-rose-100/50 overflow-hidden">
      <svg viewBox="0 0 120 120" className="size-[112px]" fill="none" aria-hidden>
        <defs>
          <linearGradient id="trophyGold" x1="40" y1="26" x2="80" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8DD86" />
            <stop offset="0.55" stopColor="#E7B044" />
            <stop offset="1" stopColor="#D2952B" />
          </linearGradient>
          <linearGradient id="trophyBase" x1="44" y1="78" x2="76" y2="94" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7E4A57" />
            <stop offset="1" stopColor="#5C3540" />
          </linearGradient>
        </defs>

        <g fill="#A9C29A">
          <ellipse cx="33" cy="88" rx="6.5" ry="3" transform="rotate(-38 33 88)" />
          <ellipse cx="39" cy="81" rx="6" ry="2.8" transform="rotate(-22 39 81)" />
          <ellipse cx="44" cy="75" rx="5.2" ry="2.5" transform="rotate(-10 44 75)" />
          <ellipse cx="87" cy="88" rx="6.5" ry="3" transform="rotate(38 87 88)" />
          <ellipse cx="81" cy="81" rx="6" ry="2.8" transform="rotate(22 81 81)" />
          <ellipse cx="76" cy="75" rx="5.2" ry="2.5" transform="rotate(10 76 75)" />
        </g>

        <path d="M41 35 C28 35 28 53 43 53" stroke="url(#trophyGold)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M79 35 C92 35 92 53 77 53" stroke="url(#trophyGold)" strokeWidth="4.5" strokeLinecap="round" />

        <path d="M39 31 H81 V41 C81 57 71 67 60 67 C49 67 39 57 39 41 Z" fill="url(#trophyGold)" />
        <rect x="38.5" y="29.5" width="43" height="5" rx="2.5" fill="#FBE8A6" />

        <rect x="56" y="67" width="8" height="8" fill="url(#trophyGold)" />

        <path d="M47 75 H73 L77 87 H43 Z" fill="url(#trophyBase)" />
        <rect x="41" y="87" width="38" height="6" rx="3" fill="url(#trophyBase)" />

        <path
          d="M60 77.5 l1.7 3.5 3.9 .5 -2.9 2.6 .8 3.8 -3.5 -2 -3.5 2 .8 -3.8 -2.9 -2.6 3.9 -.5 Z"
          fill="#F8DD86"
        />

        <g>
          <rect x="92" y="25" width="5" height="5" rx="1.2" fill="#DD6A82" transform="rotate(22 94.5 27.5)" />
          <rect x="28" y="38" width="4.5" height="4.5" rx="1.2" fill="#E7B044" transform="rotate(-16 30 40)" />
          <rect x="95" y="55" width="4" height="4" rx="1" fill="#EAA9B7" transform="rotate(28 97 57)" />
          <rect x="30" y="25" width="4" height="4" rx="1" fill="#E7B044" transform="rotate(14 32 27)" />
          <circle cx="24" cy="60" r="2.3" fill="#A9C29A" />
          <circle cx="90" cy="41" r="2" fill="#DD6A82" />
        </g>
      </svg>
    </div>
  );
}
