"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessagesSquare } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { cn } from "@/lib/cn";
import type { DmConversation } from "@/lib/community/dm/types";
import { NewMessage } from "./new-message";

type Props = {
  conversations: DmConversation[];
  currentConversationId?: string;
  currentUserId: string;
};

function shortTime(iso: string): string {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
  currentConversationId,
  currentUserId,
}: Props) {
  const [picking, setPicking] = useState(false);

  return (
    <aside className="w-full lg:w-[320px] shrink-0 flex flex-col h-full bg-white border-r border-ink-100 overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 h-[63px] border-b border-ink-100">
        <h2 className="font-semibold text-[15px] text-ink-900">Messages</h2>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12">
            <span className="size-12 rounded-full bg-cream-200 text-ink-400 inline-flex items-center justify-center mb-3">
              <MessagesSquare className="size-6" strokeWidth={1.8} aria-hidden />
            </span>
            <p className="text-[13px] font-semibold text-ink-900">No messages yet</p>
            <p className="text-[12px] text-ink-500 mt-1 leading-snug">
              Start a conversation with another creator.
            </p>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-4 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              New message
            </button>
          </div>
        ) : (
          <ul>
            {conversations.map((c) => {
              const active = c.id === currentConversationId;
              const mine = c.last_message_sender === currentUserId;
              const preview = c.last_message_preview
                ? `${mine ? "You: " : ""}${c.last_message_preview}`
                : "No messages yet";
              return (
                <li key={c.id}>
                  <Link
                    href={`/messages/${c.id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-[12px] transition-colors",
                      active ? "bg-rose-50" : "hover:bg-cream-100",
                    )}
                  >
                    <Avatar
                      name={c.other.name}
                      src={c.other.avatar ?? undefined}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-[13.5px] font-semibold truncate",
                            active ? "text-rose-700" : "text-ink-900",
                          )}
                        >
                          {c.other.name}
                        </span>
                        <span className="shrink-0 text-[10.5px] text-ink-400 tabular-nums">
                          {shortTime(c.last_message_at)}
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-500 truncate mt-0.5">
                        {preview}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {picking && <NewMessage onClose={() => setPicking(false)} />}
    </aside>
  );
}
