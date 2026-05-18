import { redirect } from "next/navigation";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { PostingKpiTiles } from "@/components/posting/kpi-tiles";
import { ActivePlanCard } from "@/components/posting/active-plan-card";
import { PlannedPostsTable } from "@/components/posting/planned-posts-table";
import { PostingRail } from "@/components/posting/rail";
import { PostingTabs } from "@/components/posting/tabs";
import { PostingActions } from "@/components/posting/posting-actions";
import {
  getActivePlan,
  getPlannedItems,
  getWeeklyStats,
  getUserPillars,
  type PostingItem,
} from "@/lib/posting/queries";

export const metadata = { title: "Posting Plans · Creator Growth OS" };

export default async function PostingPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const [activePlan, pillars] = await Promise.all([
    getActivePlan(),
    getUserPillars(),
  ]);

  const [items, weekly] = await Promise.all([
    getPlannedItems(activePlan?.id ?? null, 4),
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
  const pillarsForUI =
    pillars.length > 0
      ? pillars
      : [
          { label: "Education", weight: 40 },
          { label: "Inspiration", weight: 30 },
          { label: "Behind the Scenes", weight: 20 },
          { label: "Promotion", weight: 10 },
        ];

  const upcoming = itemsForUI.slice(0, 3).map((it) => ({
    id: it.id,
    scheduled_for: it.scheduled_for,
    platform: it.platform,
    topic: it.topic,
  }));

  return (
    <PageShell
      rail={
        <PostingRail
          userName={ctx.name}
          avatarUrl={ctx.railProfile.avatar_url}
          weekly={weeklyForUI}
          upcoming={upcoming}
          pillars={pillarsForUI}
        />
      }
    >
      <div className="space-y-7 max-w-[1240px] mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-1">
              Posting Plans
            </h1>
            <p className="text-ink-500 text-[14px]">
              Plan smarter. Post consistently. Grow faster.
            </p>
          </div>
          <PostingActions activePlanId={activePlan?.id ?? null} />
        </header>

        {/* Tabs */}
        <PostingTabs />

        {/* KPI tiles */}
        <PostingKpiTiles
          thisWeekPlanned={weeklyForUI.total}
          consistencyDaysPerWeek={5}
          bestTime="7:00 PM"
          engagementGoal={8}
        />

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
        <PlannedPostsTable items={itemsForUI} />
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
