"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Bell, Loader2,
  AlertOctagon, Info, ShieldAlert, Rocket, DollarSign,
  Activity, ScrollText, ArrowRight,
} from "lucide-react";
import {
  markAllDevNotificationsRead,
  markDevNotificationRead,
} from "@/lib/dev-dashboard/dev-notifications-actions";
import type {
  DevNotification,
  DevNotificationCategory,
  DevNotificationSeverity,
  DevNotificationStatus,
} from "@/lib/dev-dashboard/dev-notifications-queries";
import {
  useDevNotificationsRealtime,
  type DevNotificationDbRow,
} from "@/lib/dev-dashboard/dev-notifications-realtime";
import { cn } from "@/lib/cn";

const BELL_CAP = 6;

/* Map a raw DB row coming from Realtime into the UI-facing shape so it
   can be merged directly into the dropdown's items state. Mirrors the
   server-side mapper in dev-notifications-queries.ts. */
function dbRowToNotification(r: DevNotificationDbRow): DevNotification {
  const ms = Date.now() - new Date(r.occurred_at).getTime();
  const whenLabel =
    ms < 10_000           ? "Just now" :
    ms < 60_000           ? `${Math.round(ms / 1000)}s ago` :
    ms < 60 * 60_000      ? `${Math.round(ms / 60_000)}m ago` :
    ms < 24 * 60 * 60_000 ? `${Math.round(ms / (60 * 60_000))}h ago` :
                            `${Math.round(ms / (24 * 60 * 60_000))}d ago`;

  const ts          = new Date(r.occurred_at).getTime();
  const today0      = new Date(); today0.setHours(0, 0, 0, 0);
  const weekStartMs = Date.now() - 7 * 24 * 60 * 60_000;
  const group       =
    ts >= today0.getTime() ? "today" :
    ts >= weekStartMs      ? "week"  : "earlier";

  return {
    id:          r.id,
    occurredAt:  r.occurred_at,
    title:       r.title,
    body:        r.body,
    category:    r.category as DevNotificationCategory,
    severity:    r.severity as DevNotificationSeverity,
    status:      r.status   as DevNotificationStatus,
    source:      r.source,
    traceId:     r.trace_id,
    actionLabel: r.action_label,
    actionUrl:   r.action_url,
    whenLabel,
    group,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Bell + dropdown panel rendered into the dev topbar.

   The server-side wrapper (dev-notifications-trigger.tsx) fetches the
   initial unread count + top items so the badge is correct on first
   paint with no client-side loading flash. After that, this component
   owns local state for optimistic mark-read and mark-all-read.
   ───────────────────────────────────────────────────────────────────────── */

const SEVERITY_DOT: Record<DevNotificationSeverity, string> = {
  critical: "bg-[var(--dev-danger)]",
  high:     "bg-[var(--dev-danger-text)]",
  medium:   "bg-[var(--dev-warning-text)]",
  low:      "bg-[var(--dev-accent-text)]",
  info:     "bg-[var(--dev-text-muted)]",
};

const SEVERITY_PILL: Record<DevNotificationSeverity, string> = {
  critical: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  high:     "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  medium:   "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  low:      "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  info:     "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border-[var(--dev-border)]",
};

const CATEGORY_ICON: Record<DevNotificationCategory, typeof Bell> = {
  incident: AlertOctagon,
  deploy:   Rocket,
  security: ShieldAlert,
  billing:  DollarSign,
  system:   Activity,
  audit:    ScrollText,
};

const CATEGORY_LABEL: Record<DevNotificationCategory, string> = {
  incident: "Incident",
  deploy:   "Deploy",
  security: "Security",
  billing:  "Billing",
  system:   "System",
  audit:    "Audit",
};

type Props = {
  initialItems:       DevNotification[];
  initialUnreadCount: number;
};

export function DevNotificationsDropdown({ initialItems, initialUnreadCount }: Props) {
  const [open, setOpen]               = useState(false);
  const [items, setItems]             = useState<DevNotification[]>(initialItems);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition]  = useTransition();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Keep local state in sync if the server passes new props (e.g. after
  // a router refresh on the page). Adjust during render rather than
  // useEffect to avoid the cascading-render lint pattern.
  const [prevItems, setPrevItems] = useState(initialItems);
  if (initialItems !== prevItems) {
    setPrevItems(initialItems);
    setItems(initialItems);
    setUnreadCount(initialUnreadCount);
  }

  // Close on click-outside + Esc.
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
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown",   onKey);
    };
  }, [open]);

  // Live updates via Supabase Realtime: new notifications prepend into
  // the list, the badge bumps, and status changes from another tab
  // (mark-read / archive) reflect locally without a page refresh. The
  // server-side trigger system in 0014 means errors/auth events stream
  // in here automatically.
  useDevNotificationsRealtime({
    onInsert: (row) => {
      const item = dbRowToNotification(row);
      setItems((prev) => {
        // Avoid duplicating if the same id is already present (dedup
        // hits arrive as UPDATEs, but defensive de-dup here keeps the
        // UI honest if Realtime ever re-delivers).
        if (prev.some((p) => p.id === item.id)) return prev;
        return [item, ...prev].slice(0, BELL_CAP);
      });
      if (item.status === "unread") setUnreadCount((c) => c + 1);
    },
    onUpdate: (row) => {
      const item = dbRowToNotification(row);
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === item.id);
        if (idx === -1) {
          // A dedup hit bumped a row not currently in the visible window
          // — surface it at the top.
          if (row.status === "archived") return prev;
          return [item, ...prev].slice(0, BELL_CAP);
        }
        const next = prev.slice();
        next[idx] = item;
        return next;
      });
      // Recompute unread count from the now-updated list so cross-tab
      // mark-read / dedup-bump stays correct without double-counting.
      setUnreadCount((prevCount) => {
        // Cheap heuristic: if this update flipped the row's status, adjust.
        const wasUnread = items.find((p) => p.id === item.id)?.status === "unread";
        const nowUnread = row.status === "unread";
        if (wasUnread && !nowUnread) return Math.max(0, prevCount - 1);
        if (!wasUnread && nowUnread) return prevCount + 1;
        return prevCount;
      });
    },
    onDelete: (id) => {
      setItems((prev) => prev.filter((p) => p.id !== id));
    },
  });

  function handleMarkAllRead() {
    startTransition(async () => {
      const optimisticItems = items.map((n) => ({ ...n, status: "read" as const }));
      setItems(optimisticItems);
      setUnreadCount(0);
      const res = await markAllDevNotificationsRead();
      if (!res.ok) {
        // Revert if the action failed.
        setItems(items);
        setUnreadCount(unreadCount);
        console.error("[dev-notifications] mark all read:", res.error);
      }
    });
  }

  function handleItemClick(id: string) {
    const target = items.find((n) => n.id === id);
    if (!target || target.status !== "unread") return;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: "read" } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    startTransition(async () => {
      const res = await markDevNotificationRead(id);
      if (!res.ok) console.error("[dev-notifications] mark read:", res.error);
    });
  }

  return (
    <div ref={rootRef} className="relative">
      {/* ── Bell trigger ─────────────────────────────────────────────── */}
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex items-center justify-center size-9 rounded-[10px] transition-colors",
          open
            ? "bg-[var(--dev-surface-soft)] text-[var(--dev-text-primary)]"
            : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]",
        )}
      >
        <Bell className="size-[17px]" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-[var(--dev-accent)] text-white text-[10px] font-semibold ring-2 ring-[var(--dev-topbar-bg)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Recent dev notifications"
          className="absolute right-0 top-[calc(100%+8px)] w-[400px] max-w-[calc(100vw-2rem)] rounded-[14px] bg-[var(--dev-surface)] border border-[var(--dev-border-strong)] shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--dev-border-soft)]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[14px] font-semibold text-[var(--dev-text-primary)]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] text-[10.5px] font-semibold text-[var(--dev-accent-text)] tabular-nums">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors disabled:opacity-60"
              >
                {isPending && <Loader2 className="size-3 animate-spin" strokeWidth={2} />}
                Mark all read
              </button>
            ) : (
              <span className="text-[12px] text-[var(--dev-text-muted)]">All caught up</span>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-[var(--dev-border-soft)]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <Bell className="size-7 text-[var(--dev-text-muted)] mb-2" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-[var(--dev-text-primary)]">No notifications</p>
                <p className="text-[12px] text-[var(--dev-text-muted)] mt-0.5">
                  You&apos;re fully caught up.
                </p>
              </div>
            ) : (
              items.map((n) => (
                <DropdownRow key={n.id} n={n} onMarkRead={handleItemClick} />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[var(--dev-border-soft)] bg-[var(--dev-sidebar-bg)]">
            <Link
              href="/dev/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full text-[12.5px] font-semibold text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
            >
              View all notifications
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Single row in the dropdown ──────────────────────────────────────── */

function DropdownRow({
  n,
  onMarkRead,
}: {
  n: DevNotification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = CATEGORY_ICON[n.category] ?? Info;
  const isUnread = n.status === "unread";

  // The row is clickable to mark-read. If there's also an action URL,
  // an inline link inside the row navigates without triggering mark-read
  // twice (we mark-read on navigate too via onClick).
  function rowClick(e: React.MouseEvent) {
    // Avoid double-marking when the user clicks the inline link.
    if ((e.target as HTMLElement).closest("a")) return;
    onMarkRead(n.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={rowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onMarkRead(n.id);
        }
      }}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer focus:outline-none focus-visible:bg-[var(--dev-surface-soft)]",
        isUnread ? "bg-transparent" : "bg-[var(--dev-sidebar-bg)]/40",
        "hover:bg-[var(--dev-surface-soft)]",
      )}
    >
      {/* Unread dot column */}
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 rounded-full shrink-0",
          isUnread ? SEVERITY_DOT[n.severity] : "bg-transparent",
        )}
      />

      {/* Category icon */}
      <span
        aria-hidden
        className={cn(
          "size-7 rounded-[8px] inline-flex items-center justify-center border shrink-0",
          SEVERITY_PILL[n.severity],
        )}
      >
        <Icon className="size-[15px]" strokeWidth={1.9} />
      </span>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center px-1.5 h-[18px] rounded-md text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap border",
              SEVERITY_PILL[n.severity],
            )}
          >
            {CATEGORY_LABEL[n.category]}
          </span>
          <span className="text-[11px] text-[var(--dev-text-muted)] ml-auto tabular-nums shrink-0">
            {n.whenLabel}
          </span>
        </div>
        <div
          className={cn(
            "text-[13px] leading-snug",
            isUnread ? "font-semibold text-[var(--dev-text-primary)]" : "font-medium text-[var(--dev-text-secondary)]",
          )}
        >
          {n.title}
        </div>
        {n.body && (
          <p className="mt-0.5 text-[12px] text-[var(--dev-text-muted)] leading-snug line-clamp-2">
            {n.body}
          </p>
        )}
        {n.actionUrl && n.actionLabel && (
          <Link
            href={n.actionUrl}
            className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
          >
            {n.actionLabel}
            <ArrowRight className="size-3" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}
