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
  pinned: boolean;
  author_is_admin: boolean;
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
  kind: string | null;
  cover_image_url: string | null;
};

export async function listSpaces(): Promise<CommunitySpace[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_spaces")
    .select("id, slug, name, description, category, member_count, featured")
    .order("sort_order", { ascending: true });
  return (data ?? []) as CommunitySpace[];
}

type RecentPostRow = {
  id: string;
  space_id: string;
  user_id: string;
  title: string;
  body: string;
  reply_count: number;
  created_at: string;
  last_reply_at: string | null;
  pinned_at?: string | null;
};

export async function listRecentPosts(limit = 8): Promise<CommunityPost[]> {
  const supabase = await createClient();
  const cols =
    "id, space_id, user_id, title, body, reply_count, created_at, last_reply_at";

  // Prefer ordering pinned posts first (migration 0054). Fall back without
  // pinned_at if that column doesn't exist yet.
  // Pinned first, then most-recent (by created_at) so a brand-new thread —
  // which has no replies yet — always lands at the top. The client-side
  // sort filter (Most recent / popular / liked / commented) re-orders from here.
  const primary = await supabase
    .from("community_posts")
    .select(`${cols}, pinned_at`)
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  let posts = primary.data as unknown as RecentPostRow[] | null;
  if (primary.error?.code === "42703") {
    const fb = await supabase
      .from("community_posts")
      .select(cols)
      .order("created_at", { ascending: false })
      .limit(limit);
    posts = fb.data as unknown as RecentPostRow[] | null;
  }

  if (!posts?.length) return [];

  const spaceIds = Array.from(new Set(posts.map((p) => p.space_id)));
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)));

  const [{ data: spaces }, { data: profiles }, { data: admins }] =
    await Promise.all([
      supabase.from("community_spaces").select("id, name").in("id", spaceIds),
      supabase
        .from("profiles")
        .select("id, display_name, full_name, avatar_url")
        .in("id", userIds),
      supabase.from("admin_users").select("user_id").in("user_id", userIds),
    ]);

  const spaceMap = new Map(spaces?.map((s) => [s.id, s.name]) ?? []);
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  const adminSet = new Set((admins ?? []).map((a) => a.user_id));

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
      pinned: !!p.pinned_at,
      author_is_admin: adminSet.has(p.user_id),
    };
  });
}

export async function listAllEvents(limit = 100): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  const cols =
    "id, title, description, host_name, starts_at, duration_min, joined_count, url";

  // Past + upcoming events (ascending by start) — the Events tab filters and
  // sorts them client-side (Upcoming / Past / All / date ranges). Prefer
  // selecting `kind` + `cover_image_url` (migrations 0051/0052); fall back to
  // just `kind` so events still render before 0052 is applied.
  const primary = await supabase
    .from("community_events")
    .select(`${cols}, kind, cover_image_url`)
    .order("starts_at", { ascending: true })
    .limit(limit);
  let rows = primary.data as unknown as CommunityEvent[] | null;
  if (primary.error?.code === "42703") {
    const fb = await supabase
      .from("community_events")
      .select(`${cols}, kind`)
      .order("starts_at", { ascending: true })
      .limit(limit);
    rows = fb.data as unknown as CommunityEvent[] | null;
  }
  return (rows ?? []).map((e) => ({
    ...e,
    kind: e.kind ?? null,
    cover_image_url: e.cover_image_url ?? null,
  }));
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

export type CommunityReply = {
  id: string;
  post_id: string;
  parent_reply_id: string | null;
  author_name: string;
  author_avatar: string | null;
  body: string;
  created_at: string;
  reactions: PostReaction[];
};

/**
 * Fetch replies for a set of posts (oldest → newest), keyed by post_id, so the
 * Feed can show the actual conversation inline. Read-only; reuses the existing
 * `community_replies` table.
 */
