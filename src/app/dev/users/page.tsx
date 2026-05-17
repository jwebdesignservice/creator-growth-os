import { Filter, Download } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { UsersMetricCards } from "@/components/dev-dashboard/sections/users/users-metric-cards";
import { UsersFilterBar } from "@/components/dev-dashboard/sections/users/users-filter-bar";
import { UserGrowthTrendsCard } from "@/components/dev-dashboard/sections/users/user-growth-trends-card";
import { PlanDistributionCard } from "@/components/dev-dashboard/sections/users/plan-distribution-card";
import { UserStatusBreakdownCard } from "@/components/dev-dashboard/sections/users/user-status-breakdown-card";
import { TopUserSegmentsCard } from "@/components/dev-dashboard/sections/users/top-user-segments-card";
import { OnboardingFunnelCard } from "@/components/dev-dashboard/sections/users/onboarding-funnel-card";
import { RegionalUsageCard } from "@/components/dev-dashboard/sections/users/regional-usage-card";
import { NeedsAttentionCard } from "@/components/dev-dashboard/sections/users/needs-attention-card";
import { RetentionEngagementCard } from "@/components/dev-dashboard/sections/users/retention-engagement-card";
import { TopUserHealthCard } from "@/components/dev-dashboard/sections/users/top-user-health-card";
import { HighestValueSegmentCard } from "@/components/dev-dashboard/sections/users/highest-value-segment-card";
import { RecentUserActivityTable } from "@/components/dev-dashboard/sections/users/recent-user-activity-table";

export const metadata = { title: "Users · Dev Dashboard" };

export default function DevUsersPage() {
  return (
    <div className="space-y-5">
      <DevPageHeader
        title="Users"
        subtitle="Monitor user growth, account health, onboarding progress, plan distribution, and high-signal user activity across the platform."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
            >
              <Filter className="size-3.5" strokeWidth={2} />
              Create Segment
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
            >
              <Download className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
              Export Users
            </button>
          </div>
        }
      />

      {/* 1. Top metric strip — 6 tiles auto-fit */}
      <UsersMetricCards />

      {/* 2. Filter row */}
      <UsersFilterBar />

      {/*
        Main analytics + insights grid.

        Layout (xl, 12-col):
        ┌─────────────────────────────────────────────┬────────────────┐
        │ User Growth (5) │ Plan Dist (3) │ Status (2)│ Top User Segs  │ row 1
        ├─────────────────────────────────────────────┤    (col 11–12) │
        │ Onboard │ Regional │ Attention │ Retention  │ Top User Health│ row 2
        │   (2)   │   (2)    │   (2)     │   (2)      │ Highest Value  │ row 2 cont.
        └─────────────────────────────────────────────┴────────────────┘
        At md, drops to two 2-up rows for the left main + a 2-up row for the
        right rail. At sm/below, everything stacks single column.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LEFT MAIN: 10 cols at xl */}
        <div className="xl:col-span-10 space-y-4 min-w-0">
          {/* Row 1: 3 wider analytics panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-10 gap-4">
            <div className="xl:col-span-5">
              <UserGrowthTrendsCard />
            </div>
            <div className="xl:col-span-3">
              <PlanDistributionCard />
            </div>
            <div className="md:col-span-2 xl:col-span-2">
              <UserStatusBreakdownCard />
            </div>
          </div>

          {/* Row 2: 4 mid-row cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <OnboardingFunnelCard />
            <RegionalUsageCard />
            <NeedsAttentionCard />
            <RetentionEngagementCard />
          </div>
        </div>

        {/* RIGHT RAIL: 2 cols at xl, stacked at lg- */}
        <div className="xl:col-span-2 space-y-4 min-w-0">
          <TopUserSegmentsCard />
          <TopUserHealthCard />
          <HighestValueSegmentCard />
        </div>
      </div>

      {/* 3. Recent User Activity — full-width */}
      <RecentUserActivityTable />
    </div>
  );
}
