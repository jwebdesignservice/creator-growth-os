import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { groupReactions } from "../chat/queries";
import type { ReactionGroup } from "../chat/types";
import type {
  DmConversation,
  DmMessage,
  DmParticipant,
  DmReaction,
} from "./types";

const MSG_COLS =
  "id, conversation_id, user_id, body, deleted_at, deleted_by, mention_user_ids, author_name, author_avatar, reply_to_id, reply_to_preview, edited_at, image_url, link_preview, created_at";

type ProfileRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  handle: string | null;
};

function toParticipant(id: string, p: ProfileRow | undefined): DmParticipant {
  return {
    id,
    name: p?.display_name ?? p?.full_name ?? "Creator",
    avatar: p?.avatar_url ?? null,
    handle: p?.handle ?? null,
  };
}

/** Look up display info for a set of user ids (service client — RLS hides
 *  other users' profile rows, but we only surface name/avatar/handle). */
async function fetchProfiles(ids: string[]): Promise<Map<string, ProfileRow>> {
  const map = new Map<string, ProfileRow>();
  if (ids.length === 0) return map;
  const svc = createServiceClient();
  const { data } = await svc
    .from("profiles")
    .select("id, display_name, full_name, avatar_url, handle")
    .in("id", ids);
  for (const p of (data ?? []) as ProfileRow[]) map.set(p.id, p);
  return map;
}

/** Every conversation the user is part of, newest activity first. */
export async function listConversations(
  userId: string,
): Promise<DmConversation[]> {
  if (!userId) return [];
  const supabase = await createClient();
  const { data: convs } = await supabase
    .from("dm_conversations")
    .select(
      "id, participant_1_id, participant_2_id, last_message_at, last_message_preview, last_message_sender, created_at",
    )
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  if (!convs || convs.length === 0) return [];

  const otherIds = convs.map((c) =>
    c.participant_1_id === userId ? c.participant_2_id : c.participant_1_id,
  );
  const profiles = await fetchProfiles([...new Set(otherIds)]);

  return convs.map((c) => {
    const otherId =
      c.participant_1_id === userId ? c.participant_2_id : c.participant_1_id;
    return {
      id: c.id,
      other: toParticipant(otherId, profiles.get(otherId)),
      last_message_at: c.last_message_at,
      last_message_preview: c.last_message_preview ?? null,
      last_message_sender: c.last_message_sender ?? null,
      created_at: c.created_at,
    };
  });
}

/** One conversation resolved against the other participant. Null if the user
 *  isn't a participant (RLS) or it doesn't exist. */
export async function getConversation(
  conversationId: string,
  userId: string,
): Promise<DmConversation | null> {
  const supabase = await createClient();
  const { data: c } = await supabase
    .from("dm_conversations")
    .select(
      "id, participant_1_id, participant_2_id, last_message_at, last_message_preview, last_message_sender, created_at",
    )
    .eq("id", conversationId)
    .maybeSingle();
  if (!c) return null;
  if (c.participant_1_id !== userId && c.participant_2_id !== userId) {
    return null;
  }
  const otherId =
    c.participant_1_id === userId ? c.participant_2_id : c.participant_1_id;
  const profiles = await fetchProfiles([otherId]);
  return {
    id: c.id,
    other: toParticipant(otherId, profiles.get(otherId)),
    last_message_at: c.last_message_at,
    last_message_preview: c.last_message_preview ?? null,
    last_message_sender: c.last_message_sender ?? null,
    created_at: c.created_at,
  };
}

/** Recent (non-deleted) messages, oldest→newest. Pass `before` to paginate. */
export async function listRecentMessages(
  conversationId: string,
  limit = 100,
  before?: string,
): Promise<DmMessage[]> {
  const supabase = await createClient();
  let q = supabase
    .from("dm_messages")
    .select(MSG_COLS)
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return ((data ?? []) as DmMessage[]).reverse();
}

/** Aggregated reactions for a set of message ids. */
export async function listReactions(
  messageIds: string[],
): Promise<ReactionGroup[]> {
  if (messageIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("dm_reactions")
    .select("message_id, user_id, emoji")
    .in("message_id", messageIds);
  return groupReactions((data ?? []) as DmReaction[]);
}

/** Search members to start a new DM with (by name or @handle), excluding self. */
export async function searchMembers(
  q: string,
  selfId: string,
): Promise<DmParticipant[]> {
  const term = q.trim();
  if (term.length < 1) return [];
  const svc = createServiceClient();
  const { data } = await svc
    .from("profiles")
    .select("id, display_name, full_name, avatar_url, handle")
    .or(
      `display_name.ilike.%${term}%,full_name.ilike.%${term}%,handle.ilike.%${term}%`,
    )
    .neq("id", selfId)
    .limit(12);
  return ((data ?? []) as ProfileRow[]).map((p) => toParticipant(p.id, p));
}