export async function listRepliesForPosts(
  postIds: string[],
  userId: string,
): Promise<Map<string, CommunityReply[]>> {
  const map = new Map<string, CommunityReply[]>();
  if (postIds.length === 0) return map;

  const supabase = await createClient();

  // Prefer selecting parent_reply_id (migration 0049). If that column doesn't
  // exist yet, fall back without it so existing replies still render.
  type ReplyRow = {
    id: string;
    post_id: string;
    user_id: string;
    body: string;
    created_at: string;
    parent_reply_id?: string | null;
  };
  const primary = await supabase
    .from("community_replies")
    .select("id, post_id, user_id, body, created_at, parent_reply_id")
    .in("post_id", postIds)
    .order("created_at", { ascending: true });
  let replies = primary.data as ReplyRow[] | null;
  if (primary.error?.code === "42703") {
    const fallback = await supabase
      .from("community_replies")
      .select("id, post_id, user_id, body, created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });
    replies = fallback.data as ReplyRow[] | null;
  }
  if (!replies?.length) return map;

  const userIds = Array.from(new Set(replies.map((r) => r.user_id)));
  const replyIds = replies.map((r) => r.id);

  const [{ data: profiles }, reactionsByReply] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, full_name, avatar_url")
      .in("id", userIds),
    getReplyReactions(replyIds, userId),
  ]);
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  for (const r of replies) {
    const profile = profileMap.get(r.user_id);
    const reply: CommunityReply = {
      id: r.id,
      post_id: r.post_id,
      parent_reply_id:
        (r as { parent_reply_id?: string | null }).parent_reply_id ?? null,
      author_name: profile?.display_name ?? profile?.full_name ?? "Creator",
      author_avatar: profile?.avatar_url ?? null,
      body: r.body,
      created_at: r.created_at,
      reactions: reactionsByReply.get(r.id) ?? [],
    };
    const arr = map.get(r.post_id);
    if (arr) arr.push(reply);
    else map.set(r.post_id, [reply]);
  }
  return map;
}

export type PostVotes = { likes: number; dislikes: number; myVote: 0 | 1 | -1 };

/**
 * Like / dislike tallies per post, plus the current user's own vote. Reads
 * `community_post_votes` (migration 0047). DEFENSIVE: if that table doesn't
 * exist yet (migration not applied), returns an empty map so the feed still
 * renders with zero counts rather than erroring.
 */
