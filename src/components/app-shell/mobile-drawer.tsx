"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
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
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

type Item = { label: string; href: string; icon: LucideIcon };

// Mirrors PRIMARY/SECONDARY in sidebar.tsx — kept in sync intentionally so the
// mobile drawer offers the full nav while the bottom-nav only surfaces top 5.
const PRIMARY: Item[] = [
  { label: "Dashboard",     href: "/dashboard",   icon: LayoutGrid },
  { label: "Programs",      href: "/programs",    icon: GraduationCap },
  { label: "Tutorials",     href: "/tutorials",   icon: PlayCircle },
  { label: "Posting Plans", href: "/posting",     icon: CalendarDays },
  { label: "Tasks",         href: "/missions",    icon: CheckSquare },
  { label: "Performance",   href: "/performance", icon: BarChart3 },
  { label: "Community",     href: "/community",   icon: Users },
];

const SECONDARY: Item[] = [
  { label: "Profile",  href: "/profile",  icon: UserCircle2 },
  { label: "Billing",  href: "/billing",  icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

type Props = {
  plan?: "free" | "basic" | "pro";
  isAdmin?: boolean;
};

export function MobileDrawer({ plan = "free", isAdmin = false }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change — adjusting state during render (React-recommended
  // pattern over a useEffect that would re-render twice on each navigation).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  // ESC to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center size-10 -ml-1.5 rounded-full text-ink-900 hover:bg-cream-200 transition-colors"
      >
        <Menu className="size-[22px]" strokeWidth={1.8} />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-in fade-in duration-150"
          />

          {/* Panel */}
          <aside
            className="absolute inset-y-0 left-0 flex flex-col bg-cream-100 border-r border-ink-100 shadow-xl animate-in slide-in-from-left duration-200"
            style={{ width: "var(--mobile-drawer-width)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <BrandMark size={32} />
                <span className="text-[14px] font-semibold text-ink-900 leading-tight">
                  Creator Growth OS
                </span>
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center size-9 rounded-full hover:bg-cream-200 transition-colors"
              >
                <X className="size-[18px] text-ink-700" strokeWidth={1.8} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto">
              <ul className="space-y-1">
                {PRIMARY.map((item) => (
                  <DrawerLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item.href)}
                  />
                ))}
              </ul>

              <div className="my-4 h-px bg-ink-100 mx-3" />

              <ul className="space-y-1">
                {SECONDARY.map((item) => (
                  <DrawerLink
                    key={item.href}
                    item={item}
                    active={isActive(pathname, item.href)}
                  />
                ))}
              </ul>

              {isAdmin && (
                <>
                  <div className="my-4 h-px bg-ink-100 mx-3" />
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-[12px] bg-ink-900 text-cream-100 text-[14px] font-medium"
                  >
                    <ShieldCheck className="size-[18px] text-rose-300" strokeWidth={1.8} />
                    <span className="flex-1">Admin Console</span>
                    <span className="text-[9.5px] font-semibold tracking-wider text-rose-300 uppercase">
                      Admin
                    </span>
                  </Link>
                </>
              )}
            </nav>

            {plan !== "pro" && (
              <div className="p-4">
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
                    onClick={() => setOpen(false)}
                    className="block w-full h-9 leading-9 text-[12.5px] font-medium bg-white border border-rose-200 text-rose-700 rounded-[10px]"
                  >
                    Upgrade now
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function DrawerLink({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-[12px] text-[14.5px] font-medium transition-colors",
          active
            ? "bg-rose-100 text-rose-700"
            : "text-ink-700 hover:bg-cream-200",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon
          className={cn("size-[19px] shrink-0", active ? "text-rose-600" : "text-ink-500")}
          strokeWidth={1.8}
        />
        <span className="flex-1">{item.label}</span>
      </Link>
    </li>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}
