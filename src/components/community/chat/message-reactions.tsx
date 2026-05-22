"use client";

import { useState, useTransition } from "react";
import { SmilePlus } from "lucide-react";
import { addReaction, removeReaction } from "@/lib/community/chat/actions";
import { cn } from "@/lib/cn";
import type { ReactionGroup } from "@/lib/community/chat/types";

type Props = {
  messageId: string;
  currentUserId: string;
  reactions: ReactionGroup[];
  onError: (msg: string) => void;
};

const COMMON_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "🙏", "👏", "😮"];

export function MessageReactions({
  messageId,
  currentUserId,
  reactions,
  onError,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Filter reactions to just this message
  const mine = reactions.filter((r) => r.message_id === messageId);

  function toggle(emoji: string) {
    setPickerOpen(false);
    const existing = mine.find((r) => r.emoji === emoji);
    const alreadyReacted = existing?.user_ids.includes(currentUserId) ?? false;
    startTransition(async () => {
      const result = alreadyReacted
        ? await removeReaction(messageId, emoji)
        : await addReaction(messageId, emoji);
      if (!result.ok) onError(result.error);
    });
  }

  if (mine.length === 0 && !pickerOpen) {
    // No reactions yet — render nothing in the bubble row.
    // The "add reaction" button lives on the action hover bar in MessageBubble.
    return null;
  }

  return (
    <div className="mt-1 flex items-center gap-1 flex-wrap relative">
      {mine.map((r) => {
        const youReacted = r.user_ids.includes(currentUserId);
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => toggle(r.emoji)}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 h-6 rounded-full border text-[12px] transition-all",
              youReacted
                ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                : "bg-cream-100 border-ink-100 text-ink-700 hover:bg-cream-200",
            )}
            title={youReacted ? "Remove your reaction" : "Add your reaction"}
          >
            <span className="text-[13px] leading-none">{r.emoji}</span>
            <span className="font-medium tabular-nums">{r.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Standalone trigger button that opens the emoji picker (lives in MessageBubble hover bar). */
export function AddReactionButton({
  messageId,
  reactions,
  currentUserId,
  onError,
}: {
  messageId: string;
  reactions: ReactionGroup[];
  currentUserId: string;
  onError: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const mine = reactions.filter((r) => r.message_id === messageId);

  function pick(emoji: string) {
    setOpen(false);
    const existing = mine.find((r) => r.emoji === emoji);
    const alreadyReacted = existing?.user_ids.includes(currentUserId) ?? false;
    startTransition(async () => {
      const result = alreadyReacted
        ? await removeReaction(messageId, emoji)
        : await addReaction(messageId, emoji);
      if (!result.ok) onError(result.error);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-7 rounded-[8px] flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-rose-600 transition-colors"
        aria-label="Add reaction"
        title="React"
      >
        <SmilePlus className="size-4" strokeWidth={2} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 flex gap-1 px-2 py-1.5 bg-white border border-ink-100 rounded-[14px] shadow-md">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => pick(emoji)}
                className="size-8 rounded-[8px] flex items-center justify-center text-[18px] hover:bg-cream-100 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
