import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { listConversations } from "@/lib/community/dm/queries";
import { ConversationList } from "@/components/community/dm/conversation-list";

export const metadata = { title: "Messages · Creator Growth OS" };

export default async function MessagesPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const conversations = await listConversations(ctx.user.id);

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: "calc(100dvh - var(--topbar-height, 4rem))" }}
    >
      <ConversationList
        conversations={conversations}
        currentUserId={ctx.user.id}
      />
      <div className="hidden lg:flex flex-1 min-w-0 h-full items-center justify-center bg-white">
        <div className="text-center px-6">
          <span className="size-14 rounded-full bg-cream-200 text-ink-400 inline-flex items-center justify-center mb-3 mx-auto">
            <MessagesSquare className="size-7" strokeWidth={1.6} aria-hidden />
          </span>
          <h2 className="text-[16px] font-bold text-ink-900">Your messages</h2>
          <p className="text-[13px] text-ink-500 mt-1 max-w-xs mx-auto leading-snug">
            Select a conversation, or start a new one to message another creator
            privately.
          </p>
        </div>
      </div>
    </div>
  );
}
