"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Target,
  Flame,
  Star,
  BarChart3,
  Shield,
  Check,
  CalendarDays,
  FileText,
  Award,
} from "lucide-react";
import { MissionCard, type Mission, type MissionType } from "./mission-card";
import { Donut } from "@/components/dashboard/donut";
import { cn } from "@/lib/cn";

type Tab = "today" | "week" | "all" | "completed";

const TAB_LABELS: Record<Tab, string> = {
  today: "Today",
  week: "This Week",
  all: "All Missions",
  completed: "Completed",
};

const TYPE_FILTERS: (MissionType | "all")[] = [
  "all",
  "posting",
  "strategy",
  "engagement",
  "performance",
  "monetization",
  "confidence",
];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
// Visual week-streak for the Daily Streak card — mirrors the demo 12-day streak.
const WEEK_CHECKS = [true, true, true, true, true, false, false];

type Props = {
  missions: Mission[];
  /** Server action that toggles completion. Return value is ignored. */
  onToggle: (id: string, completed: boolean) => Promise<unknown>;
  /** Initial active tab — usually wired from the URL ?tab= query. */
  defaultTab?: Tab;
};

export function MissionsBoard({
  missions,
  onToggle,
  defaultTab = "today",
}: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [typeFilter, setTypeFilter] = useState<MissionType | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const counts = useMemo(() => {
    const today = missions.filter((m) => !m.completed);
    const completed = missions.filter((m) => m.completed);
    return {
      today: today.length,
      completed: completed.length,
      total: missions.length,
    };
  }, [missions]);

  const visible = useMemo(() => {
    let rows = missions;
    if (tab === "today") rows = rows.filter((m) => !m.completed);
    if (tab === "completed") rows = rows.filter((m) => m.completed);
    if (typeFilter !== "all") rows = rows.filter((m) => m.type === typeFilter);
    return rows;
  }, [missions, tab, typeFilter]);

  const todayProgressPct = counts.total
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;

  const points = missions
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + m.points, 0);

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Today's Progress */}
        <StatCard
          icon={<Target className="size-4 text-rose-500" strokeWidth={2} />}
          label="Today's Progress"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-1">
            <Donut percent={todayProgressPct} size={72} strokeWidth={8}>
              <span className="text-[15px] font-bold text-ink-900">
                {todayProgressPct}%
              </span>
            </Donut>
            <span className="text-[11.5px] text-ink-500">
              {counts.completed} of {counts.total} done
            </span>
          </div>
        </StatCard>

        {/* Daily Streak */}
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
              12
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">days in a row</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 mt-3">
            {WEEK_CHECKS.map((done, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "size-5 rounded-full inline-flex items-center justify-center",
                    done
                      ? "bg-rose-500 text-white"
                      : "bg-cream-200 text-transparent",
                  )}
                >
                  {done && <Check className="size-[11px]" strokeWidth={3} />}
                </span>
                <span className="text-[9px] font-semibold text-ink-400 uppercase">
                  {DAY_LABELS[i]}
                </span>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Points Today */}
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

        {/* This Week */}
        <StatCard
          icon={<BarChart3 className="size-4 text-rose-500" strokeWidth={2} />}
          label="This Week"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[26px] font-bold leading-none">
              <span className="text-rose-600">18</span>
              <span className="text-ink-300"> / 26</span>
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">
              missions completed
            </span>
          </div>
          <div className="mt-3">
            <div className="grid grid-cols-10 gap-1 mb-1.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2.5 rounded-[3px]",
                    i < 7 ? "bg-rose-500" : "bg-cream-200",
                  )}
                />
              ))}
            </div>
            <span className="text-[10.5px] font-semibold text-rose-600">
              69% of weekly goal
            </span>
          </div>
        </StatCard>

        {/* Active Challenge */}
        <StatCard
          icon={<Shield className="size-4 text-rose-500" strokeWidth={2} />}
          label="Active Challenge"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[26px] font-bold text-rose-600 leading-none">
              3 / 7
            </span>
            <span className="text-[11.5px] text-ink-500 mt-1">days completed</span>
          </div>
          <div className="mt-3">
            <div className="h-2 rounded-full bg-cream-200 overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: "43%" }}
              />
            </div>
            <span className="text-[10.5px] text-ink-500">
              7-Day Posting Challenge
            </span>
          </div>
        </StatCard>
      </section>

      {/* Tabs row */}
      <div className="flex items-center gap-1.5 flex-wrap border-b border-ink-100">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => {
          const active = tab === t;
          const badge =
            t === "today"
              ? counts.today
              : t === "completed"
                ? counts.completed
                : null;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "h-10 px-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium border-b-2 -mb-px cursor-pointer transition-colors",
                active
                  ? "text-rose-700 border-rose-500"
                  : "text-ink-500 hover:text-ink-900 border-transparent",
              )}
            >
              {TAB_LABELS[t]}
              {badge !== null && badge > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-semibold",
                    active
                      ? "bg-rose-500 text-white"
                      : "bg-cream-200 text-ink-700",
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="ml-auto relative">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-100 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
          >
            <span className="capitalize">
              {typeFilter === "all" ? "All types" : typeFilter}
            </span>
            <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[160px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTypeFilter(t);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-1.5 text-[13px] capitalize cursor-pointer hover:bg-cream-100",
                    typeFilter === t ? "text-rose-700 font-semibold" : "text-ink-700",
                  )}
                >
                  {t === "all" ? "All types" : t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mission grid */}
      {visible.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {visible.map((m) => (
            <MissionCard key={m.id} mission={m} onToggle={onToggle} />
          ))}
        </div>
      )}

      {/* Weekly challenge */}
      <ChallengeBanner />
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

