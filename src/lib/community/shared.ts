// Shared contract that lets the chat message components (bubble, list,
// composer, reactions) be reused for BOTH community channels and 1:1 direct
// messages. Each surface injects its own server actions via `ChatApi`.

import type {
  ReplyPreview,
  LinkPreview,
  MentionCandidate,
  ChatActionResult,
} from "./chat/types";

/**
 * The message shape the shared room components actually render. Both
 * `ChatMessage` (channels) and `DmMessage` (DMs) structurally satisfy this —
 * `pinned`/`author_is_admin` are optional so DMs (which have neither) fit.
 */
export type RoomMessage = {
  id: string;
  user_id: string;
  body: string;
  deleted_at: string | null;
  mention_user_ids: string[];
  author_name: string;
  author_avatar: string | null;
  reply_to_id: string | null;
  reply_to_preview: ReplyPreview | null;
  edited_at: string | null;
  image_url: string | null;
  link_preview: LinkPreview | null;
  created_at: string;
  pinned?: boolean;
  author_is_admin?: boolean;
};

/** Server actions the shared chat/DM components call. */
export type ChatApi = {
  send: (
    parentId: string,
    body: string,
    replyToId?: string,
    imageUrl?: string,
  ) => Promise<ChatActionResult>;
  edit: (id: string, body: string) => Promise<ChatActionResult>;
  remove: (id: string) => Promise<ChatActionResult>;
  addReaction: (messageId: string, emoji: string) => Promise<ChatActionResult>;
  removeReaction: (
    messageId: string,
    emoji: string,
  ) => Promise<ChatActionResult>;
  searchHandles: (q: string) => Promise<MentionCandidate[]>;
  loadOlder: (
    parentId: string,
    before: string,
    limit?: number,
  ) => Promise<RoomMessage[]>;
  /** Supabase Storage bucket used for image uploads. */
  uploadBucket: string;
  /** Pin / unpin — channels only; absent for DMs (no pin button rendered). */
  pin?: (id: string) => Promise<ChatActionResult>;
  unpin?: (id: string) => Promise<ChatActionResult>;
};
