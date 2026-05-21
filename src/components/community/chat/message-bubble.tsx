"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Trash2, Pin, PinOff } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { softDeleteMessage, pinMessage, unpinMessage } from "@/lib/community/chat/actions";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  message: ChatMessage;
  currentUserId: string;
  isAdmin: boolean;
  onDeleted: (id: string) => void;
  onPinChanged: (id: string, pinned: boolean) => void;
  onError: (msg: string) => void;
};

export function MessageBubble({
  message,
  currentUserId,
  isAdmin,
  onDeleted,
  onPinChanged,
  onError,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isOwn = message.user_id === currentUserId;
  const canDelete = isOwn || isAdmin;
  const canPin = isAdmin;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleDelete() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await softDeleteMessage(message.id);
      if (!result.ok) onError(result.error);
      else onDeleted(message.id);
    });
  }

  function handlePin() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = message.pinned
        ? await unpinMessage(message.id)
        : await pinMessage(message.id);
      if (!result.ok) onError(result.error);
      else onPinChanged(message.id, !message.pinned);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-2 py-1.5 rounded-[12px] hover:bg-cream-100/60 transition-colors",
        pending && "opacity-50",
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <Avatar
          name={message.author_name}
          src={message.author_avatar ?? undefined}
          size={36}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13.5px] font-semibold text-ink-900 leading-none">
            {message.author_name}
          </span>
          {message.author_is_admin && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 leading-none">
              Admin
            </span>
          )}
          {message.pinned && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
              <Pin className="size-2.5" strokeWidth={2.5} />
              Pinned
            </span>
          )}
          <span className="text-[11px] text-ink-400 ml-auto">{time}</span>
        </div>

        {/* Body */}
        <p className="mt-0.5 text-[13.5px] text-ink-800 leading-relaxed break-words">
          {message.body}
        </p>
      </div>

      {/* Action menu (visible on hover or when open) */}
      {(canDelete || canPin) && (
        <div
          className={cn(
            "shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity",
            menuOpen && "opacity-100",
          )}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="size-7 rounded-[8px] flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 transition-colors"
              aria-label="Message actions"
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-ink-100 rounded-[12px] shadow-md py-1 text-[13px]">
                  {canPin && (
                    <button
                      type="button"
                      onClick={handlePin}
                      className="w-full flex items-center gap-2 px-3 py-2 text-ink-700 hover:bg-cream-100 transition-colors"
                    >
                      {message.pinned ? (
                        <>
                          <PinOff className="size-3.5 text-ink-400" strokeWidth={2} />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="size-3.5 text-ink-400" strokeWidth={2} />
                          Pin message
                        </>
                      )}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="size-3.5" strokeWidth={2} />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
