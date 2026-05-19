import { Stethoscope, Download } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { DatabaseMetricCards } from "@/components/dev-dashboard/sections/database/database-metric-cards";
import { DatabaseFilterBar } from "@/components/dev-dashboard/sections/database/database-filter-bar";
import { QueryPerformanceCard } from "@/components/dev-dashboard/sections/database/query-performance-card";
import { TableActivityCard } from "@/components/dev-dashboard/sections/database/table-activity-card";
import { SlowestQueriesCard } from "@/components/dev-dashboard/sections/database/slowest-queries-card";
import { RlsMonitorCard } from "@/components/dev-dashboard/sections/database/rls-monitor-card";
import { MigrationStatusCard } from "@/components/dev-dashboard/sections/database/migration-status-card";
import { StorageStatusCard } from "@/components/dev-dashboard/sections/database/storage-status-card";
import { RpcHealthCard } from "@/components/dev-dashboard/sections/database/rpc-health-card";
import { IntegrityWarningsCard } from "@/components/dev-dashboard/sections/database/integrity-warnings-card";
import { RecentDatabaseEventsTable } from "@/components/dev-dashboard/sections/database/recent-database-events-table";

export const metadata = { title: "Database · Dev Dashboard" };

export default function DevDatabasePage() {
  return (
    <div className="space-y-5">
      <DevPageHeader
        title="Database"
        subtitle="Monitor database health, query performance, table activity, RLS denials, and storage status."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
            >
              <Stethoscope className="size-3.5" strokeWidth={2} />
              Run Health Check
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
            >
              <Download className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
              Export Report
            </button>
          </div>
        }
      />

      {/* 1. Top metric strip — 6 tiles auto-fit */}
      <DatabaseMetricCards />

      {/* 2. Filter / control row */}
      <DatabaseFilterBar />

      {/*
        Main analytics + insights grid.

        Layout (xl, 12-col):
        ┌──────────────────────────────────┬──────────────────────────┐
        │ Query Performance (cols 1-8)     │ Integrity Warnings (9-12)│ row 1
        ├──────────────────────────────────┴──────────────────────────┤
        │ Table Activity (1-6) │ Slowest Queries (7-9) │ RLS Mon (10-12)│ row 2
        ├─────────────────────────────────────────────────────────────┤
        │ Migrations (1-4) │ Storage (5-8) │ RPC Health (9-12)         │ row 3
        └─────────────────────────────────────────────────────────────┘
        At md, drops to 2-up rows. At sm and below, everything stacks.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Row 1 */}
        <div className="xl:col-span-8 min-w-0">
          <QueryPerformanceCard />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <IntegrityWarningsCard />
        </div>

        {/* Row 2 */}
        <div className="xl:col-span-6 min-w-0">
          <TableActivityCard />
        </div>
        <div className="xl:col-span-3 min-w-0">
          <SlowestQueriesCard />
        </div>
        <div className="xl:col-span-3 min-w-0">
          <RlsMonitorCard />
        </div>

        {/* Row 3 */}
        <div className="xl:col-span-4 min-w-0">
          <MigrationStatusCard />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <StorageStatusCard />
        </div>
        <div className="xl:col-span-4 min-w-0">
          <RpcHealthCard />
        </div>
      </div>

      {/* 3. Recent Database Events — full-width */}
      <RecentDatabaseEventsTable />
    </div>
  );
}
