/* Menus ──────────────────────────────────────────────────────────────────
   Header dropdowns — the profile / account menu and the notifications
   panel. Mirrors src/components/app-shell/{profile-menu,notifications-
   dropdown}.tsx (shown open). Presentational.
   ───────────────────────────────────────────────────────────────────── */

import {
  ChevronDown,
  Settings,
  CreditCard,
  LifeBuoy,
  LogOut,
  Bell,
  CircleCheck,
  UserPlus,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export function ProfileMenu() {
  const links: { Icon: LucideIcon; label: string }[] = [
    { Icon: Settings, label: "Settings" },
    { Icon: CreditCard, label: "Billing" },
    { Icon: LifeBuoy, label: "Help & Support" },
  ];
  return (
    <div className="relative w-[260px]">
      <button type="button" className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-cream-200 w-full">
        <span className="size-8 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold inline-flex items-center justify-center shrink-0">JW</span>
        <div className="text-left leading-tight flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900">Jack Wilson</div>
          <div className="text-[11px] text-ink-500 flex items-center gap-1">
            <span className="inline-block size-[5px] rounded-full bg-rose-500" />
            Pro Plan
          </div>
        </div>
        <ChevronDown className="size-4 text-ink-500 rotate-180" strokeWidth={2} />
      </button>
      <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-[240px] rounded-[14px] bg-white border border-ink-100 shadow-card z-10 py-2">
        <div className="px-4 py-2 border-b border-ink-100 mb-1">
          <div className="text-[13.5px] font-semibold text-ink-900">Jack Wilson</div>
          <div className="text-[11px] text-ink-500">Pro Plan</div>
        </div>
        {links.map((l) => {
          const Icon = l.Icon;
          return (
            <span key={l.label} className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-ink-700 hover:bg-cream-100 transition-colors">
              <span className="text-ink-500">
                <Icon className="size-4" strokeWidth={1.8} />
              </span>
              {l.label}
            </span>
          );
        })}
        <div className="my-1 h-px bg-ink-100" />
        <span className="flex items-center gap-2.5 w-full px-4 py-2 text-[13.5px] text-rose-600 hover:bg-rose-50 transition-colors">
          <LogOut className="size-4" strokeWidth={1.8} />
          Sign out
        </span>
      </div>
    </div>
  );
}

export function NotificationsDropdown() {
  const items: { Icon: LucideIcon; tone: string; text: string; time: string; unread?: boolean }[] = [
    { Icon: UserPlus, tone: "bg-rose-100 text-rose-600", text: "Amelia Park joined your program", time: "2m", unread: true },
    { Icon: CircleCheck, tone: "bg-success-bg text-success", text: "Your media kit was published", time: "1h", unread: true },
    { Icon: MessageCircle, tone: "bg-cream-200 text-ink-500", text: "New reply in #wins", time: "3h" },
  ];
  return (
    <div className="w-[320px] rounded-[14px] bg-white border border-ink-100 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 h-12 border-b border-ink-100">
        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-900">
          <Bell className="size-4 text-rose-600" strokeWidth={2} />
          Notifications
        </span>
        <span className="text-[11.5px] font-medium text-rose-600">Mark all read</span>
      </div>
      <div className="py-1">
        {items.map((it, i) => {
          const Icon = it.Icon;
          return (
            <div key={i} className={"flex items-start gap-3 px-4 py-2.5 " + (it.unread ? "bg-rose-50/40" : "")}>
              <span className={"size-8 rounded-full inline-flex items-center justify-center shrink-0 " + it.tone}>
                <Icon className="size-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-ink-700 leading-snug">{it.text}</p>
                <span className="text-[11px] text-ink-400">{it.time} ago</span>
              </div>
              {it.unread && <span className="size-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />}
            </div>
          );
        })}
      </div>
      <div className="px-4 h-10 border-t border-ink-100 flex items-center justify-center">
        <span className="text-[12px] font-medium text-rose-600">View all</span>
      </div>
    </div>
  );
}
