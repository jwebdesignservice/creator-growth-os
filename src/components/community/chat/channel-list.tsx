"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hash, Megaphone, Trophy, Menu, X, Lock, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { createChannel } from "@/lib/community/chat/actions";
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

function CreateChannelForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [adminOnly, setAdminOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createChannel({
        name,
        icon: icon || undefined,
        postsAdminOnly: adminOnly,
      });
      if (!res.ok) {
        setError(res.error ?? "Could not create channel.");
        return;
      }
      setName("");
      setIcon("");
      setAdminOnly(false);
      setOpen(false);
      onCreated();
      router.refresh();
    });
  }

  if (!open) {
    return (
      <footer className="shrink-0 border-t border-ink-100 p-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12.5px] font-medium transition-colors"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          New channel
        </button>
      </footer>
    );
  }

  return (
    <footer className="shrink-0 border-t border-ink-100 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-ink-700">New channel</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="size-6 rounded-[6px] text-ink-400 hover:bg-cream-100 flex items-center justify-center"
          aria-label="Cancel"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Channel name"
        maxLength={80}
        className="w-full h-8 px-2 rounded-[8px] border border-ink-200 text-[12.5px] focus:outline-none focus:border-rose-300"
      />
      <input
        type="text"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        placeholder="Emoji (optional)"
        maxLength={4}
        className="w-full h-8 px-2 rounded-[8px] border border-ink-200 text-[12.5px] focus:outline-none focus:border-rose-300"
      />
      <label className="flex items-center gap-2 text-[12px] text-ink-700 cursor-pointer">
        <input
          type="checkbox"
          checked={adminOnly}
          onChange={(e) => setAdminOnly(e.target.checked)}
          className="size-3.5"
        />
        Admins only can post
      </label>
      {error && <p className="text-[11.5px] text-rose-600">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending || !name.trim()}
        className="w-full h-8 rounded-[8px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[12px] font-medium transition-colors"
      >
        {pending ? "Creating…" : "Create"}
      </button>
    </footer>
  );
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
          // Desktop: inline sidebar — sticky just below the topbar so it
          // always stays in view even if anything causes the body to scroll.
          // h-fit + self-start keeps the panel sized to its content (no
          // empty white space below the channels), and max-h caps it to the
          // visible area in case the channel list ever grows long.
          "shrink-0 w-[240px] bg-white rounded-[20px] border border-ink-100 overflow-hidden lg:sticky lg:top-[calc(var(--topbar-height)+1rem)] lg:self-start lg:max-h-[calc(100dvh-var(--topbar-height)-2rem)]",
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

        <nav className="py-2">
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

        {isAdmin && <CreateChannelForm onCreated={() => setMobileOpen(false)} />}
      </aside>
    </>
  );
}
