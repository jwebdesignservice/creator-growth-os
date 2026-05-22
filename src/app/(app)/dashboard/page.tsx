import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/app-shell/page-shell";
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
import { TodaysPlan } from "@/components/dashboard/todays-plan";
import { GettingStarted } from "@/components/dashboard/getting-started";
import {
  UpcomingContent,
  type WeekDay,
  type UpcomingItem,
} from "@/components/dashboard/upcoming-content";
import {
  ThisWeeksOverview,
  type OverviewEntry,
  type PlatformOption,
} from "@/components/dashboard/this-weeks-overview";
import { getProgressForPrograms } from "@/lib/programs/queries";

export const metadata = { title: "Dashboard | Creator Growth OS" };

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
      .limit(3),
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
      .select("week_start, followers, profile_visits, engagement_rate, clicks, posts_published")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(26),
  ]);

  const tasksTotal = todayMissions?.length ?? 0;
  const tasksCompleted =
    todayMissions?.filter((m) => m.status === "completed").length ?? 0;

  // ── KPI metrics ───────────────────────────────────────────────────────
  const socials = ctx.railProfile.socials;
  const followers =
    (socials.instagram ?? 0) + (socials.tiktok ?? 0) + (socials.youtube ?? 0);
  const postsThisWeek = postingItems?.length ?? 0;
  // Revenue isn't tracked yet — placeholder goal until that data source lands.
  const revenue = 1200;
  const revenueGoal = 3000;

  // Compute real per-program progress for the user. We do this in a
  // separate round-trip on top of the parallel reads above so the
  // dashboard card percentages reflect actual lesson_progress, not the
  // mock 68/42 numbers we used to render.
  const progressMap = dbPrograms?.length
    ? await getProgressForPrograms(dbPrograms.map((p) => p.id))
    : new Map();

  const programs: ProgramCard[] = dbPrograms?.length
    ? dbPrograms.map((p): ProgramCard => {
        const prog = progressMap.get(p.id);
        const percent = prog?.percent ?? 0;
        const isProLocked = p.plan_access === "pro" && ctx.plan !== "pro";
        const status: ProgramCard["status"] = isProLocked
          ? "pro_only"
          : percent >= 100
            ? "completed"
            : percent > 0
              ? "in_progress"
              : "not_started";
        return {
          slug: p.slug,
          title: p.title,
          subtitle: p.description ?? "",
          status,
          progress: percent,
        };
      })
    : FALLBACK_PROGRAMS;

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
  // Tag each scheduled post with a day index (0 = today … 6) so the strip
  // can filter by day. Dots and cards both derive from this one list, so
  // they always agree.
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayStart = startOfDay(now);

  const realUpcoming: UpcomingItem[] = (postingItems ?? [])
    .filter(
      (p): p is typeof p & { platform: string; scheduled_for: string } =>
        !!p.scheduled_for &&
        (p.platform === "instagram" ||
          p.platform === "tiktok" ||
          p.platform === "youtube"),
    )
    .map((p): UpcomingItem => {
      const when = new Date(p.scheduled_for);
      return {
        id: p.id,
        platform: p.platform as "instagram" | "tiktok" | "youtube",
        label: p.topic ?? `${p.platform} ${p.content_type ?? "post"}`,
        time: when.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        dayIndex: Math.round((startOfDay(when) - todayStart) / 86_400_000),
      };
    })
    .filter((it) => it.dayIndex >= 0 && it.dayIndex <= 6);

  const upcomingItems: UpcomingItem[] =
    realUpcoming.length > 0 ? realUpcoming : UPCOMING_ITEMS;

  // Dots per day are just the per-day tally of the items above.
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const it of upcomingItems) dayCounts[it.dayIndex] += 1;

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return {
      short: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.getDate(),
      isToday: i === 0,
      count: dayCounts[i],
    };
  });

  // ── This Week's Overview ──────────────────────────────────────────────
  // Raw weekly entries (oldest→newest) — the component windows + filters them.
  const overviewEntries: OverviewEntry[] = (performanceRows ?? [])
    .map((r) => ({
      date: r.week_start,
      followers: r.followers ?? 0,
      profileVisits: r.profile_visits ?? 0,
      engagementRate: Number(r.engagement_rate ?? 0),
      contentPublished: r.posts_published ?? 0,
    }))
    .reverse();

  // Platform filter options, weighted by each connected account's share of
  // total followers (engagement rate stays unscaled inside the component).
  const totalSocial =
    (socials.instagram ?? 0) + (socials.tiktok ?? 0) + (socials.youtube ?? 0);
  const platformOptions: PlatformOption[] = [{ label: "All Platforms", weight: 1 }];
  if (totalSocial > 0) {
    if (socials.instagram)
      platformOptions.push({ label: "Instagram", weight: socials.instagram / totalSocial });
    if (socials.tiktok)
      platformOptions.push({ label: "TikTok", weight: socials.tiktok / totalSocial });
    if (socials.youtube)
      platformOptions.push({ label: "YouTube", weight: socials.youtube / totalSocial });
  }

  // ── KPI card visuals ──────────────────────────────────────────────────
  // Followers history (oldest→newest) for the Audience Growth sparkline.
  const followersSeries =
    performanceRows && performanceRows.length > 0
      ? [...performanceRows].reverse().map((r) => r.followers ?? 0)
      : [];

  // Today's Progress checklist — real tasks when present, else onboarding steps.
  const DEFAULT_CHECKLIST = [
    { label: "Create your first program", done: false },
    { label: "Set up your content calendar", done: false },
    { label: "Add your brand profile", done: false },
    { label: "Complete your profile", done: false },
  ];
  const checklist =
    todayMissions && todayMissions.length > 0
      ? todayMissions.slice(0, 4).map((m) => ({
          label: m.title,
          done: m.status === "completed",
        }))
      : DEFAULT_CHECKLIST;

  // Content Activity — posts per weekday this week (Mon→Sun).
  const contentActivity = [0, 0, 0, 0, 0, 0, 0];
  for (const p of postingItems ?? []) {
    if (!p.scheduled_for) continue;
    const wd = (new Date(p.scheduled_for).getDay() + 6) % 7; // Mon=0 … Sun=6
    contentActivity[wd] += 1;
  }

  return (
    <PageShell>
    <div className="space-y-[var(--mobile-section-gap)] lg:space-y-[var(--space-section-gap)] max-w-[var(--container-dashboard)] mx-auto">
      <DashboardHero
        firstName={firstName}
        plan={ctx.plan}
        profileCompletion={ctx.railProfile.profile_completion}
        avatarUrl={ctx.railProfile.avatar_url}
      />

      <KpiCards
        kpi={{
          followers,
          followersSeries,
          tasksCompleted,
          tasksTotal,
          checklist,
          postsThisWeek,
          contentActivity,
          revenue,
          revenueGoal,
        }}
      />

      <ProgramsRow programs={programs} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-grid-gap)]">
        <div className="lg:row-span-2">
          <TodaysPlan tasksCompleted={tasksCompleted} tasksTotal={tasksTotal} />
        </div>
        <ContinueLearning lessons={learning} />
        <GettingStarted />
        <div className="lg:col-span-2">
          <UpcomingContent days={weekDays} items={upcomingItems} />
        </div>
      </section>

      <ThisWeeksOverview
        entries={overviewEntries.length ? overviewEntries : FALLBACK_ENTRIES}
        platforms={platformOptions}
      />
    </div>
    </PageShell>
  );
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

