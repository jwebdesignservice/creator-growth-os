import Link from "next/link";
import {
  Sparkles,
  CalendarDays,
  Flame,
  Star,
  CheckCircle2,
  Activity,
  ListChecks,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import { ProgressRing } from "@/components/ui/progress-ring";
import { TodayFocusTable } from "./today-focus-table";
import type { Mission } from "./mission-card";

/**
 * Overview tab — same two-card template as the Posting "My Plans" page.
 *
 * Card 1 (hero): identity row (art tile · serif headline · status chip · one
 * quiet meta line) with actions on the right, then a single progress strip —
 * animated ring, segmented done/open bar with caption + legend, and the next
 * open mission inline. Card 2: the Today's focus table. Server-rendered.
 */

type Props = {
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
  const allDone = totalCount > 0 && openToday === 0;
  const nextMission = todayFocus[0] ?? null;

  // Same status-chip language as the posting hero.
  const status =
    totalCount === 0
      ? { label: "No Tasks", cls: "bg-ink-100 text-ink-500" }
      : allDone
        ? { label: "Complete", cls: "bg-emerald-100 text-emerald-700" }
        : { label: "On Track", cls: "bg-rose-100 text-rose-700" };

  // Two-phase pipeline: completed vs still open. Same segmented-pill bar +
  // legend treatment as the posting hero, with counts that sum to the total.
  const phases = [
    { key: "done", label: "Done", count: completedCount, bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-600" },
    { key: "open", label: "Open", count: openToday, bar: "bg-ink-300", dot: "bg-ink-400", text: "text-ink-600" },
  ];
  const livePhases = phases.filter((p) => p.count > 0);

  return (
    <div className="space-y-4">
      <WorkspaceHeader title="Overview" />

      {/* Two clearly separate cards — today's summary, then the focus table —
          floating on the cream page background. */}
      <div className="space-y-5 pt-1 pb-4">
        {/* ── Hero card ───────────────────────────────────────────────── */}
        <section className="card overflow-hidden lg:shrink-0">
          <div className="p-5 sm:p-6">
            {/* Row 1 — identity · actions */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="hidden sm:block relative size-14 shrink-0 rounded-[14px] overflow-hidden bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/50">
                  <TasksArt />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-display text-[22px] sm:text-[24px] text-ink-900 leading-tight">
                      {totalCount === 0
                        ? "No missions assigned yet"
                        : allDone
                          ? "You're all caught up today 🎉"
                          : `You have ${openToday} ${openToday === 1 ? "mission" : "missions"} left today`}
                    </h2>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 h-[20px] rounded-full text-[10px] font-bold uppercase tracking-[0.1em] shrink-0",
                        status.cls,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  {/* One quiet meta line — date + the old quick-stat trio */}
                  <div className="flex items-center gap-x-3.5 gap-y-1 flex-wrap mt-1.5 text-[12.5px] text-ink-500">
                    <Meta icon={CalendarDays} label={formattedDate} />
                    <Meta icon={Flame} label={`${streakCurrent} day streak`} accent />
                    <Meta icon={Star} label={`${points} points today`} />
                    <Meta icon={CheckCircle2} label={`${weekTotal} this week`} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/missions?tab=tasks"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] border border-ink-200 bg-white text-ink-700 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
                >
                  <ListChecks className="size-4 text-rose-500" strokeWidth={2} />
                  View All Tasks
                </Link>
                <Link
                  href="/missions?tab=activity"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] border border-ink-200 bg-white text-ink-700 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
                >
                  <Activity className="size-4 text-rose-500" strokeWidth={2} />
                  Activity
                </Link>
              </div>
            </div>

            {/* Row 2 — progress strip: ring · bar + legend · next mission */}
            <div className="mt-5 pt-4 border-t border-ink-100 flex items-center gap-x-5 gap-y-3 flex-wrap">
              <ProgressRing
                pct={progressPct}
                label={`${progressPct}% of today's missions completed`}
                gradientId="taskRingGrad"
              />

              <div className="flex-1 min-w-[230px]">
                <div className="flex h-2 gap-[3px] plan-bar-fill">
                  {totalCount === 0 ? (
                    <div className="h-full w-full rounded-full bg-cream-200" />
                  ) : (
                    livePhases.map((p) => (
                      <div
                        key={p.key}
                        className={cn("h-full rounded-full", p.bar)}
                        style={{ width: `${(p.count / totalCount) * 100}%` }}
                        title={`${p.label}: ${p.count}`}
                      />
                    ))
                  )}
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-x-4 gap-y-1 flex-wrap">
                  <span className="text-[11.5px] text-ink-500">
                    {totalCount === 0
                      ? "New missions land here — check back soon."
                      : allDone
                        ? `All ${totalCount} mission${totalCount === 1 ? "" : "s"} completed — nice work!`
                        : `${completedCount} of ${totalCount} completed today`}
                  </span>
                  <div className="flex items-center gap-x-3.5 gap-y-1 flex-wrap">
                    {livePhases.map((p) => (
                      <span key={p.key} className="flex items-center gap-1.5">
                        <span className={cn("size-2 rounded-full shrink-0", p.dot)} />
                        <span className={cn("text-[13px] font-bold tabular-nums leading-none", p.text)}>
                          {p.count}
                        </span>
                        <span className="text-[11px] text-ink-500 leading-none">{p.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next mission — inline pill, tap → full task list */}
              <Link
                href="/missions?tab=tasks"
                className="group flex items-center gap-2.5 h-12 pl-2 pr-3 rounded-full border border-ink-100 bg-cream-50 hover:border-rose-200 hover:bg-rose-50/40 transition-colors min-w-0"
              >
                <span className="size-8 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                  <ListChecks className="size-3.5" strokeWidth={2} />
                </span>
                <span className="min-w-0 max-w-[260px]">
                  <span className="block text-[10px] uppercase tracking-[0.08em] text-ink-400 font-semibold leading-none">
                    Next mission
                  </span>
                  <span className="block text-[12.5px] font-semibold text-ink-900 truncate mt-0.5">
                    {nextMission ? nextMission.title : "Nothing open right now"}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 text-ink-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition shrink-0"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Today's focus card ──────────────────────────────────────── */}
        <section className="space-y-3">
          <h3 className="text-[15px] font-semibold text-ink-900">
            Today&apos;s focus
          </h3>

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
      </div>
    </div>
  );
}

/* ── Bits ──────────────────────────────────────────────────────────────── */

function Meta({
  icon: Icon,
  label,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon
        className={cn("size-3.5", accent ? "text-rose-500" : "text-ink-400")}
        strokeWidth={2}
        {...(accent ? { fill: "currentColor" } : {})}
      />
      {label}
    </span>
  );
}

/** Checklist motif in the same palette as the posting hero's calendar art. */
function TasksArt() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <circle cx="100" cy="120" r="80" fill="white" opacity="0.35" />
      {/* Clipboard */}
      <rect x="56" y="64" width="88" height="100" rx="8" fill="white" opacity="0.9" />
      <rect x="84" y="54" width="32" height="16" rx="6" fill="var(--rose-300)" />
      {/* Checklist rows — first two ticked */}
      {Array.from({ length: 3 }).map((_, i) => (
        <g key={i}>
          <rect
            x="68"
            y={88 + i * 24}
            width="14"
            height="14"
            rx="4"
            fill={i < 2 ? "var(--rose-300)" : "var(--cream-300)"}
          />
          {i < 2 && (
            <path
              d={`M71 ${95 + i * 24} l3 3 l5 -6`}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
          <rect
            x="90"
            y={91 + i * 24}
            width="42"
            height="8"
            rx="4"
            fill="var(--cream-300)"
          />
        </g>
      ))}
      {/* Leaf */}
      <path d="M40 196 C40 168 64 150 84 150 C84 178 64 196 40 196 Z" fill="var(--rose-300)" opacity="0.8" />
      <line x1="40" y1="196" x2="78" y2="158" stroke="white" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
