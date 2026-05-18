"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { ContentStatus } from "@/lib/posting/queries";
import {
  updateItemStatus,
  deletePostingItem,
} from "@/app/(app)/posting/actions";

const STATUS_FLOW: ContentStatus[] = [
  "idea",
  "planned",
  "scripted",
  "filmed",
  "edited",
  "posted",
  "reviewed",
];

const STATUS_LABEL: Record<ContentStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  scripted: "Scripted",
  filmed: "Filmed",
  edited: "Edited",
  posted: "Posted",
  reviewed: "Reviewed",
};

export function ItemActionsMenu({
  itemId,
  currentStatus,
}: {
  itemId: string;
  currentStatus: ContentStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const setStatus = (next: ContentStatus) =>
    startTransition(async () => {
      await updateItemStatus(itemId, next);
      setOpen(false);
    });

  const remove = () =>
    startTransition(async () => {
      if (!confirm("Delete this planned post?")) return;
      await deletePostingItem(itemId);
      setOpen(false);
    });

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        className="size-8 rounded-full hover:bg-cream-200 inline-flex items-center justify-center text-ink-500 disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 w-[180px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5"
        >
          <div className="px-3 py-1.5 text-[10.5px] uppercase tracking-wide text-ink-500 font-semibold">
            Move to
          </div>
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              disabled={pending || s === currentStatus}
              role="menuitem"
              className="flex w-full items-center justify-between px-3 py-1.5 text-[13px] text-ink-700 hover:bg-cream-100 disabled:text-rose-600 disabled:bg-rose-50/60"
            >
              {STATUS_LABEL[s]}
              {s === currentStatus && (
                <span className="text-[10px] uppercase tracking-wide">
                  Current
                </span>
              )}
            </button>
          ))}
          <div className="my-1 h-px bg-ink-100" />
          <button
            type="button"
            onClick={remove}
            role="menuitem"
            disabled={pending}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" strokeWidth={2} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
