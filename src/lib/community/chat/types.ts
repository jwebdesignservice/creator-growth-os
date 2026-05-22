// Types for the community chat feature.
// ChatMessage mirrors the community_chat_messages DB row.

export type ReplyPreview = {
  author_name: string;
  body: string;
};

export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  site_name: string | null;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  body: string;
  pinned: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  mention_user_ids: string[];
  author_name: string;
  author_avatar: string | null;
  author_is_admin: boolean;
  reply_to_id: string | null;
  reply_to_preview: ReplyPreview | null;
  edited_at: string | null;
  image_url: string | null;
  link_preview: LinkPreview | null;
  created_at: string;
};

export type ChatReaction = {
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

/** Aggregated view used by the UI: one entry per (message, emoji) with count and user list. */
export type ReactionGroup = {
  message_id: string;
  emoji: string;
  count: number;
  user_ids: string[];
};

export type PresenceUser = {
  user_id: string;
  name: string;
  avatar: string | null;
};

export type MentionCandidate = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  handle: string | null;
  avatar_url: string | null;
};

export type ChatActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };
