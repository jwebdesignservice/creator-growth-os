import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { DashboardHero, type HeroJourney } from "@/components/dashboard/hero";
import { ProgramsCard } from "@/components/dashboard/programs-card";
import {
  TutorialsCard,
  ContentCard,
  TasksCard,
  PerformanceCard,
  CommunityCard,
} from "@/components/dashboard/launcher-tiles";
import { getProgressForPrograms } from "@/lib/programs/queries";
import { getLang, getT } from "@/lib/i18n/server";

export const metadata = { title: "Dashboard | Profluencer" };

type ProgressLessonShape = {
  watched_seconds: number;
  lessons: {
    slug: string;
    title: string;
    duration_seconds: number;
    programs?: { title: string } | null;
  } | null;
};

const HUES = ["rose", "warm", "cream"] as const;

export default async function DashboardPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");
  const { user, profile } = ctx;
  const supabase = await createClient();
  const lang = await getLang();
  const t = await getT();

  const firstName = (
    profile?.display_name ??
    profile?.full_name ??
    user.email?.split("@")[0] ??
    "Creator"
  ).split(" ")[0];

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndIso = weekEnd.toISOString();
  const todayStartIso = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();

  const [
    { data: dbPrograms },
    { data: todayMissions },
    { data: progressRows },
    { data: postingItems },
    { data: performanceRows },
    { count: tutorialsCount },
    { data: memberRows, count: memberCount },
  ] = await Promise.all([
    supabase
      .from("programs")
      .select("id, slug, title, description, plan_access, cover_image_url")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
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
        "completed, watched_seconds, updated_at, lessons(slug, title, duration_seconds, programs(title))",
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
      .select("week_start, followers")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(26),
    // Standalone tutorials = published lessons not attached to a program.
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .is("program_id", null),
    // Community members (+ a few avatars for the cluster).
    supabase.from("profiles").select("avatar_url", { count: "exact" }).limit(12),
  ]);

  // ── Programs (covers + journey) ───────────────────────────────────────
  const progressMap = dbPrograms?.length
    ? await getProgressForPrograms(dbPrograms.map((p) => p.id))
    : new Map();

  const progs = (dbPrograms ?? []).map((p, i) => {
    const percent = progressMap.get(p.id)?.percent ?? 0;
    const isProLocked = p.plan_access === "pro" && ctx.plan !== "pro";
    const status = isProLocked
      ? "pro_only"
      : percent >= 100
        ? "completed"
        : percent > 0
          ? "in_progress"
          : "not_started";
    return {
      slug: p.slug,
      title: p.title,
      status,
      percent,
      hue: HUES[i % HUES.length],
      imageUrl: p.cover_image_url ?? null,
    };
  });

  const programsTotal = progs.length;
  const programsInProgress = progs.filter(
    (p) => p.status === "in_progress",
  ).length;
  const coverRank = (s: string) =>
    s === "in_progress" ? 0 : s === "not_started" ? 1 : s === "completed" ? 2 : 3;
  const programCovers = [...progs]
    .sort(
      (a, b) => coverRank(a.status) - coverRank(b.status) || b.percent - a.percent,
    )
    .slice(0, 3)
    .map((p) => ({
      imageUrl: p.imageUrl,
      hue: p.hue,
      progress: p.status === "in_progress" ? p.percent : null,
    }));
  const allCovered =
    programCovers.length > 0 && programCovers.every((c) => c.imageUrl);
  const consistentCovers = allCovered
    ? programCovers
    : programCovers.map((c) => ({ ...c, imageUrl: null }));
  const launcherCovers =
    consistentCovers.length > 0
      ? consistentCovers
      : [
          { imageUrl: null, hue: "rose" as const, progress: null },
          { imageUrl: null, hue: "warm" as const, progress: null },
          { imageUrl: null, hue: "cream" as const, progress: null },
        ];

  // ── Hero journey ──────────────────────────────────────────────────────
  const recent = progressRows?.[0] as unknown as ProgressLessonShape | undefined;
  const recentLessonSlug = recent?.lessons?.slug ?? null;
  const recentProgramTitle = recent?.lessons?.programs?.title ?? null;
  const inProgressPrograms = progs.filter((p) => p.status === "in_progress");
  const continueProgram =
    inProgressPrograms.find((p) => p.title === recentProgramTitle) ??
    inProgressPrograms[0] ??
    null;
  const hasCompleted = progs.some((p) => p.status === "completed");
  const nextProgram = progs.find((p) => p.status === "not_started") ?? null;

  let journey: HeroJourney;
  if (progs.length > 0 && continueProgram) {
    const href =
      recentLessonSlug && continueProgram.title === recentProgramTitle
        ? `/programs/${continueProgram.slug}/${recentLessonSlug}`
        : `/programs/${continueProgram.slug}`;
    journey = {
      stage: "continue",
      programTitle: continueProgram.title,
      percent: continueProgram.percent,
      primaryHref: href,
      secondaryHref: "/missions",
    };
  } else if (progs.length > 0 && hasCompleted && nextProgram) {
    journey = {
      stage: "next",
      programTitle: nextProgram.title,
      primaryHref: `/programs/${nextProgram.slug}`,
      secondaryHref: "/missions",
    };
  } else if (progs.length > 0 && hasCompleted) {
    journey = { stage: "done", primaryHref: "/tutorials", secondaryHref: "/missions" };
  } else {
    journey = { stage: "start", primaryHref: "/programs", secondaryHref: "/missions" };
  }

  const hour = now.getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const greeting = `${now.toLocaleDateString(lang, { weekday: "long" })} ${t(partOfDay)}`;

  const fmtClock = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, "0")}`;
  };

  type HeroView = {
    headline: string;
    subline: string;
    primaryLabel: string;
    primaryHref: string;
    resume: {
      programTitle: string;
      percent: number;
      lessonTitle: string | null;
      lessonMeta: string | null;
    } | null;
  };

  let hero: HeroView;
  if (journey.stage === "continue") {
    const sameProgram = recentProgramTitle === journey.programTitle;
    const dur = recent?.lessons?.duration_seconds ?? 0;
    const watched = recent?.watched_seconds ?? 0;
    hero = {
      headline: t("Welcome back, {name}.", { name: firstName }),
      subline: t("Pick up where you left off — or explore somewhere new."),
      primaryLabel: t("Continue program"),
      primaryHref: journey.primaryHref,
      resume: {
        programTitle: journey.programTitle,
        percent: journey.percent,
        lessonTitle: sameProgram ? recent?.lessons?.title ?? null : null,
        lessonMeta:
          sameProgram && dur > 0
            ? t("{time} left", { time: fmtClock(Math.max(0, dur - watched)) })
            : null,
      },
    };
  } else if (journey.stage === "next") {
    hero = {
      headline: t("Welcome back, {name}.", { name: firstName }),
      subline: t("Ready for your next program? {title} is up.", {
        title: journey.programTitle,
      }),
      primaryLabel: t("Start next program"),
      primaryHref: journey.primaryHref,
      resume: null,
    };
  } else if (journey.stage === "done") {
    hero = {
      headline: t("Nice work, {name}.", { name: firstName }),
      subline: t("You've completed every program — keep sharpening with tutorials."),
      primaryLabel: t("Explore tutorials"),
      primaryHref: journey.primaryHref,
      resume: null,
    };
  } else {
    hero = {
      headline: t("Welcome, {name}.", { name: firstName }),
      subline: t("Start your first program — we'll guide you step by step."),
      primaryLabel: t("Browse programs"),
      primaryHref: journey.primaryHref,
      resume: null,
    };
  }

  // ── Tasks ─────────────────────────────────────────────────────────────
  const tasksTotal = todayMissions?.length ?? 0;
  const tasksCompleted =
    todayMissions?.filter((m) => m.status === "completed").length ?? 0;
  const taskList = (todayMissions ?? []).slice(0, 3).map((m) => ({
    title: m.title,
    done: m.status === "completed",
  }));

  // ── Posting Plans (week schedule) ─────────────────────────────────────
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayStart = startOfDay(now);
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const p of postingItems ?? []) {
    if (!p.scheduled_for) continue;
    const idx = Math.round(
      (startOfDay(new Date(p.scheduled_for)) - todayStart) / 86_400_000,
    );
    if (idx >= 0 && idx <= 6) dayCounts[idx] += 1;
  }
  const contentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return {
      letter: d.toLocaleDateString(lang, { weekday: "short" }).charAt(0),
      count: dayCounts[i],
      isToday: i === 0,
    };
  });
  const postsThisWeek = postingItems?.length ?? 0;

  // Upcoming scheduled posts — previews the content calendar on the tile.
  const upcomingPosts = (postingItems ?? [])
    .filter((p): p is typeof p & { scheduled_for: string } => !!p.scheduled_for)
    .slice(0, 3)
    .map((p) => {
      const when = new Date(p.scheduled_for);
      const idx = Math.round(
        (startOfDay(when) - todayStart) / 86_400_000,
      );
      const day =
        idx === 0
          ? t("Today")
          : idx === 1
            ? t("Tomorrow")
            : when.toLocaleDateString(lang, { weekday: "short" });
      const time = when.toLocaleTimeString(lang, {
        hour: "numeric",
        minute: "2-digit",
      });
      return {
        platform: p.platform ?? "other",
        type: (p.content_type ?? p.topic ?? "Post").toString(),
        when: `${day} · ${time}`,
      };
    });

  // ── Performance ───────────────────────────────────────────────────────
  const socials = ctx.railProfile.socials;
  const followers =
    (socials.instagram ?? 0) + (socials.tiktok ?? 0) + (socials.youtube ?? 0);
  const followersSeries =
    performanceRows && performanceRows.length > 0
      ? [...performanceRows].reverse().map((r) => r.followers ?? 0)
      : [];
  // Recent momentum (week-over-week), signed — the tile renders direction.
  const perfDelta = (() => {
    const s = followersSeries;
    if (s.length < 2) return 0;
    const last = s[s.length - 1];
    const prev = s[s.length - 2] || last || 1;
    return ((last - prev) / Math.max(1, Math.abs(prev))) * 100;
  })();

  // ── Community ─────────────────────────────────────────────────────────
  const members = memberCount ?? 0;
  const memberAvatars = (memberRows ?? [])
    .map((r) => r.avatar_url)
    .filter((a): a is string => !!a)
    .slice(0, 4);

  const tutorialsTotal = tutorialsCount ?? 0;

  return (
    <PageShell>
      <div className="space-y-[var(--mobile-section-gap)] lg:space-y-[var(--space-section-gap)]">
        <DashboardHero
          firstName={firstName}
          greeting={greeting}
          avatarUrl={ctx.railProfile.avatar_url}
          plan={ctx.plan}
          headline={hero.headline}
          subline={hero.subline}
          primaryLabel={hero.primaryLabel}
          primaryHref={hero.primaryHref}
          resume={hero.resume}
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-grid-gap)]">
          <ProgramsCard
            href="/programs"
            total={programsTotal}
            inProgress={programsInProgress}
            covers={launcherCovers}
          />
          <TutorialsCard total={tutorialsTotal} />
          <ContentCard
            thisWeek={postsThisWeek}
            posts={upcomingPosts}
            days={contentDays}
          />
          <TasksCard
            dueToday={tasksTotal}
            completed={tasksCompleted}
            total={tasksTotal}
            tasks={taskList}
          />
          <PerformanceCard
            followers={followers}
            series={followersSeries}
            deltaPct={perfDelta}
          />
          <CommunityCard members={members} avatars={memberAvatars} />
        </section>
      </div>
    </PageShell>
  );
}
