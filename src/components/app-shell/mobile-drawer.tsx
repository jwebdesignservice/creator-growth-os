"use client";

import { createPortal } from "react-dom";
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
  CreditCard,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

type Item = { label: string; href: string; icon: LucideIcon };

// Kept in sync with sidebar.tsx — the drawer offers the full nav while
// bottom-nav only surfaces the top 5.
const PRIMARY: Item[] = [
  { label: "Dashboard",     href: "/dashboard",   icon: LayoutGrid },
  { label: "Programs",      href: "/programs",    icon: GraduationCap },
  { label: "Tutorials",     href: "/tutorials",   icon: PlayCircle },
  { label: "Posting Plans", href: "/posting",     icon: CalendarDays },
  { label: "Tasks",         href: "/missions",    icon: CheckSquare },
  { label: "Performance",   href: "/performance", icon: BarChart3 },
  { label: "Monetization",  href: "/monetization", icon: Wallet },
  { label: "Community",     href: "/community",   icon: Users },
];

const SECONDARY: Item[] = [
  { label: "Billing",  href: "/billing",  icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

type Props = {
  plan?: "free" | "basic" | "pro";
  isAdmin?: boolean;
  isDev?: boolean;
};

export function MobileDrawer({ plan = "free", isAdmin = false, isDev = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Defer portal mount until after hydration so document.body exists.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change — adjust state during render (recommended pattern).
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

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger trigger — stays inside the mobile topbar */}
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-drawer-panel"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center size-11 -ml-1.5 rounded-full text-ink-900 hover:bg-cream-200 active:bg-cream-300 transition-colors"
      >
        <Menu className="size-[22px]" strokeWidth={1.8} />
      </button>

      {/* Portal to <body> escapes the topbar's `backdrop-filter` containing block, which would otherwise scope `position: fixed` to the 56px topbar frame. */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden
              onClick={close}
              className={cn(
                "lg:hidden fixed inset-0 z-40 bg-ink-900/55 transition-opacity duration-300 ease-out",
                open
                  ? "opacity-100 backdrop-blur-[6px] pointer-events-auto"
                  : "opacity-0 pointer-events-none",
              )}
            />

            {/* Panel */}
            <aside
              id="mobile-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              aria-hidden={!open}
              className={cn(
                "lg:hidden fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-cream-100 border-r border-ink-100 shadow-2xl will-change-transform transition-transform duration-300 ease-out",
                open ? "translate-x-0" : "-translate-x-full pointer-events-none",
              )}
              style={{ width: "var(--mobile-drawer-width)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink-100 shrink-0">
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <BrandMark size={28} />
                  <span className="text-[16px] font-semibold tracking-tight text-ink-900 leading-tight truncate">
                    profluencer
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={close}
                  className="inline-flex items-center justify-center size-10 rounded-full text-ink-700 hover:bg-cream-200 active:bg-cream-300 transition-colors shrink-0"
                >
                  <X className="size-[18px]" strokeWidth={1.8} />
                </button>
              </div>

              {/* Scrollable nav body */}
              <nav className="flex-1 min-h-0 px-3 py-3 overflow-y-auto overscroll-contain">
                <ul className="space-y-1">
                  {PRIMARY.map((item) => (
                    <DrawerLink
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      onSelect={close}
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
                      onSelect={close}
                    />
                  ))}
                </ul>

                {(isAdmin || isDev) && <div className="my-4 h-px bg-ink-100 mx-3" />}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="flex items-center gap-3 px-3 py-3 rounded-[12px] bg-ink-900 text-cream-100 text-[14px] font-medium min-h-[48px] active:opacity-90 transition-opacity"
                  >
                    <ShieldCheck className="size-[18px] text-rose-300" strokeWidth={1.8} />
                    <span className="flex-1">Admin Console</span>
                  </Link>
                )}

                {isDev && (
                  <Link
                    href="/dev"
                    onClick={close}
                    className="mt-2 flex items-center gap-3 px-3 py-3 rounded-[12px] bg-[#0A0F1F] text-cream-100 text-[14px] font-medium min-h-[48px] ring-1 ring-[rgba(59,130,246,0.32)] active:opacity-90 transition-opacity"
                  >
                    <Terminal className="size-[18px] text-[#7AA9FF]" strokeWidth={1.8} />
                    <span className="flex-1">Dev Console</span>
                  </Link>
                )}
              </nav>

              {/* Upgrade footer — pinned to the bottom of the panel */}
              {plan !== "pro" && (
                <div className="p-4 border-t border-ink-100 shrink-0">
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
                      onClick={close}
                      className="block w-full h-11 leading-[44px] text-[13px] font-semibold bg-white border border-rose-200 text-rose-700 rounded-[10px] hover:bg-rose-100 active:bg-rose-100 transition-colors"
                    >
                      Upgrade now
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </>,
          document.body,
        )}
    </>
  );
}

function DrawerLink({
  item,
  active,
  onSelect,
}: {
  item: Item;
  active: boolean;
  onSelect?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-[12px] text-[14.5px] font-medium transition-colors min-h-[48px]",
          active
            ? "bg-rose-100 text-rose-700"
            : "text-ink-700 hover:bg-cream-200 active:bg-cream-300",
        )}
      >
        <Icon
          className={cn("size-[20px] shrink-0", active ? "text-rose-600" : "text-ink-500")}
          strokeWidth={active ? 2 : 1.8}
        />
        <span className="flex-1 leading-tight">{item.label}</span>
      </Link>
    </li>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}
