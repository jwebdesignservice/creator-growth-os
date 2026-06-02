"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  Mail,
  Link2,
  Bell,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Matches "exact" so child routes don't activate the index entry. */
  exact?: boolean;
};

/**
 * Inner sub-nav for the user's Settings surface. Mirrors the
 * ProgramNav structure (compact rail + inner panel idiom) so the
 * two feel like the same pattern. Eight items follow the canonical
 * account-settings outline; pages that aren't built out yet render
 * the "Under development" placeholder.
 *
 * Hidden on mobile (the bottom-nav handles cross-section navigation
 * there); on `lg+` it sits flush against the (app) sidebar.
 */
const ITEMS: NavItem[] = [
  { label: "Edit profile",       href: "/settings",                    icon: CircleUser, exact: true },
  { label: "Invites",            href: "/settings/invites",            icon: Mail        },
  { label: "Connected accounts", href: "/settings/connected-accounts", icon: Link2       },
  { label: "Notifications",      href: "/settings/notifications",      icon: Bell        },
  { label: "Payment methods",    href: "/settings/payment-methods",    icon: CreditCard  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-cream-100">
      {/* Heading — matches the "Account settings" block in the canonical
          settings sidebar; bold and prominent so users orient instantly. */}
      <div className="px-6 pt-7 pb-5">
        <h2 className="text-[20px] font-bold text-ink-900 leading-tight">
          Account settings
        </h2>
      </div>

      {/* Nav items — single group; spacing + radius match ProgramNav so
          the rose-active state reads identical across surfaces. */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
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
                      "size-[18px] shrink-0",
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
    </aside>
  );
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}
