import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/app-shell/page-shell";
import { RightRail } from "@/components/app-shell/right-rail";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { DashboardHero } from "@/components/dashboard/hero";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import {
  ProgramsRow,
  type ProgramCard,
} from "@/components/dashboard/programs-row";
import { ContinueLearning } from "@/components/dashboard/continue-learning";
import { TodaysPlan } from "@/components/dashboard/todays-plan";
import {
  UpcomingContent,
  type WeekDay,
  type UpcomingItem,
} from "@/components/dashboard/upcoming-content";
import { PerformanceOverview } from "@/components/dashboard/performance-overview";

export const metadata = { title: "Dashboard · Creator Growth OS" };

export default async function DashboardPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");
  const { user, profile } = ctx;
  const supabase = await createClient();

  const firstName =
    (profile?.display_name ?? profile?.full_name ?? user.email?.split("@")[0] ?? "Creator")
      .split(" ")[0];

  // Programs — read from DB if available, otherwise show the seeded mock
  const { data: dbPrograms } = await supabase
    .from("programs")
    .select("slug, title, description, plan_access")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(4);

  const programs: ProgramCard[] = dbPrograms?.length
    ? dbPrograms.map((p, i) => ({
        slug: p.slug,
        title: p.title,
        subtitle: p.description ?? "",
        status:
          p.plan_access === "pro"
            ? "pro_only"
            : i === 2
              ? "not_started"
              : "in_progress",
        progress: i === 0 ? 68 : i === 1 ? 42 : 0,
      }))
    : FALLBACK_PROGRAMS;

  return (
    <PageShell rail={<RightRail profile={ctx.railProfile} />}>
    <div className="space-y-6 lg:space-y-7 max-w-[1240px] mx-auto">
      <DashboardHero firstName={firstName} />

      <KpiCards
        kpi={{
          program_progress: 68,
          daily_streak: 12,
          videos_watched: 48,
          weekly_progress: 72,
          weekly_progress_delta: 18,
          tasks_completed: 26,
          tasks_total: 36,
        }}
      />

      <ProgramsRow programs={programs} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ContinueLearning lessons={MOCK_LESSONS} />
        <TodaysPlan tasks={MOCK_TASKS} />
        <UpcomingContent days={WEEK_DAYS} items={UPCOMING_ITEMS} />
      </section>

      <PerformanceOverview
        metrics={[
          {
            label: "Followers",
            value: "+1,248",
            delta: 12.5,
            series: [40, 44, 42, 48, 52, 58, 64, 70],
          },
          {
            label: "Profile Visits",
            value: "8,542",
            delta: 8.1,
            series: [30, 35, 32, 40, 45, 50, 55, 60],
          },
          {
            label: "Engagement Rate",
            value: "6.7%",
            delta: 15.3,
            series: [20, 25, 22, 30, 32, 38, 42, 48],
          },
          {
            label: "Website Clicks",
            value: "432",
            delta: -9.4,
            series: [50, 48, 46, 44, 42, 40, 38, 36],
          },
        ]}
        platformMix={[
          { label: "Instagram", percent: 58, color: "var(--rose-500)" },
          { label: "TikTok", percent: 26, color: "var(--ink-700)" },
          { label: "YouTube", percent: 10, color: "var(--rose-300)" },
          { label: "Other", percent: 6, color: "var(--cream-300)" },
        ]}
      />
    </div>
    </PageShell>
  );
}

// --- Fallback mock data (used until schema/programs are seeded) ----------

const FALLBACK_PROGRAMS: ProgramCard[] = [
  {
    slug: "influencer-blueprint",
    title: "The Influencer Blueprint",
    subtitle: "Build your brand from the ground up",
    status: "in_progress",
    progress: 68,
  },
  {
    slug: "content-that-connects",
    title: "Content That Connects",
    subtitle: "Create content that attracts & converts",
    status: "in_progress",
    progress: 42,
  },
  {
    slug: "monetize-your-influence",
    title: "Monetize Your Influence",
    subtitle: "Turn your audience into income",
    status: "not_started",
    progress: 0,
  },
  {
    slug: "scale-and-automate",
    title: "Scale & Automate",
    subtitle: "Grow bigger, work smarter",
    status: "pro_only",
  },
];

const MOCK_LESSONS = [
  {
    slug: "finding-your-niche",
    title: "Finding Your Niche",
    program_title: "The Influencer Blueprint",
    lesson_label: "Lesson 3",
    duration: "12:45",
  },
  {
    slug: "content-pillars-that-work",
    title: "Content Pillars That Work",
    program_title: "Content That Connects",
    lesson_label: "Lesson 5",
    duration: "15:30",
  },
  {
    slug: "hooks-that-get-attention",
    title: "Hooks That Get Attention",
    program_title: "Content That Connects",
    lesson_label: "Lesson 6",
    duration: "11:20",
  },
];

const MOCK_TASKS = [
  { id: "t1", title: "Post a story and engage with 10 followers", completed: true },
  { id: "t2", title: "Reply to DMs and comments", completed: true },
  { id: "t3", title: "Plan tomorrow's content (3 posts)", completed: false },
  { id: "t4", title: "Watch lesson: Content Pillars That Work", completed: false },
  { id: "t5", title: "Analyze top performing post", completed: false },
  { id: "t6", title: "Send 3 brand outreach messages", completed: false },
];

const WEEK_DAYS: WeekDay[] = [
  { short: "Mon", date: 19 },
  { short: "Tue", date: 20, isToday: true },
  { short: "Wed", date: 21 },
  { short: "Thu", date: 22 },
  { short: "Fri", date: 23 },
];

const UPCOMING_ITEMS: UpcomingItem[] = [
  { id: "u1", platform: "instagram", label: "Instagram Post", time: "10:00 AM" },
  { id: "u2", platform: "tiktok", label: "TikTok Video", time: "1:00 PM" },
  { id: "u3", platform: "youtube", label: "YouTube Short", time: "6:00 PM" },
];
