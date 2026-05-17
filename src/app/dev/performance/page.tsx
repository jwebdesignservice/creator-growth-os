import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { PerformanceMetricCards } from "@/components/dev-dashboard/sections/performance/performance-metric-cards";
import { PerformanceFilterBar } from "@/components/dev-dashboard/sections/performance/performance-filter-bar";
import { ResponseTimeChartCard } from "@/components/dev-dashboard/sections/performance/response-time-chart-card";
import { RequestsThroughputCard } from "@/components/dev-dashboard/sections/performance/requests-throughput-card";
import { TopSlowestRoutesCard } from "@/components/dev-dashboard/sections/performance/top-slowest-routes-card";
import { ApdexScoreCard } from "@/components/dev-dashboard/sections/performance/apdex-score-card";
import { ResourceUsageCard } from "@/components/dev-dashboard/sections/performance/resource-usage-card";
import { ErrorRateChartCard } from "@/components/dev-dashboard/sections/performance/error-rate-chart-card";
import { DbQueriesCard } from "@/components/dev-dashboard/sections/performance/db-queries-card";
import { ServicePerformanceTable } from "@/components/dev-dashboard/sections/performance/service-performance-table";
import { CreateAlertRuleModal } from "@/components/dev-dashboard/sections/performance/create-alert-rule-modal";
import { ExportMetricsButton } from "@/components/dev-dashboard/sections/performance/export-metrics-button";
import { parsePerformanceFilters } from "@/lib/dev-dashboard/performance-filters";
import { loadPerformancePageData } from "@/lib/dev-dashboard/performance-queries";

export const metadata = { title: "Performance · Dev Dashboard" };
// Performance metrics are real-time — never cache the rendered page.
export const dynamic   = "force-dynamic";
export const revalidate = 0;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function DevPerformancePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp      = await searchParams;
  const filters = parsePerformanceFilters(sp);
  const data    = await loadPerformancePageData(filters);

  return (
    <div className="space-y-5">
      <DevPageHeader
        title="Performance"
        subtitle="Response times, throughput, and resource use"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CreateAlertRuleModal />
            <ExportMetricsButton filters={filters} />
          </div>
        }
      />

      {/* 1. Top metric strip — 6 tiles auto-fit */}
      <PerformanceMetricCards metrics={data.metrics} />

      {/* 2. Filter / control row — wires every input to URL search params */}
      <PerformanceFilterBar filters={filters} />

      {/*
        3. Two-column top chart row.
        xl (12-col): Response Time (col-6) | Throughput (col-6)
      */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ResponseTimeChartCard chart={data.latency} compareChart={data.latencyCompare} />
        <RequestsThroughputCard chart={data.throughput} compareChart={data.throughputCompare} />
      </div>

      {/*
        4. Five-panel insights row.
        xl: 5 equal cols. md: 2 cols (3 wrap). mobile: stacked.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <TopSlowestRoutesCard routes={data.slowestRoutes} />
        <ApdexScoreCard apdex={data.apdex} />
        <ResourceUsageCard rows={data.resourceUsage} />
        <ErrorRateChartCard chart={data.errorRate} compareChart={data.errorRateCompare} />
        <DbQueriesCard queries={data.dbQueries} />
      </div>

      {/* 5. Service Performance Overview — full-width sortable table */}
      <ServicePerformanceTable rows={data.services} filters={filters} />
    </div>
  );
}
