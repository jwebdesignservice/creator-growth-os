import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  getEntryForWeek,
  getRecentEntries,
  computeKpiTiles,
  getLoggingStreak,
  mondayOfWeek,
  addWeeks,
} from "@/lib/performance/queries";
import { PerformanceKpiTiles } from "@/components/performance/kpi-tiles";
import { ConnectSocialCard } from "@/components/performance/connect-social-card";
import { PerformanceEntryForm } from "@/components/performance/entry-form";
import { TrendChart } from "@/components/performance/trend-chart";
import { BestPostsJournal } from "@/components/performance/journal";
import { PerformanceRail } from "@/components/performance/rail";

export const metadata = { title: "Performance · Creator Growth OS" };

type Search = Promise<{ week?: string }>;

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const sp = await searchParams;
  const currentMonday = mondayOfWeek();
  const week = /^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? "")
    ? (sp.week as string)
    : currentMonday;
  const isCurrentWeek = week === currentMonday;

  const [entry, recent] = await Promise.all([
    getEntryForWeek(week),
    getRecentEntries(12),
  ]);

  const tiles = computeKpiTiles(recent);
  const streak = getLoggingStreak(recent);

  const latest = recent[0];
  const prev = recent[1];
  const snapshot = [
    { label: "Followers", value: formatCompact(latest?.followers) },
    { label: "Reach", value: formatCompact(latest?.reach) },
    { label: "Posts", value: latest?.posts_published?.toString() ?? "—" },
    {
      label: "Engagement",
      value:
        latest?.engagement_rate != null
          ? `${latest.engagement_rate.toFixed(1)}%`
          : "—",
    },
    {
      label: "Clicks",
      value: latest?.clicks?.toString() ?? "—",
    },
  ];

  const insights = computeInsights(latest, prev);
  const firstName = ctx.name.split(" ")[0];

  return (
    <PageShell
      rail={
        <PerformanceRail
          plan={ctx.plan}
          streak={streak}
          snapshot={snapshot}
          insights={insights}
        />
      }
    >
      <div className="space-y-7 container-app">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
              <Sparkles className="size-4" strokeWidth={2} />
              Welcome back, {firstName}!
            </div>
            <h1 className="text-h1 text-ink-900 mb-1">
              Performance
            </h1>
            <p className="text-ink-500 text-[14px]">
              Track what&apos;s working. Tune what&apos;s not.
            </p>
          </div>
        </header>

        {/* KPI tiles */}
        <PerformanceKpiTiles tiles={tiles} plan={ctx.plan} />

        {/* Connect Social Accounts — frontend-only placeholder card */}
        <ConnectSocialCard />

        {/* Weekly entry form */}
        <PerformanceEntryForm
          entry={entry}
          plan={ctx.plan}
          weekStart={week}
          prevWeek={addWeeks(week, -1)}
          nextWeek={addWeeks(week, 1)}
          isCurrentWeek={isCurrentWeek}
        />

        {/* Trend + Journal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          <TrendChart entries={recent} />
          <BestPostsJournal entries={recent} />
        </div>
      </div>
    </PageShell>
  );
}

type Latest = { followers: number | null; reach: number | null; engagement_rate: number | null; posts_published: number | null } | undefined;

function computeInsights(latest: Latest, prev: Latest) {
  if (!latest || !prev) return [];
  const candidates: { label: string; current: number; previous: number; format: (n: number) => string }[] = [
    {
      label: "Followers",
      current: latest.followers ?? 0,
      previous: prev.followers ?? 0,
      format: formatNumber,
    },
    {
      label: "Reach",
      current: latest.reach ?? 0,
      previous: prev.reach ?? 0,
      format: formatNumber,
    },
    {
      label: "Engagement",
      current: latest.engagement_rate ?? 0,
      previous: prev.engagement_rate ?? 0,
      format: (n) => `${n.toFixed(1)}%`,
    },
  ];
  return candidates
    .filter((c) => c.previous > 0)
    .map((c) => ({
      label: c.label,
      primary: c.format(c.current),
      delta: Math.round(((c.current - c.previous) / c.previous) * 100),
    }))
    .filter((c) => c.delta !== 0)
    .slice(0, 3);
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatCompact(n: number | null | undefined) {
  if (n == null) return "—";
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000)
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}
