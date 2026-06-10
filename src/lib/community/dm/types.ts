// Types for the 1:1 direct-messaging feature. DmMessage mirrors a dm_messages
// row and structurally satisfies RoomMessage so it reuses the chat components.

import type { ReplyPreview, LinkPreview } from "../chat/types";

export type {
  ReplyPreview,
  LinkPreview,
  ReactionGroup,
  MentionCandidate,
  ChatActionResult,
} from "../chat/types";

export type DmMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  body: string;
  deleted_at: string | null;
  deleted_by: string | null;
  mention_user_ids: string[];
  author_name: string;
  author_avatar: string | null;
  reply_to_id: string | null;
  reply_to_preview: ReplyPreview | null;
  edited_at: string | null;
  image_url: string | null;
  link_preview: LinkPreview | null;
  created_at: string;
};

export type DmReaction = {
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

/** The other person in a conversation (display info). */
export type DmParticipant = {
  id: string;
  name: string;
  avatar: string | null;
  handle: string | null;
};

/** A conversation row resolved against the *other* participant for the UI. */
export type DmConversation = {
  id: string;
  other: DmParticipant;
  last_message_at: string;
  last_message_preview: string | null;
  last_message_sender: string | null;
  created_at: string;
};