export async function getPostVotes(
  postIds: string[],
  userId: string,
): Promise<Map<string, PostVotes>> {
  const map = new Map<string, PostVotes>();
  if (postIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_post_votes")
    .select("post_id, user_id, value")
    .in("post_id", postIds);
  if (error || !data) return map; // table may not exist yet — fail soft

  for (const row of data) {
    const v = map.get(row.post_id) ?? { likes: 0, dislikes: 0, myVote: 0 as const };
    if (row.value === 1) v.likes += 1;
    else if (row.value === -1) v.dislikes += 1;
    if (row.user_id === userId) v.myVote = row.value === 1 ? 1 : -1;
    map.set(row.post_id, v);
  }
  return map;
}

export type PostReaction = { emoji: string; count: number; reacted: boolean };

/**
 * Emoji reaction tallies per post, plus whether the current user reacted with
 * each emoji. Reads `community_post_reactions` (migration 0048). DEFENSIVE: if
 * that table doesn't exist yet, returns an empty map so the feed still renders.
 */
export async function getPostReactions(
  postIds: string[],
  userId: string,
): Promise<Map<string, PostReaction[]>> {
  const map = new Map<string, PostReaction[]>();
  if (postIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_post_reactions")
    .select("post_id, user_id, emoji")
    .in("post_id", postIds);
  if (error || !data) return map; // table may not exist yet — fail soft

  // post_id -> emoji -> tally
  const byPost = new Map<
    string,
    Map<string, { count: number; reacted: boolean }>
  >();
  for (const row of data) {
    let emojiMap = byPost.get(row.post_id);
    if (!emojiMap) {
      emojiMap = new Map();
      byPost.set(row.post_id, emojiMap);
    }
    const entry = emojiMap.get(row.emoji) ?? { count: 0, reacted: false };
    entry.count += 1;
    if (row.user_id === userId) entry.reacted = true;
    emojiMap.set(row.emoji, entry);
  }

  for (const [postId, emojiMap] of byPost) {
    const arr: PostReaction[] = [];
    for (const [emoji, tally] of emojiMap) {
      arr.push({ emoji, count: tally.count, reacted: tally.reacted });
    }
    map.set(postId, arr);
  }
  return map;
}

/**
 * Emoji reaction tallies per reply (migration 0049). Same shape + defensive
 * behaviour as getPostReactions — returns an empty map if the table is absent.
 */
export async function getReplyReactions(
  replyIds: string[],
  userId: string,
): Promise<Map<string, PostReaction[]>> {
  const map = new Map<string, PostReaction[]>();
  if (replyIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_reply_reactions")
    .select("reply_id, user_id, emoji")
    .in("reply_id", replyIds);
  if (error || !data) return map; // table may not exist yet — fail soft

  const byReply = new Map<
    string,
    Map<string, { count: number; reacted: boolean }>
  >();
  for (const row of data) {
    let emojiMap = byReply.get(row.reply_id);
    if (!emojiMap) {
      emojiMap = new Map();
      byReply.set(row.reply_id, emojiMap);
    }
    const entry = emojiMap.get(row.emoji) ?? { count: 0, reacted: false };
    entry.count += 1;
    if (row.user_id === userId) entry.reacted = true;
    emojiMap.set(row.emoji, entry);
  }

  for (const [replyId, emojiMap] of byReply) {
    const arr: PostReaction[] = [];
    for (const [emoji, tally] of emojiMap) {
      arr.push({ emoji, count: tally.count, reacted: tally.reacted });
    }
    map.set(replyId, arr);
  }
  return map;
}

export type PostAttachment = {
  url: string;
  type: "image" | "video" | "link";
  name: string;
};

export type PostPollOption = {
  id: string;
  text: string;
  votes: number;
  mine: boolean;
};
export type PostPoll = {
  options: PostPollOption[];
  totalVotes: number;
  voted: boolean;
};

/**
 * Poll definition + live tallies per post (migration 0053). DEFENSIVE: if the
 * `poll` column / votes table don't exist yet, returns an empty map so the feed
 * still renders.
 */
export async function getPostPolls(
  postIds: string[],
  userId: string,
): Promise<Map<string, PostPoll>> {
  const map = new Map<string, PostPoll>();
  if (postIds.length === 0) return map;

  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id, poll")
    .in("id", postIds);
  if (error || !posts) return map; // column may not exist yet — fail soft

  type RawPoll = { options?: { id: string; text: string }[] };
  const pollPosts = posts.filter((p) => {
    const raw = (p as { poll?: RawPoll | null }).poll;
    return raw && Array.isArray(raw.options) && raw.options.length > 0;
  });
  if (pollPosts.length === 0) return map;

  const { data: votes } = await supabase
    .from("community_poll_votes")
    .select("post_id, user_id, option_id")
    .in(
      "post_id",
      pollPosts.map((p) => p.id),
    );

  const countByPostOption = new Map<string, Map<string, number>>();
  const myVoteByPost = new Map<string, string>();
  for (const v of votes ?? []) {
    const m = countByPostOption.get(v.post_id) ?? new Map<string, number>();
    m.set(v.option_id, (m.get(v.option_id) ?? 0) + 1);
    countByPostOption.set(v.post_id, m);
    if (v.user_id === userId) myVoteByPost.set(v.post_id, v.option_id);
  }

  for (const p of pollPosts) {
    const raw = (p as { poll: RawPoll }).poll;
    const counts = countByPostOption.get(p.id) ?? new Map<string, number>();
    const myOpt = myVoteByPost.get(p.id);
    let total = 0;
    const options: PostPollOption[] = (raw.options ?? []).map((o) => {
      const c = counts.get(o.id) ?? 0;
      total += c;
      return { id: o.id, text: o.text, votes: c, mine: myOpt === o.id };
    });
    map.set(p.id, { options, totalVotes: total, voted: !!myOpt });
  }
  return map;
}

/**
 * Media attachments per post (migration 0050). DEFENSIVE: if the `attachments`
 * column doesn't exist yet, returns an empty map so the feed still renders.
 */
export async function getPostAttachments(
  postIds: string[],
): Promise<Map<string, PostAttachment[]>> {
  const map = new Map<string, PostAttachment[]>();
  if (postIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, attachments")
    .in("id", postIds);
  if (error || !data) return map; // column may not exist yet — fail soft

  for (const row of data) {
    const raw = (row as { attachments?: unknown }).attachments;
    const list = Array.isArray(raw) ? (raw as PostAttachment[]) : [];
    if (list.length) map.set(row.id, list);
  }
  return map;
}
