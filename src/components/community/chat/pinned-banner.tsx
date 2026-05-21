"use client";

import { Pin } from "lucide-react";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  pinned: ChatMessage[];
};

export function PinnedBanner({ pinned }: Props) {
  if (pinned.length === 0) return null;

  return (
    <div className="border-b border-amber-100 bg-amber-50/60 px-4 py-2.5">
      <div className="flex items-start gap-2">
        <Pin
          className="size-3.5 text-amber-500 shrink-0 mt-0.5"
          strokeWidth={2.5}
        />
        <div className="flex-1 min-w-0 space-y-1">
          {pinned.map((msg) => (
            <div key={msg.id} className="text-[12.5px] text-ink-700 leading-snug truncate">
              <span className="font-semibold text-ink-900">{msg.author_name}:</span>{" "}
              {msg.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
