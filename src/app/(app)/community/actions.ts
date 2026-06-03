"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyCommunityReply } from "@/lib/notifications/service";
import { POST_REACTIONS } from "@/lib/community/reactions";
import { requireAdminClient } from "@/lib/admin/require-admin";
import type { PostAttachment } from "@/lib/community/queries";

type Result = { ok: true } | { ok: false; error: string };

export async function createPost(
  spaceSlug: string,
  title: string,
  body: string,
  attachments: PostAttachment[] = [],
  poll: { options: { id: string; text: string }[] } | null = null,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Normalise + validate the poll (single-choice, ≥2 non-empty options).
  const cleanPoll = poll?.options
    ? {
        options: poll.options
          .map((o) => ({ id: String(o.id), text: String(o.text).trim() }))
          .filter((o) => o.text.length > 0),
      }
    : null;
  const hasPoll = !!cleanPoll && cleanPoll.options.length >= 2;

  if (!title.trim()) return { ok: false, error: "Title is required." };
  if (cleanPoll && !hasPoll)
    return { ok: false, error: "A poll needs at least 2 options." };
  if (!body.trim() && !hasPoll && attachments.length === 0)
    return { ok: false, error: "Add a description, a poll, or an attachment." };

  const { data: space } = await supabase
    .from("community_spaces")
    .select("id")
    .eq("slug", spaceSlug)
    .maybeSingle();
  if (!space) return { ok: false, error: "Space not found." };

  // Only include `attachments` when present so text-only posts keep working
  // even before the media column (migration 0050) is applied.
  const payload: Record<string, unknown> = {
    space_id: space.id,
    user_id: user.id,
    title: title.trim(),
    body: body.trim(),
  };
  if (attachments.length > 0) payload.attachments = attachments;
  if (hasPoll) payload.poll = cleanPoll;

  const { error } = await supabase.from("community_posts").insert(payload);
  if (error) {
    if (error.code === "42703")
      return {
        ok: false,
        error:
          "This needs a database update that's still pending — run the latest migrations (0050 for media, 0053 for polls) and try again.",
      };
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true };
}

export async function createReply(
  postId: string,
  body: string,
  parentReplyId?: string | null,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!body.trim()) return { ok: false, error: "Reply cannot be empty." };

  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id, title")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };

  // Only include parent_reply_id when replying to a comment, so top-level
  // replies keep working even before threading (migration 0049) is applied.
  const payload: Record<string, unknown> = {
    post_id: postId,
    user_id: user.id,
    body: body.trim(),
  };
  if (parentReplyId) payload.parent_reply_id = parentReplyId;

  const { error } = await supabase.from("community_replies").insert(payload);
  if (error) {
    if (error.code === "42703")
      return {
        ok: false,
        error:
          "Replying to a comment isn't available yet — the database update (migration 0049) is still pending.",
      };
    return { ok: false, error: error.message };
  }

  if (post.user_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", user.id)
      .maybeSingle();
    const authorName =
      profile?.display_name ?? profile?.full_name ?? "A creator";
    await notifyCommunityReply(post.user_id, authorName, postId);
  }

  revalidatePath("/community");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Votes (like / dislike) — community_post_votes (migration 0047)
// ─────────────────────────────────────────────────────────────────────

const VOTES_UNAVAILABLE =
  "Likes aren't available yet — the database update (migration 0047) is still pending.";

/**
 * Cast (or toggle off) a like/dislike on a post. Clicking the same vote again
 * removes it; clicking the opposite switches it. Gracefully reports when the
 * votes table hasn't been migrated yet (42P01) instead of throwing.
 */
