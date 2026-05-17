"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ChevronDown, X } from "lucide-react";
import { escalateTicket } from "@/lib/dev-support/actions";
import {
  DEV_ESCALATION_OPTIONS,
  type DevEscalationState,
} from "@/lib/dev-support/types";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/cn";

type Props = {
  ticketPublicId: string;
  currentEscalation: DevEscalationState | null;
};

export function EscalateMenu({ ticketPublicId, currentEscalation }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function pick(state: DevEscalationState | null) {
    setOpen(false);
    start(async () => {
      const result = await escalateTicket(ticketPublicId, state);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(state ? `Escalated: ${state}` : "Escalation cleared");
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
          // Warning-toned secondary: visible (signals risk), not dominant
          // (still shorter than the primary "Reply to Client" CTA).
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[var(--dev-warning-soft)] border border-[var(--dev-warning-border)] hover:border-[var(--dev-warning-text)] text-[12.5px] font-semibold text-[var(--dev-warning-text)] transition-colors",
          pending && "opacity-60 cursor-progress",
        )}
      >
        <ShieldAlert className="size-3.5" strokeWidth={1.9} />
        {pending ? "Updating…" : "Escalate"}
        <ChevronDown className="size-3 opacity-70" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-1 z-20 min-w-[240px] rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] shadow-xl py-1"
        >
          {DEV_ESCALATION_OPTIONS.map((opt) => {
            const isActive = currentEscalation === opt;
            return (
              <li key={opt} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(opt);
                  }}
                  className={cn(
                    "w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] transition-colors",
                    isActive
                      ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                      : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]",
                  )}
                >
                  {opt}
                </button>
              </li>
            );
          })}
          {currentEscalation && (
            <li className="border-t border-[var(--dev-border-soft)] mt-1 pt-1" role="none">
              <button
                type="button"
                role="menuitem"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(null);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-[var(--dev-text-muted)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-secondary)] transition-colors"
              >
                <X className="size-3.5" strokeWidth={2} />
                Clear escalation
              </button>
            </li>
          )}
        </ul>
      )}

    </div>
  );
}
