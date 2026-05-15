"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Sparkles, ArrowRight } from "lucide-react";
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

type Props = {
  missions: Mission[];
  /** Server action that toggles completion. Return value is ignored. */
  onToggle: (id: string, completed: boolean) => Promise<unknown>;
};

export function MissionsBoard({ missions, onToggle }: Props) {
  const [tab, setTab] = useState<Tab>("today");
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

  return (
    <div className="space-y-6">
      {/* KPI tiles */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile
          label="Today's Progress"
          primary={
            <Donut percent={todayProgressPct} size={48} strokeWidth={6}>
              <span className="text-[11px] font-semibold text-ink-900">
                {todayProgressPct}%
              </span>
            </Donut>
          }
          sub={`${counts.completed} / ${counts.total} done`}
          mediaIsLeft
        />
        <KpiTile
          label="Daily Streak"
          icon="🔥"
          primary={<Stat>12</Stat>}
          sub="days in a row"
        />
        <KpiTile
          label="Points Today"
          icon="⭐"
          primary={
            <Stat>
              {missions
                .filter((m) => m.completed)
                .reduce((sum, m) => sum + m.points, 0)}
            </Stat>
          }
          sub="earned"
        />
        <KpiTile
          label="This Week"
          icon="📈"
          primary={<Stat>18 / 26</Stat>}
          sub="missions"
        />
        <KpiTile
          label="Active Challenge"
          icon="🏆"
          primary={<Stat>3 / 7</Stat>}
          sub="7-Day Posting"
        />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

function KpiTile({
  label,
  primary,
  sub,
  icon,
  mediaIsLeft,
}: {
  label: string;
  primary: React.ReactNode;
  sub: React.ReactNode;
  icon?: string;
  mediaIsLeft?: boolean;
}) {
  return (
    <div className={cn("card p-4 flex gap-3", mediaIsLeft ? "items-center" : "flex-col")}>
      {mediaIsLeft ? (
        <>
          <div className="shrink-0">{primary}</div>
          <div className="min-w-0">
            <div className="text-[11.5px] text-ink-500 font-medium leading-tight mb-1">
              {label}
            </div>
            <div className="text-[11.5px] text-ink-500">{sub}</div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-500 font-medium">
            {icon && <span aria-hidden>{icon}</span>}
            {label}
          </div>
          <div>{primary}</div>
          <div className="text-[11px] text-ink-500">{sub}</div>
        </>
      )}
    </div>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[22px] font-semibold text-ink-900 leading-none">
      {children}
    </span>
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

function ChallengeBanner() {
  return (
    <section className="rounded-[24px] bg-cream-200 overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_220px] gap-6 p-6 lg:p-8">
        <div>
          <span className="chip chip-rose mb-3">
            🏆 Active Challenge · Day 3 of 7
          </span>
          <h3 className="font-display text-[28px] text-ink-900 leading-tight mb-2">
            7-Day Posting Challenge
          </h3>
          <p className="text-ink-500 text-[13.5px] max-w-md mb-4">
            Post once per day for 7 days, log your performance, and capture a
            short reflection. Build the habit, win the badge.
          </p>
          <div className="flex items-center gap-2 mb-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  i < 3 ? "bg-rose-500" : "bg-cream-300",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium cursor-pointer transition-colors"
          >
            Continue Challenge
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-rose-100/60 flex items-center justify-center">
            <span className="text-5xl" aria-hidden>
              🏆
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
