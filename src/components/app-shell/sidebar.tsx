"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  GraduationCap,
  PlayCircle,
  CalendarDays,
  CheckSquare,
  BarChart3,
  Users,
  UserCircle2,
  CreditCard,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

const PRIMARY: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Programs", href: "/programs", icon: GraduationCap },
  { label: "Tutorials", href: "/tutorials", icon: PlayCircle },
  { label: "Posting Plans", href: "/posting", icon: CalendarDays },
  { label: "Tasks", href: "/missions", icon: CheckSquare },
  { label: "Performance", href: "/performance", icon: BarChart3 },
  { label: "Community", href: "/community", icon: Users },
];

const SECONDARY: NavItem[] = [
  { label: "Profile", href: "/profile", icon: UserCircle2 },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ plan = "free" }: { plan?: "free" | "basic" | "pro" }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-[252px] shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-cream-100">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-start gap-3 px-6 py-6 hover:opacity-90 transition-opacity"
      >
        <BrandMark size={42} />
        <div className="text-[12.5px] font-medium leading-[1.25] text-ink-900 pt-0.5">
          How To Become
          <br />
          A Successful
          <br />
          Social Media Influencer
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {PRIMARY.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </ul>

        <div className="my-4 h-px bg-ink-100 mx-3" />

        <ul className="space-y-1">
          {SECONDARY.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </ul>
      </nav>

      {/* Upgrade card — hidden for Pro users */}
      {plan !== "pro" && (
        <div className="p-4">
          <UpgradeCard />
        </div>
      )}
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors",
          active
            ? "bg-rose-100 text-rose-700"
            : "text-ink-700 hover:bg-cream-200 hover:text-ink-900",
        )}
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            active ? "text-rose-600" : "text-ink-500",
          )}
          strokeWidth={1.8}
        />
        <span className="flex-1">{item.label}</span>
        {typeof item.badge === "number" && (
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold",
              active
                ? "bg-rose-600 text-white"
                : "bg-rose-100 text-rose-700",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

function UpgradeCard() {
  return (
    <div className="rounded-[16px] border border-rose-200 bg-rose-50/60 p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-rose-700 text-[13px] font-semibold mb-1">
        <Sparkles className="size-4" strokeWidth={2} />
        Upgrade to Pro
      </div>
      <p className="text-[11.5px] text-ink-500 leading-snug mb-3">
        Unlock all programs, premium resources and 1-to-1 coaching.
      </p>
      <Link
        href="/billing?upgrade=pro"
        className="block w-full h-9 leading-9 text-[12.5px] font-medium bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-[10px] transition-colors"
      >
        Upgrade now
      </Link>
    </div>
  );
}