function EmptyState({ tab }: { tab: Tab }) {
  const copy =
    tab === "today"
      ? "All caught up — no missions remaining today. 🎉"
      : tab === "completed"
        ? "Nothing completed yet. Knock out your first mission to get the streak going."
        : "Nothing here yet. Check back soon.";
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
        <Sparkles className="size-5" strokeWidth={1.8} />
      </div>
      <p className="text-ink-700 text-[14px]">{copy}</p>
    </div>
  );
}

/* Demo challenge state — swap these two numbers for real data when the
   posting-challenge backend lands. Everything below derives from them. */
const CHALLENGE_TOTAL_DAYS = 7;
const CHALLENGE_COMPLETED_DAYS = 3;

function ChallengeBanner() {
  const total = CHALLENGE_TOTAL_DAYS;
  const completed = CHALLENGE_COMPLETED_DAYS;
  const daysLeft = Math.max(0, total - completed);
  const days = Array.from({ length: total }, (_, i) => ({
    n: i + 1,
    done: i < completed,
  }));

  return (
    <section className="card rounded-[24px] p-5 sm:p-7 lg:p-8">
      {/* ── Top: details + progress (left) · trophy + motivator (right) ── */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px]">
        {/* LEFT */}
        <div className="min-w-0">
          <span className="chip chip-rose inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-rose-500" aria-hidden />
            Active Challenge · Day {completed} of {total}
          </span>

          <h3 className="font-display text-[26px] sm:text-[32px] text-ink-900 leading-tight mt-3 mb-2">
            7-Day Posting Challenge
          </h3>
          <p className="text-ink-500 text-[13.5px] leading-relaxed max-w-xl">
            Post once per day for 7 days, log your performance, and capture a
            short reflection. Build the habit, win the badge.
          </p>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[13px] font-semibold text-ink-900">
                Your progress
              </span>
              <span className="text-[13px] font-medium text-rose-600 tabular-nums">
                {completed} of {total} days completed
              </span>
            </div>

            {/* Stepper */}
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

        {/* RIGHT — trophy + motivator, divided on lg */}
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

      {/* ── Divider + actions + stats ── */}
      <div className="border-t border-cream-200 mt-7 pt-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <Link
              href="/missions"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors"
            >
              <CalendarDays className="size-4" strokeWidth={2} />
              Continue Challenge
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
            <Link
              href="/missions"
              className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
            >
              <FileText className="size-4 text-ink-500" strokeWidth={1.8} />
              View challenge details
              <ChevronRight className="size-4 text-ink-400" strokeWidth={2} />
            </Link>
          </div>

          {/* Stat — days remaining in the challenge */}
          <div className="flex items-center">
            <ChallengeStat
              icon={<CalendarDays className="size-5 text-rose-500" strokeWidth={2} />}
              value={`${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
              sub="Stay consistent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ChallengeStat({
  icon,
  value,
  sub,
  divider,
}: {
  icon: React.ReactNode;
  value: string;
  sub: string;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        // Divider only in the single-row desktop layout; below xl the stats
        // wrap, where a leading border would look out of place.
        divider && "xl:border-l xl:border-cream-200 xl:pl-6",
      )}
    >
      <span className="shrink-0">{icon}</span>
      <div className="leading-tight">
        <div className="text-[13.5px] font-semibold text-ink-900 whitespace-nowrap">
          {value}
        </div>
        <div className="text-[12px] text-ink-500 whitespace-nowrap">{sub}</div>
      </div>
    </div>
  );
}

/* Illustrated trophy badge — gold cup + maroon plinth with a star, soft
   laurel leaves, and confetti, on a rose disc. Inline SVG so it renders
   identically across platforms (unlike the 🏆 emoji) and matches the
   reference art. Purely decorative. */
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

        {/* Laurel leaves behind the plinth */}
        <g fill="#A9C29A">
          <ellipse cx="33" cy="88" rx="6.5" ry="3" transform="rotate(-38 33 88)" />
          <ellipse cx="39" cy="81" rx="6" ry="2.8" transform="rotate(-22 39 81)" />
          <ellipse cx="44" cy="75" rx="5.2" ry="2.5" transform="rotate(-10 44 75)" />
          <ellipse cx="87" cy="88" rx="6.5" ry="3" transform="rotate(38 87 88)" />
          <ellipse cx="81" cy="81" rx="6" ry="2.8" transform="rotate(22 81 81)" />
          <ellipse cx="76" cy="75" rx="5.2" ry="2.5" transform="rotate(10 76 75)" />
        </g>

        {/* Handles */}
        <path d="M41 35 C28 35 28 53 43 53" stroke="url(#trophyGold)" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M79 35 C92 35 92 53 77 53" stroke="url(#trophyGold)" strokeWidth="4.5" strokeLinecap="round" />

        {/* Cup */}
        <path d="M39 31 H81 V41 C81 57 71 67 60 67 C49 67 39 57 39 41 Z" fill="url(#trophyGold)" />
        <rect x="38.5" y="29.5" width="43" height="5" rx="2.5" fill="#FBE8A6" />

        {/* Stem */}
        <rect x="56" y="67" width="8" height="8" fill="url(#trophyGold)" />

        {/* Plinth */}
        <path d="M47 75 H73 L77 87 H43 Z" fill="url(#trophyBase)" />
        <rect x="41" y="87" width="38" height="6" rx="3" fill="url(#trophyBase)" />

        {/* Star */}
        <path
          d="M60 77.5 l1.7 3.5 3.9 .5 -2.9 2.6 .8 3.8 -3.5 -2 -3.5 2 .8 -3.8 -2.9 -2.6 3.9 -.5 Z"
          fill="#F8DD86"
        />

        {/* Confetti */}
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
