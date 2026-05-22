"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageList } from "./message-list";
import { PinnedBanner } from "./pinned-banner";
import { Composer } from "./composer";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { fetchRecentMessages } from "@/lib/community/chat/actions";
import type { ChatMessage } from "@/lib/community/chat/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Props = {
  initialMessages: ChatMessage[];
  initialPinned: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  isAdmin: boolean;
};
// currentUserName and currentUserAvatar reserved for future optimistic insert

type Toast = { id: number; kind: "error" | "success"; message: string };

export function ChatRoom({
  initialMessages,
  initialPinned,
  currentUserId,
  isAdmin,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pinned, setPinned] = useState<ChatMessage[]>(initialPinned);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasDisconnected = useRef(false);

  const showError = useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, kind: "error", message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("chat:global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_chat_messages",
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
          }
          // Refetch to catch messages missed during disconnect
          if (wasDisconnected.current) {
            wasDisconnected.current = false;
            fetchRecentMessages(30).then((fresh) => {
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

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

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
        <MessageSquare className="size-4 text-rose-500" strokeWidth={2} />
        <h1 className="font-semibold text-[15px] text-ink-900">Community Chat</h1>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
          />
          <span className="text-[11.5px] text-ink-400">
            {isConnected ? "Live" : "Connecting…"}
          </span>
        </div>
      </div>

      {/* Pinned banner */}
      <PinnedBanner pinned={pinned} />

      {/* Message list */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onDeleted={handleDeleted}
        onPinChanged={handlePinChanged}
        onError={showError}
        onOlderLoaded={handleOlderLoaded}
        onReply={setReplyTo}
      />

      {/* Composer */}
      <Composer
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSent={() => {/* scroll handled by MessageList useEffect */}}
        onError={showError}
        isConnected={isConnected}
      />

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
