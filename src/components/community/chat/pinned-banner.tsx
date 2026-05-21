"use client";

import { useState } from "react";
import { Pin, ChevronDown, ChevronUp } from "lucide-react";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  pinned: ChatMessage[];
};

export function PinnedBanner({ pinned }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (pinned.length === 0) return null;

  const visible = expanded ? pinned : pinned.slice(0, 1);

  return (
    <div className="border-b border-amber-100 bg-amber-50/60 px-4 py-2.5">
      <div className="flex items-start gap-2">
        <Pin
          className="size-3.5 text-amber-500 shrink-0 mt-0.5"
          strokeWidth={2.5}
        />
        <div className="flex-1 min-w-0 space-y-1">
          {visible.map((msg) => (
            <div key={msg.id} className="text-[12.5px] text-ink-700 leading-snug truncate">
              <span className="font-semibold text-ink-900">{msg.author_name}:</span>{" "}
              {msg.body}
            </div>
          ))}
        </div>
        {pinned.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 text-[11px] text-amber-600 hover:text-amber-700 flex items-center gap-0.5 font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3" strokeWidth={2.5} />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="size-3" strokeWidth={2.5} />
                {pinned.length - 1} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
