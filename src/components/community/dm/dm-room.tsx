"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/app-shell/avatar";
import { MessageList } from "@/components/community/chat/message-list";
import { Composer } from "@/components/community/chat/composer";
import { searchHandles } from "@/lib/community/chat/actions";
import {
  sendMessage,
  editMessage,
  softDeleteMessage,
  addReaction,
  removeReaction,
  loadOlderMessages,
  fetchRecentMessages,
  markConversationRead,
} from "@/lib/community/dm/actions";
import type {
  DmConversation,
  DmMessage,
  DmReaction,
} from "@/lib/community/dm/types";
import type { ReactionGroup } from "@/lib/community/chat/types";
import type { ChatApi } from "@/lib/community/shared";

type Props = {
  conversation: DmConversation;
  initialMessages: DmMessage[];
  initialReactions: DmReaction[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  isAdmin: boolean;
};

type Toast = { id: number; message: string };
type Presence = { user_id: string };

export function DmRoom({
  conversation,
  initialMessages,
  initialReactions,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isAdmin,
}: Props) {
  const router = useRouter();
  const other = conversation.other;
  const [messages, setMessages] = useState<DmMessage[]>(initialMessages);
  const [reactions, setReactions] = useState<DmReaction[]>(initialReactions);
  const [otherOnline, setOtherOnline] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [replyTo, setReplyTo] = useState<DmMessage | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasDisconnected = useRef(false);

  const reactionGroups: ReactionGroup[] = useMemo(() => {
    const map = new Map<string, ReactionGroup>();
    for (const r of reactions) {
      const key = `${r.message_id}::${r.emoji}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.user_ids.push(r.user_id);
      } else {
        map.set(key, {
          message_id: r.message_id,
          emoji: r.emoji,
          count: 1,
          user_ids: [r.user_id],
        });
      }
    }
    return [...map.values()];
  }, [reactions]);

  const dmApi: ChatApi = useMemo(
    () => ({
      send: sendMessage,
      edit: editMessage,
      remove: softDeleteMessage,
      addReaction,
      removeReaction,
      searchHandles,
      loadOlder: loadOlderMessages,
      uploadBucket: "chat-images",
      // No pin in 1:1 DMs.
    }),
    [],
  );

  const showError = useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // Opening the thread clears its unread state; refresh so the "Messages"
  // nav badge (computed in the app shell) updates right away.
  useEffect(() => {
    markConversationRead(conversation.id).then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // ── Realtime ──────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    const rt = supabase
      .channel(`dm:${conversation.id}`, {
        config: { presence: { key: currentUserId } },
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dm_reactions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const r = payload.new as DmReaction;
            setReactions((prev) =>
              prev.some(
                (x) =>
                  x.message_id === r.message_id &&
                  x.user_id === r.user_id &&
                  x.emoji === r.emoji,
              )
                ? prev
                : [...prev, r],
            );
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as DmReaction;
            setReactions((prev) =>
              prev.filter(
                (x) =>
                  !(
                    x.message_id === old.message_id &&
                    x.user_id === old.user_id &&
                    x.emoji === old.emoji
                  ),
              ),
            );
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = rt.presenceState() as Record<string, Presence[]>;
        const ids = new Set<string>();
        for (const arr of Object.values(state)) {
          for (const meta of arr) ids.add(meta.user_id);
        }
        setOtherOnline(ids.has(other.id));
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dm_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as DmMessage;
            setMessages((prev) =>
              prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
            );
            // The thread is open, so a message from the other person is read
            // on arrival — keep the DB read marker fresh so it never counts
            // toward the unread badge once we navigate away.
            if (newMsg.user_id !== currentUserId) {
              markConversationRead(conversation.id);
            }
          }
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as DmMessage;
            if (updated.deleted_at) {
              setMessages((prev) => prev.filter((m) => m.id !== updated.id));
              return;
            }
            setMessages((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m)),
            );
          }
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
          }
          await rt.track({ user_id: currentUserId } satisfies Presence);
          if (wasDisconnected.current) {
            wasDisconnected.current = false;
            fetchRecentMessages(conversation.id, 30).then((fresh) => {
              setMessages((prev) => {
                const ids = new Set(prev.map((m) => m.id));
                const add = fresh.filter((m) => !ids.has(m.id));
                return add.length > 0 ? [...prev, ...add] : prev;
              });
            });
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          wasDisconnected.current = true;
          reconnectTimer.current = setTimeout(() => setIsConnected(false), 3000);
        }
      });

    return () => {
      supabase.removeChannel(rt);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  function handleDeleted(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }
  function handleOlderLoaded(older: DmMessage[]) {
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const add = older.filter((m) => !ids.has(m.id));
      return [...add, ...prev];
    });
  }

  // Avatar shows currentUser identity for self-sent denorm; unused warning guard.
  void currentUserName;
  void currentUserAvatar;

  return (
    <div className="flex flex-col h-full min-h-0 bg-cream-100 overflow-hidden">
      {/* Header — the other participant */}
      <div className="shrink-0 flex items-center gap-3 px-3 sm:px-5 h-[63px] border-b border-ink-100 bg-white">
        <div className="relative">
          <Avatar name={other.name} src={other.avatar ?? undefined} size={36} />
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white ${
              otherOnline ? "bg-emerald-400" : "bg-ink-300"
            }`}
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-[15px] text-ink-900 leading-tight truncate">
            {other.name}
          </h1>
          <p className="text-[11.5px] text-ink-400 leading-tight">
            {otherOnline ? "Online" : other.handle ? `@${other.handle}` : "Offline"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
          />
          <span className="text-[11.5px] text-ink-400">
            {isConnected ? "Live" : "Connecting…"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        parentId={conversation.id}
        api={dmApi}
        messages={messages}
        reactions={reactionGroups}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onDeleted={handleDeleted}
        onError={showError}
        onOlderLoaded={(older) => handleOlderLoaded(older as DmMessage[])}
        onReply={(m) => setReplyTo(m as DmMessage)}
        emptyLabel={`No messages yet — say hi to ${other.name}! 👋`}
      />

      {/* Composer */}
      <Composer
        parentId={conversation.id}
        api={dmApi}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSent={() => {}}
        onError={showError}
        isConnected={isConnected}
        currentUserId={currentUserId}
        placeholder={`Message ${other.name}…`}
      />

      {/* Toasts */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-4 py-2.5 rounded-[12px] text-[13px] font-medium shadow-md bg-rose-600 text-white pointer-events-none"
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
