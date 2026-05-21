"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/components/app-shell/avatar";
import type { MentionCandidate } from "@/lib/community/chat/types";

type Props = {
  candidates: MentionCandidate[];
  selectedIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
};

export function MentionPopover({ candidates, selectedIndex, onSelect }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (candidates.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-ink-100 rounded-[14px] shadow-lg overflow-hidden z-30">
      <div className="px-3 py-1.5 text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider border-b border-ink-50">
        Mention a creator
      </div>
      <ul className="max-h-48 overflow-y-auto py-1">
        {candidates.map((c, i) => {
          const name = c.display_name ?? c.full_name ?? c.handle ?? "Creator";
          const isActive = i === selectedIndex;
          return (
            <li key={c.id}>
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(c)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "hover:bg-cream-100 text-ink-700"
                }`}
              >
                <Avatar name={name} src={c.avatar_url ?? undefined} size={28} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{name}</div>
                  {c.handle && (
                    <div className="text-[11px] text-ink-400 truncate">
                      @{c.handle}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
