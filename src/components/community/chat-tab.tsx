import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  listChannels,
  listRecentMessages,
  listPinned,
} from "@/lib/community/chat/queries";
import type { ChatReaction } from "@/lib/community/chat/types";
import { ChannelList } from "@/components/community/chat/channel-list";
import { ChatRoom } from "@/components/community/chat/chat-room";

/**
 * Chat tab content — the full real-time chat embedded directly in the
 * community page (channel sidebar + live message room), defaulting to the
 * first channel. Mirrors the standalone `/community/chat/[slug]` page, except
 * channel links stay inside the tab via `?tab=chat&c=<slug>`.
 */
export async function ChatTab({
  activeSlug,
  userId,
  userName,
  userAvatar,
}: {
  activeSlug?: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
}) {
  const channels = await listChannels();

  if (channels.length === 0) {
    return (
      <div className="card p-10 text-center">
        <span className="inline-flex items-center justify-center size-12 rounded-full bg-rose-50 text-rose-500 mb-3">
          <MessageSquare className="size-6" strokeWidth={1.8} />
        </span>
        <h3 className="text-h4 text-ink-900 mb-1">No channels yet</h3>
        <p className="text-[13px] text-ink-500 max-w-sm mx-auto">
          Chat channels will appear here once they&apos;re set up.
        </p>
      </div>
    );
  }

  const channel =
    (activeSlug ? channels.find((c) => c.slug === activeSlug) : null) ??
    channels[0];

  const supabase = await createClient();
  const [{ data: isAdminRaw }, messages, pinned] = await Promise.all([
    supabase.rpc("is_admin"),
    listRecentMessages(channel.id, 100),
    listPinned(channel.id),
  ]);
  const isAdmin = isAdminRaw === true;

  const messageIds = messages.map((m) => m.id);
  let reactions: ChatReaction[] = [];
  if (messageIds.length > 0) {
    const { data } = await supabase
      .from("community_chat_reactions")
      .select("message_id, user_id, emoji, created_at")
      .in("message_id", messageIds);
    reactions = (data ?? []) as ChatReaction[];
  }

  return (
    <div
      className="flex gap-4 overflow-hidden"
      style={{ height: "calc(100dvh - 15rem)", minHeight: "480px" }}
    >
      <ChannelList
        channels={channels}
        currentSlug={channel.slug}
        isAdmin={isAdmin}
        inTab
      />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <ChatRoom
          key={channel.id}
          channel={channel}
          initialMessages={messages}
          initialPinned={pinned}
          initialReactions={reactions}
          currentUserId={userId}
          currentUserName={userName}
          currentUserAvatar={userAvatar}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
