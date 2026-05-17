import { Settings } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { SystemHealthStrip } from "@/components/dev-dashboard/sections/system-health-strip";
import { MetricCards } from "@/components/dev-dashboard/sections/metric-cards";
import { CriticalAlertsCard } from "@/components/dev-dashboard/sections/critical-alerts-card";
import { ErrorsCard } from "@/components/dev-dashboard/sections/errors-card";
import { TopErrorCard } from "@/components/dev-dashboard/sections/top-error-card";
import { UsageOverviewCard } from "@/components/dev-dashboard/sections/usage-overview-card";
import { DatabaseHealthCard } from "@/components/dev-dashboard/sections/database-health-card";
import { DeploymentStatusCard } from "@/components/dev-dashboard/sections/deployment-status-card";
import { QaReadinessCard } from "@/components/dev-dashboard/sections/qa-readiness-card";
import { RecentLogsTable } from "@/components/dev-dashboard/sections/recent-logs-table";

export const metadata = { title: "Overview · Dev Dashboard" };

export default function DevOverviewPage() {
  return (
    <div className="space-y-[var(--mobile-section-gap)] sm:space-y-5">
      <DevPageHeader
        title="Overview"
        subtitle="Real-time system health and key metrics"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
          >
            <Settings className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.8} />
            Configure Dashboard
          </button>
        }
      />

      {/* 1. System health strip — overall + 7 service tiles */}
      <SystemHealthStrip />

      {/* 2. Key metric cards — 6 tiles auto-fit */}
      <MetricCards />

      {/* 3–5. Critical Alerts + Errors (24h) + Top Error */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--mobile-grid-gap)] sm:gap-4">
        <CriticalAlertsCard />
        <ErrorsCard />
        <TopErrorCard />
      </section>

      {/* 6–9. Usage Overview (wide) + DB + Deployment + QA.
            12-col grid at md+ so Usage can take the full row at tablet
            (md:col-span-6) and shrink to ~42% at xl. The three small cards
            arrange as 2 + 2 + 3 cols within the same row at xl, and as a
            single 3-up row at md (each col-span-2). */}
      <section className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-[var(--mobile-grid-gap)] sm:gap-4">
        <div className="md:col-span-6 xl:col-span-5">
          <UsageOverviewCard />
        </div>
        <div className="md:col-span-2 xl:col-span-2">
          <DatabaseHealthCard />
        </div>
        <div className="md:col-span-2 xl:col-span-2">
          <DeploymentStatusCard />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <QaReadinessCard />
        </div>
      </section>

      {/* 10. Recent Logs */}
      <RecentLogsTable />
    </div>
  );
}