// Fallback shown when the user has no lesson_progress rows yet. Slugs match
// real lessons in 0003_lessons_seed.sql so links don't 404.
const MOCK_LESSONS: Lesson[] = [
  {
    slug: "defining-niche-sweet-spot",
    title: "Defining Your Niche Sweet Spot",
    program_title: "The Influencer Blueprint",
    lesson_label: "Lesson 3",
    duration: "12:45",
    progress: 75,
  },
  {
    slug: "content-pillars-that-work",
    title: "Content Pillars That Work",
    program_title: "Content That Connects",
    lesson_label: "Lesson 5",
    duration: "15:30",
    progress: 50,
  },
  {
    slug: "hooks-that-stop-the-scroll",
    title: "Hooks That Stop The Scroll",
    program_title: "Content That Connects",
    lesson_label: "Lesson 6",
    duration: "11:20",
    progress: 25,
  },
];

// Fallback content for the week strip + cards, shown until the user has real
// posting_plan_items. One distribution drives both the dots and the cards, so
// today carries the three demo posts and the rest of the week shows the 1–4
// range — clicking a day reveals exactly that many cards.
const MOCK_DAY_COUNTS = [3, 2, 0, 1, 4, 0, 1];
const MOCK_PLATFORMS = ["instagram", "tiktok", "youtube"] as const;
const MOCK_LABELS: Record<(typeof MOCK_PLATFORMS)[number], string> = {
  instagram: "Instagram Post",
  tiktok: "TikTok Video",
  youtube: "YouTube Short",
};
const MOCK_TIMES = ["10:00 AM", "1:00 PM", "6:00 PM", "8:30 PM"];

const UPCOMING_ITEMS: UpcomingItem[] = MOCK_DAY_COUNTS.flatMap(
  (count, dayIndex) =>
    Array.from({ length: count }, (_, j): UpcomingItem => {
      const platform = MOCK_PLATFORMS[j % MOCK_PLATFORMS.length];
      return {
        id: `mock-${dayIndex}-${j}`,
        platform,
        label: MOCK_LABELS[platform],
        time: MOCK_TIMES[j % MOCK_TIMES.length],
        dayIndex,
      };
    }),
);

// Demo weekly entries shown until the user logs real performance. Dated
// relative to today so the calendar-window tabs (This Week / 7d / 30d) all
// resolve to sensible, non-empty ranges out of the box.
const FALLBACK_ENTRIES: OverviewEntry[] = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (5 - i) * 7); // 6 weekly points up to today
  const base = [820, 910, 1010, 1180, 1290, 1372][i];
  return {
    date: d.toISOString().slice(0, 10),
    followers: base,
    profileVisits: [220, 260, 240, 300, 340, 410][i],
    engagementRate: [2.2, 2.4, 2.3, 2.6, 2.7, 2.8][i],
    contentPublished: [3, 4, 4, 5, 6, 6][i],
  };
});
