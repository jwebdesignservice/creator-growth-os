import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/app-shell/page-shell";
import { RightRail, MobileRail } from "@/components/app-shell/right-rail";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { DashboardHero } from "@/components/dashboard/hero";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import {
  ProgramsRow,
  type ProgramCard,
} from "@/components/dashboard/programs-row";
import {
  ContinueLearning,
  type Lesson,
} from "@/components/dashboard/continue-learning";
import {
  TodaysPlan,
  type TodayTask,
} from "@/components/dashboard/todays-plan";
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

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndIso = weekEnd.toISOString();

  // All independent reads in parallel
  const [
    { data: dbPrograms },
    { data: profileRow },
    { data: todayMissions },
    { data: progressRows },
    { data: postingItems },
    { data: performanceRows },
  ] = await Promise.all([
    supabase
      .from("programs")
      .select("id, slug, title, description, plan_access")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(4),
    supabase
      .from("profiles")
      .select("daily_streak")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("missions")
      .select("id, title, status")
      .eq("user_id", user.id)
      .eq("due_date", todayIso)
      .order("created_at", { ascending: true })
      .limit(6),
    supabase
      .from("lesson_progress")
      .select(
        "completed, updated_at, lessons(slug, title, duration_seconds, programs(title))",
      )
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("posting_plan_items")
      .select("id, scheduled_for, platform, content_type, topic")
      .eq("user_id", user.id)
      .gte("scheduled_for", now.toISOString())
      .lte("scheduled_for", weekEndIso)
      .order("scheduled_for", { ascending: true })
      .limit(8),
    supabase
      .from("performance_entries")
      .select("week_start, followers, profile_visits, engagement_rate, clicks")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(8),
  ]);

  const dailyStreak = profileRow?.daily_streak ?? 0;
  const tasksTotal = todayMissions?.length ?? 0;
  const tasksCompleted =
    todayMissions?.filter((m) => m.status === "completed").length ?? 0;

  const programs: ProgramCard[] = dbPrograms?.length
    ? dbPrograms.map((p, i): ProgramCard => ({
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

  // ── Today's tasks (DB-backed) ─────────────────────────────────────────
  const tasks: TodayTask[] =
    todayMissions && todayMissions.length > 0
      ? todayMissions.map((m): TodayTask => ({
          id: m.id,
          title: m.title,
          completed: m.status === "completed",
        }))
      : MOCK_TASKS;

  // ── Continue learning (DB-backed) ─────────────────────────────────────
  type ProgressLessonShape = {
    completed: boolean;
    updated_at: string;
    lessons: {
      slug: string;
      title: string;
      duration_seconds: number;
      programs?: { title: string } | null;
    } | null;
  };
  const learning: Lesson[] =
    progressRows && progressRows.length > 0
      ? (progressRows as unknown as ProgressLessonShape[])
          .filter((row) => row.lessons)
          .map((row, i): Lesson => {
            const lesson = row.lessons!;
            const mins = Math.floor(lesson.duration_seconds / 60);
            const secs = lesson.duration_seconds % 60;
            return {
              slug: lesson.slug,
              title: lesson.title,
              program_title: lesson.programs?.title ?? "Programs",
              lesson_label: `Lesson ${i + 1}`,
              duration: `${mins}:${String(secs).padStart(2, "0")}`,
            };
          })
      : MOCK_LESSONS;

  // ── Upcoming content (DB-backed posting items) ────────────────────────
  const weekDays: WeekDay[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return {
      short: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.getDate(),
      isToday: i === 0,
    };
  });
  const upcomingItems: UpcomingItem[] =
    postingItems && postingItems.length > 0
      ? postingItems
          .filter(
            (p): p is typeof p & { platform: string } =>
              p.platform === "instagram" ||
              p.platform === "tiktok" ||
              p.platform === "youtube",
          )
          .map((p): UpcomingItem => {
            const when = p.scheduled_for ? new Date(p.scheduled_for) : null;
            return {
              id: p.id,
              platform: p.platform as "instagram" | "tiktok" | "youtube",
              label: p.topic ?? `${p.platform} ${p.content_type ?? "post"}`,
              time:
                when?.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                }) ?? "—",
            };
          })
      : UPCOMING_ITEMS;

  // ── Performance (latest week) ─────────────────────────────────────────
  const realMetrics =
    performanceRows && performanceRows.length > 0
      ? buildPerformanceMetrics(performanceRows)
      : null;

  return (
    <PageShell rail={<RightRail profile={ctx.railProfile} />}>
    <div className="space-y-[var(--mobile-section-gap)] lg:space-y-[var(--space-section-gap)] max-w-[var(--container-dashboard)] mx-auto">
      <DashboardHero firstName={firstName} />

      <KpiCards
        kpi={{
          program_progress: 0,
          daily_streak: dailyStreak,
          videos_watched: 0,
          weekly_progress: 0,
          weekly_progress_delta: 0,
          tasks_completed: tasksCompleted,
          tasks_total: tasksTotal,
        }}
      />

      <MobileRail profile={ctx.railProfile} />

      <ProgramsRow programs={programs} />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-[var(--space-grid-gap)]">
        <ContinueLearning lessons={learning} />
        <TodaysPlan tasks={tasks} />
        <UpcomingContent days={weekDays} items={upcomingItems} />
      </section>

      <PerformanceOverview
        metrics={realMetrics ?? FALLBACK_METRICS}
        platformMix={FALLBACK_PLATFORM_MIX}
      />
    </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Performance series helper
// ─────────────────────────────────────────────────────────────────────

type PerfRow = {
  followers: number | null;
  profile_visits: number | null;
  engagement_rate: number | null;
  clicks: number | null;
};

function buildPerformanceMetrics(rows: PerfRow[]) {
  // rows are ordered newest first; we want oldest→newest series.
  const ordered = [...rows].reverse();
  const followersSeries = ordered.map((r) => r.followers ?? 0);
  const visitsSeries = ordered.map((r) => r.profile_visits ?? 0);
  const engSeries = ordered.map((r) => Number(r.engagement_rate ?? 0));
  const clicksSeries = ordered.map((r) => r.clicks ?? 0);
  const latest = rows[0];
  const previous = rows[1];

  const delta = (cur: number, prev: number): number =>
    prev > 0 ? Number((((cur - prev) / prev) * 100).toFixed(1)) : 0;

  return [
    {
      label: "Followers",
      value: `${(latest.followers ?? 0).toLocaleString()}`,
      delta: delta(latest.followers ?? 0, previous?.followers ?? 0),
      series: followersSeries,
    },
    {
      label: "Profile Visits",
      value: `${(latest.profile_visits ?? 0).toLocaleString()}`,
      delta: delta(latest.profile_visits ?? 0, previous?.profile_visits ?? 0),
      series: visitsSeries,
    },
    {
      label: "Engagement Rate",
      value: `${Number(latest.engagement_rate ?? 0)}%`,
      delta: delta(
        Number(latest.engagement_rate ?? 0),
        Number(previous?.engagement_rate ?? 0),
      ),
      series: engSeries,
    },
    {
      label: "Website Clicks",
      value: `${(latest.clicks ?? 0).toLocaleString()}`,
      delta: delta(latest.clicks ?? 0, previous?.clicks ?? 0),
      series: clicksSeries,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────
// Fallback data (shown until user has real entries)
// ─────────────────────────────────────────────────────────────────────

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

const MOCK_LESSONS: Lesson[] = [
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

const MOCK_TASKS: TodayTask[] = [
  { id: "t1", title: "Post a story and engage with 10 followers", completed: true },
  { id: "t2", title: "Reply to DMs and comments", completed: true },
  { id: "t3", title: "Plan tomorrow's content (3 posts)", completed: false },
  { id: "t4", title: "Watch lesson: Content Pillars That Work", completed: false },
  { id: "t5", title: "Analyze top performing post", completed: false },
  { id: "t6", title: "Send 3 brand outreach messages", completed: false },
];

const UPCOMING_ITEMS: UpcomingItem[] = [
  { id: "u1", platform: "instagram", label: "Instagram Post", time: "10:00 AM" },
  { id: "u2", platform: "tiktok", label: "TikTok Video", time: "1:00 PM" },
  { id: "u3", platform: "youtube", label: "YouTube Short", time: "6:00 PM" },
];

const FALLBACK_METRICS = [
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
];

const FALLBACK_PLATFORM_MIX = [
  { label: "Instagram", percent: 58, color: "var(--rose-500)" },
  { label: "TikTok", percent: 26, color: "var(--ink-700)" },
  { label: "YouTube", percent: 10, color: "var(--rose-300)" },
  { label: "Other", percent: 6, color: "var(--cream-300)" },
];
