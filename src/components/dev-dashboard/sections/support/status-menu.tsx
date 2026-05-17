"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { updateStatus } from "@/lib/dev-dashboard/support-actions";
import type { SupportTicketStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

type DbStatus = "open" | "waiting" | "in_progress" | "resolved" | "closed";

const STATUS_OPTIONS: { value: DbStatus; label: string; pill: string }[] = [
  { value: "open",         label: "Open",         pill: "bg-[var(--dev-accent-soft)]   text-[var(--dev-accent-text)]   border border-[var(--dev-accent-border)]" },
  { value: "in_progress",  label: "In Progress",  pill: "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border border-[var(--dev-chart-violet)]/30" },
  { value: "waiting",      label: "Waiting Client", pill: "bg-[var(--dev-chart-amber)]/15 text-[var(--dev-chart-amber)] border border-[var(--dev-chart-amber)]/30" },
  { value: "resolved",     label: "Resolved",     pill: "bg-[var(--dev-success-soft)]  text-[var(--dev-success-text)]  border border-[var(--dev-success-border)]" },
  { value: "closed",       label: "Closed",       pill: "bg-[var(--dev-surface-elev)]  text-[var(--dev-text-secondary)] border border-[var(--dev-border)]" },
];

const UI_TO_DB: Partial<Record<SupportTicketStatus, DbStatus>> = {
  "open":           "open",
  "in-progress":    "in_progress",
  "waiting-client": "waiting",
  "resolved":       "resolved",
  // 'escalated' and 'investigating' aren't direct DB statuses — derived.
};

type Props = {
  ticketPublicId: string;
  currentStatus: SupportTicketStatus;
};

export function StatusMenu({ ticketPublicId, currentStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const currentDb = UI_TO_DB[currentStatus] ?? "open";
  const currentLabel = STATUS_OPTIONS.find((o) => o.value === currentDb)?.label ?? "Open";
  const currentPill = STATUS_OPTIONS.find((o) => o.value === currentDb)?.pill ?? STATUS_OPTIONS[0].pill;

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

  function pick(value: DbStatus) {
    if (value === currentDb) {
      setOpen(false);
      return;
    }
    setError(null);
    start(async () => {
      const result = await updateStatus(ticketPublicId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1 px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap transition-opacity",
          currentPill,
          pending && "opacity-60 cursor-not-allowed",
        )}
      >
        {pending && <Loader2 className="size-3 animate-spin" strokeWidth={2.2} />}
        {currentLabel}
        <ChevronDown className="size-3 -mr-0.5" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 z-30 w-[180px] dev-card p-1.5 shadow-xl"
        >
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = opt.value === currentDb;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={isCurrent}
                onClick={() => pick(opt.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] transition-colors",
                  isCurrent
                    ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                    : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]",
                )}
              >
                <span className={cn("inline-flex items-center justify-center size-3.5 rounded-full border", opt.pill)} aria-hidden />
                <span className="flex-1 text-left">{opt.label}</span>
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
