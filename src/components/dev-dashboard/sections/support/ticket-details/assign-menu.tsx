"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ChevronDown, X } from "lucide-react";
import { assignTicket } from "@/lib/dev-support/actions";
import type { DevAssignableUser } from "@/lib/dev-support/types";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/cn";

type Props = {
  ticketPublicId: string;
  assignableUsers: DevAssignableUser[];
};

export function AssignMenu({ ticketPublicId, assignableUsers }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  // ESC closes the menu globally.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(userId: string | null, name: string | null) {
    setOpen(false);
    start(async () => {
      const result = await assignTicket(ticketPublicId, userId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(name ? `Assigned to ${name}` : "Ticket unassigned");
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
        <UserPlus className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
        {pending ? "Assigning…" : "Assign"}
        <ChevronDown className="size-3 text-[var(--dev-text-muted)]" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-1 z-20 min-w-[220px] max-h-[280px] overflow-auto rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] shadow-xl py-1"
        >
          {assignableUsers.length === 0 ? (
            <li className="px-3 py-2 text-[12.5px] text-[var(--dev-text-muted)]">
              No assignable users found.
            </li>
          ) : (
            <>
              {assignableUsers.map((u) => (
                <li key={u.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(u.id, u.name);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors"
                  >
                    <span className="size-6 rounded-full bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] inline-flex items-center justify-center text-[10px] font-semibold text-[var(--dev-accent-text)] shrink-0">
                      {u.initials}
                    </span>
                    <span className="truncate">{u.name}</span>
                  </button>
                </li>
              ))}
              <li className="border-t border-[var(--dev-border-soft)] mt-1 pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(null, null);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-[var(--dev-text-muted)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-secondary)] transition-colors"
                >
                  <X className="size-3.5" strokeWidth={2} />
                  Unassign
                </button>
              </li>
            </>
          )}
        </ul>
      )}

    </div>
  );
}
