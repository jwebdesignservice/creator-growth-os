// Types for the community chat feature.
// ChatMessage mirrors the community_chat_messages DB row.

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
  created_at: string;
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
