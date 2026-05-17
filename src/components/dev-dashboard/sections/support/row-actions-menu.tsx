"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  MoreHorizontal,
  PlayCircle,
  CircleCheck,
  AlertOctagon,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  escalateTicket,
  updateStatus,
} from "@/lib/dev-dashboard/support-actions";
import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

type Props = {
  ticketPublicId: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  selectHref: string;
};

export function RowActionsMenu({ ticketPublicId, status, selectHref }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  function runStatus(next: "in_progress" | "resolved") {
    setError(null);
    start(async () => {
      const result = await updateStatus(ticketPublicId, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  function runEscalate() {
    setError(null);
    start(async () => {
      const result = await escalateTicket(ticketPublicId, "Escalated to Engineering");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  function copyId() {
    void navigator.clipboard.writeText(ticketPublicId).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => setError("Could not copy to clipboard."),
    );
  }

  const canMarkInProgress = status !== "in-progress" && status !== "resolved";
  const canResolve = status !== "resolved";
  const canEscalate = status !== "escalated" && status !== "resolved";

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={`Actions for ${ticketPublicId}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center justify-center size-7 rounded-md text-[var(--dev-text-muted)] hover:bg-[var(--dev-surface-elev)] hover:text-[var(--dev-text-primary)] transition-colors",
          open && "bg-[var(--dev-surface-elev)] text-[var(--dev-text-primary)]",
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <MoreHorizontal className="size-4" strokeWidth={1.9} />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 z-40 w-[220px] dev-card p-1.5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            role="menuitem"
            href={selectHref}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors"
          >
            <ExternalLink className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} />
            View details
          </a>

          {canMarkInProgress && (
            <button
              type="button"
              role="menuitem"
              onClick={() => runStatus("in_progress")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors text-left"
            >
              <PlayCircle className="size-3.5 text-[var(--dev-chart-violet)]" strokeWidth={1.9} />
              Mark in progress
            </button>
          )}

          {canResolve && (
            <button
              type="button"
              role="menuitem"
              onClick={() => runStatus("resolved")}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors text-left"
            >
              <CircleCheck className="size-3.5 text-[var(--dev-success-text)]" strokeWidth={1.9} />
              Mark resolved
            </button>
          )}

          {canEscalate && (
            <button
              type="button"
              role="menuitem"
              onClick={runEscalate}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors text-left"
            >
              <AlertOctagon className="size-3.5 text-[var(--dev-danger-text)]" strokeWidth={1.9} />
              Escalate to engineering
            </button>
          )}

          <div className="my-1 h-px bg-[var(--dev-border-soft)]" aria-hidden />

          <button
            type="button"
            role="menuitem"
            onClick={copyId}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[12.5px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors text-left"
          >
            <Copy className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} />
            {copied ? "Copied!" : `Copy ${ticketPublicId}`}
          </button>

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
