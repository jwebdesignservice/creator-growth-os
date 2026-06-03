import { redirect } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { ActivePlanCard } from "@/components/posting/active-plan-card";
import { PlannedPostsTable } from "@/components/posting/planned-posts-table";
import { PostingTabs } from "@/components/posting/tabs";
import { PostingActions } from "@/components/posting/posting-actions";
import { ContentCalendar } from "@/components/posting/content-calendar";
import { BestTimeHeatmap, FormatPerformance } from "@/design-templates/posting-insights";
import { ContributionHeatmap } from "@/design-templates/heatmap";
import { RetentionCohort } from "@/design-templates/funnels";
import { getActivePlan, getPlannedItems } from "@/lib/posting/queries";

export const metadata = { title: "Posting Plans · Creator Growth OS" };

type SearchParams = Promise<{ view?: string }>;

export default async function PostingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { view } = await searchParams;
  const activeTab: "my_plans" | "calendar" =
    view === "calendar" ? "calendar" : "my_plans";

  const activePlan = await getActivePlan();

  // Calendar needs the full week; the table previews fewer. Only fetch items
  // when there's a real plan — no plan means no posts (and no fake demos).
  const itemLimit = activeTab === "calendar" ? 100 : 8;
  const items = activePlan
    ? await getPlannedItems(activePlan.id, itemLimit)
    : [];

  return (
    <PageShell>
      <div className="space-y-7 max-w-[1600px] mx-auto">
        {/* Tabs + primary action — pill switcher left, primary action right */}
        <div className="flex items-center justify-between gap-4 flex-wrap gap-y-2">
          <PostingTabs active={activeTab} />
          <PostingActions activePlanId={activePlan?.id ?? null} />
        </div>

        {!activePlan ? (
          <EmptyPlanState />
        ) : activeTab === "my_plans" ? (
          <>
            <section className="space-y-3">
              <h2 className="text-[16px] font-semibold text-ink-900">
                Current Plan
              </h2>
              <ActivePlanCard plan={activePlan} />
            </section>

            <PlannedPostsTable items={items} />

            {/* Content insights — design-system visualisations (Best time,
                Format performance, Posting activity, Audience retention).
                Sample data for now; these wire to real metrics as the
                analytics pipeline lands, hence the honest "preview" note. */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-[16px] font-semibold text-ink-900">
                  Content insights
                </h2>
                <span className="text-[12.5px] text-ink-400">
                  Preview — fills in as you post
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                <BestTimeHeatmap className="w-full max-w-none" />
                <FormatPerformance className="w-full max-w-none" />
                <ContributionHeatmap className="w-full max-w-none" />
                <RetentionCohort className="w-full max-w-none" />
              </div>
            </section>
          </>
        ) : (
          <ContentCalendar
            items={items}
            weekStart={activePlan.week_start}
            planId={activePlan.id}
          />
        )}
      </div>
    </PageShell>
  );
}

/* Real empty state — shown when the user has no active plan. The create flow
   (PostingActions) is the same one used in the header, so it actually works. */
function EmptyPlanState() {
  return (
    <section className="card p-10 sm:p-14 text-center">
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
