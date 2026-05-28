import { redirect } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { PostingKpiTiles } from "@/components/posting/kpi-tiles";
import { ActivePlanCard } from "@/components/posting/active-plan-card";
import { PlannedPostsTable } from "@/components/posting/planned-posts-table";
import { PostingTabs } from "@/components/posting/tabs";
import { PostingActions } from "@/components/posting/posting-actions";
import { ContentCalendar } from "@/components/posting/content-calendar";
import {
  getActivePlan,
  getPlannedItems,
  getWeeklyStats,
  type PostingItem,
} from "@/lib/posting/queries";

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

  // Calendar needs the FULL week's items, not just the top 4 the
  // table previews. Pull a bigger window when we know we'll need it.
  const itemLimit = activeTab === "calendar" ? 50 : 4;
  const [items, weekly] = await Promise.all([
    getPlannedItems(activePlan?.id ?? null, itemLimit),
    getWeeklyStats(activePlan?.id ?? null),
  ]);

  // Render with mock fallback when nothing is seeded so the page demos
  // the full layout. Real data takes over the moment admin (or the user)
  // creates a plan.
  const planForUI =
    activePlan ??
    ({
      id: "demo",
      title: "Content Plan – Week of " + currentWeekLabel(),
      week_start: currentWeekLabel(),
      description:
        "A balanced weekly plan focused on growth, engagement and conversion.",
      status: "active",
      progress: 65,
    } as const);

  const itemsForUI: PostingItem[] = items.length > 0 ? items : MOCK_ITEMS;
  const isDemoItems = items.length === 0;
  const weeklyForUI =
    weekly.total > 0
      ? weekly
      : {
          total: 14,
          by_type: [
            { label: "Reels", count: 6, color: "var(--rose-500)" },
            { label: "Carousels", count: 4, color: "var(--rose-300)" },
            { label: "Stories", count: 2, color: "var(--cream-300)" },
            { label: "Videos", count: 2, color: "var(--ink-700)" },
          ],
        };
  return (
    <PageShell>
      <div className="space-y-7 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 text-ink-900 mb-1">
              Posting Plans
            </h1>
            <p className="text-ink-500 text-[14px]">
              Plan smarter. Post consistently. Grow faster.
            </p>
          </div>
          <PostingActions activePlanId={activePlan?.id ?? null} />
        </header>

        {/* Tabs */}
        <PostingTabs active={activeTab} />

        {/* KPI tiles — only "This Week's Posts" is wired to real data
            today; consistency / best-time / engagement goal need data
            sources we haven't built yet, so the tiles render empty
            states instead of fake numbers. */}
        <PostingKpiTiles
          thisWeekPlanned={weeklyForUI.total}
          consistencyDaysPerWeek={null}
          bestTime={null}
          engagementGoal={null}
        />

        {activeTab === "my_plans" ? (
          <>
            {/* Current Plan section */}
            <section className="space-y-3">
              <h2 className="text-[16px] font-semibold text-ink-900">
                Current Plan
              </h2>
              <ActivePlanCard
                title={planForUI.title}
                description={planForUI.description}
                progress={planForUI.progress}
                weekLabel={`Week of ${planForUI.week_start}`}
                planId={activePlan?.id}
              />
            </section>

            {/* Planned Posts table */}
            <PlannedPostsTable items={itemsForUI} isDemo={isDemoItems} />
          </>
        ) : (
          <ContentCalendar
            items={itemsForUI}
            weekStart={activePlan?.week_start ?? null}
          />
        )}
      </div>
    </PageShell>
  );
}

function currentWeekLabel() {
  const d = new Date();
  const monday = new Date(d);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Mon=1 ... Sun=0
  monday.setDate(monday.getDate() + diff);
  return monday.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Mock items used until the user (or admin) creates a real plan
const MOCK_ITEMS: PostingItem[] = [
  {
    id: "demo-1",
    scheduled_for: nextDate(0, 19, 0),
    platform: "instagram",
    content_type: "reel",
    topic: "3 content ideas to grow your audience",
    status: "planned",
  },
  {
    id: "demo-2",
    scheduled_for: nextDate(1, 12, 0),
    platform: "tiktok",
    content_type: "short_video",
    topic: "Behind the scenes of my workflow",
    status: "planned",
  },
  {
    id: "demo-3",
    scheduled_for: nextDate(2, 18, 0),
    platform: "youtube",
    content_type: "youtube_video",
    topic: "How I plan my content for 7 days",
    status: "scripted",
  },
  {
    id: "demo-4",
    scheduled_for: nextDate(3, 9, 0),
    platform: "instagram",
    content_type: "carousel",
    topic: "Tips to increase engagement",
    status: "idea",
  },
];

function nextDate(addDays: number, hours: number, minutes: number) {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}
