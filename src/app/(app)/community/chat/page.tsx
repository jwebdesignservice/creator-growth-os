import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { listRecentMessages, listPinned } from "@/lib/community/chat/queries";
import { ChatRoom } from "@/components/community/chat/chat-room";
import { createClient } from "@/lib/supabase/server";
import type { ChatReaction } from "@/lib/community/chat/types";

export const metadata = { title: "Community Chat · Creator Growth OS" };

export default async function CommunityChatPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const supabase = await createClient();
  const { data: isAdminRaw } = await supabase.rpc("is_admin");

  const [messages, pinned] = await Promise.all([
    listRecentMessages(100),
    listPinned(),
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
    <div className="flex flex-col flex-1 min-h-0 px-[var(--mobile-content-x)] lg:px-[var(--space-page-x)] py-4">
      <ChatRoom
        initialMessages={messages}
        initialPinned={pinned}
        initialReactions={initialReactions}
        currentUserId={ctx.user.id}
        currentUserName={ctx.name}
        currentUserAvatar={ctx.profile?.avatar_url ?? null}
        isAdmin={isAdminRaw === true}
      />
    </div>
  );
}
