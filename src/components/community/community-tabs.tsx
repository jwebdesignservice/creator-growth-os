import Link from "next/link";
import {
  MessageSquare,
  Hash,
  CalendarDays,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type CommunityTab = "feed" | "chat" | "events" | "members";

const TABS: { key: CommunityTab; label: string; icon: LucideIcon }[] = [
  { key: "feed", label: "Feed", icon: MessageSquare },
  { key: "chat", label: "Chat", icon: Hash },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "members", label: "Members", icon: Users },
];

/**
 * Community section tabs — a segmented control. URL-driven
 * (`/community?tab=…`) so each section is shareable + back-button friendly,
 * mirroring the posting / missions pages. Presentational + server-rendered:
 * the active tab is resolved on the page and passed in, so there's no client
 * JS here.
 *
 * The four tabs sit inside one rounded "track"; the active tab is a filled
 * white pill with a soft shadow + rose accent.
 */
export function CommunityTabs({ active }: { active: CommunityTab }) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
      <nav
        aria-label="Community sections"
        className="inline-flex items-center gap-1 rounded-[14px] bg-cream-100 border border-ink-100 p-1"
      >
        {TABS.map((t) => {
          const isActive = t.key === active;
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={t.key === "feed" ? "/community" : `/community?tab=${t.key}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] text-[13.5px] font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-ink-500 hover:text-ink-900",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  isActive ? "text-rose-600" : "text-ink-400",
                )}
                strokeWidth={2}
              />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
