import { redirect } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { PostingKpiTiles } from "@/components/posting/kpi-tiles";
import { ActivePlanCard } from "@/components/posting/active-plan-card";
import { PlannedPostsTable } from "@/components/posting/planned-posts-table";
import { PostingTabs } from "@/components/posting/tabs";
import { PostingActions } from "@/components/posting/posting-actions";
import { ContentCalendar } from "@/components/posting/content-calendar";
import { getActivePlan, getPlannedItems, getWeeklyStats } from "@/lib/posting/queries";

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
  const [items, weekly] = activePlan
    ? await Promise.all([
        getPlannedItems(activePlan.id, itemLimit),
        getWeeklyStats(activePlan.id),
      ])
    : [[], { total: 0, by_type: [] }];

  return (
    <PageShell>
      <div className="space-y-7 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 text-ink-900 mb-1">Posting Plans</h1>
            <p className="text-ink-500 text-[14px]">
              Plan smarter. Post consistently. Grow faster.
            </p>
          </div>
          <PostingActions activePlanId={activePlan?.id ?? null} />
        </header>

        {/* Tabs */}
        <PostingTabs active={activeTab} />

        {/* KPI tiles — "This Week's Posts" is real; the rest need data sources
            we haven't built, so they render honest empty states. */}
        <PostingKpiTiles
          thisWeekPlanned={weekly.total}
          consistencyDaysPerWeek={null}
          bestTime={null}
          engagementGoal={null}
        />

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
