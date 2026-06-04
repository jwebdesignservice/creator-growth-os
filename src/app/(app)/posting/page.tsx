import { redirect } from "next/navigation";
import {
  CalendarPlus,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { ActivePlanCard } from "@/components/posting/active-plan-card";
import { PlannedPostsTable } from "@/components/posting/planned-posts-table";
import { PostingActions } from "@/components/posting/posting-actions";
import { ContentCalendar } from "@/components/posting/content-calendar";
import { BestTimeHeatmap, FormatPerformance } from "@/design-templates/posting-insights";
import { ContributionHeatmap } from "@/design-templates/heatmap";
import { RetentionCohort } from "@/design-templates/funnels";
import { getActivePlan, getPlannedItems } from "@/lib/posting/queries";
import {
  WorkspaceShell,
  WorkspaceHeader,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";

export const metadata = { title: "Posting Plans · Creator Growth OS" };

type PostingTab = "my_plans" | "calendar" | "insights";

const POSTING_TABS: WorkspaceTab[] = [
  { key: "my_plans", label: "My Plans", icon: ClipboardList, href: "/posting" },
  {
    key: "calendar",
    label: "Calendar",
    icon: CalendarRange,
    href: "/posting?view=calendar",
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    href: "/posting?view=insights",
  },
];

type SearchParams = Promise<{ view?: string }>;

export default async function PostingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { view } = await searchParams;
  const active: PostingTab =
    view === "calendar" ? "calendar" : view === "insights" ? "insights" : "my_plans";

  const activePlan = await getActivePlan();

  // Calendar needs the full week; the table previews fewer. Insights uses
  // sample visualisations, so it needs no items.
  const itemLimit = active === "calendar" ? 100 : active === "my_plans" ? 8 : 0;
  const items =
    activePlan && itemLimit > 0
      ? await getPlannedItems(activePlan.id, itemLimit)
      : [];

  return (
    <PageShell>
      <WorkspaceShell
        title="Posting Plans"
        icon={CalendarDays}
        tabs={POSTING_TABS}
        activeKey={active}
      >
        {!activePlan ? (
          <EmptyPlanState />
        ) : active === "my_plans" ? (
          <div className="space-y-4">
            <WorkspaceHeader title="My Plans">
              <PostingActions activePlanId={activePlan.id} />
            </WorkspaceHeader>
            <ActivePlanCard plan={activePlan} />
            <PlannedPostsTable items={items} />
          </div>
        ) : active === "calendar" ? (
          <div className="space-y-4 lg:space-y-0 lg:h-full lg:flex lg:flex-col lg:gap-4">
            <WorkspaceHeader title="Calendar">
              <PostingActions activePlanId={activePlan.id} />
            </WorkspaceHeader>
            <ContentCalendar
              items={items}
              weekStart={activePlan.week_start}
              planId={activePlan.id}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <WorkspaceHeader title="Content insights">
              <span className="text-[12.5px] text-ink-400">
                Preview — fills in as you post
              </span>
            </WorkspaceHeader>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
              <BestTimeHeatmap className="w-full max-w-none" />
              <FormatPerformance className="w-full max-w-none" />
              <ContributionHeatmap className="w-full max-w-none" />
              <RetentionCohort className="w-full max-w-none" />
            </div>
          </div>
        )}
      </WorkspaceShell>
    </PageShell>
  );
}

/* Real empty state — shown when the user has no active plan. The create flow
   (PostingActions) is the same one used in the header, so it actually works. */
function EmptyPlanState() {
  return (
    <section className="card p-10 sm:p-14 text-center lg:mt-[var(--space-page-y)]">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4 mx-auto">
        <CalendarPlus className="size-6" strokeWidth={1.8} aria-hidden />
      </div>
      <h2 className="text-h4 sm:text-[22px] text-ink-900 mb-2">
        No active posting plan yet
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-6 leading-relaxed">
        Create your first weekly plan to schedule posts across platforms, move
        each piece from idea → posted, and review your consistency in the
        calendar.
      </p>
      <div className="flex justify-center">
        <PostingActions activePlanId={null} />
      </div>
    </section>
  );
}
