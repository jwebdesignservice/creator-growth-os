import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { QaMetricCards } from "@/components/dev-dashboard/sections/qa-checklist/qa-metric-cards";
import { QaFilterBar } from "@/components/dev-dashboard/sections/qa-checklist/qa-filter-bar";
import { QaGroupedAreasList } from "@/components/dev-dashboard/sections/qa-checklist/qa-grouped-areas-list";
import { ReleaseReadinessCard } from "@/components/dev-dashboard/sections/qa-checklist/release-readiness-card";
import { BlockersCard } from "@/components/dev-dashboard/sections/qa-checklist/blockers-card";
import { QaProgressByAreaCard } from "@/components/dev-dashboard/sections/qa-checklist/qa-progress-by-area-card";
import { RecentActivityCard } from "@/components/dev-dashboard/sections/qa-checklist/recent-activity-card";
import { ReleaseNotesCard } from "@/components/dev-dashboard/sections/qa-checklist/release-notes-card";
import { parseQaFilters, type QaRawSearchParams } from "@/lib/dev-dashboard/qa-filters";
import {
  getQaBlockers,
  getQaGroupedAreas,
  getQaMetrics,
  getQaProgressByArea,
  getQaRecentActivity,
  getQaReleaseNotes,
  getQaReleaseOptions,
  getQaReleaseReadiness,
} from "@/lib/dev-dashboard/qa-queries";

export const metadata = { title: "QA Checklist · Dev Dashboard" };

type PageProps = {
  searchParams: Promise<QaRawSearchParams>;
};

export default async function DevQaChecklistPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseQaFilters(raw);

  // All queries fan out in parallel — no sequential dependencies.
  const [
    releaseOptions,
    metrics,
    groupedAreas,
    blockers,
    progressByArea,
    readiness,
    recentActivity,
    releaseNotes,
  ] = await Promise.all([
    getQaReleaseOptions(),
    getQaMetrics(filters),
    getQaGroupedAreas(filters),
    getQaBlockers(filters),
    getQaProgressByArea(filters),
    getQaReleaseReadiness(filters),
    getQaRecentActivity(filters),
    getQaReleaseNotes(filters),
  ]);

  return (
    <div className="space-y-5">
      <DevPageHeader
        title="QA Checklist"
        subtitle="Pre-release verification checklist"
      />

      <QaMetricCards data={metrics} />
      <QaFilterBar releaseOptions={releaseOptions} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="min-w-0">
          <QaGroupedAreasList data={groupedAreas} filters={filters} />
        </div>

        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReleaseReadinessCard data={readiness} />
            <BlockersCard data={blockers} />
          </div>

          <QaProgressByAreaCard data={progressByArea} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecentActivityCard data={recentActivity} />
            <ReleaseNotesCard data={releaseNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
