import { Bookmark, Download } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { LogsMetricCards } from "@/components/dev-dashboard/sections/logs/logs-metric-cards";
import { LogsFilterBar } from "@/components/dev-dashboard/sections/logs/logs-filter-bar";
import { LiveLogStreamTable } from "@/components/dev-dashboard/sections/logs/live-log-stream-table";
import { LogVolumeByLevelCard } from "@/components/dev-dashboard/sections/logs/log-volume-by-level-card";
import { ServicesMostLogsCard } from "@/components/dev-dashboard/sections/logs/services-most-logs-card";
import { SavedViewsCard } from "@/components/dev-dashboard/sections/logs/saved-views-card";
import { SelectedLogDetailsCard } from "@/components/dev-dashboard/sections/logs/selected-log-details-card";
import { RecentTraceGroupsTable } from "@/components/dev-dashboard/sections/logs/recent-trace-groups-table";
import { loadLogsPageData } from "@/lib/dev-dashboard/logs-queries";
import { parseLogsFilters } from "@/lib/dev-dashboard/logs-filters";
import { ExportLogsButton } from "@/components/dev-dashboard/sections/logs/export-logs-button";

export const metadata = { title: "Logs · Dev Dashboard" };
// Logs are real-time — never cache the rendered page.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function DevLogsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp      = await searchParams;
  const filters = parseLogsFilters(sp);
  const data    = await loadLogsPageData(filters);

  return (
    <div className="space-y-5">
      <DevPageHeader
        title="Logs"
        subtitle="Live application logs across services"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
            >
              <Bookmark className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
              Save View
            </button>
            <ExportLogsButton filters={filters}>
              <Download className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
              Export Logs
            </ExportLogsButton>
          </div>
        }
      />

      {/* 1. Top metric strip — 5 tiles auto-fit */}
      <LogsMetricCards metrics={data.metrics} />

      {/* 2. Filter / control row */}
      <LogsFilterBar filters={filters} />

      {/*
        3. Main grid.
        xl (12-col):
        ┌────────────────────────────────┬───────────────────┐
        │ Live Log Stream (col-span-9)   │ Log Volume        │
        │                                │ Services          │
        │ Selected Log Details (col-9)   │ Saved Views       │
        └────────────────────────────────┴───────────────────┘
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-9 space-y-4 min-w-0">
          <LiveLogStreamTable
            rows={data.rows}
            total={data.totalRows}
            totalPages={data.totalPages}
            currentPage={filters.page}
            selectedId={data.selectedId}
            filters={filters}
          />
          <SelectedLogDetailsCard detail={data.selectedDetail} />
        </div>
        <div className="xl:col-span-3 space-y-4 min-w-0">
          <LogVolumeByLevelCard chart={data.volumeChart} />
          <ServicesMostLogsCard services={data.services} />
          <SavedViewsCard views={data.savedViews} />
        </div>
      </div>

      {/* 4. Recent Trace Groups — full width */}
      <RecentTraceGroupsTable rows={data.traceGroups} />
    </div>
  );
}
