import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { DashboardHero, type HeroJourney } from "@/components/dashboard/hero";
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
  // Start of today — a post earlier today should still show under "today"
  // (using `now` dropped any post scheduled before the current moment).
  const todayStartIso = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();

  // All independent reads in parallel
  const [
    { data: dbPrograms },
    { data: todayMissions },
    { data: progressRows },
    { data: postingItems },
    { data: performanceRows },
    { count: lessonsWatchedCount },
    { count: scheduledPostCount },
    { data: activePlanRow },
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
      .select("id, scheduled_for, platform, content_type, topic, status")
      .eq("user_id", user.id)
      .gte("scheduled_for", todayStartIso)
      .lte("scheduled_for", weekEndIso)
      .order("scheduled_for", { ascending: true })
      .limit(20),
    supabase
      .from("performance_entries")
      .select("week_start, followers, profile_visits, engagement_rate, clicks, posts_published, revenue")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(26),
    // Has the user watched at least one lesson? → Today's Plan step 1
    supabase
      .from("lesson_progress")
      .select("lesson_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("watched_seconds", 0),
    // Has the user scheduled/published at least one post? → Today's Plan step 3
    supabase
      .from("posting_plan_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("scheduled_for", "is", null),
    // Active posting plan id — lets the "Add Content" popup attach new posts.
    supabase
      .from("posting_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const tasksTotal = todayMissions?.length ?? 0;
  const tasksCompleted =
    todayMissions?.filter((m) => m.status === "completed").length ?? 0;

  // Today's Plan signals — real, so steps flip to "Completed" automatically.
  const watchedLesson = (lessonsWatchedCount ?? 0) > 0;
  const scheduledPost = (scheduledPostCount ?? 0) > 0;
  const activePlanId = activePlanRow?.id ?? null;

  // ── KPI metrics ───────────────────────────────────────────────────────
  const socials = ctx.railProfile.socials;
  const followers =
    (socials.instagram ?? 0) + (socials.tiktok ?? 0) + (socials.youtube ?? 0);
  const postsThisWeek = postingItems?.length ?? 0;
  // Revenue: latest weekly entry's revenue (Pro feature). Null/0 → render
  // "—" empty state in the KPI card instead of a fake number + goal.
  const revenue = Number(performanceRows?.[0]?.revenue ?? 0) || null;

  // Compute real per-program progress for the user. We do this in a
  // separate round-trip on top of the parallel reads above so the
  // dashboard card percentages reflect actual lesson_progress, not the
  // mock 68/42 numbers we used to render.
  const progressMap = dbPrograms?.length
    ? await getProgressForPrograms(dbPrograms.map((p) => p.id))
    : new Map();

  const programs: ProgramCard[] = (dbPrograms ?? []).map((p): ProgramCard => {
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
  });

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
  const learning: Lesson[] = (progressRows ?? [])
    .map((row) => row as unknown as ProgressLessonShape)
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
    });

  // ── Upcoming content (DB-backed posting items) ────────────────────────
  // Tag each scheduled post with a day index (0 = today … 6) so the strip
  // can filter by day. Dots and cards both derive from this one list, so
  // they always agree.
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayStart = startOfDay(now);

  const realUpcoming: UpcomingItem[] = (postingItems ?? [])
    .filter((p): p is typeof p & { scheduled_for: string } => !!p.scheduled_for)
    .map((p): UpcomingItem => {
      const when = new Date(p.scheduled_for);
      return {
        id: p.id,
        platform: (p.platform ?? "other") as UpcomingItem["platform"],
        status: (p.status ?? "planned") as UpcomingItem["status"],
        contentType: p.content_type ?? null,
        label: p.topic ?? `${p.platform ?? "Post"} ${p.content_type ?? "post"}`,
        time: when.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        dayIndex: Math.round((startOfDay(when) - todayStart) / 86_400_000),
      };
    })
    .filter((it) => it.dayIndex >= 0 && it.dayIndex <= 6);

  const upcomingItems: UpcomingItem[] = realUpcoming;

  // Dots per day are just the per-day tally of the items above.
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const it of upcomingItems) dayCounts[it.dayIndex] += 1;

  const weekDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return {
      short: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.getDate(),
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
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

  // ── Welcome-hero journey stage (start → continue → next program → done).
  // Derived from the user's real program progress so the hero evolves with
  // where they are. Falls back to "start" when no real programs are seeded.
  const hasRealPrograms = (dbPrograms?.length ?? 0) > 0;
  const recent = progressRows?.[0] as unknown as ProgressLessonShape | undefined;
  const recentLessonSlug = recent?.lessons?.slug ?? null;
  const recentProgramTitle = recent?.lessons?.programs?.title ?? null;

  const inProgressPrograms = programs.filter((p) => p.status === "in_progress");
  const continueProgram =
    inProgressPrograms.find((p) => p.title === recentProgramTitle) ??
    inProgressPrograms[0] ??
    null;
  const hasCompleted = programs.some((p) => p.status === "completed");
  const nextProgram = programs.find((p) => p.status === "not_started") ?? null;

  let journey: HeroJourney;
  if (hasRealPrograms && continueProgram) {
    const href =
      recentLessonSlug && continueProgram.title === recentProgramTitle
        ? `/programs/${continueProgram.slug}/${recentLessonSlug}`
        : `/programs/${continueProgram.slug}`;
    journey = {
      stage: "continue",
      programTitle: continueProgram.title,
      percent: continueProgram.progress ?? 0,
      primaryHref: href,
      secondaryHref: "/missions",
    };
  } else if (hasRealPrograms && hasCompleted && nextProgram) {
    journey = {
      stage: "next",
      programTitle: nextProgram.title,
      primaryHref: `/programs/${nextProgram.slug}`,
      secondaryHref: "/missions",
    };
  } else if (hasRealPrograms && hasCompleted) {
    journey = { stage: "done", primaryHref: "/tutorials", secondaryHref: "/missions" };
  } else {
    journey = { stage: "start", primaryHref: "/programs", secondaryHref: "/missions" };
  }

  return (
    <PageShell>
    <div className="space-y-[var(--mobile-section-gap)] lg:space-y-[var(--space-section-gap)] max-w-[var(--container-dashboard)] mx-auto">
      <DashboardHero
        firstName={firstName}
        plan={ctx.plan}
        profileCompletion={ctx.railProfile.profile_completion}
        avatarUrl={ctx.railProfile.avatar_url}
        journey={journey}
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
        }}
      />

      <ProgramsRow programs={programs} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-grid-gap)]">
        <div className="lg:row-span-2">
          <TodaysPlan
            tasksCompleted={tasksCompleted}
            tasksTotal={tasksTotal}
            watchedLesson={watchedLesson}
            scheduledPost={scheduledPost}
          />
        </div>
        <ContinueLearning lessons={learning} />
        <GettingStarted />
        <div className="lg:col-span-2">
          <UpcomingContent
            days={weekDays}
            items={upcomingItems}
            activePlanId={activePlanId}
          />
        </div>
      </section>

      <ThisWeeksOverview
        entries={overviewEntries}
        platforms={platformOptions}
      />
    </div>
    </PageShell>
  );
}

// All mock-data fallbacks (programs, lessons, upcoming content, weekly
// entries) were removed in the mock-data cleanup pass. Components now
// render their own empty states when a user has no rows yet.
