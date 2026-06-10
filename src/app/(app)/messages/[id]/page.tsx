import { notFound, redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  getConversation,
  listConversations,
  listRecentMessages,
} from "@/lib/community/dm/queries";
import { ConversationList } from "@/components/community/dm/conversation-list";
import { DmRoom } from "@/components/community/dm/dm-room";
import { createClient } from "@/lib/supabase/server";
import type { DmReaction } from "@/lib/community/dm/types";

export const metadata = { title: "Messages · Creator Growth OS" };

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const conversation = await getConversation(id, ctx.user.id);
  if (!conversation) notFound();

  const supabase = await createClient();
  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  const isAdmin = isAdminRaw === true;

  const [conversations, messages] = await Promise.all([
    listConversations(ctx.user.id),
    listRecentMessages(conversation.id, 100),
  ]);

  const messageIds = messages.map((m) => m.id);
  let initialReactions: DmReaction[] = [];
  if (messageIds.length > 0) {
    const { data } = await supabase
      .from("dm_reactions")
      .select("message_id, user_id, emoji, created_at")
      .in("message_id", messageIds);
    initialReactions = (data ?? []) as DmReaction[];
  }

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: "calc(100dvh - var(--topbar-height, 4rem))" }}
    >
      <div className="hidden lg:flex h-full">
        <ConversationList
          conversations={conversations}
          currentConversationId={conversation.id}
          currentUserId={ctx.user.id}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <DmRoom
          key={conversation.id}
          conversation={conversation}
          initialMessages={messages}
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
