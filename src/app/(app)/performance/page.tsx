import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  getRecentEntries,
  computeKpiTiles,
  getLoggingStreak,
} from "@/lib/performance/queries";
import { PerformanceKpiTiles } from "@/components/performance/kpi-tiles";
import { ConnectSocialCard } from "@/components/performance/connect-social-card";
import { AutoSyncOnMount } from "@/components/performance/auto-sync-on-mount";
import { getSocialConnections } from "@/lib/social/queries";
import { TrendChart } from "@/components/performance/trend-chart";
import { PerformanceRail } from "@/components/performance/rail";

export const metadata = { title: "Performance · Creator Growth OS" };

export default async function PerformancePage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const [recent, socialConnections] = await Promise.all([
    getRecentEntries(12),
    getSocialConnections(),
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

        {/* Connect Social Accounts — real OAuth flow */}
        <ConnectSocialCard connections={socialConnections} />

        {/* Silently re-syncs any connected platform whose last_synced_at
            is older than 6h, so users see fresh numbers without clicking. */}
        <AutoSyncOnMount connections={socialConnections} />

        {/* Trend */}
        <TrendChart entries={recent} />
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