export async function votePost(
  postId: string,
  value: 1 | -1,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing, error: selErr } = await supabase
    .from("community_post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (selErr?.code === "42P01") return { ok: false, error: VOTES_UNAVAILABLE };

  let error;
  if (existing?.value === value) {
    // Same vote clicked again → remove it.
    ({ error } = await supabase
      .from("community_post_votes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id));
  } else {
    ({ error } = await supabase
      .from("community_post_votes")
      .upsert(
        { post_id: postId, user_id: user.id, value },
        { onConflict: "post_id,user_id" },
      ));
  }

  if (error) {
    if (error.code === "42P01") return { ok: false, error: VOTES_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Reactions (emoji) — community_post_reactions (migration 0048)
// ─────────────────────────────────────────────────────────────────────

const REACTIONS_UNAVAILABLE =
  "Reactions aren't available yet — the database update (migration 0048) is still pending.";

/**
 * Toggle an emoji reaction on a post for the current user: adds it if absent,
 * removes it if already present. Fails soft (clear message) when the reactions
 * table hasn't been migrated yet (42P01) instead of throwing.
 */
export async function reactToPost(
  postId: string,
  emoji: string,
): Promise<Result> {
  if (!POST_REACTIONS.includes(emoji as (typeof POST_REACTIONS)[number])) {
    return { ok: false, error: "Unsupported reaction." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing, error: selErr } = await supabase
    .from("community_post_reactions")
    .select("emoji")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();
  if (selErr?.code === "42P01")
    return { ok: false, error: REACTIONS_UNAVAILABLE };

  let error;
  if (existing) {
    ({ error } = await supabase
      .from("community_post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .eq("emoji", emoji));
  } else {
    ({ error } = await supabase
      .from("community_post_reactions")
      .insert({ post_id: postId, user_id: user.id, emoji }));
  }

  if (error) {
    if (error.code === "42P01")
      return { ok: false, error: REACTIONS_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Reply reactions (emoji) — community_reply_reactions (migration 0049)
// ─────────────────────────────────────────────────────────────────────

const REPLY_REACTIONS_UNAVAILABLE =
  "Comment reactions aren't available yet — the database update (migration 0049) is still pending.";

/**
 * Toggle an emoji reaction on a reply (comment). Same toggle + fail-soft
 * behaviour as reactToPost.
 */
export async function reactToReply(
  replyId: string,
  emoji: string,
): Promise<Result> {
  if (!POST_REACTIONS.includes(emoji as (typeof POST_REACTIONS)[number])) {
    return { ok: false, error: "Unsupported reaction." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: existing, error: selErr } = await supabase
    .from("community_reply_reactions")
    .select("emoji")
    .eq("reply_id", replyId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();
  if (selErr?.code === "42P01")
    return { ok: false, error: REPLY_REACTIONS_UNAVAILABLE };

  let error;
  if (existing) {
    ({ error } = await supabase
      .from("community_reply_reactions")
      .delete()
      .eq("reply_id", replyId)
      .eq("user_id", user.id)
      .eq("emoji", emoji));
  } else {
    ({ error } = await supabase
      .from("community_reply_reactions")
      .insert({ reply_id: replyId, user_id: user.id, emoji }));
  }

  if (error) {
    if (error.code === "42P01")
      return { ok: false, error: REPLY_REACTIONS_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Poll votes — community_poll_votes (migration 0053)
// ─────────────────────────────────────────────────────────────────────

const POLLS_UNAVAILABLE =
  "Polls aren't available yet — the database update (migration 0053) is still pending.";

/** Cast or change the current user's single-choice vote on a post's poll. */
export async function votePoll(
  postId: string,
  optionId: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: post, error: selErr } = await supabase
    .from("community_posts")
    .select("poll")
    .eq("id", postId)
    .maybeSingle();
  if (selErr?.code === "42703") return { ok: false, error: POLLS_UNAVAILABLE };

  const options =
    (post?.poll as { options?: { id: string }[] } | null)?.options ?? [];
  if (!options.some((o) => o.id === optionId))
    return { ok: false, error: "That poll option no longer exists." };

  const { error } = await supabase.from("community_poll_votes").upsert(
    { post_id: postId, user_id: user.id, option_id: optionId },
    { onConflict: "post_id,user_id" },
  );
  if (error) {
    if (error.code === "42P01") return { ok: false, error: POLLS_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Pin / unpin a thread — admin only (migration 0054)
// ─────────────────────────────────────────────────────────────────────

export async function setPostPinned(
  postId: string,
  pinned: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("community_posts")
    .update({ pinned_at: pinned ? new Date().toISOString() : null })
    .eq("id", postId);
  if (error) {
    if (error.code === "42703")
      return {
        ok: false,
        error: "Pinning needs migration 0054 — run it in the SQL editor first.",
      };
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true };
}
