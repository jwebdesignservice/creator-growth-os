"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyChatMention } from "@/lib/notifications/service";
import type { ChatActionResult, MentionCandidate, ChatMessage } from "./types";

// ── sendMessage ────────────────────────────────────────────────────────

export async function sendMessage(body: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Message cannot be empty." };
  if (trimmed.length > 2000) return { ok: false, error: "Message too long." };

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

  const { data: msg, error } = await supabase
    .from("community_chat_messages")
    .insert({
      user_id: user.id,
      body: trimmed,
      mention_user_ids: mentionUserIds,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_is_admin: authorIsAdmin,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Fire mention notifications via service client (bypasses RLS)
  const bodyPreview = trimmed.slice(0, 100);
  for (const mentionedId of mentionUserIds) {
    await notifyChatMention(mentionedId, authorName, msg.id, bodyPreview);
  }

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
  const { listRecentMessages } = await import("./queries");
  return listRecentMessages(limit, before);
}
