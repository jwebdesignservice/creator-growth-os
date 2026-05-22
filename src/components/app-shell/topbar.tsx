"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Headset, CalendarDays } from "lucide-react";
import { ProfileMenu } from "./profile-menu";
import { NotifDropdown } from "./notifications-dropdown";
import { MobileDrawer } from "./mobile-drawer";
import { Avatar } from "./avatar";
import { CommandPalette, openCommandPalette } from "./command-palette";
import { BrandMark } from "@/components/brand-mark";

export { Avatar } from "./avatar";

type Props = {
  user: {
    id?: string;
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
  // Show ⌘ on Mac, Ctrl on everything else, in the inline keyboard hint.
  // Deferred via setTimeout(0) so the setState lives outside the synchronous
  // effect body (React 19 / set-state-in-effect lint rule).
  const [modKey, setModKey] = useState<"⌘" | "Ctrl">("⌘");
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const t = window.setTimeout(() => setModKey(isMac ? "⌘" : "Ctrl"), 0);
    return () => window.clearTimeout(t);
  }, []);

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
          <span className="text-[16px] font-semibold tracking-tight text-ink-900 leading-none truncate">
            profluencer
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <NotifDropdown initialUnreadCount={unreadNotificationCount} userId={user.id} />
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
      <div className="hidden lg:flex items-center gap-4 min-h-[var(--topbar-height)] py-4 px-6 lg:px-8">
        {/* Search trigger — opens the global command palette.
            Renders as an input-shaped button so it visually matches the
            previous search field, but it's a real <button> so keyboard +
            screen reader users get the right semantics. */}
        <div className="flex-1 max-w-[520px]">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open search"
            aria-haspopup="dialog"
            className="group relative w-full h-11 pl-11 pr-3 rounded-[14px] bg-white border border-ink-100 text-left text-[13.5px] text-ink-400 hover:border-ink-200 hover:bg-white focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors flex items-center"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 size-[16px] text-ink-400 group-hover:text-ink-500 transition-colors"
              strokeWidth={2}
              aria-hidden
            />
            <span className="flex-1 truncate">Search programs, tutorials, pages…</span>
            <span
              aria-hidden
              className="ml-2 inline-flex items-center gap-1 shrink-0"
            >
              <kbd className="inline-flex items-center justify-center h-[22px] min-w-[22px] px-1.5 rounded-[6px] bg-cream-100 border border-ink-200 text-[10.5px] font-semibold text-ink-700">
                {modKey}
              </kbd>
              <kbd className="inline-flex items-center justify-center h-[22px] min-w-[22px] px-1.5 rounded-[6px] bg-cream-100 border border-ink-200 text-[10.5px] font-semibold text-ink-700">
                K
              </kbd>
            </span>
          </button>
        </div>

        <div className="flex-1" />

        {/* Icon actions */}
        <div className="flex items-center gap-2">
          <NotifDropdown initialUnreadCount={unreadNotificationCount} userId={user.id} />
          <Link
            href="/support"
            aria-label="Support"
            className="relative inline-flex items-center justify-center size-10 rounded-full bg-white border border-ink-100 hover:bg-cream-200 transition-colors"
          >
            <Headset className="size-[18px] text-ink-700" strokeWidth={1.8} />
          </Link>
          <Link
            href="/posting"
            aria-label="Calendar"
            className="relative inline-flex items-center justify-center size-10 rounded-full bg-white border border-ink-100 hover:bg-cream-200 transition-colors"
          >
            <CalendarDays className="size-[18px] text-ink-700" strokeWidth={1.8} />
          </Link>
        </div>

        {/* Profile chip with dropdown */}
        <ProfileMenu user={user} />
      </div>

      {/* Global command palette — singleton, opened from desktop search,
          mobile search, or the ⌘K / Ctrl+K shortcut anywhere in the app. */}
      <CommandPalette />
    </header>
  );
}

