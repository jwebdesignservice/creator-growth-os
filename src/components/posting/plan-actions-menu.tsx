"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Archive, MoreHorizontal } from "lucide-react";
import { archivePostingPlan } from "@/app/(app)/posting/actions";

export function PlanActionsMenu({ planId }: { planId: string }) {
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

  const archive = () =>
    startTransition(async () => {
      if (
        !confirm(
          "Archive this plan? Existing posts will stay in your history. You can create a new active plan afterwards.",
        )
      )
        return;
      await archivePostingPlan(planId);
      setOpen(false);
    });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Plan actions"
        className="size-10 rounded-[12px] border border-ink-200 bg-white hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-30 w-[180px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5"
        >
          <button
            type="button"
            onClick={archive}
            disabled={pending}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-ink-700 hover:bg-cream-100"
          >
            <Archive className="size-3.5" strokeWidth={2} />
            Archive plan
          </button>
        </div>
      )}
    </div>
  );
}
