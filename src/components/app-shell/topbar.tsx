"use client";

import Link from "next/link";
import { Search, Mail, CalendarDays } from "lucide-react";
import { ProfileMenu } from "./profile-menu";
import { NotifDropdown } from "./notifications-dropdown";
import { MobileDrawer } from "./mobile-drawer";
import { Avatar } from "./avatar";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

export { Avatar } from "./avatar";

type Props = {
  user: {
    name: string;
    avatar_url?: string | null;
    plan?: string;
  };
  unreadNotificationCount?: number;
  plan?: "free" | "basic" | "pro";
  isAdmin?: boolean;
  isDev?: boolean;
};

export function Topbar({
  user,
  unreadNotificationCount = 0,
  plan = "free",
  isAdmin = false,
  isDev = false,
}: Props) {
  return (
    <header className="sticky top-0 z-30 bg-cream-100/85 backdrop-blur supports-[backdrop-filter]:bg-cream-100/70 border-b border-ink-100">
      {/* ── Mobile bar (< lg) ────────────────────────────────────────────── */}
      <div
        className="lg:hidden flex items-center gap-2"
        style={{
          height: "var(--mobile-topbar-height)",
          paddingInline: "var(--mobile-content-x)",
        }}
      >
        <MobileDrawer plan={plan} isAdmin={isAdmin} isDev={isDev} />

        <Link
          href="/dashboard"
          className="flex items-center gap-2 min-w-0 flex-1 -ml-0.5"
        >
          <BrandMark size={28} />
          <span className="text-[15px] font-semibold text-ink-900 leading-none truncate">
            Creator Growth OS
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <NotifDropdown initialUnreadCount={unreadNotificationCount} />
          <Link
            href="/settings"
            aria-label="Account settings"
            className="inline-flex items-center justify-center p-1 rounded-full hover:bg-cream-200 active:bg-cream-300 transition-colors"
          >
            <Avatar
              name={user.name}
              src={user.avatar_url ?? undefined}
              size={36}
            />
          </Link>
        </div>
      </div>

      {/* ── Desktop bar (lg+) ────────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center gap-4 h-[var(--topbar-height)] px-6 lg:px-8">
        {/* Search */}
        <div className="flex-1 max-w-[520px]">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 size-[16px] text-ink-400"
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Search programs, tutorials, topics..."
              className="w-full h-11 pl-11 pr-4 rounded-[14px] bg-white border border-ink-100 placeholder:text-ink-400 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Icon actions */}
        <div className="flex items-center gap-2">
          <NotifDropdown initialUnreadCount={unreadNotificationCount} />
          <IconButton aria-label="Messages">
            <Mail className="size-[18px] text-ink-700" strokeWidth={1.8} />
          </IconButton>
          <IconButton aria-label="Calendar">
            <CalendarDays className="size-[18px] text-ink-700" strokeWidth={1.8} />
          </IconButton>
        </div>

        {/* Profile chip with dropdown */}
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}

function IconButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex items-center justify-center size-10 rounded-full bg-white border border-ink-100 hover:bg-cream-200 transition-colors",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
