import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { ReportsView, type ReportsData, type ReportsStudent } from "./reports-view";

export const metadata = { title: "Reports · Admin" };

type Params = Promise<{ id: string }>;

/**
 * /admin/programs/[id]/reports — live analytics.
 *
 * Every figure is aggregated here from guaranteed-applied tables (programs,
 * lessons, lesson_progress, profiles) and handed to the client view. No seeded
 * data: sparse programs render honest zeros / empty states. Enrollment follows
 * the platform's plan-gated access model (same as the Students tab).
 */
const VALID_PLAN_ENUM = ["free", "basic", "pro"];

function plansWithAccess(tier: string): string[] {
  switch (tier) {
    case "free":
      return ["free", "basic", "pro", "diamond"];
    case "basic":
      return ["basic", "pro", "diamond"];
    case "pro":
      return ["pro", "diamond"];
    case "diamond":
      return ["diamond"];
    default:
      return ["free", "basic", "pro", "diamond"];
  }
}

export default async function ReportsPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, title, plan_access")
    .eq("id", id)
    .maybeSingle();
  if (!program) notFound();

  const { data: lessonRows } = await supabase
    .from("lessons")
    .select("id, title, sort_order")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });
  const lessons = (lessonRows ?? []).map((l) => ({
    id: l.id as string,
    title: (l.title as string) ?? "Untitled lesson",
  }));
  const lessonIds = lessons.map((l) => l.id);
  const totalLessons = lessons.length;

  // Members with access (plan-gated). `profiles.plan` is the subscription_plan
  // enum (free | basic | pro) — filter to real enum values to avoid errors.
  const allowed = plansWithAccess((program.plan_access as string) ?? "basic").filter(
    (p) => VALID_PLAN_ENUM.includes(p),
  );
  let profiles: Array<Record<string, unknown>> = [];
  if (allowed.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, email, last_active_date")
      .in("plan", allowed);
    profiles = data ?? [];
  }
  const enrolled = profiles.length;

  type Prog = {
    user_id: string;
    lesson_id: string;
    completed: boolean;
    watched_seconds: number;
    completed_at: string | null;
  };
  let progress: Prog[] = [];
  if (lessonIds.length > 0 && profiles.length > 0) {
    const userIds = profiles.map((p) => p.id as string);
    const { data } = await supabase
      .from("lesson_progress")
      .select("user_id, lesson_id, completed, watched_seconds, completed_at")
      .in("lesson_id", lessonIds)
      .in("user_id", userIds);
    progress = (data ?? []).map((r) => ({
      user_id: r.user_id as string,
      lesson_id: r.lesson_id as string,
      completed: !!r.completed,
      watched_seconds: (r.watched_seconds as number) ?? 0,
      completed_at: (r.completed_at as string | null) ?? null,
    }));
  }

  // Per-user rollup.
  const byUser = new Map<
    string,
    { completed: Set<string>; watched: number; lastAt: string | null }
  >();
  for (const r of progress) {
    const e =
      byUser.get(r.user_id) ?? { completed: new Set<string>(), watched: 0, lastAt: null };
    e.watched += r.watched_seconds;
    if (r.completed) {
      e.completed.add(r.lesson_id);
      if (r.completed_at && (!e.lastAt || r.completed_at > e.lastAt)) e.lastAt = r.completed_at;
    }
    byUser.set(r.user_id, e);
  }

  // Server component renders once per request — reading the clock is safe here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const WEEK = 7 * 86_400_000;

  const memberStats = profiles.map((p) => {
    const e = byUser.get(p.id as string);
    const completedCount = e ? e.completed.size : 0;
    const watched = e ? e.watched : 0;
    const progressPct =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const lastTs = e?.lastAt ?? (p.last_active_date as string | null) ?? null;
    const lastDays = lastTs
      ? Math.max(0, Math.floor((now - new Date(lastTs).getTime()) / 86_400_000))
      : 9999;
    return { p, completedCount, watched, progressPct, lastTs, lastDays };
  });

  let completed = 0;
  let notStarted = 0;
  let inProgress = 0;
  for (const m of memberStats) {
    if (m.progressPct >= 100 && totalLessons > 0) completed++;
    else if (m.completedCount === 0 && m.watched === 0) notStarted++;
    else inProgress++;
  }

  const avgProgress =
    enrolled > 0
      ? Math.round(memberStats.reduce((s, m) => s + m.progressPct, 0) / enrolled)
      : 0;
  const completionRate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
  const activeWeek = memberStats.filter((m) => m.lastDays <= 7).length;

  // Per-lesson completion rate (% of enrolled who completed it).
  const completionByLesson = new Map<string, number>();
  for (const r of progress) {
    if (r.completed) {
      completionByLesson.set(r.lesson_id, (completionByLesson.get(r.lesson_id) ?? 0) + 1);
    }
  }
  const lessonPerf = lessons
    .map((l) => ({
      name: l.title,
      pct: enrolled > 0 ? Math.round(((completionByLesson.get(l.id) ?? 0) / enrolled) * 100) : 0,
    }))
    .slice(0, 6);

  // Weekly completion trend (last 8 weeks).
  const trend: { label: string; value: number }[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = now - (w + 1) * WEEK;
    const end = now - w * WEEK;
    const count = progress.filter((r) => {
      if (!r.completed || !r.completed_at) return false;
      const t = new Date(r.completed_at).getTime();
      return t >= start && t < end;
    }).length;
    const d = new Date(end);
    trend.push({
      label: `${d.toLocaleDateString(undefined, { month: "short" })} ${d.getDate()}`,
      value: count,
    });
  }

  const usersWithWatch = memberStats.filter((m) => m.watched > 0);
  const avgWatchSec =
    usersWithWatch.length > 0
      ? Math.round(usersWithWatch.reduce((s, m) => s + m.watched, 0) / usersWithWatch.length)
      : 0;
  const totalCompletions = progress.filter((r) => r.completed).length;

  const students: ReportsStudent[] = memberStats
    .slice()
    .sort((a, b) => b.progressPct - a.progressPct || a.lastDays - b.lastDays)
    .slice(0, 8)
    .map((m) => {
      const name =
        (m.p.full_name as string | null)?.trim() ||
        (m.p.display_name as string | null)?.trim() ||
        (m.p.email as string | null)?.split("@")[0] ||
        "Member";
      const status: ReportsStudent["status"] =
        m.progressPct >= 100 && totalLessons > 0
          ? "completed"
          : m.completedCount === 0 && m.watched === 0
            ? "not_started"
            : "in_progress";
      const risk: ReportsStudent["risk"] =
        status === "completed" ? "low" : m.lastDays > 14 ? "high" : m.lastDays > 7 ? "medium" : "low";
      return {
        id: m.p.id as string,
        name,
        initials: initials(name),
        progress: m.progressPct,
        last: m.lastTs
          ? new Date(m.lastTs).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—",
        status,
        risk,
      };
    });

  // Recommendations — derived from the live numbers above.
  const recommendations: { title: string; body: string }[] = [];
  const atRisk = memberStats.filter((m) => m.lastDays > 14 && m.progressPct < 100).length;
  if (enrolled === 0) {
    recommendations.push({
      title: "No members have access yet",
      body: "Adjust the program's access tier on the Access tab to reach members.",
    });
  }
  if (totalLessons === 0) {
    recommendations.push({
      title: "Add lessons to this program",
      body: "The curriculum is empty — build modules and videos on the Curriculum tab.",
    });
  }
  if (atRisk > 0) {
    recommendations.push({
      title: `${atRisk} member${atRisk === 1 ? "" : "s"} at risk`,
      body: "Inactive for 14+ days — consider a re-engagement message.",
    });
  }
  if (notStarted > 0 && enrolled > 0) {
    recommendations.push({
      title: `${notStarted} member${notStarted === 1 ? "" : "s"} haven't started`,
      body: "Nudge them toward the first lesson.",
    });
  }
  if (lessonPerf.length > 0) {
    const top = [...lessonPerf].sort((a, b) => b.pct - a.pct)[0];
    if (top && top.pct > 0) {
      recommendations.push({
        title: `“${top.name}” is your strongest lesson`,
        body: `${top.pct}% of members completed it.`,
      });
    }
  }

  const data: ReportsData = {
    programId: program.id as string,
    programSlug: program.slug as string,
    rangeLabel: "Last 8 weeks",
    kpis: { enrolled, completionRate, avgProgress, activeWeek },
    distribution: { completed, inProgress, notStarted, total: enrolled },
    lessons: lessonPerf,
    trend,
    engagement: {
      avgWatch: formatWatch(avgWatchSec),
      totalCompletions,
      activeWeek,
      avgProgress,
    },
    students,
    recommendations: recommendations.slice(0, 5),
  };

  return <ReportsView data={data} />;
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((n) => n[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M"
  );
}

function formatWatch(sec: number): string {
  if (sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
