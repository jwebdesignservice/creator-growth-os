import { redirect } from "next/navigation";
import { BarChart3, LayoutGrid, Share2 } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  getPerformanceOverviewEntries,
  getManualEntries,
} from "@/lib/performance/queries";
import { ConnectSocialCard } from "@/components/performance/connect-social-card";
import { AutoSyncOnMount } from "@/components/performance/auto-sync-on-mount";
import { getSocialConnections } from "@/lib/social/queries";
import { WeeklyOverview } from "@/components/performance/weekly-overview";
import { PerformanceManualEntry } from "@/components/performance/manual-entry";
import {
  WorkspaceShell,
  WorkspaceHeader,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";

export const metadata = { title: "Performance · Creator Growth OS" };

type PerformanceTab = "overview" | "accounts";

const VALID_TABS: PerformanceTab[] = ["overview", "accounts"];

const PERFORMANCE_TABS: WorkspaceTab[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid, href: "/performance" },
  {
    key: "accounts",
    label: "Accounts",
    icon: Share2,
    href: "/performance?tab=accounts",
  },
];

type SearchParams = Promise<{ tab?: string }>;

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { tab } = await searchParams;
  const active: PerformanceTab = VALID_TABS.includes(tab as PerformanceTab)
    ? (tab as PerformanceTab)
    : "overview";

  const [recent, socialConnections, manualEntries] = await Promise.all([
    getPerformanceOverviewEntries(12),
    getSocialConnections(),
    getManualEntries(12),
  ]);

  const connectedPlatforms = socialConnections
    .filter((c) => c.connectionStatus === "connected")
    .map((c) => c.label);
  const connectedConn =
    socialConnections.find((c) => c.connectionStatus === "connected") ?? null;
  const connected = connectedConn
    ? { platform: connectedConn.platform, label: connectedConn.label }
    : null;

  return (
    <PageShell>
      <WorkspaceShell
        title="Performance"
        icon={BarChart3}
        tabs={PERFORMANCE_TABS}
        activeKey={active}
      >
        {/* Silently re-syncs any connected platform whose last_synced_at is
            older than 6h, so users see fresh numbers without clicking. Runs on
            either tab. */}
        <AutoSyncOnMount connections={socialConnections} />

        {active === "overview" && (
          <div className="space-y-4">
            <WorkspaceHeader title="Overview" />
            <WeeklyOverview
              entries={recent}
              platforms={connectedPlatforms}
              connected={connected}
            />
            <PerformanceManualEntry entries={manualEntries} />
          </div>
        )}

        {active === "accounts" && (
          <div className="space-y-4">
            <WorkspaceHeader title="Accounts" />
            <ConnectSocialCard connections={socialConnections} />
          </div>
        )}
      </WorkspaceShell>
    </PageShell>
  );
}
