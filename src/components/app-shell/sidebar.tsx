"use client";

import { useEffect, useRef, useState } from "react";
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
  CreditCard,
  Settings,
  Sparkles,
  ShieldCheck,
  Terminal,
  Wallet,
  UserRound,
  Plus,
  X,
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
  { label: "Monetization", href: "/monetization", icon: Wallet },
  { label: "Community", href: "/community", icon: Users },
];

const SECONDARY: NavItem[] = [
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

const WIDTH_EXPANDED = 200;
const WIDTH_COLLAPSED = 64;
/** Time (ms) the sidebar stays expanded after first page load before auto-collapsing. */
const AUTO_COLLAPSE_MS = 2500;

export function Sidebar({
  plan = "free",
  isAdmin = false,
  isDev = false,
}: {
  plan?: "free" | "basic" | "pro";
  isAdmin?: boolean;
  isDev?: boolean;
}) {
  const pathname = usePathname();

  // Three logical states represented by two booleans:
  // - collapsed = false, hoverExpanded = *      → expanded (initial 2.5s on mount)
  // - collapsed = true,  hoverExpanded = false  → collapsed icon rail
  // - collapsed = true,  hoverExpanded = true   → floating overlay (page content
  //                                                stays at WIDTH_COLLAPSED)
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // Auto-collapse after the user has had a chance to scan the labels once.
  // useRef so the timer can be cancelled if the layout unmounts mid-window.
  const autoCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    autoCollapseTimer.current = setTimeout(() => {
      setCollapsed(true);
    }, AUTO_COLLAPSE_MS);
    return () => {
      if (autoCollapseTimer.current) clearTimeout(autoCollapseTimer.current);
    };
  }, []);

  const expanded = !collapsed || hoverExpanded;
  const isFloatingOverlay = collapsed && hoverExpanded;
  const railWidth = expanded ? WIDTH_EXPANDED : WIDTH_COLLAPSED;

  return (
    <>
      {/* ── Layout spacer ────────────────────────────────────────────────
          Reserves the page's horizontal real estate for the sidebar. When
          the sidebar is hovered open from collapsed, this spacer stays at
          WIDTH_COLLAPSED — so the actual sidebar overlays content rather
          than pushing it around the cursor.                                */}
      <div
        aria-hidden
        className="hidden lg:block shrink-0 transition-[width] duration-200 ease-out"
        style={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED }}
      />

      {/* ── Actual sidebar ──────────────────────────────────────────────
          Always fixed-positioned so the hover-overlay state doesn't shift
          anything. Width animates between 64 (icon rail) and 200 (full).  */}
      <aside
        onMouseEnter={() => {
          // Hover only re-expands when in the collapsed state. While the
          // sidebar is still in its initial "expanded on mount" period,
          // hovering is a no-op (it's already at full width).
          if (collapsed) setHoverExpanded(true);
        }}
        onMouseLeave={() => setHoverExpanded(false)}
        className={cn(
          // z-40 so the sidebar sits ABOVE the topbar (z-30). Without
          // this, the sticky topbar paints over the sidebar's right
          // edge — labels get clipped by the search bar, and during
          // the hover-overlay state the expanded panel disappears
          // behind the topbar entirely.
          "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40",
          "border-r border-ink-100 bg-cream-100 overflow-hidden",
          "transition-[width,box-shadow] duration-200 ease-out",
          // Only shadow when in the floating-overlay mode — makes it
          // visually pop above content; otherwise it sits inline.
          isFloatingOverlay && "shadow-xl",
        )}
        style={{ width: railWidth }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-4 py-4 hover:opacity-90 transition-opacity shrink-0"
        >
          <BrandMark size={28} />
          <span
            className={cn(
              "text-[16px] font-semibold tracking-tight text-ink-900 whitespace-nowrap transition-opacity duration-150",
              expanded ? "opacity-100" : "opacity-0",
            )}
          >
            profluencer
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-1.5 overflow-y-auto">
          <ul className="space-y-1">
            {PRIMARY.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                expanded={expanded}
              />
            ))}
          </ul>

          <div className="my-3 h-px bg-ink-100 mx-2.5" />

          <ul className="space-y-1">
            {SECONDARY.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                expanded={expanded}
              />
            ))}
          </ul>

          {(isAdmin || isDev) && (
            <div className="my-3 h-px bg-ink-100 mx-2.5" />
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] bg-ink-900 text-cream-100 hover:bg-ink-700 text-[13.5px] font-medium transition-colors"
            >
              <ShieldCheck
                className="size-[17px] text-rose-300 shrink-0"
                strokeWidth={1.8}
              />
              <span
                className={cn(
                  "flex-1 whitespace-nowrap transition-opacity duration-150",
                  expanded ? "opacity-100" : "opacity-0",
                )}
              >
                Admin Console
              </span>
            </Link>
          )}

          {isDev && (
            <Link
              href="/dev"
              className="mt-2 flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] bg-[#0A0F1F] text-cream-100 hover:bg-[#111729] text-[13.5px] font-medium transition-colors ring-1 ring-[rgba(59,130,246,0.32)]"
            >
              <Terminal
                className="size-[17px] text-[#7AA9FF] shrink-0"
                strokeWidth={1.8}
              />
              <span
                className={cn(
                  "flex-1 whitespace-nowrap transition-opacity duration-150",
                  expanded ? "opacity-100" : "opacity-0",
                )}
              >
                Dev Console
              </span>
            </Link>
          )}
        </nav>

        {/* Bottom cards — only render when the sidebar has room. Cards need
            their labels to make sense; rendering them in collapsed mode
            would just clip mid-word. Fades alongside the width transition. */}
        <div
          className={cn(
            "p-4 space-y-3 shrink-0 transition-opacity duration-150",
            expanded
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          {plan !== "pro" && <UpgradeCard />}
          <ReferralCard />
        </div>
      </aside>
    </>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavLink({
  item,
  active,
  expanded,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        title={!expanded ? item.label : undefined}
        className={cn(
          "group flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] text-[13.5px] font-medium transition-colors",
          active
            ? "bg-rose-100 text-rose-700"
            : "text-ink-700 hover:bg-cream-200 hover:text-ink-900",
        )}
      >
        <Icon
          className={cn(
            "size-[17px] shrink-0",
            active ? "text-rose-600" : "text-ink-500",
          )}
          strokeWidth={1.8}
        />
        <span
          className={cn(
            "flex-1 whitespace-nowrap transition-opacity duration-150",
            expanded ? "opacity-100" : "opacity-0",
          )}
        >
          {item.label}
        </span>
        {typeof item.badge === "number" && (
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold transition-opacity duration-150",
              active
                ? "bg-rose-600 text-white"
                : "bg-rose-100 text-rose-700",
              expanded ? "opacity-100" : "opacity-0",
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
      <div className="flex items-center justify-center gap-1.5 text-rose-700 text-[13px] font-semibold mb-3">
        <Sparkles className="size-4" strokeWidth={2} />
        Upgrade to Pro
      </div>
      <Link
        href="/billing?upgrade=pro"
        className="block w-full h-9 leading-9 text-[12.5px] font-medium bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-[10px] transition-colors"
      >
        Upgrade now
      </Link>
    </div>
  );
}

/* ─── Referral promo — invite friends, earn free credits ───────────────── */

function ReferralCard() {
  // Session-only dismiss: the (app) layout (and this sidebar) persists across
  // client navigation, so closing it keeps it hidden until a full reload —
  // no localStorage/effect needed, which keeps this lint- and hydration-clean.
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative rounded-[16px] border border-rose-100 bg-rose-50 p-4 text-center">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-2 right-2 inline-flex items-center justify-center size-6 rounded-full text-ink-400 hover:text-ink-700 hover:bg-rose-100 transition-colors"
      >
        <X className="size-3.5" strokeWidth={2} />
      </button>

      {/* Avatar cluster + add badge */}
      <div className="flex items-center justify-center -space-x-2.5 mb-3 mt-1">
        <ReferralAvatar tone="bg-rose-300" />
        <ReferralAvatar tone="bg-rose-400" />
        <ReferralAvatar tone="bg-rose-300" />
        <span className="relative z-10 inline-flex items-center justify-center size-6 rounded-full bg-gold-500 text-white border-2 border-rose-50">
          <Plus className="size-3" strokeWidth={3} />
        </span>
      </div>

      <Link
        href="/settings/referrals"
        className="block w-full h-9 leading-9 text-[12.5px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] transition-colors"
      >
        Invite friends
      </Link>
    </div>
  );
}

function ReferralAvatar({ tone }: { tone: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center size-9 rounded-full border-2 border-rose-50",
        tone,
      )}
    >
      <UserRound className="size-4 text-white" strokeWidth={2} />
    </span>
  );
}
