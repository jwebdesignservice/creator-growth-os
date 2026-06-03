import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export type AdminStats = {
  totalUsers: number;
  onboardedUsers: number;
  byCategory: Record<string, number>;
  byPlan: Record<string, number>;
  newThisWeek: number;
  recentSignups: {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
    plan: string;
    category: string;
    onboarded: boolean;
  }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createServiceClient();

  // Count total users (profiles)
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: onboardedUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("onboarded", true);

  // By category + by plan
  const { data: groups } = await supabase
    .from("profiles")
    .select("category, plan");

  const byCategory: Record<string, number> = {};
  const byPlan: Record<string, number> = {};
  for (const r of groups ?? []) {
    byCategory[r.category ?? "starter"] = (byCategory[r.category ?? "starter"] ?? 0) + 1;
    byPlan[r.plan ?? "free"] = (byPlan[r.plan ?? "free"] ?? 0) + 1;
  }

  // New this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: newThisWeek } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  // Recent signups (10)
  const { data: recent } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at, plan, category, onboarded")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    totalUsers: totalUsers ?? 0,
    onboardedUsers: onboardedUsers ?? 0,
    byCategory,
    byPlan,
    newThisWeek: newThisWeek ?? 0,
    recentSignups: (recent ?? []) as AdminStats["recentSignups"],
  };
}

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  category: string;
  plan: string;
  onboarded: boolean;
  daily_streak: number;
  last_active_date: string | null;
  created_at: string;
};

export type UsersListParams = {
  search?: string;
  category?: string;
  plan?: string;
  page?: number;
  pageSize?: number;
};

export async function getUsersList({
  search,
  category,
  plan,
  page = 0,
  pageSize = 25,
}: UsersListParams = {}): Promise<{ rows: AdminUserRow[]; total: number }> {
  const supabase = createServiceClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, display_name, category, plan, onboarded, daily_streak, last_active_date, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (plan) query = query.eq("plan", plan);
  if (search && search.trim().length > 0) {
    const s = search.trim();
    query = query.or(
      `email.ilike.%${s}%,full_name.ilike.%${s}%,display_name.ilike.%${s}%`,
    );
  }

  query = query.range(page * pageSize, page * pageSize + pageSize - 1);

  const { data, count } = await query;
  return { rows: (data ?? []) as AdminUserRow[], total: count ?? 0 };
}

export async function getUserDetail(userId: string) {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  // Quick aggregates
  const [{ count: missionsAssigned }, { count: missionsCompleted }, { count: weeksLogged }] =
    await Promise.all([
      supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("performance_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  return {
    profile,
    subscription,
    aggregates: {
      missionsAssigned: missionsAssigned ?? 0,
      missionsCompleted: missionsCompleted ?? 0,
      weeksLogged: weeksLogged ?? 0,
    },
  };
}

export async function getMissionTemplates() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("mission_templates")
    .select("id, title, description, mission_type, category, plan_access, points, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAnnouncements() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, audience_plan, audience_category, published_at")
    .order("published_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export type AdminEvent = {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  starts_at: string;
  duration_min: number;
  joined_count: number;
  url: string | null;
  kind: string | null;
};

/**
 * All community events (upcoming + past) for the admin manager. Defensive about
 * the `kind` column (migration 0051): if it isn't there yet, falls back to a
 * select without it so the list still renders.
 */
export async function getAdminEvents(): Promise<AdminEvent[]> {
  const supabase = createServiceClient();
  const cols =
    "id, title, description, host_name, starts_at, duration_min, joined_count, url";
  const primary = await supabase
    .from("community_events")
    .select(`${cols}, kind`)
    .order("starts_at", { ascending: true });
  let rows = primary.data as unknown as AdminEvent[] | null;
  if (primary.error?.code === "42703") {
    const fb = await supabase
      .from("community_events")
      .select(cols)
      .order("starts_at", { ascending: true });
    rows = fb.data as unknown as AdminEvent[] | null;
  }
  return (rows ?? []).map((e) => ({ ...e, kind: e.kind ?? null }));
}

/* ─────────────────────────────────────────────────────────────────────────
   Admin metrics — daily series for the top-of-dashboard chart.

   Real data is computed for what the schema supports today (signups,
   lesson completions, active students). Metrics that need a payments /
   billing source (revenue, earnings, course sales, course completions)
   return a zeroed series so the chart still renders and the UI can be
   audited end-to-end. Wire those up once the data lands.
   ───────────────────────────────────────────────────────────────────────── */

export type AdminMetricKey =
  | "revenue"
  | "earnings"
  | "course_sales"
  | "new_signups"
  | "active_students"
  | "lesson_completions"
  | "course_completions";

export type AdminMetricPoint = { date: string; value: number };
export type AdminMetricsSeries = Record<AdminMetricKey, AdminMetricPoint[]>;

const METRIC_WINDOW_DAYS = 90;

export async function getAdminMetricsSeries(): Promise<AdminMetricsSeries> {
  const supabase = createServiceClient();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (METRIC_WINDOW_DAYS - 1));

  // Pre-build an aligned 90-day calendar so every series shares the same x-axis.
  const days: string[] = [];
  for (let i = 0; i < METRIC_WINDOW_DAYS; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  const dayIndex = new Map(days.map((d, i) => [d, i]));
  const zeros = (): AdminMetricPoint[] => days.map((date) => ({ date, value: 0 }));

  const indexOfTimestamp = (ts: string | null | undefined): number | null => {
    if (!ts) return null;
    const d = new Date(ts).toISOString().slice(0, 10);
    return dayIndex.get(d) ?? null;
  };

  const startIso = start.toISOString();
  const [signupsRes, completionsRes, activityRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startIso),
    supabase
      .from("lesson_progress")
      .select("completed_at")
      .eq("completed", true)
      .gte("completed_at", startIso),
    supabase
      .from("lesson_progress")
      .select("user_id, updated_at")
      .gte("updated_at", startIso),
  ]);

  const newSignups = zeros();
  for (const row of signupsRes.data ?? []) {
    const i = indexOfTimestamp(row.created_at as string | null);
    if (i !== null) newSignups[i].value += 1;
  }

  const lessonCompletions = zeros();
  for (const row of completionsRes.data ?? []) {
    const i = indexOfTimestamp(row.completed_at as string | null);
    if (i !== null) lessonCompletions[i].value += 1;
  }

  // Active students = distinct user_id with any lesson_progress activity per day.
  const activeBuckets = new Map<number, Set<string>>();
  for (const row of activityRes.data ?? []) {
    const i = indexOfTimestamp(row.updated_at as string | null);
    if (i === null) continue;
    const set = activeBuckets.get(i) ?? new Set<string>();
    set.add(row.user_id as string);
    activeBuckets.set(i, set);
  }
  const activeStudents = zeros();
  for (const [i, set] of activeBuckets) activeStudents[i].value = set.size;

  return {
    revenue: zeros(),
    earnings: zeros(),
    course_sales: zeros(),
    new_signups: newSignups,
    active_students: activeStudents,
    lesson_completions: lessonCompletions,
    course_completions: zeros(),
  };
}

