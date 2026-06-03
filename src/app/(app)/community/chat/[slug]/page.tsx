import { notFound, redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  listRecentMessages,
  listPinned,
  listChannels,
  getChannelBySlug,
} from "@/lib/community/chat/queries";
import { ChatRoom } from "@/components/community/chat/chat-room";
import { ChannelList } from "@/components/community/chat/channel-list";
import { createClient } from "@/lib/supabase/server";
import type { ChatReaction } from "@/lib/community/chat/types";

export const metadata = { title: "Community Chat · Creator Growth OS" };

type Params = { slug: string };

export default async function CommunityChatChannelPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const channel = await getChannelBySlug(slug);
  if (!channel) notFound();

  const supabase = await createClient();
  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  const isAdmin = isAdminRaw === true;

  const [channels, messages, pinned] = await Promise.all([
    listChannels(),
    listRecentMessages(channel.id, 100),
    listPinned(channel.id),
  ]);

  // Reactions for the visible messages (initial paint — realtime takes over)
  const messageIds = messages.map((m) => m.id);
  let initialReactions: ChatReaction[] = [];
  if (messageIds.length > 0) {
    const { data } = await supabase
      .from("community_chat_reactions")
      .select("message_id, user_id, emoji, created_at")
      .in("message_id", messageIds);
    initialReactions = (data ?? []) as ChatReaction[];
  }

  return (
    <div
      className="flex overflow-hidden px-[var(--mobile-content-x)] lg:px-[var(--space-page-x)] py-4 gap-4"
      style={{
        // Pin the chat surface to exactly the space below the topbar so the
        // PAGE never scrolls — only the message list (overflow-y-auto) does,
        // and the channels panel stays static. Inline style avoids Tailwind
        // arbitrary-value resolution quirks; dvh handles mobile browser
        // chrome correctly. The 5.5rem fallback mirrors --topbar-height in
        // containers.css so a missing/invalid token can't silently collapse
        // this to height:auto (which would let the whole page scroll).
        height: "calc(100dvh - var(--topbar-height, 5.5rem))",
      }}
    >
      <ChannelList
        channels={channels}
        currentSlug={slug}
        isAdmin={isAdmin}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <ChatRoom
          key={channel.id}
          channel={channel}
          initialMessages={messages}
          initialPinned={pinned}
          initialReactions={initialReactions}
          currentUserId={ctx.user.id}
          currentUserName={ctx.name}
          currentUserAvatar={ctx.profile?.avatar_url ?? null}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
