"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleDot, ChevronDown, Check } from "lucide-react";
import { changeTicketStatus } from "@/lib/dev-support/actions";
import { DEV_STATUS_OPTIONS } from "@/lib/dev-support/types";
import type { SupportTicketStatus as DbStatus } from "@/lib/support/types";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/cn";

type Props = { ticketPublicId: string };

export function ChangeStatusMenu({ ticketPublicId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  // ESC closes the menu even when focus isn't on the trigger.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(value: DbStatus, label: string) {
    setOpen(false);
    start(async () => {
      const result = await changeTicketStatus(ticketPublicId, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Status changed to ${label}`);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors",
          pending && "opacity-60 cursor-progress",
        )}
      >
        <CircleDot className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
        {pending ? "Updating…" : "Change Status"}
        <ChevronDown className="size-3 text-[var(--dev-text-muted)]" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] shadow-xl py-1"
        >
          {DEV_STATUS_OPTIONS.map((o) => (
            <li key={o.value} role="none">
              <button
                type="button"
                role="menuitem"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o.value, o.label);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors"
              >
                <Check className="size-3.5 opacity-0" strokeWidth={2} aria-hidden />
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
