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
  created_at: string;
  /** 0-100: published posts (posted | reviewed) / total */
  progress: number;
  total: number;
  platforms: number;
  // Pipeline phase counts — always sum to `total`.
  ideas: number; // idea
  planned: number; // planned
  inProduction: number; // scripted | filmed | edited
  published: number; // posted | reviewed
  nextPost: {
    scheduled_for: string;
    platform: PlatformKey | null;
    content_type: string | null;
  } | null;
};

export type PostingItem = {
  id: string;
  scheduled_for: string | null;
  platform: PlatformKey | null;
  content_type: string | null;
  topic: string | null;
  /** Caption / description (migration 0042) — null pre-migration. */
  notes?: string | null;
  /** Attached media public URL (migration 0057) — null pre-migration. */
  media_url?: string | null;
  status: ContentStatus;
  /** Publish lifecycle (migration 0060) — absent pre-migration. */
  publish_state?: "draft" | "queued" | "publishing" | "published" | "failed";
  published_url?: string | null;
  publish_error?: string | null;
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
    .select("id, title, week_start, description, status, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return null;

  const { data: items } = await supabase
    .from("posting_plan_items")
    .select("status, platform, content_type, scheduled_for")
    .eq("plan_id", plan.id);

  const list = (items ?? []) as {
    status: ContentStatus;
    platform: PlatformKey | null;
    content_type: string | null;
    scheduled_for: string | null;
  }[];

  const total = list.length;
  const ideas = list.filter((i) => i.status === "idea").length;
  const planned = list.filter((i) => i.status === "planned").length;
  const IN_PRODUCTION = new Set(["scripted", "filmed", "edited"]);
  const inProduction = list.filter((i) => IN_PRODUCTION.has(i.status)).length;
  const PUBLISHED = new Set(["posted", "reviewed"]);
  const published = list.filter((i) => PUBLISHED.has(i.status)).length;
  const progress = total === 0 ? 0 : Math.round((published / total) * 100);
  const platforms = new Set(
    list.map((i) => i.platform).filter((p): p is PlatformKey => !!p),
  ).size;

  // Soonest upcoming scheduled post.
  const now = Date.now();
  const upcoming = list
    .filter((i) => i.scheduled_for && new Date(i.scheduled_for).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_for!).getTime() -
        new Date(b.scheduled_for!).getTime(),
    );
  const nextPost = upcoming[0]
    ? {
        scheduled_for: upcoming[0].scheduled_for as string,
        platform: upcoming[0].platform,
        content_type: upcoming[0].content_type,
      }
    : null;

  return {
    ...plan,
    progress,
    total,
    platforms,
    ideas,
    planned,
    inProduction,
    published,
    nextPost,
  };
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

  const buildQuery = (cols: string) => {
    let q = supabase
      .from("posting_plan_items")
      .select(cols)
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: true })
      .limit(limit);
    if (planId) q = q.eq("plan_id", planId);
    return q;
  };

  // `notes` (caption, 0042), `media_url` (attachment, 0057) and the publish
  // lifecycle columns (0060) feed the queue cards; degrade column-by-column
  // pre-migration, same fail-soft as the detail popup (42703 =
  // undefined_column).
  let res = await buildQuery(
    "id, scheduled_for, platform, content_type, topic, notes, media_url, status, publish_state, published_url, publish_error",
  );
  if (res.error?.code === "42703") {
    res = await buildQuery(
      "id, scheduled_for, platform, content_type, topic, notes, media_url, status",
    );
  }
  if (res.error?.code === "42703") {
    res = await buildQuery(
      "id, scheduled_for, platform, content_type, topic, notes, status",
    );
  }
  if (res.error?.code === "42703") {
    res = await buildQuery(
      "id, scheduled_for, platform, content_type, topic, status",
    );
  }
  return (res.data ?? []) as unknown as PostingItem[];
}

export type ItemPhase = {
  item_id: string;
  stage: ContentStatus;
  scheduled_for: string | null;
};

/**
 * All scheduled production phases for the given posts (the per-stage dates set
 * in the post detail popup). Returns [] if the phases table isn't applied yet
 * (migration 0055), so the calendar degrades to single-day rendering.
 */
export async function getItemPhases(itemIds: string[]): Promise<ItemPhase[]> {
  if (itemIds.length === 0) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("posting_item_phases")
    .select("item_id, stage, scheduled_for")
    .in("item_id", itemIds)
    .eq("user_id", user.id);
  if (error || !data) return [];

  return data.map((r) => ({
    item_id: (r as { item_id: string }).item_id,
    stage: (r as { stage: ContentStatus }).stage,
    scheduled_for:
      ((r as { scheduled_for: string | null }).scheduled_for) ?? null,
  }));
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
