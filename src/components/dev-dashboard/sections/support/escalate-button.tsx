"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { escalateTicket } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

type Props = {
  ticketId: string;
  alreadyEscalated?: boolean;
};

const ESCALATION_OPTIONS = [
  "Escalated to Engineering",
  "Awaiting Client Reply",
  "Awaiting Internal Review",
] as const;

export function EscalateButton({ ticketId, alreadyEscalated }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<(typeof ESCALATION_OPTIONS)[number]>("Escalated to Engineering");

  function onConfirm() {
    setError(null);
    start(async () => {
      const result = await escalateTicket(ticketId, state);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[var(--dev-danger-soft)] border border-[var(--dev-danger-border)] hover:bg-[var(--dev-danger)]/20 text-[12.5px] font-semibold text-[var(--dev-danger-text)] transition-colors",
        )}
      >
        {alreadyEscalated ? "Re-escalate" : "Escalate"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Escalate ticket"
          className="absolute right-0 bottom-full mb-2 z-30 w-[280px] dev-card p-3 shadow-xl"
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-2">
            Escalate to
          </div>
          <div className="space-y-1.5">
            {ESCALATION_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-[6px] cursor-pointer text-[12.5px] transition-colors",
                  state === opt
                    ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                    : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)]",
                )}
              >
                <input
                  type="radio"
                  name="escalation"
                  value={opt}
                  checked={state === opt}
                  onChange={() => setState(opt)}
                  className="size-3 accent-[var(--dev-accent)]"
                />
                {opt}
              </label>
            ))}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-[11px] text-[var(--dev-danger-text)]">
              {error}
            </p>
          )}
          <div className="mt-2.5 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] text-[12px] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--dev-danger-soft)] border border-[var(--dev-danger-border)] text-[12px] font-semibold text-[var(--dev-danger-text)] hover:bg-[var(--dev-danger)]/20 transition-colors",
                pending && "opacity-70 cursor-not-allowed",
              )}
            >
              {pending && <Loader2 className="size-3 animate-spin" strokeWidth={2.2} />}
              Confirm escalation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