/* ───────────────────────────────────────────────────────────────────── */
/* Active program builds — what the admin is currently working on        */

export type BuildStatus = "in_progress" | "draft" | "ready_to_publish";

export type ActiveProgramBuild = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  plan_access: "free" | "basic" | "pro";
  cover_image_url: string | null;
  total_lessons: number;
  total_tasks: number;
  created_at: string;
  published: boolean;
  modulesCount: number;
  buildPct: number;
  status: BuildStatus;
  lastEdited: string;
  cta: { label: string; href: string };
};

/**
 * Returns the top N programs the admin is currently building, decorated
 * with a synthetic build-completeness percent + status derived from how
 * much of the program's structure has been filled in (description /
 * thumbnail / modules / lessons / tasks / published).
 *
 * Powers the dashboard's "Continue where you left off" section. Once a
 * real updated_at + per-program build progress lives in the DB, swap the
 * heuristic for that.
 */
export async function getActiveProgramBuilds(
  limit = 3,
): Promise<ActiveProgramBuild[]> {
  const supabase = createServiceClient();

  const { data: programs } = await supabase
    .from("programs")
    .select(
      "id, slug, title, description, plan_access, cover_image_url, total_lessons, total_tasks, created_at, published",
    )
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (!programs || programs.length === 0) return [];

  // Distinct modules per program — from the lessons table's module_number.
  const ids = programs.map((p) => p.id);
  const { data: lessonRows } = await supabase
    .from("lessons")
    .select("program_id, module_number")
    .in("program_id", ids);

  const modulesByProgram = new Map<string, Set<number>>();
  for (const l of lessonRows ?? []) {
    if (!modulesByProgram.has(l.program_id)) {
      modulesByProgram.set(l.program_id, new Set());
    }
    if (l.module_number != null) {
      modulesByProgram.get(l.program_id)!.add(l.module_number);
    }
  }

  return programs.map((p): ActiveProgramBuild => {
    const modulesCount = modulesByProgram.get(p.id)?.size ?? 0;
    const buildPct = computeBuildPct({
      hasDescription: !!p.description,
      hasCover: !!p.cover_image_url,
      modulesCount,
      totalLessons: p.total_lessons ?? 0,
      totalTasks: p.total_tasks ?? 0,
      published: !!p.published,
    });
    const status = computeBuildStatus(p.published, buildPct);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      plan_access: p.plan_access as ActiveProgramBuild["plan_access"],
      cover_image_url: p.cover_image_url,
      total_lessons: p.total_lessons ?? 0,
      total_tasks: p.total_tasks ?? 0,
      created_at: p.created_at,
      published: p.published,
      modulesCount,
      buildPct,
      status,
      lastEdited: relativeTime(p.created_at),
      cta: computeBuildCta(p.id, status, !!p.cover_image_url),
    };
  });
}

function computeBuildPct(input: {
  hasDescription: boolean;
  hasCover: boolean;
  modulesCount: number;
  totalLessons: number;
  totalTasks: number;
  published: boolean;
}): number {
  let pct = 0;
  if (input.hasDescription) pct += 15;
  if (input.hasCover) pct += 20;
  if (input.modulesCount > 0) pct += 25;
  if (input.totalLessons > 0) pct += 25;
  if (input.totalTasks > 0) pct += 15;
  return Math.min(100, pct);
}

function computeBuildStatus(
  published: boolean,
  buildPct: number,
): BuildStatus {
  if (published) return "in_progress";
  if (buildPct >= 70) return "ready_to_publish";
  if (buildPct >= 40) return "in_progress";
  return "draft";
}

function computeBuildCta(
  programId: string,
  status: BuildStatus,
  hasCover: boolean,
): { label: string; href: string } {
  const href = `/admin/programs/${programId}`;
  if (!hasCover) return { label: "Add thumbnail", href };
  if (status === "ready_to_publish") return { label: "Finish pricing", href };
  if (status === "draft") return { label: "Continue building", href };
  return { label: "Continue curriculum", href };
}

function relativeTime(iso: string): string {
  const created = new Date(iso).getTime();
  const diffMs = Date.now() - created;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
