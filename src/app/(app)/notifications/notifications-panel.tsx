"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Notifications page — client panel
// Receives real data from the server component (page.tsx) as props.
// All mutations go through server actions (actions.ts).
// Zero hardcoded notification data in this file.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useTransition } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { Avatar } from "@/components/app-shell/topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "./actions";
import type {
  NotificationWithGroup,
  NotificationFilter,
  NotificationGroup,
  NotificationCategory,
  NotificationType,
} from "@/lib/notifications/types";
import {
  Bell,
  CheckSquare,
  CalendarDays,
  PlayCircle,
  Trophy,
  Flame,
  Crown,
  Radio,
  SlidersHorizontal,
  CheckCircle2,
  MessageCircle,
  Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Visual config — single source of truth for category colours
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { border: string; chip: string; label: string }
> = {
  task:      { border: "border-l-rose-500",   chip: "bg-rose-100 text-rose-700",   label: "Task"      },
  program:   { border: "border-l-violet-500", chip: "bg-violet-100 text-violet-700", label: "Program" },
  community: { border: "border-l-indigo-400", chip: "bg-indigo-100 text-indigo-700", label: "Community" },
  event:     { border: "border-l-amber-500",  chip: "bg-amber-100 text-amber-700",  label: "Event"    },
  system:    { border: "border-l-teal-500",   chip: "bg-teal-100 text-teal-700",    label: "System"   },
};

// Map DB notification_type → icon slot
type NotifIconSlot = "task" | "plan" | "tutorial" | "milestone" | "community" | "live" | "streak" | "pro" | "message" | "system";

function getIconSlot(type: NotificationType): NotifIconSlot {
  switch (type) {
    case "task_assigned":
    case "task_due":
    case "task_completed":        return "task";
    case "posting_plan_updated":
    case "post_reminder":         return "plan";
    case "tutorial_unlocked":
    case "program_available":     return "tutorial";
    case "milestone_reached":     return "milestone";
    case "community_reply":       return "community";
    case "coach_message":         return "message";
    case "live_event":            return "live";
    case "upgrade_recommendation":return "pro";
    case "billing_update":
    case "announcement":          return "system";
    default:                      return "task";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export — receives server-fetched props
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  notifications: NotificationWithGroup[];
  firstName?:    string;
}

export function NotificationsPageClient({ notifications, firstName }: Props) {
  return (
    <PageShell>
      <div className="w-full max-w-[1180px]">
        <NotificationsMain initialItems={notifications} firstName={firstName} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main notification list
// ─────────────────────────────────────────────────────────────────────────────

function NotificationsMain({
  initialItems,
  firstName,
}: {
  initialItems: NotificationWithGroup[];
  firstName?: string;
}) {
  const [items, setItems]               = useState(initialItems);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [, startTransition]             = useTransition();

  const unreadCount = items.filter((n) => n.status === "unread").length;

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, status: "read" as const })));
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => n.id === id ? { ...n, status: "read" as const } : n),
      );
    });
  }

  const filtered = items.filter((n) => {
    if (activeFilter === "all")    return true;
    if (activeFilter === "unread") return n.status === "unread";
    return n.category === activeFilter;
  });

  const GROUPS: { label: string; key: NotificationGroup }[] = [
    { label: "Today",              key: "today"   },
    { label: "Earlier This Week",  key: "week"    },
    { label: "Earlier",            key: "earlier" },
  ];

  const FILTERS: { key: NotificationFilter; label: string; badge?: number }[] = [
    { key: "all",       label: "All",       badge: unreadCount || undefined },
    { key: "unread",    label: "Unread",    badge: unreadCount || undefined },
    { key: "task",      label: "Tasks",     badge: items.filter((n) => n.category === "task"      && n.status === "unread").length || undefined },
    { key: "program",   label: "Programs"  },
    { key: "community", label: "Community", badge: items.filter((n) => n.category === "community" && n.status === "unread").length || undefined },
    { key: "event",     label: "Events"    },
    { key: "system",    label: "System"    },
  ];

  const allCaughtUp = activeFilter === "all" && unreadCount === 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        {firstName && (
          <div className="text-rose-600 font-medium text-[13.5px] flex items-center gap-2 mb-2">
            Welcome back, {firstName}! <span aria-hidden>👋</span>
          </div>
        )}
        <h1 className="text-page-title text-ink-900">Notifications</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Stay updated with tasks, lessons, community, events and important updates.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium transition-colors",
                activeFilter === f.key
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white border border-ink-100 text-ink-700 hover:bg-cream-100",
              )}
            >
              {f.label}
              {f.badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold",
                    activeFilter === f.key ? "bg-white/25 text-white" : "bg-rose-100 text-rose-700",
                  )}
                >
                  {f.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[13px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
          <button
            type="button"
            className="size-10 rounded-[10px] bg-white border border-ink-100 hover:bg-cream-100 flex items-center justify-center transition-colors"
            aria-label="Filter options"
          >
            <SlidersHorizontal className="size-4 text-ink-500" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* All-caught-up state */}
      {allCaughtUp && (
        <div className="card p-12 sm:p-14 flex flex-col items-center text-center mb-6">
          <div className="size-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <Check className="size-6 text-emerald-600" strokeWidth={2.5} />
          </div>
          <div className="text-[15px] font-semibold text-ink-800">You&apos;re all caught up!</div>
          <div className="text-[13px] text-ink-500 mt-1 max-w-xs">
            No unread notifications. We&apos;ll let you know when something needs your attention.
          </div>
        </div>
      )}

      {/* Grouped list */}
      {!allCaughtUp && (
        <div className="space-y-6">
          {GROUPS.map(({ label, key }) => {
            const groupItems = filtered
              .filter((n) => n.group === key)
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              );
            if (groupItems.length === 0) return null;
            return (
              <div key={key}>
                <div className="text-[11px] font-bold text-ink-400 uppercase tracking-widest mb-3">
                  {label}
                </div>
                <div className="card overflow-hidden divide-y divide-ink-100">
                  {groupItems.map((n) => (
                    <NotifRow key={n.id} notification={n} onRead={handleMarkRead} />
                  ))}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="card p-12 sm:p-14 flex flex-col items-center text-center">
              <div className="size-12 rounded-full bg-cream-200 flex items-center justify-center mb-3">
                <Bell className="size-5 text-ink-400" strokeWidth={1.5} />
              </div>
              <div className="text-[14px] font-semibold text-ink-700">No notifications here</div>
              <div className="text-[13px] text-ink-500 mt-1">Nothing in this category yet.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification row
// ─────────────────────────────────────────────────────────────────────────────

function NotifRow({
  notification: n,
  onRead,
}: {
  notification: NotificationWithGroup;
  onRead: (id: string) => void;
}) {
  const cat     = CATEGORY_CONFIG[n.category];
  const isUnread = n.status === "unread";
  const isLive   = n.type === "live_event" && isUnread;
  const iconSlot = getIconSlot(n.type);
  const avatarName =
    (n.metadata?.author_name as string | undefined) ??
    (n.metadata?.from_name   as string | undefined);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-4 border-l-[3px] transition-colors",
        isUnread ? cat.border : "border-l-transparent",
        isUnread ? "bg-white hover:bg-cream-50" : "bg-cream-50/40 hover:bg-cream-50",
      )}
      onClick={() => { if (isUnread) onRead(n.id); }}
    >
      {/* Unread indicator */}
      <div className="shrink-0 flex items-center justify-center w-2.5 mt-2.5">
        <span className={cn("size-2 rounded-full", isUnread ? "bg-rose-500" : "bg-transparent")} />
      </div>

      {/* Icon */}
      <div className="shrink-0">
        <NotifIconBubble slot={iconSlot} avatarName={avatarName} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
              <span className="size-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
          <span className={cn("text-[10.5px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full", cat.chip)}>
            {cat.label}
          </span>
        </div>
        <div className={cn("text-[13.5px] leading-snug mb-0.5", isUnread ? "font-semibold text-ink-900" : "font-medium text-ink-500")}>
          {n.title}
        </div>
        {n.body && (
          <div className="text-[12.5px] text-ink-500 leading-snug">{n.body}</div>
        )}
      </div>

      {/* CTA + timestamp */}
      <div className="shrink-0 flex flex-col items-end gap-2 min-w-[130px]">
        {n.action_url && n.action_label && (
          <Link href={n.action_url}>
            <Button
              size="sm"
              variant={n.category === "event" || n.type === "upgrade_recommendation" ? "primary" : "outline"}
              className="text-[12.5px] h-8 px-3"
            >
              {n.action_label}
            </Button>
          </Link>
        )}
        <span className="text-[11.5px] text-ink-400 tabular-nums">
          {formatRelativeTime(n.created_at)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon bubble
// ─────────────────────────────────────────────────────────────────────────────

function NotifIconBubble({ slot, avatarName }: { slot: NotifIconSlot; avatarName?: string }) {
  if (slot === "community") {
    return (
      <div className="relative">
        <Avatar name={avatarName ?? "User"} size={40} />
        <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
          <CheckCircle2 className="size-2.5 text-indigo-600" strokeWidth={2.5} />
        </span>
      </div>
    );
  }
  if (slot === "message") {
    return (
      <div className="relative">
        <Avatar name={avatarName ?? "User"} size={40} />
        <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center">
          <MessageCircle className="size-2.5 text-violet-600" strokeWidth={2.5} />
        </span>
      </div>
    );
  }

  const BUBBLE: Record<
    Exclude<NotifIconSlot, "community" | "message">,
    { icon: React.ReactNode; bg: string }
  > = {
    task:      { icon: <CheckSquare className="size-4 text-rose-600"   strokeWidth={2}   />, bg: "bg-rose-100"  },
    plan:      { icon: <CalendarDays className="size-4 text-rose-600"  strokeWidth={2}   />, bg: "bg-rose-100"  },
    tutorial:  { icon: <PlayCircle   className="size-4 text-violet-600" strokeWidth={1.8} />, bg: "bg-violet-100" },
    milestone: { icon: <Trophy       className="size-4 text-gold-500"  strokeWidth={1.8} />, bg: "bg-amber-50"  },
    live:      { icon: <Radio        className="size-4 text-amber-600" strokeWidth={2}   />, bg: "bg-amber-100" },
    streak:    { icon: <Flame        className="size-4 text-amber-500" strokeWidth={1.5} fill="currentColor" />, bg: "bg-amber-50" },
    pro:       { icon: <Crown        className="size-4 text-gold-500"  strokeWidth={1.5} />, bg: "bg-amber-50"  },
    system:    { icon: <Bell         className="size-4 text-teal-600"  strokeWidth={1.8} />, bg: "bg-teal-100"  },
  };

  const config = BUBBLE[slot as keyof typeof BUBBLE];
  if (!config) return null;

  return (
    <div className={cn("size-10 rounded-full flex items-center justify-center", config.bg)}>
      {config.icon}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const date       = new Date(iso);
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date >= todayStart) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
