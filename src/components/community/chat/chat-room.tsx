"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageList } from "./message-list";
import { PinnedBanner } from "./pinned-banner";
import { Composer } from "./composer";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { fetchRecentMessages } from "@/lib/community/chat/actions";
import type {
  ChatChannel,
  ChatMessage,
  ChatReaction,
  PresenceUser,
  ReactionGroup,
} from "@/lib/community/chat/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Props = {
  channel: ChatChannel;
  initialMessages: ChatMessage[];
  initialPinned: ChatMessage[];
  initialReactions: ChatReaction[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  isAdmin: boolean;
};

type Toast = { id: number; kind: "error" | "success"; message: string };

export function ChatRoom({
  channel,
  initialMessages,
  initialPinned,
  initialReactions,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isAdmin,
}: Props) {
  const canPostInChannel = !channel.posts_admin_only || isAdmin;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pinned, setPinned] = useState<ChatMessage[]>(initialPinned);
  const [reactions, setReactions] = useState<ChatReaction[]>(initialReactions);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasDisconnected = useRef(false);

  // Aggregate raw reactions into ReactionGroup[] (one per message+emoji)
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

  const showError = useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, kind: "error", message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const rt = supabase
      .channel(`chat:${channel.id}`, {
        config: { presence: { key: currentUserId } },
      })
      // ── Reactions (INSERT + DELETE)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_chat_reactions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const r = payload.new as ChatReaction;
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
            const old = payload.old as ChatReaction;
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
      // ── Presence sync
      .on("presence", { event: "sync" }, () => {
        const state = rt.presenceState() as Record<
          string,
          Array<PresenceUser>
        >;
        const flat: PresenceUser[] = [];
        const seen = new Set<string>();
        for (const arr of Object.values(state)) {
          for (const meta of arr) {
            if (!seen.has(meta.user_id)) {
              seen.add(meta.user_id);
              flat.push(meta);
            }
          }
        }
        setPresence(flat);
      })
      // ── Messages (filtered by this channel)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_chat_messages",
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }

          if (payload.eventType === "UPDATE") {
            const updated = payload.new as ChatMessage;

            if (updated.deleted_at) {
              setMessages((prev) => prev.filter((m) => m.id !== updated.id));
              setPinned((prev) => prev.filter((m) => m.id !== updated.id));
              return;
            }

            setMessages((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m)),
            );
            if (updated.pinned) {
              setPinned((prev) => {
                if (prev.some((m) => m.id === updated.id)) return prev;
                return [updated, ...prev].slice(0, 3);
              });
            } else {
              setPinned((prev) => prev.filter((m) => m.id !== updated.id));
            }
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
          // Announce ourselves via presence
          await rt.track({
            user_id: currentUserId,
            name: currentUserName,
            avatar: currentUserAvatar,
          } satisfies PresenceUser);
          // Refetch to catch messages missed during disconnect
          if (wasDisconnected.current) {
            wasDisconnected.current = false;
            fetchRecentMessages(channel.id, 30).then((fresh) => {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newOnes = fresh.filter((m) => !existingIds.has(m.id));
                return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
              });
            });
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          wasDisconnected.current = true;
          reconnectTimer.current = setTimeout(
            () => setIsConnected(false),
            3000,
          );
        }
      });

    channelRef.current = rt;

    return () => {
      supabase.removeChannel(rt);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
    // Re-subscribe whenever the channel changes (navigating between channels)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  // ── Handlers forwarded to child components ─────────────────────────

  function handleDeleted(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setPinned((prev) => prev.filter((m) => m.id !== id));
  }

  function handlePinChanged(id: string, isPinned: boolean) {
    if (isPinned) {
      // Use nested functional updater to read fresh messages without stale closure
      setMessages((prev) => {
        const msg = prev.find((m) => m.id === id);
        if (msg) {
          setPinned((pins) => {
            if (pins.some((p) => p.id === id)) return pins;
            return [{ ...msg, pinned: true }, ...pins].slice(0, 3);
          });
        }
        return prev.map((m) => (m.id === id ? { ...m, pinned: true } : m));
      });
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, pinned: false } : m)),
      );
      setPinned((prev) => prev.filter((m) => m.id !== id));
    }
  }

  function handleOlderLoaded(older: ChatMessage[]) {
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = older.filter((m) => !existingIds.has(m.id));
      return [...newOnes, ...prev];
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-[20px] border border-ink-100 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2.5 px-3 sm:px-5 py-3 border-b border-ink-100 bg-white">
        <Link
          href="/community"
          aria-label="Back to Community"
          className="inline-flex items-center gap-1.5 h-9 pl-2 pr-3 -ml-1 rounded-[10px] text-ink-600 hover:bg-cream-100 hover:text-ink-900 transition-colors text-[13px] font-medium"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} />
          <span className="hidden sm:inline">Community</span>
        </Link>
        <span className="h-5 w-px bg-ink-100" aria-hidden />
        <span className="text-[15px]" aria-hidden>
          {channel.icon ?? "💬"}
        </span>
        <h1 className="font-semibold text-[15px] text-ink-900">{channel.name}</h1>
        {channel.posts_admin_only && (
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[10.5px] font-semibold text-amber-700">
            Admins post only
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {/* Online count + stacked avatars */}
          {presence.length > 0 && (
            <div className="flex items-center gap-2" title={presence.map((p) => p.name).join(", ")}>
              <div className="flex -space-x-2">
                {presence.slice(0, 3).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div
                    key={p.user_id}
                    className="size-6 rounded-full ring-2 ring-white bg-cream-200 overflow-hidden flex items-center justify-center text-[10px] font-semibold text-ink-700"
                  >
                    {p.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[11.5px] text-ink-500 font-medium">
                {presence.length} online
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
            />
            <span className="text-[11.5px] text-ink-400">
              {isConnected ? "Live" : "Connecting…"}
            </span>
          </div>
        </div>
      </div>

      {/* Pinned banner */}
      <PinnedBanner pinned={pinned} />

      {/* Message list */}
      <MessageList
        channelId={channel.id}
        messages={messages}
        reactions={reactionGroups}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onDeleted={handleDeleted}
        onPinChanged={handlePinChanged}
        onError={showError}
        onOlderLoaded={handleOlderLoaded}
        onReply={setReplyTo}
      />

      {/* Composer — disabled with notice if channel is admin-only and user is not admin */}
      {canPostInChannel ? (
        <Composer
          channelId={channel.id}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSent={() => {/* scroll handled by MessageList useEffect */}}
          onError={showError}
          isConnected={isConnected}
          currentUserId={currentUserId}
        />
      ) : (
        <div className="border-t border-ink-100 bg-cream-50 px-4 py-4 text-center">
          <p className="text-[13px] text-ink-500">
            <span className="font-semibold text-ink-700">{channel.name}</span> is
            an announcements-only channel. You can read messages but only admins
            can post here.
          </p>
        </div>
      )}

      {/* Inline toasts */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-[12px] text-[13px] font-medium shadow-md pointer-events-none ${
              t.kind === "error"
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
