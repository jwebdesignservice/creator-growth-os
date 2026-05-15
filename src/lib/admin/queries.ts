import "server-only";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_templates")
    .select("id, title, description, mission_type, category, plan_access, points, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAnnouncements() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, audience_plan, audience_category, published_at")
    .order("published_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
