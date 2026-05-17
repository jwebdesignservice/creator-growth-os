"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  GraduationCap,
  CheckSquare,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Treated as the elevated center action */
  center?: boolean;
};

const ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Programs",  href: "/programs",  icon: GraduationCap },
  { label: "Tasks",     href: "/missions",  icon: CheckSquare, center: true },
  { label: "Community", href: "/community", icon: Users },
  { label: "Settings",  href: "/settings",  icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-t border-ink-100"
      style={{
        height: "calc(var(--mobile-bottomnav-height) + var(--mobile-safe-bottom))",
        paddingBottom: "var(--mobile-safe-bottom)",
      }}
    >
      <ul className="relative grid grid-cols-5 h-[var(--mobile-bottomnav-height)] items-stretch px-1">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          if (item.center) {
            return (
              <li key={item.href} className="flex items-end justify-center">
                <CenterItem item={item} active={active} />
              </li>
            );
          }
          return (
            <li key={item.href} className="flex">
              <SideItem item={item} active={active} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SideItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex-1 inline-flex flex-col items-center justify-center gap-1 min-h-[44px] rounded-[10px] transition-colors",
        active ? "text-rose-600" : "text-ink-500 hover:text-ink-700",
      )}
    >
      <Icon
        className={cn("size-[22px] shrink-0", active && "text-rose-600")}
        strokeWidth={active ? 2 : 1.8}
      />
      <span className={cn("text-[11px] leading-none font-medium", active && "text-rose-600")}>
        {item.label}
      </span>
    </Link>
  );
}

function CenterItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="inline-flex flex-col items-center gap-1 -translate-y-[var(--mobile-bottomnav-lift)]"
    >
      <span
        className={cn(
          "inline-flex items-center justify-center size-[52px] rounded-full text-white shadow-card transition-colors ring-4 ring-white",
          active ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600",
        )}
      >
        <Icon className="size-[22px]" strokeWidth={2} />
      </span>
      <span
        className={cn(
          "text-[11px] leading-none font-medium",
          active ? "text-rose-600" : "text-ink-500",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}
