/* Notification center ───────────────────────────────────────────────────
   The full-page notifications inbox (distinct from the compact topbar
   dropdown): filter tabs, a mark-all-read header, and grouped rows with a
   category-coloured left border, unread dot, category chip and timestamp.
   Pure presentational mirror of src/app/(app)/notifications/*.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";

type Category = "task" | "program" | "community" | "event" | "system";

const CHIP: Record<Category, string> = {
  task: "bg-rose-100 text-rose-700",
  program: "bg-violet-100 text-violet-700",
  community: "bg-indigo-100 text-indigo-700",
  event: "bg-amber-100 text-amber-700",
  system: "bg-teal-100 text-teal-700",
};
const BORDER: Record<Category, string> = {
  task: "border-l-rose-500",
  program: "border-l-violet-500",
  community: "border-l-indigo-400",
  event: "border-l-amber-500",
  system: "border-l-teal-500",
};
const LABEL: Record<Category, string> = {
  task: "Task",
  program: "Program",
  community: "Community",
  event: "Event",
  system: "System",
};

type Notif = {
  id: number;
  category: Category;
  title: string;
  time: string;
  unread: boolean;
};

const ITEMS: Notif[] = [
  { id: 1, category: "task", title: "New task assigned: Record and edit your video", time: "2m ago", unread: true },
  { id: 2, category: "program", title: "You unlocked Module 3 of The Influencer Blueprint", time: "1h ago", unread: true },
  { id: 3, category: "event", title: "Live Q&A starts in 30 minutes", time: "3h ago", unread: false },
  { id: 4, category: "community", title: "Sophie replied to your discussion", time: "Yesterday", unread: false },
  { id: 5, category: "system", title: "Your weekly performance report is ready", time: "2 days ago", unread: false },
];

const TABS = ["All", "Unread", "Tasks", "Programs"] as const;

export function NotificationCenterPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const items = ITEMS.filter((n) => {
    if (tab === "Unread") return n.unread;
    if (tab === "Tasks") return n.category === "task";
    if (tab === "Programs") return n.category === "program";
    return true;
  });

  return (
    <div className="card overflow-hidden w-[560px] max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <h3 className="text-h4 text-ink-900">Notifications</h3>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-100 text-[11px] font-bold text-rose-700 tabular-nums">
            2
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600">
          <CheckCheck className="size-3.5" strokeWidth={2.2} /> Mark all read
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-8 px-3 rounded-full text-[12.5px] font-semibold transition-colors",
              tab === t ? "bg-rose-600 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <ul className="divide-y divide-ink-50 max-h-[360px] overflow-y-auto">
        {items.length === 0 ? (
          <li className="py-12 text-center text-[13px] text-ink-400">All caught up — nothing here.</li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex items-center gap-3 pl-3 pr-4 py-3.5 border-l-2 transition-colors hover:bg-cream-50 cursor-pointer",
                n.unread ? BORDER[n.category] : "border-l-transparent",
                n.unread ? "bg-white" : "bg-cream-50/30",
              )}
            >
              <span className={cn("size-2 rounded-full shrink-0", n.unread ? "bg-rose-500" : "bg-transparent")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className={cn("text-[10.5px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full", CHIP[n.category])}>
                    {LABEL[n.category]}
                  </span>
                  <span className="text-[11px] text-ink-400 ml-auto shrink-0">{n.time}</span>
                </div>
                <div className={cn("text-[13px] leading-snug", n.unread ? "font-semibold text-ink-900" : "font-medium text-ink-500")}>
                  {n.title}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
