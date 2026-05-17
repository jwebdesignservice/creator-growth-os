"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X, Copy, Check, ShieldAlert } from "lucide-react";
import type { AuthEventRow } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Event detail drawer for /dev/auth.

   Each row in the Recent Auth Events table opens this provider's modal,
   showing a fuller view of the event payload. Mirrors the pattern used by
   the errors page's stack-trace modal so behavior (Esc, body-scroll lock,
   click-outside) stays consistent across the dashboard.
   ───────────────────────────────────────────────────────────────────────── */

type DetailCtx = {
  open: (event: AuthEventRow) => void;
};

const Ctx = createContext<DetailCtx | null>(null);

export function useAuthEventDetail(): DetailCtx {
  const ctx = useContext(Ctx);
  if (!ctx) return { open: () => undefined };
  return ctx;
}

const STATUS_PILL: Record<AuthEventRow["statusKind"], string> = {
  success: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  tracked: "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  warning: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  danger:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
};

export function AuthEventDetailProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<AuthEventRow | null>(null);
  const [copied, setCopied] = useState(false);

  const open = useCallback((e: AuthEventRow) => {
    setEvent(e);
    setCopied(false);
  }, []);

  const close = useCallback(() => setEvent(null), []);

  useEffect(() => {
    if (!event) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [event, close]);

  const onCopy = useCallback(async () => {
    if (!event) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(event, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard rejected — silently ignore; the payload is still visible.
    }
  }, [event]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {event && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Auth event details"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-[600px] dev-card p-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <header className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[15px] font-semibold text-[var(--dev-text-primary)] truncate">
                    <span className="font-mono">{event.event}</span>
                  </h2>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-semibold border shrink-0 whitespace-nowrap",
                      STATUS_PILL[event.statusKind],
                    )}
                  >
                    {event.statusLabel}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--dev-text-muted)] tabular-nums">
                  {event.time} · {event.user}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
                >
                  {copied ? (
                    <Check className="size-3.5 text-[var(--dev-success-text)]" strokeWidth={2} />
                  ) : (
                    <Copy className="size-3.5" strokeWidth={1.9} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="size-8 inline-flex items-center justify-center rounded-[8px] hover:bg-[var(--dev-surface-soft)] text-[var(--dev-text-secondary)]"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
            </header>

            {event.statusKind === "danger" || event.statusKind === "warning" ? (
              <div
                className={cn(
                  "rounded-[10px] border p-3 mb-4 flex items-start gap-2.5 text-[12.5px]",
                  event.statusKind === "danger"
                    ? "bg-[var(--dev-danger-soft)] border-[var(--dev-danger-border)] text-[var(--dev-danger-text)]"
                    : "bg-[var(--dev-warning-soft)] border-[var(--dev-warning-border)] text-[var(--dev-warning-text)]",
                )}
              >
                <ShieldAlert className="size-4 shrink-0 mt-0.5" strokeWidth={1.9} aria-hidden />
                <span className="leading-snug">
                  This event was flagged as <strong>{event.statusLabel}</strong>.
                  Investigate the user, IP, and recent activity before clearing.
                </span>
              </div>
            ) : null}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12.5px]">
              <Row label="Event"    value={<span className="font-mono">{event.event}</span>} />
              <Row label="Time"     value={<span className="tabular-nums">{event.time}</span>} />
              <Row label="User"     value={event.user} />
              <Row label="Provider" value={event.provider} />
              <Row label="Route"    value={<span className="font-mono">{event.route}</span>} />
              <Row label="Device"   value={event.device} />
              <Row label="Status"   value={event.statusLabel} />
              <Row label="Event ID" value={<span className="font-mono text-[var(--dev-text-muted)]">{event.id}</span>} />
            </dl>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-[var(--dev-text-primary)] truncate">{value}</dd>
    </div>
  );
}
