"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isClean, MODERATION_REJECTION } from "../chat/moderation";
import { fetchLinkPreview } from "../chat/actions";
import { listRecentMessages, searchMembers } from "./queries";
import type {
  ChatActionResult,
  DmMessage,
  DmParticipant,
} from "./types";

// ── Mark a conversation read (clears the unread "Messages" badge) ────────────

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  if (!conversationId) return;
  const supabase = await createClient();
  try {
    await supabase.rpc("mark_dm_read", { conv: conversationId });
  } catch {
    // dm read-state functions may not exist yet (pre-migration); safe to ignore
  }
}

// ── Start (or resume) a conversation with another member ────────────────────

export async function startConversation(
  otherUserId: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!otherUserId || otherUserId === user.id) {
    return { ok: false, error: "Pick someone else to message." };
  }

  // Confirm the recipient exists (service client — RLS hides other profiles).
  const svc = createServiceClient();
  const { data: other } = await svc
    .from("profiles")
    .select("id")
    .eq("id", otherUserId)
    .maybeSingle();
  if (!other) return { ok: false, error: "That member doesn't exist." };

  // Existing conversation for this pair?
  const { data: existing } = await supabase
    .from("dm_conversations")
    .select("id")
    .or(
      `and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`,
    )
    .maybeSingle();
  if (existing) return { ok: true, id: existing.id };

  const { data: created, error } = await supabase
    .from("dm_conversations")
    .insert({ participant_1_id: user.id, participant_2_id: otherUserId })
    .select("id")
    .single();

  // Lost a race to create the same pair → fetch the winner.
  if (error) {
    const { data: again } = await supabase
      .from("dm_conversations")
      .select("id")
      .or(
        `and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`,
      )
      .maybeSingle();
    if (again) return { ok: true, id: again.id };
    return { ok: false, error: error.message };
  }

  revalidatePath("/messages");
  return { ok: true, id: created.id };
}

// ── Send a message ──────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  body: string,
  replyToId?: string,
  imageUrl?: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!conversationId) return { ok: false, error: "Conversation is required." };

  const trimmed = body.trim();
  if (!trimmed && !imageUrl) {
    return { ok: false, error: "Message cannot be empty." };
  }
  if (trimmed.length > 2000) return { ok: false, error: "Message too long." };
  if (trimmed && !isClean(trimmed)) {
    return { ok: false, error: MODERATION_REJECTION };
  }

  // Resolve reply parent (must be in this conversation, not deleted).
  let replyToPreview: { author_name: string; body: string } | null = null;
  let validReplyToId: string | null = null;
  if (replyToId) {
    const { data: parent } = await supabase
      .from("dm_messages")
      .select("id, author_name, body, deleted_at")
      .eq("id", replyToId)
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .maybeSingle();
    if (parent) {
      validReplyToId = parent.id;
      replyToPreview = {
        author_name: parent.author_name,
        body: parent.body.slice(0, 140),
      };
    }
  }

  // Own profile (RLS allows reading your own row).
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  const authorName = profile?.display_name ?? profile?.full_name ?? "Creator";
  const authorAvatar = profile?.avatar_url ?? null;

  // @handle mentions (for highlight chips).
  const handles = [
    ...new Set(
      [...trimmed.matchAll(/(^|\s)@([a-z0-9_]+)/gi)].map((m) =>
        m[2].toLowerCase(),
      ),
    ),
  ];
  let mentionUserIds: string[] = [];
  if (handles.length > 0) {
    const svc = createServiceClient();
    const { data: mentioned } = await svc
      .from("profiles")
      .select("id")
      .in("handle", handles)
      .neq("id", user.id);
    mentionUserIds = (mentioned ?? []).map((p: { id: string }) => p.id);
  }

  const linkPreview = trimmed ? await fetchLinkPreview(trimmed) : null;

  const { data: msg, error } = await supabase
    .from("dm_messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      body: trimmed || "",
      mention_user_ids: mentionUserIds,
      author_name: authorName,
      author_avatar: authorAvatar,
      reply_to_id: validReplyToId,
      reply_to_preview: replyToPreview,
      image_url: imageUrl ?? null,
      link_preview: linkPreview,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/messages");
  return { ok: true, id: msg.id };
}

// ── Edit / delete ───────────────────────────────────────────────────────────

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
  if (!isClean(trimmed)) return { ok: false, error: MODERATION_REJECTION };

  const { error } = await supabase
    .from("dm_messages")
    .update({ body: trimmed, edited_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function softDeleteMessage(
  id: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("dm_messages")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Reactions ───────────────────────────────────────────────────────────────

export async function addReaction(
  messageId: string,
  emoji: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { error } = await supabase
    .from("dm_reactions")
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
    .from("dm_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Pagination / reconnect ──────────────────────────────────────────────────

export async function loadOlderMessages(
  conversationId: string,
  before: string,
  limit = 50,
): Promise<DmMessage[]> {
  return listRecentMessages(conversationId, limit, before);
}

export async function fetchRecentMessages(
  conversationId: string,
  limit = 30,
): Promise<DmMessage[]> {
  return listRecentMessages(conversationId, limit);
}

// ── Member search (client-callable wrapper) ─────────────────────────────────

export async function searchMembersAction(
  q: string,
): Promise<DmParticipant[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return searchMembers(q, user.id);
}
