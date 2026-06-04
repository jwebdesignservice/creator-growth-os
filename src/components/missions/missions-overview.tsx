import Link from "next/link";
import {
  Sparkles,
  CalendarDays,
  ArrowRight,
  Flame,
  Star,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import { TodayFocusTable } from "./today-focus-table";
import type { Mission } from "./mission-card";

/**
 * Overview tab — a concise landing for the Tasks page: today's progress at a
 * glance, a short preview of today's open missions, and a teaser into the
 * Mission Activity tab. The full list lives in Tasks; the full stats +
 * challenge live in Mission Activity. Server-rendered.
 */

type Props = {
  firstName: string;
  formattedDate: string;
  completedCount: number;
  totalCount: number;
  points: number;
  progressPct: number;
  weekTotal: number;
  streakCurrent: number;
  todayFocus: Mission[];
};

export function MissionsOverview({
  firstName,
  formattedDate,
  completedCount,
  totalCount,
  points,
  progressPct,
  weekTotal,
  streakCurrent,
  todayFocus,
}: Props) {
  const openToday = Math.max(0, totalCount - completedCount);

  return (
    <div className="space-y-4">
      <WorkspaceHeader title="Overview" />

      {/* Hero summary */}
      <section className="card rounded-[20px] p-5 sm:p-6">
        <div className="text-rose-600 font-medium text-[13px] mb-1.5 flex items-center gap-1.5">
          <Sparkles className="size-4" strokeWidth={2} />
          Welcome back, {firstName}!
        </div>
        <h2 className="text-[22px] sm:text-[26px] font-semibold text-ink-900 leading-tight">
          {openToday > 0
            ? `You have ${openToday} ${openToday === 1 ? "mission" : "missions"} left today`
            : "You're all caught up today 🎉"}
        </h2>
        <p className="text-[13px] text-ink-500 mt-1 flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-ink-400" strokeWidth={2} />
          {formattedDate}
        </p>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12.5px] font-medium text-ink-600">
              Today&apos;s progress
            </span>
            <span className="text-[12.5px] font-semibold text-ink-900 tabular-nums">
              {completedCount}/{totalCount} done
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <QuickStat
            icon={<Flame className="size-4 text-rose-500" fill="currentColor" strokeWidth={1.6} />}
            value={`${streakCurrent}`}
            label="day streak"
          />
          <QuickStat
            icon={<Star className="size-4 text-rose-500" strokeWidth={2} />}
            value={`${points}`}
            label="points today"
          />
          <QuickStat
            icon={<CheckCircle2 className="size-4 text-rose-500" strokeWidth={2} />}
            value={`${weekTotal}`}
            label="this week"
          />
        </div>
      </section>

      {/* Today's focus */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-ink-900">
            Today&apos;s focus
          </h3>
          <Link
            href="/missions?tab=tasks"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
          >
            View all tasks
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>

        {todayFocus.length === 0 ? (
          <div className="card rounded-[16px] p-8 text-center">
            <div className="inline-flex items-center justify-center size-11 rounded-full bg-rose-100 text-rose-600 mb-2.5">
              <Sparkles className="size-5" strokeWidth={1.8} />
            </div>
            <p className="text-[13.5px] text-ink-600">
              No open missions right now — nice work staying on top of it.
            </p>
          </div>
        ) : (
          <TodayFocusTable tasks={todayFocus} />
        )}
      </section>

      {/* Activity teaser */}
      <Link
        href="/missions?tab=activity"
        className="card rounded-[20px] p-5 flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-0.5"
      >
        <span className="size-11 rounded-[14px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Activity className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold text-ink-900">
            Mission Activity
          </div>
          <p className="text-[12.5px] text-ink-500 leading-snug">
            See your streak, points, weekly activity and the 7-Day Challenge.
          </p>
        </div>
        <ArrowRight className="size-[18px] text-ink-400 shrink-0" strokeWidth={2} />
      </Link>
    </div>
  );
}

function QuickStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[14px] border border-ink-100 bg-cream-50 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5">
        {icon}
        <span className="text-[20px] font-bold text-ink-900 leading-none tabular-nums">
          {value}
        </span>
      </div>
      <div className="text-[11px] text-ink-500 mt-1">{label}</div>
    </div>
  );
}
