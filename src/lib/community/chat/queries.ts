import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "./types";

const CHAT_COLS =
  "id, user_id, body, pinned, deleted_at, deleted_by, mention_user_ids, author_name, author_avatar, author_is_admin, reply_to_id, reply_to_preview, created_at";

/**
 * Fetch the most recent messages (excluding soft-deleted).
 * Returns them in chronological order (oldest first).
 * Pass `before` (ISO timestamp) to paginate backwards.
 */
export async function listRecentMessages(
  limit = 100,
  before?: string,
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  let q = supabase
    .from("community_chat_messages")
    .select(CHAT_COLS)
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
 * Fetch up to 3 pinned non-deleted messages, newest-pin-first,
 * for the pinned banner at the top of the chat.
 */
export async function listPinned(): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_chat_messages")
    .select(CHAT_COLS)
    .eq("pinned", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as ChatMessage[];
}
