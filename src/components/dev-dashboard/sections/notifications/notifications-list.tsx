"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertOctagon, AlertTriangle, Info, ShieldAlert, Rocket, DollarSign,
  Activity, ScrollText, ArrowRight, Archive, Check, Bell,
} from "lucide-react";
import {
  markDevNotificationRead,
  archiveDevNotification,
} from "@/lib/dev-dashboard/dev-notifications-actions";
import type {
  DevNotification,
  DevNotificationCategory,
  DevNotificationGroup,
  DevNotificationSeverity,
} from "@/lib/dev-dashboard/dev-notifications-queries";
import { cn } from "@/lib/cn";

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

const GROUP_LABEL: Record<DevNotificationGroup, string> = {
  today:   "Today",
  week:    "Earlier This Week",
  earlier: "Earlier",
};

const GROUP_ORDER: DevNotificationGroup[] = ["today", "week", "earlier"];

/* ─────────────────────────────────────────────────────────────────────── */

export function NotificationsList({ items: initialItems }: { items: DevNotification[] }) {
  const [items, setItems] = useState(initialItems);

  // Sync from server when the props change (filter navigation, mark-all, etc.).
  const [prev, setPrev] = useState(initialItems);
  if (initialItems !== prev) {
    setPrev(initialItems);
    setItems(initialItems);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="size-7 text-[var(--dev-text-muted)] mb-2" strokeWidth={1.5} />
        <p className="text-[13px] font-semibold text-[var(--dev-text-primary)]">No notifications match these filters.</p>
        <p className="text-[12px] text-[var(--dev-text-muted)] mt-0.5">
          Try widening the filters above or clearing them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {GROUP_ORDER.map((group) => {
        const groupItems = items.filter((n) => n.group === group);
        if (groupItems.length === 0) return null;
        return (
          <section key={group}>
            <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-2">
              {GROUP_LABEL[group]}
              <span className="ml-2 tabular-nums text-[var(--dev-text-faint)]">
                ({groupItems.length})
              </span>
            </div>
            <ul className="divide-y divide-[var(--dev-border-soft)] -mx-2">
              {groupItems.map((n) => (
                <Row
                  key={n.id}
                  n={n}
                  onMarkRead={(id) =>
                    setItems((prev) =>
                      prev.map((row) => (row.id === id ? { ...row, status: "read" } : row)),
                    )
                  }
                  onArchive={(id) =>
                    setItems((prev) => prev.filter((row) => row.id !== id))
                  }
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ─── Row ────────────────────────────────────────────────────────────── */

function Row({
  n,
  onMarkRead,
  onArchive,
}: {
  n: DevNotification;
  onMarkRead: (id: string) => void;
  onArchive:  (id: string) => void;
}) {
  const Icon = CATEGORY_ICON[n.category] ?? Info;
  const isUnread = n.status === "unread";
  const [, startTransition] = useTransition();

  function rowClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (!isUnread) return;
    onMarkRead(n.id);
    startTransition(async () => { await markDevNotificationRead(n.id); });
  }

  function markRead() {
    onMarkRead(n.id);
    startTransition(async () => { await markDevNotificationRead(n.id); });
  }
  function archive() {
    onArchive(n.id);
    startTransition(async () => { await archiveDevNotification(n.id); });
  }

  return (
    <li
      role={isUnread ? "button" : undefined}
      tabIndex={isUnread ? 0 : -1}
      onClick={rowClick}
      onKeyDown={(e) => {
        if (!isUnread) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          markRead();
        }
      }}
      className={cn(
        "flex items-start gap-3 px-2 py-3 transition-colors",
        isUnread ? "cursor-pointer hover:bg-[var(--dev-surface-soft)]" : "",
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
          "size-8 rounded-[8px] inline-flex items-center justify-center border shrink-0",
          SEVERITY_PILL[n.severity],
        )}
      >
        <Icon className="size-4" strokeWidth={1.9} />
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
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--dev-text-muted)] whitespace-nowrap">
            {n.severity}
          </span>
          {n.source && (
            <span className="text-[11px] font-mono text-[var(--dev-text-muted)] truncate">
              · {n.source}
            </span>
          )}
          <span className="text-[11px] text-[var(--dev-text-muted)] ml-auto tabular-nums shrink-0">
            {n.whenLabel}
          </span>
        </div>
        <div
          className={cn(
            "text-[13.5px] leading-snug",
            isUnread ? "font-semibold text-[var(--dev-text-primary)]" : "font-medium text-[var(--dev-text-secondary)]",
          )}
        >
          {n.title}
        </div>
        {n.body && (
          <p className="mt-0.5 text-[12.5px] text-[var(--dev-text-muted)] leading-snug">
            {n.body}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {n.actionUrl && n.actionLabel && (
            <Link
              href={n.actionUrl}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
            >
              {n.actionLabel}
              <ArrowRight className="size-3" strokeWidth={2} />
            </Link>
          )}
          {n.traceId && (
            <Link
              href={`/dev/logs?sel=${n.traceId}`}
              className="inline-flex items-center gap-1 text-[12px] text-[var(--dev-text-muted)] hover:text-[var(--dev-text-secondary)] font-mono transition-colors"
            >
              trace {n.traceId.slice(0, 8)}
            </Link>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {isUnread && (
          <button
            type="button"
            onClick={markRead}
            aria-label="Mark as read"
            title="Mark as read"
            className="inline-flex items-center justify-center size-7 rounded-[6px] text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
          >
            <Check className="size-3.5" strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={archive}
          aria-label="Archive notification"
          title="Archive"
          className="inline-flex items-center justify-center size-7 rounded-[6px] text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
        >
          <Archive className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}
