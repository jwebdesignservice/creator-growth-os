"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyChatMention, notifyChatReply } from "@/lib/notifications/service";
import type { ChatActionResult, MentionCandidate, ChatMessage } from "./types";
import { listRecentMessages } from "./queries";

// ── sendMessage ────────────────────────────────────────────────────────

export async function sendMessage(
  body: string,
  replyToId?: string,
  imageUrl?: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const trimmed = body.trim();
  // An image alone (without text) is allowed
  if (!trimmed && !imageUrl) return { ok: false, error: "Message cannot be empty." };
  if (trimmed.length > 2000) return { ok: false, error: "Message too long." };

  // Resolve reply parent (if any) — denormalize a snippet for display
  let replyToPreview: { author_name: string; body: string } | null = null;
  let validReplyToId: string | null = null;
  let replyParentUserId: string | null = null;
  if (replyToId) {
    const { data: parent } = await supabase
      .from("community_chat_messages")
      .select("id, user_id, author_name, body, deleted_at")
      .eq("id", replyToId)
      .is("deleted_at", null)
      .maybeSingle();
    if (parent) {
      validReplyToId = parent.id;
      replyParentUserId = parent.user_id;
      replyToPreview = {
        author_name: parent.author_name,
        body: parent.body.slice(0, 140),
      };
    }
  }

  // Own profile — safe: RLS allows reading your own row
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const authorName =
    profile?.display_name ?? profile?.full_name ?? "Creator";
  const authorAvatar = profile?.avatar_url ?? null;

  // Admin check (is_admin() reads admin_users for the current user)
  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  const authorIsAdmin = isAdminRaw === true;

  // Extract @handle tokens (handles are [a-z0-9_] per signup UI)
  const handleMatches = [
    ...trimmed.matchAll(/(^|\s)@([a-z0-9_]+)/gi),
  ];
  const handles = [
    ...new Set(handleMatches.map((m) => m[2].toLowerCase())),
  ];

  let mentionUserIds: string[] = [];
  if (handles.length > 0) {
    // Service client bypasses RLS — needed to look up other users' handles
    const svc = createServiceClient();
    const { data: mentioned } = await svc
      .from("profiles")
      .select("id")
      .in("handle", handles)
      .neq("id", user.id);
    mentionUserIds = (mentioned ?? []).map((p: { id: string }) => p.id);
  }

  // Fetch a link preview for the first URL (best-effort, 3s timeout)
  const linkPreview = trimmed ? await fetchLinkPreview(trimmed) : null;

  const { data: msg, error } = await supabase
    .from("community_chat_messages")
    .insert({
      user_id: user.id,
      body: trimmed || "",
      mention_user_ids: mentionUserIds,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_is_admin: authorIsAdmin,
      reply_to_id: validReplyToId,
      reply_to_preview: replyToPreview,
      image_url: imageUrl ?? null,
      link_preview: linkPreview,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Fire notifications via service client (bypasses RLS).
  // Use body preview, falling back to "(image)" for image-only messages.
  const bodyPreview = trimmed.slice(0, 100) || (imageUrl ? "(image)" : "");

  // If this is a reply, ping the parent author — but only if it's not the
  // sender themselves, and skip them from the mention list to avoid double-ping.
  const shouldNotifyReplyAuthor =
    replyParentUserId && replyParentUserId !== user.id;
  const mentionRecipients = shouldNotifyReplyAuthor
    ? mentionUserIds.filter((id) => id !== replyParentUserId)
    : mentionUserIds;

  const notifications: Promise<void>[] = [];
  if (shouldNotifyReplyAuthor && replyParentUserId && validReplyToId) {
    notifications.push(
      notifyChatReply(replyParentUserId, authorName, msg.id, validReplyToId, bodyPreview),
    );
  }
  for (const mentionedId of mentionRecipients) {
    notifications.push(notifyChatMention(mentionedId, authorName, msg.id, bodyPreview));
  }
  await Promise.all(notifications);

  return { ok: true, id: msg.id };
}

// ── softDeleteMessage ─────────────────────────────────────────────────

export async function softDeleteMessage(
  id: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("community_chat_messages")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── pinMessage ────────────────────────────────────────────────────────

export async function pinMessage(id: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  if (!isAdminRaw) return { ok: false, error: "Only admins can pin messages." };

  const { error } = await supabase
    .from("community_chat_messages")
    .update({ pinned: true })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── unpinMessage ──────────────────────────────────────────────────────

export async function unpinMessage(id: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  if (!isAdminRaw) return { ok: false, error: "Only admins can unpin messages." };

  const { error } = await supabase
    .from("community_chat_messages")
    .update({ pinned: false })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── searchHandles ─────────────────────────────────────────────────────

export async function searchHandles(
  q: string,
): Promise<MentionCandidate[]> {
  if (!q || q.length < 1) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const svc = createServiceClient();
  const { data } = await svc
    .from("profiles")
    .select("id, display_name, full_name, handle, avatar_url")
    .ilike("handle", `${q}%`)
    .limit(10);
  return (data ?? []) as MentionCandidate[];
}

// ── loadOlderMessages ─────────────────────────────────────────────────

export async function loadOlderMessages(
  before: string,
  limit = 50,
): Promise<ChatMessage[]> {
  return listRecentMessages(limit, before);
}

// ── fetchRecentMessages (for reconnect recovery) ───────────────────────

export async function fetchRecentMessages(
  limit = 30,
): Promise<ChatMessage[]> {
  return listRecentMessages(limit);
}

// ── Reactions ─────────────────────────────────────────────────────────

export async function addReaction(
  messageId: string,
  emoji: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Upsert-ish: if it already exists, INSERT will conflict on PK and we silently
  // treat that as success (the user "reacted again" — same as already reacted).
  const { error } = await supabase
    .from("community_chat_reactions")
    .insert({ message_id: messageId, user_id: user.id, emoji });
  if (error && !/duplicate key|conflict/i.test(error.message)) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function removeReaction(
  messageId: string,
  emoji: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("community_chat_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Edit own message ──────────────────────────────────────────────────

export async function editMessage(
  id: string,
  newBody: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const trimmed = newBody.trim();
  if (!trimmed) return { ok: false, error: "Message cannot be empty." };
  if (trimmed.length > 2000) return { ok: false, error: "Message too long." };

  // RLS enforces owner-only update (auth.uid() = user_id OR is_admin()).
  // The action layer further restricts to owner-only edits (admins can delete
  // but shouldn't silently edit other users' words).
  const { error } = await supabase
    .from("community_chat_messages")
    .update({ body: trimmed, edited_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Link preview (Open Graph unfurl) — used internally by sendMessage ─

import type { LinkPreview } from "./types";

const URL_RE = /(https?:\/\/[^\s<>"']+)/i;

/** Extract og:title, og:description, og:image, og:site_name from HTML. */
function parseOg(html: string, url: string): LinkPreview {
  function pick(prop: string): string | null {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i",
    );
    const m = html.match(re);
    return m ? m[1] : null;
  }
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return {
    url,
    title: pick("og:title") ?? (titleTag ? titleTag[1].trim() : null),
    description: pick("og:description") ?? pick("description"),
    image: pick("og:image"),
    site_name: pick("og:site_name"),
  };
}

/** Fetch OG metadata for the first URL in `body`. Best-effort; null on any failure. */
export async function fetchLinkPreview(
  body: string,
): Promise<LinkPreview | null> {
  const match = body.match(URL_RE);
  if (!match) return null;
  const url = match[1];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "CreatorGrowthOS-Bot/1.0 (+link-preview)" },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!/text\/html/i.test(ct)) return null;
    // Only read up to ~256KB to avoid memory blowup on huge pages
    const text = (await res.text()).slice(0, 256_000);
    const preview = parseOg(text, url);
    // Only return if we got at least a title or image — otherwise it's useless
    if (!preview.title && !preview.image) return null;
    return preview;
  } catch {
    return null;
  }
}
