"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, Check, X, UserPlus, Loader2 } from "lucide-react";
import { assignTicket } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

type AssignableUser = { id: string; label: string };

type Props = {
  ticketPublicId: string;
  currentAssigneeName: string;
  currentAssigneeId: string | null;
  assignableUsers: AssignableUser[];
};

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AssignMenu({ ticketPublicId, currentAssigneeName, currentAssigneeId, assignableUsers }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(userId: string | null) {
    if (userId === currentAssigneeId) {
      setOpen(false);
      return;
    }
    setError(null);
    start(async () => {
      const result = await assignTicket(ticketPublicId, userId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  const displayName = currentAssigneeId ? currentAssigneeName : "Unassigned";

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[12px] font-medium bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[var(--dev-text-primary)] transition-colors",
          pending && "opacity-60 cursor-not-allowed",
        )}
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" strokeWidth={2.2} />
        ) : currentAssigneeId ? (
          <span className="inline-flex items-center justify-center size-4 rounded-full bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border border-[var(--dev-accent-border)] text-[9px] font-semibold" aria-hidden>
            {initialsFor(displayName)}
          </span>
        ) : (
          <UserPlus className="size-3 text-[var(--dev-text-muted)]" strokeWidth={2} />
        )}
        <span className="truncate max-w-[120px]">{displayName}</span>
        <ChevronDown className="size-3 text-[var(--dev-text-muted)] -mr-0.5" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 z-30 w-[240px] dev-card p-1.5 shadow-xl max-h-[300px] overflow-y-auto"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={currentAssigneeId === null}
            onClick={() => pick(null)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] transition-colors",
              currentAssigneeId === null
                ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]",
            )}
          >
            <X className="size-3 text-[var(--dev-text-muted)]" strokeWidth={2} />
            <span className="flex-1 text-left italic">Unassigned</span>
            {currentAssigneeId === null && <Check className="size-3 text-[var(--dev-accent-text)]" strokeWidth={2.5} />}
          </button>

          {assignableUsers.length > 0 && (
            <div className="my-1 h-px bg-[var(--dev-border-soft)]" aria-hidden />
          )}

          {assignableUsers.map((u) => {
            const isCurrent = u.id === currentAssigneeId;
            return (
              <button
                key={u.id}
                type="button"
                role="menuitemradio"
                aria-checked={isCurrent}
                onClick={() => pick(u.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] transition-colors",
                  isCurrent
                    ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                    : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]",
                )}
              >
                <span
                  className="inline-flex items-center justify-center size-5 rounded-full bg-[var(--dev-surface-elev)] border border-[var(--dev-border)] text-[10px] font-semibold text-[var(--dev-text-secondary)]"
                  aria-hidden
                >
                  {initialsFor(u.label)}
                </span>
                <span className="flex-1 text-left truncate">{u.label}</span>
                {isCurrent && <Check className="size-3 text-[var(--dev-accent-text)]" strokeWidth={2.5} />}
              </button>
            );
          })}

          {error && (
            <p role="alert" className="mt-1 px-2 text-[11px] text-[var(--dev-danger-text)]">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
