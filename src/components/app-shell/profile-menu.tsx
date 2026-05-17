"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import { Avatar } from "./avatar";
import { signOut } from "@/app/(auth)/actions";
import { cn } from "@/lib/cn";

type Props = {
  user: {
    name: string;
    avatar_url?: string | null;
    plan?: string;
  };
};

export function ProfileMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click and ESC
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full transition-colors",
          open ? "bg-cream-200" : "hover:bg-cream-200",
        )}
      >
        <Avatar name={user.name} src={user.avatar_url ?? undefined} size={32} />
        <div className="text-left leading-tight">
          <div className="text-[13.5px] font-semibold text-ink-900">
            {user.name}
          </div>
          {user.plan && (
            <div className="text-[11px] text-ink-500 capitalize flex items-center gap-1">
              <span className="inline-block size-[5px] rounded-full bg-rose-500" />
              {user.plan} Plan
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-ink-500 transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-[240px] rounded-[14px] bg-white border border-ink-100 shadow-card z-50 py-2"
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-ink-100 mb-1">
            <div className="text-[13.5px] font-semibold text-ink-900 truncate">
              {user.name}
            </div>
            {user.plan && (
              <div className="text-[11px] text-ink-500 capitalize">
                {user.plan} Plan
              </div>
            )}
          </div>

          {/* Links */}
          <MenuLink
            href="/settings"
            icon={<Settings className="size-4" strokeWidth={1.8} />}
            label="Settings"
            onClick={() => setOpen(false)}
          />
          <MenuLink
            href="/billing"
            icon={<CreditCard className="size-4" strokeWidth={1.8} />}
            label="Billing"
            onClick={() => setOpen(false)}
          />

          <div className="my-1 h-px bg-ink-100" />

          {/* Sign out — server action */}
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex items-center gap-2.5 w-full px-4 py-2 text-[13.5px] text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="size-4" strokeWidth={1.8} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-ink-700 hover:bg-cream-100 transition-colors"
    >
      <span className="text-ink-500">{icon}</span>
      {label}
    </Link>
  );
}
