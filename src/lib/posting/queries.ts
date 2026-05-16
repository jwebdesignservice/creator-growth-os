import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PlatformKey =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "snapchat"
  | "linkedin"
  | "multiple"
  | "other";

export type ContentStatus =
  | "idea"
  | "planned"
  | "scripted"
  | "filmed"
  | "edited"
  | "posted"
  | "reviewed";

export type ActivePlan = {
  id: string;
  title: string;
  week_start: string;
  description: string | null;
  status: string;
  /** 0-100 derived from item statuses */
  progress: number;
};

export type PostingItem = {
  id: string;
  scheduled_for: string | null;
  platform: PlatformKey | null;
  content_type: string | null;
  topic: string | null;
  status: ContentStatus;
};

export type WeeklyStats = {
  total: number;
  by_type: { label: string; count: number; color: string }[];
};

export type PillarSlice = {
  label: string;
  weight: number;
};

const TYPE_LABEL: Record<string, string> = {
  reel: "Reels",
  short_video: "Short Video",
  carousel: "Carousels",
  story: "Stories",
  video: "Videos",
  youtube_video: "YouTube Video",
  post: "Posts",
};

const TYPE_COLOR: Record<string, string> = {
  reel: "var(--rose-500)",
  short_video: "var(--ink-700)",
  carousel: "var(--rose-300)",
  story: "var(--rose-200)",
  video: "var(--rose-400)",
  youtube_video: "var(--rose-500)",
  post: "var(--rose-300)",
};

const PILLAR_LABEL: Record<string, string> = {
  education: "Education",
  lifestyle: "Lifestyle",
  motivation: "Inspiration",
  inspiration: "Inspiration",
  behind_the_scenes: "Behind the Scenes",
  personal_brand: "Personal Brand",
  business_monetization: "Promotion",
  promotion: "Promotion",
};

export async function getActivePlan(): Promise<ActivePlan | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: plan } = await supabase
    .from("posting_plans")
    .select("id, title, week_start, description, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return null;

  const { data: items } = await supabase
    .from("posting_plan_items")
    .select("status")
    .eq("plan_id", plan.id);

  const total = items?.length ?? 0;
  const done = (items ?? []).filter(
    (i) => i.status === "posted" || i.status === "reviewed",
  ).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return { ...plan, progress };
}

export async function getPlannedItems(
  planId: string | null,
  limit = 4,
): Promise<PostingItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("posting_plan_items")
    .select("id, scheduled_for, platform, content_type, topic, status")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (planId) query = query.eq("plan_id", planId);

  const { data: items } = await query;
  return (items ?? []) as PostingItem[];
}

export async function getWeeklyStats(planId: string | null): Promise<WeeklyStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { total: 0, by_type: [] };

  let query = supabase
    .from("posting_plan_items")
    .select("content_type")
    .eq("user_id", user.id);
  if (planId) query = query.eq("plan_id", planId);

  const { data: items } = await query;
  const counts = new Map<string, number>();
  for (const it of items ?? []) {
    const k = it.content_type ?? "post";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const by_type = Array.from(counts.entries()).map(([k, count]) => ({
    label: TYPE_LABEL[k] ?? prettyLabel(k),
    count,
    color: TYPE_COLOR[k] ?? "var(--rose-400)",
  }));

  return {
    total: items?.length ?? 0,
    by_type,
  };
}

export async function getUserPillars(): Promise<PillarSlice[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: pillars } = await supabase
    .from("content_pillars")
    .select("label, weight")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (!pillars || pillars.length === 0) return [];

  // Normalise weights to sum to 100
  const sum = pillars.reduce((s, p) => s + (p.weight ?? 0), 0) || pillars.length;
  return pillars.map((p) => ({
    label: PILLAR_LABEL[p.label] ?? prettyLabel(p.label),
    weight: Math.max(
      1,
      Math.round(((p.weight ?? 25) / sum) * 100),
    ),
  }));
}

function prettyLabel(slug: string) {
  return slug
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
