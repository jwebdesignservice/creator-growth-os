"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenSquare,
  Send,
  Workflow,
  FileText,
  History,
  Settings,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const EMAIL_NAV: NavItem[] = [
  { label: "Compose", href: "/admin/emails", icon: PenSquare },
  { label: "Campaigns", href: "/admin/emails/campaigns", icon: Send },
  { label: "Automations", href: "/admin/emails/automations", icon: Workflow },
  { label: "Templates", href: "/admin/emails/templates", icon: FileText },
  { label: "History", href: "/admin/emails/history", icon: History },
  { label: "Settings", href: "/admin/emails/settings", icon: Settings },
];

export function EmailNav({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-cream-100">
      {/* Brand strip — keeps a small ghost of the parent app brand */}
      <Link
        href="/admin"
        className="px-6 py-6 hover:opacity-90 transition-opacity"
        title="Admin"
      >
        <span className="font-display text-[18px] text-rose-600 leading-none">
          profluencer
        </span>
      </Link>

      {/* Section label */}
      <div className="px-6 mt-2 mb-3">
        <span className="text-[10.5px] uppercase tracking-[0.18em] text-rose-600 font-semibold">
          Email
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {EMAIL_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-rose-100 text-rose-700"
                      : "text-ink-700 hover:bg-cream-200/70 hover:text-ink-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[17px] shrink-0",
                      active ? "text-rose-600" : "text-ink-500",
                    )}
                    strokeWidth={2}
                  />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin chip */}
      <div className="p-3 border-t border-ink-100">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-cream-200/70 transition-colors"
        >
          <span className="size-9 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[12px] font-bold shrink-0">
            {initials(adminName)}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-ink-900 truncate leading-tight">
              {adminName}
            </span>
            <span className="block text-[11.5px] text-ink-500 truncate">
              {adminEmail}
            </span>
          </span>
          <ChevronDown
            className="size-3.5 text-ink-400 shrink-0"
            strokeWidth={2}
          />
        </Link>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin/emails") return pathname === "/admin/emails";
  return pathname.startsWith(href);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
