import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { listRecentMessages, listPinned } from "@/lib/community/chat/queries";
import { ChatRoom } from "@/components/community/chat/chat-room";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="flex flex-col flex-1 min-h-0 px-[var(--mobile-content-x)] lg:px-[var(--space-page-x)] py-4">
      <ChatRoom
        initialMessages={messages}
        initialPinned={pinned}
        currentUserId={ctx.user.id}
        currentUserName={ctx.name}
        currentUserAvatar={ctx.profile?.avatar_url ?? null}
        isAdmin={isAdminRaw === true}
      />
    </div>
  );
}
