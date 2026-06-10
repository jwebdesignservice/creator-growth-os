"use client";

import { useEffect, useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import type { ReactionGroup } from "@/lib/community/chat/types";
import type { ChatApi, RoomMessage } from "@/lib/community/shared";

type Props = {
  parentId: string;
  messages: RoomMessage[];
  currentUserId: string;
  isAdmin: boolean;
  api: ChatApi;
  onDeleted: (id: string) => void;
  onPinChanged?: (id: string, pinned: boolean) => void;
  onError: (msg: string) => void;
  onOlderLoaded: (older: RoomMessage[]) => void;
  onReply: (message: RoomMessage) => void;
  reactions: ReactionGroup[];
  /** Empty-state copy (channel vs DM differ). */
  emptyLabel?: string;
};

export function MessageList({
  parentId,
  messages,
  currentUserId,
  isAdmin,
  api,
  onDeleted,
  onPinChanged,
  onError,
  onOlderLoaded,
  onReply,
  reactions,
  emptyLabel = "No messages yet — say hello! 👋",
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [loadingOlder, startLoadingOlder] = useTransition();

  // Auto-scroll to bottom when new messages arrive — but only if the user
  // is already at (or near) the bottom so we don't yank their scroll position.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Scroll to bottom on initial mount
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    startLoadingOlder(async () => {
      const older = await api.loadOlder(parentId, oldest.created_at, 50);
      onOlderLoaded(older);
    });
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-2 py-3 space-y-4"
    >
      {/* Load older button */}
      {messages.length > 0 && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className="text-[12px] text-ink-500 hover:text-ink-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-100 hover:border-ink-200 bg-white transition-colors disabled:opacity-50"
          >
            {loadingOlder ? (
              <Loader2 className="size-3 animate-spin" strokeWidth={2} />
            ) : null}
            Load older messages
          </button>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="text-[13px] text-ink-400">{emptyLabel}</p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          api={api}
          reactions={reactions.filter((r) => r.message_id === msg.id)}
          onDeleted={onDeleted}
          onPinChanged={onPinChanged}
          onError={onError}
          onReply={onReply}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
