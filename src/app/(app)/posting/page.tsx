import { redirect } from "next/navigation";
import {
  CalendarPlus,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  BarChart3,
  FileText,
  Lightbulb,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { ActivePlanCard } from "@/components/posting/active-plan-card";
import { IdeasBoard } from "@/components/posting/ideas-board";
import { PostingPlatformCards } from "@/components/posting/platform-cards";
import { PlannedPostsTable } from "@/components/posting/planned-posts-table";
import { PostQueue } from "@/components/posting/post-queue";
import { PostingActions } from "@/components/posting/posting-actions";
import { ContentCalendar } from "@/components/posting/content-calendar";
import { InsightsDashboard } from "@/components/posting/insights-dashboard";
import {
  getActivePlan,
  getPlannedItems,
  getItemPhases,
} from "@/lib/posting/queries";
import {
  WorkspaceShell,
  WorkspaceHeader,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";

export const metadata = { title: "Posting Plans · Profluencer" };

type PostingTab = "my_plans" | "posts" | "ideas" | "calendar" | "insights";

const POSTING_TABS: WorkspaceTab[] = [
  { key: "my_plans", label: "My Plans", icon: ClipboardList, href: "/posting" },
  {
    key: "posts",
    label: "Posts",
    icon: FileText,
    href: "/posting?view=posts",
  },
  {
    key: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    href: "/posting?view=ideas",
  },
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
    view === "calendar"
      ? "calendar"
      : view === "insights"
        ? "insights"
        : view === "posts"
          ? "posts"
          : view === "ideas"
            ? "ideas"
            : "my_plans";

  const activePlan = await getActivePlan();

  // Calendar needs the full week; My Plans needs it too (the platform cards
  // count posts per platform) while its table previews fewer. Insights uses
  // sample visualisations, so it needs no items.
  const itemLimit = active === "insights" ? 0 : 100;
  const items =
    activePlan && itemLimit > 0
      ? await getPlannedItems(activePlan.id, itemLimit)
      : [];

  // Per-post phases power the calendar's Timeline (roadmap) view.
  const phases =
    active === "calendar" && items.length > 0
      ? await getItemPhases(items.map((i) => i.id))
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
            {/* Three sections — plan summary, the per-platform nav cards,
                then the posts table — floating on the cream page background. */}
            <div className="space-y-5 pt-1 pb-4">
              <ActivePlanCard plan={activePlan} />
              <PostingPlatformCards items={items} planId={activePlan.id} />
              <PlannedPostsTable
                items={items.slice(0, 8)}
                addPostSlot={<PostingActions activePlanId={activePlan.id} />}
              />
            </div>
          </div>
        ) : active === "posts" ? (
          <div className="space-y-4">
            <WorkspaceHeader title="Posts">
              <PostingActions activePlanId={activePlan.id} />
            </WorkspaceHeader>
            {/* Queue — posts on a day-by-day timeline with "+ New" slots. */}
            <div className="pt-1">
              <PostQueue items={items} planId={activePlan.id} />
            </div>
          </div>
        ) : active === "ideas" ? (
          <IdeasBoard />
        ) : active === "calendar" ? (
          <ContentCalendar
            items={items}
            weekStart={activePlan.week_start}
            planId={activePlan.id}
            phases={phases}
            addPostSlot={<PostingActions activePlanId={activePlan.id} />}
          />
        ) : (
          <div className="space-y-4">
            <WorkspaceHeader title="Content insights">
              <span className="text-[12.5px] text-ink-400">
                Preview — fills in as you post
              </span>
            </WorkspaceHeader>
            <InsightsDashboard />
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
