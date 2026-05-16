"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Bell dropdown — compact notification panel anchored to the topbar bell icon.
//
// Architecture:
//   • initialUnreadCount comes from the server (SSR, no flash on first paint).
//   • When the dropdown opens the first time, it calls getDropdownNotifications()
//     (a server action) to fetch the real top-5 items.
//   • Mark-all-read calls markAllNotificationsRead() and resets local state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  getDropdownNotifications,
  markAllNotificationsRead,
} from "@/app/(app)/notifications/actions";
import type { NotificationCategory, NotificationType } from "@/lib/notifications/types";

// ─────────────────────────────────────────────────────────────────────────────
// Visual config — mirrors CATEGORY_CONFIG in notifications-panel.tsx
// ─────────────────────────────────────────────────────────────────────────────

const CHIP: Record<NotificationCategory, string> = {
  task:      "bg-rose-100   text-rose-700",
  program:   "bg-violet-100 text-violet-700",
  community: "bg-indigo-100 text-indigo-700",
  event:     "bg-amber-100  text-amber-700",
  system:    "bg-teal-100   text-teal-700",
};

const BORDER: Record<NotificationCategory, string> = {
  task:      "border-l-rose-500",
  program:   "border-l-violet-500",
  community: "border-l-indigo-400",
  event:     "border-l-amber-500",
  system:    "border-l-teal-500",
};

const LABEL: Record<NotificationCategory, string> = {
  task:      "Task",
  program:   "Program",
  community: "Community",
  event:     "Event",
  system:    "System",
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DropdownItem = {
  id:         string;
  title:      string;
  category:   NotificationCategory;
  type:       NotificationType;
  status:     string;
  created_at: string;
  action_url: string | null;
  live:       boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function NotifDropdown({ initialUnreadCount = 0 }: { initialUnreadCount?: number }) {
  const [open, setOpen]           = useState(false);
  const [unreadCount, setUnread]  = useState(initialUnreadCount);
  const [items, setItems]         = useState<DropdownItem[] | null>(null); // null = not yet loaded
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Keep badge in sync if the server re-renders with a new count (e.g. after
  // navigation). Adjusted during render rather than via useEffect to avoid the
  // cascading re-render and the react-hooks/set-state-in-effect lint rule.
  const [prevInitial, setPrevInitial] = useState(initialUnreadCount);
  if (initialUnreadCount !== prevInitial) {
    setPrevInitial(initialUnreadCount);
    setUnread(initialUnreadCount);
  }

  // Close on click-outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    const next = !open;
    setOpen(next);
    // Fetch items the first time the dropdown opens
    if (next && items === null) {
      startTransition(async () => {
        const data = await getDropdownNotifications();
        setItems(data as DropdownItem[]);
      });
    }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setUnread(0);
      setItems((prev) =>
        prev ? prev.map((n) => ({ ...n, status: "read" })) : prev,
      );
    });
  }

  const allRead = unreadCount === 0;

  return (
    <div ref={ref} className="relative">
      {/* ── Bell trigger ──────────────────────────────────────────────────── */}
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={handleOpen}
        className={cn(
          "relative inline-flex items-center justify-center size-10 rounded-full bg-white border border-ink-100 hover:bg-cream-200 transition-colors",
          open && "bg-cream-200 border-rose-200",
        )}
      >
        <Bell className="size-[18px] text-ink-700" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-600 ring-2 ring-cream-100" />
        )}
        <span className="sr-only">{unreadCount} notifications</span>
      </button>

      {/* ── Dropdown panel ────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[380px] bg-white rounded-[16px] border border-ink-100 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-ink-100">
            <div className="flex items-center gap-2">
              <span className="font-display text-[15px] text-ink-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-100 text-[11px] font-bold text-rose-700">
                  {unreadCount}
                </span>
              )}
            </div>
            {!allRead ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-[12px] font-medium text-rose-600 hover:text-rose-700 transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            ) : (
              <span className="text-[12px] text-ink-400">All caught up</span>
            )}
          </div>

          {/* Body — loading / empty / list */}
          <div className="divide-y divide-ink-50 max-h-[360px] overflow-y-auto">
            {items === null ? (
              /* Loading skeleton */
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 text-ink-300 animate-spin" strokeWidth={2} />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <Bell className="size-8 text-ink-200 mb-2" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-ink-500">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => {
                const isRead = allRead || n.status !== "unread";
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-center gap-3 pl-3 pr-4 py-3 border-l-2 transition-colors hover:bg-cream-50 cursor-pointer",
                      !isRead ? BORDER[n.category] : "border-l-transparent",
                      isRead  ? "bg-cream-50/30" : "bg-white",
                    )}
                  >
                    {/* Unread dot */}
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        !isRead ? "bg-rose-500" : "bg-transparent",
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        {n.live && !isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                            <span className="size-1.5 rounded-full bg-white animate-pulse" />
                            Live
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[10.5px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full",
                            CHIP[n.category],
                          )}
                        >
                          {LABEL[n.category]}
                        </span>
                        <span className="text-[11px] text-ink-400 ml-auto shrink-0">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "text-[13px] leading-snug truncate",
                          !isRead ? "font-semibold text-ink-900" : "font-medium text-ink-500",
                        )}
                      >
                        {n.title}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-ink-100 bg-cream-50">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now  = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date >= todayStart) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
