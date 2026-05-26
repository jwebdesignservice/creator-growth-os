"use client";

import { useState } from "react";
import Link from "next/link";
import { Hash, Megaphone, Trophy, Menu, X, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChatChannel } from "@/lib/community/chat/types";

type Props = {
  channels: ChatChannel[];
  currentSlug: string;
  isAdmin: boolean;
};

/**
 * Render an icon for a channel. Uses the channel.icon emoji if present,
 * otherwise falls back to a lucide icon based on slug.
 */
function ChannelIcon({ channel }: { channel: ChatChannel }) {
  if (channel.icon) {
    return <span className="text-[15px] leading-none">{channel.icon}</span>;
  }
  if (channel.slug === "announcements") {
    return <Megaphone className="size-4" strokeWidth={2} />;
  }
  if (channel.slug === "wins") {
    return <Trophy className="size-4" strokeWidth={2} />;
  }
  return <Hash className="size-4" strokeWidth={2} />;
}

export function ChannelList({ channels, currentSlug, isAdmin }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button — floats inside the chat layout */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-3 bottom-20 z-30 size-11 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Open channels"
      >
        <Menu className="size-5" strokeWidth={2} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink-900/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          // Desktop: inline sidebar
          "shrink-0 w-[240px] bg-white rounded-[20px] border border-ink-100 overflow-hidden",
          // Mobile: drawer
          "lg:flex flex-col",
          mobileOpen
            ? "fixed left-3 top-3 bottom-3 z-50 flex w-[260px] shadow-xl"
            : "hidden",
        )}
      >
        <header className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-ink-100">
          <h2 className="font-display text-[16px] text-ink-900">Channels</h2>
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden size-7 rounded-[8px] flex items-center justify-center text-ink-400 hover:bg-cream-100"
            aria-label="Close channels"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5">
            {channels.map((c) => {
              const active = c.slug === currentSlug;
              return (
                <li key={c.id}>
                  <Link
                    href={`/community/chat/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 mx-2 rounded-[10px] text-[13.5px] font-medium transition-colors group",
                      active
                        ? "bg-rose-50 text-rose-700"
                        : "text-ink-700 hover:bg-cream-100",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 flex items-center justify-center",
                        active ? "text-rose-600" : "text-ink-400",
                      )}
                    >
                      <ChannelIcon channel={c} />
                    </span>
                    <span className="flex-1 truncate">{c.name}</span>
                    {c.posts_admin_only && (
                      <span title="Admins only can post" className="shrink-0">
                        <Lock
                          className={cn(
                            "size-3",
                            active ? "text-rose-400" : "text-ink-300",
                          )}
                          strokeWidth={2}
                        />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {isAdmin && (
          <footer className="shrink-0 border-t border-ink-100 p-3">
            <p className="text-[11.5px] text-ink-400 leading-snug">
              Admin: channel management coming soon. For now, seed via SQL.
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}
