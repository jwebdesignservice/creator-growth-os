import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { ErrorsMetricCards } from "@/components/dev-dashboard/sections/errors/errors-metric-cards";
import { ErrorsFilterBar } from "@/components/dev-dashboard/sections/errors/errors-filter-bar";
import { ErrorTrendsCard } from "@/components/dev-dashboard/sections/errors/error-trends-card";
import { SeverityBreakdownCard } from "@/components/dev-dashboard/sections/errors/severity-breakdown-card";
import { TopAffectedServicesCard } from "@/components/dev-dashboard/sections/errors/top-affected-services-card";
import { HighestImpactErrorCard } from "@/components/dev-dashboard/sections/errors/highest-impact-error-card";
import { GroupedErrorsTable } from "@/components/dev-dashboard/sections/errors/grouped-errors-table";
import { ActiveIncidentsCard } from "@/components/dev-dashboard/sections/errors/active-incidents-card";
import { LatestStackTraceCard } from "@/components/dev-dashboard/sections/errors/latest-stack-trace-card";
import { CreateAlertRuleModal } from "@/components/dev-dashboard/sections/errors/create-alert-rule-modal";
import { ExportLogsButton } from "@/components/dev-dashboard/sections/errors/export-logs-button";
import { StackTraceModalProvider } from "@/components/dev-dashboard/sections/errors/stack-trace-modal";
import { parseErrorsFilters, type ErrorsRawSearchParams } from "@/lib/dev-dashboard/errors-filters";
import {
  getActiveIncidents,
  getErrorTrends,
  getErrorsList,
  getErrorsMetrics,
  getHighestImpactError,
  getLatestStackTrace,
  getSeverityBreakdown,
  getStackTraceForError,
  getTopAffectedServices,
} from "@/lib/dev-dashboard/errors-queries";

export const metadata = { title: "Errors · Dev Dashboard" };

type PageProps = {
  searchParams: Promise<ErrorsRawSearchParams>;
};

export default async function DevErrorsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseErrorsFilters(raw);

  // Fetch everything in parallel — these are independent reads.
  const [
    metrics,
    errorsList,
    trends,
    severity,
    topServices,
    highestImpact,
    incidents,
    latestTrace,
  ] = await Promise.all([
    getErrorsMetrics(filters),
    getErrorsList(filters),
    getErrorTrends(filters),
    getSeverityBreakdown(filters),
    getTopAffectedServices(filters),
    getHighestImpactError(),
    getActiveIncidents(),
    getLatestStackTrace(),
  ]);

  // Once we have the top error, also fetch its trace if available — fall
  // back to the global latest trace if no per-error trace is stored.
  const highestImpactTrace =
    (await getStackTraceForError(highestImpact.id)) ?? latestTrace;

  return (
    <StackTraceModalProvider>
      <div className="space-y-5">
        <DevPageHeader
          title="Errors"
          subtitle="Monitor application failures, severity trends, affected systems, and incident impact in real time."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <CreateAlertRuleModal />
              <ExportLogsButton />
            </div>
          }
        />

        <ErrorsMetricCards data={metrics} />
        <ErrorsFilterBar />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-9 space-y-4 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ErrorTrendsCard data={trends} />
              <SeverityBreakdownCard data={severity} />
              <TopAffectedServicesCard data={topServices} />
            </div>
            <GroupedErrorsTable
              rows={errorsList.rows}
              total={errorsList.total}
              totalPages={errorsList.totalPages}
              filters={filters}
            />
          </div>

          <div className="xl:col-span-3 space-y-4 min-w-0">
            <HighestImpactErrorCard data={highestImpact} trace={highestImpactTrace} />
            <ActiveIncidentsCard data={incidents} />
            <LatestStackTraceCard data={latestTrace} />
          </div>
        </div>
      </div>
    </StackTraceModalProvider>
  );
}
