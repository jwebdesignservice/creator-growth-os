"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Megaphone,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
  CalendarDays,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

const MAIN: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Missions", href: "/admin/missions", icon: CheckSquare },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

const SOON: NavItem[] = [
  { label: "Programs", href: "/admin", icon: GraduationCap, comingSoon: true },
  { label: "Posting Plans", href: "/admin", icon: CalendarDays, comingSoon: true },
  { label: "Performance", href: "/admin", icon: BarChart3, comingSoon: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-[252px] shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-ink-900 text-cream-100">
      {/* Brand */}
      <Link
        href="/admin"
        className="flex items-start gap-3 px-6 py-6 hover:opacity-90 transition-opacity"
      >
        <BrandMark size={36} className="text-rose-400" />
        <div className="leading-tight pt-0.5">
          <div className="text-[14px] font-semibold text-white">
            Creator Growth
          </div>
          <div className="text-[10.5px] tracking-[0.16em] uppercase text-rose-300/80">
            Admin Console
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {MAIN.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </ul>

        <div className="mt-6 mb-2 px-3 text-[10px] uppercase tracking-[0.14em] text-cream-100/40 font-semibold">
          Coming Soon
        </div>
        <ul className="space-y-1">
          {SOON.map((item) => (
            <NavLink key={item.label} item={item} active={false} />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12.5px] text-cream-100/70 hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="size-3.5" strokeWidth={2} />
          Exit to creator app
        </Link>
        <div className="mt-3 flex items-center gap-2 px-3 text-[11px] text-cream-100/40">
          <ShieldCheck className="size-3.5 text-rose-300" strokeWidth={2} />
          Admin access verified
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const disabled = !!item.comingSoon;

  const content = (
    <span
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors",
        disabled
          ? "text-cream-100/30 cursor-not-allowed"
          : active
            ? "bg-rose-600 text-white shadow-sm"
            : "text-cream-100/80 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          disabled
            ? "text-cream-100/30"
            : active
              ? "text-white"
              : "text-cream-100/60",
        )}
        strokeWidth={1.8}
      />
      <span className="flex-1">{item.label}</span>
      {item.comingSoon && (
        <span className="text-[9.5px] uppercase tracking-wider text-cream-100/40">
          soon
        </span>
      )}
    </span>
  );

  return (
    <li>
      {disabled ? (
        <div className="cursor-not-allowed">{content}</div>
      ) : (
        <Link href={item.href}>{content}</Link>
      )}
    </li>
  );
}
