import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ChatChannel, ChatMessage, ChatReaction, ReactionGroup } from "./types";

const CHAT_COLS =
  "id, channel_id, user_id, body, pinned, deleted_at, deleted_by, mention_user_ids, author_name, author_avatar, author_is_admin, reply_to_id, reply_to_preview, edited_at, image_url, link_preview, created_at";

const CHANNEL_COLS =
  "id, slug, name, description, icon, posts_admin_only, sort_order, created_at";

/**
 * List all channels, sorted for sidebar display.
 */
export async function listChannels(): Promise<ChatChannel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_chat_channels")
    .select(CHANNEL_COLS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as ChatChannel[];
}

/**
 * Fetch a single channel by slug. Returns null if not found.
 */
export async function getChannelBySlug(slug: string): Promise<ChatChannel | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_chat_channels")
    .select(CHANNEL_COLS)
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? null) as ChatChannel | null;
}

/**
 * Fetch the most recent messages (excluding soft-deleted).
 * Returns them in chronological order (oldest first).
 * Pass `before` (ISO timestamp) to paginate backwards.
 */
export async function listRecentMessages(
  channelId: string,
  limit = 100,
  before?: string,
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  let q = supabase
    .from("community_chat_messages")
    .select(CHAT_COLS)
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    q = q.lt("created_at", before);
  }

  const { data } = await q;
  // Reverse so the list displays oldest → newest top-to-bottom
  return ((data ?? []) as ChatMessage[]).reverse();
}

/**
 * Fetch up to 3 pinned non-deleted messages for this channel, newest-pin-first.
 */
export async function listPinned(channelId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_chat_messages")
    .select(CHAT_COLS)
    .eq("channel_id", channelId)
    .eq("pinned", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as ChatMessage[];
}

/**
 * Fetch all reactions for a set of message ids, aggregated by (message, emoji).
 * Returns ReactionGroup[] so the UI can render chips with counts.
 */
export async function listReactions(
  messageIds: string[],
): Promise<ReactionGroup[]> {
  if (messageIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_chat_reactions")
    .select("message_id, user_id, emoji")
    .in("message_id", messageIds);
  return groupReactions((data ?? []) as ChatReaction[]);
}

/** Aggregate raw reaction rows into ReactionGroup[] (one per message+emoji). */
export function groupReactions(rows: ChatReaction[]): ReactionGroup[] {
  const map = new Map<string, ReactionGroup>();
  for (const r of rows) {
    const key = `${r.message_id}::${r.emoji}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.user_ids.push(r.user_id);
    } else {
      map.set(key, {
        message_id: r.message_id,
        emoji: r.emoji,
        count: 1,
        user_ids: [r.user_id],
      });
    }
  }
  return [...map.values()];
}
