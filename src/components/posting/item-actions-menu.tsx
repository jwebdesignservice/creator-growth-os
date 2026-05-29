"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Repeat,
  ChevronRight,
  Check,
  Trash2,
} from "lucide-react";
import type { ContentStatus } from "@/lib/posting/queries";
import {
  updateItemStatus,
  deletePostingItem,
  duplicatePostingItem,
} from "@/app/(app)/posting/actions";
import { cn } from "@/lib/cn";

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

const MENU_WIDTH = 188;

type MenuPos = {
  left: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

// Position the menu next to the trigger using viewport (fixed) coordinates so
// it can't be clipped by any ancestor's overflow (the table/calendar cards clip
// both axes). Flips above the trigger when there's little room below, and caps
// its height to the available space so it scrolls internally instead of
// spilling off-screen.
function computeMenuPos(rect: DOMRect): MenuPos {
  const gap = 6;
  const margin = 8;
  const left = Math.max(
    margin,
    Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - margin),
  );
  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  if (spaceBelow < 280 && spaceAbove > spaceBelow) {
    return {
      left,
      bottom: window.innerHeight - rect.top + gap,
      maxHeight: Math.max(160, spaceAbove - gap),
    };
  }
  return {
    left,
    top: rect.bottom + gap,
    maxHeight: Math.max(160, spaceBelow - gap),
  };
}

export function ItemActionsMenu({
  itemId,
  currentStatus,
  onEdit,
}: {
  itemId: string;
  currentStatus: ContentStatus;
  /** When provided, an "Edit" item appears that opens the post detail popup. */
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setStatusOpen(false); // always start with the status sub-menu collapsed
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos(computeMenuPos(rect));
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function reposition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPos(computeMenuPos(rect));
    }
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      // Clicks on the trigger (handled by toggle) or inside the menu stay open.
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // Capture scroll on any ancestor (the table/card scrolls) + window resize.
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const setStatus = (next: ContentStatus) =>
    startTransition(async () => {
      await updateItemStatus(itemId, next);
      router.refresh();
      setOpen(false);
    });

  const duplicate = () =>
    startTransition(async () => {
      await duplicatePostingItem(itemId);
      router.refresh();
      setOpen(false);
    });

  const remove = () =>
    startTransition(async () => {
      if (!confirm("Delete this planned post?")) return;
      await deletePostingItem(itemId);
      router.refresh();
      setOpen(false);
    });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Post actions"
        className="size-8 rounded-full hover:bg-cream-200 inline-flex items-center justify-center text-ink-500 disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: MENU_WIDTH,
              maxHeight: pos.maxHeight,
            }}
            className="z-[60] overflow-y-auto rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5"
          >
            {/* Edit — opens the post detail popup (when the parent wires it up). */}
            {onEdit && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onEdit?.();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-cream-100"
              >
                <Pencil className="size-3.5 shrink-0" strokeWidth={2} />
                Edit
              </button>
            )}

            {/* Duplicate — clones the post into a new "(copy)" on the same day. */}
            <button
              type="button"
              role="menuitem"
              onClick={duplicate}
              disabled={pending}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50"
            >
              <Copy className="size-3.5 shrink-0" strokeWidth={2} />
              Duplicate
            </button>

            {/* Change status — its own collapsible sub-menu. */}
            <button
              type="button"
              aria-expanded={statusOpen}
              onClick={() => setStatusOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-ink-700 hover:bg-cream-100"
            >
              <Repeat className="size-3.5 shrink-0" strokeWidth={2} />
              Change status
              <ChevronRight
                className={cn(
                  "size-3.5 ml-auto text-ink-400 transition-transform",
                  statusOpen && "rotate-90",
                )}
                strokeWidth={2}
              />
            </button>
            {statusOpen && (
              <div className="border-y border-ink-100 bg-cream-50/50 py-1">
                {STATUS_FLOW.map((s) => {
                  const current = s === currentStatus;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (!current) setStatus(s);
                      }}
                      disabled={pending || current}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 pl-8 pr-3 py-1.5 text-[12.5px] hover:bg-cream-100 disabled:hover:bg-transparent",
                        current ? "text-rose-600 font-semibold" : "text-ink-700",
                      )}
                    >
                      {STATUS_LABEL[s]}
                      {current && (
                        <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="my-1 h-px bg-ink-100" />
            <button
              type="button"
              role="menuitem"
              onClick={remove}
              disabled={pending}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="size-3.5 shrink-0" strokeWidth={2} />
              Delete
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
