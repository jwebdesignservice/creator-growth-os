import { createClient } from "@/lib/supabase/server";

export type CommunitySpace = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: "starter" | "growth" | "monetization" | "scale" | null;
  member_count: number;
  featured: boolean;
};

export type CommunityPost = {
  id: string;
  space_id: string;
  space_name: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  title: string;
  body: string;
  reply_count: number;
  created_at: string;
  last_reply_at: string | null;
};

export type CommunityEvent = {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  starts_at: string;
  duration_min: number;
  joined_count: number;
  url: string | null;
};

export async function listSpaces(): Promise<CommunitySpace[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_spaces")
    .select("id, slug, name, description, category, member_count, featured")
    .order("sort_order", { ascending: true });
  return (data ?? []) as CommunitySpace[];
}

export async function listRecentPosts(limit = 8): Promise<CommunityPost[]> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("community_posts")
    .select(
      "id, space_id, user_id, title, body, reply_count, created_at, last_reply_at",
    )
    .order("last_reply_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!posts?.length) return [];

  const spaceIds = Array.from(new Set(posts.map((p) => p.space_id)));
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)));

  const [{ data: spaces }, { data: profiles }] = await Promise.all([
    supabase.from("community_spaces").select("id, name").in("id", spaceIds),
    supabase
      .from("profiles")
      .select("id, display_name, full_name, avatar_url")
      .in("id", userIds),
  ]);

  const spaceMap = new Map(spaces?.map((s) => [s.id, s.name]) ?? []);
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  return posts.map((p): CommunityPost => {
    const profile = profileMap.get(p.user_id);
    return {
      id: p.id,
      space_id: p.space_id,
      space_name: spaceMap.get(p.space_id) ?? "Community",
      user_id: p.user_id,
      author_name:
        profile?.display_name ?? profile?.full_name ?? "Creator",
      author_avatar: profile?.avatar_url ?? null,
      title: p.title,
      body: p.body,
      reply_count: p.reply_count,
      created_at: p.created_at,
      last_reply_at: p.last_reply_at,
    };
  });
}

export async function listUpcomingEvents(limit = 4): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_events")
    .select(
      "id, title, description, host_name, starts_at, duration_min, joined_count, url",
    )
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  return (data ?? []) as CommunityEvent[];
}

export async function listMemberSpotlight(limit = 3) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, avatar_url, category, primary_platform")
    .not("onboarded", "is", null)
    .eq("onboarded", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
