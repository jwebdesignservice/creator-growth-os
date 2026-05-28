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
  Gift,
  ArrowRight,
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

const WIDTH_EXPANDED = 240;
const WIDTH_COLLAPSED = 76;
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
        {/* Logo — `shrink-0` on the BrandMark wrapper so flex can't
            squeeze it down when the rail is narrow (without this the
            icon ends up ~4px wide and effectively invisible). */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-5 py-5 hover:opacity-90 transition-opacity shrink-0"
        >
          <span className="shrink-0">
            <BrandMark size={30} />
          </span>
          <span
            className={cn(
              "text-[16px] font-semibold tracking-tight text-ink-900 whitespace-nowrap transition-opacity duration-150",
              expanded ? "opacity-100" : "opacity-0",
            )}
          >
            profluencer
          </span>
        </Link>

        {/* Nav — explicit overflow-x-hidden prevents a horizontal
            scrollbar appearing inside the rail when label widths
            exceed the collapsed (76px) wrapper. */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto overflow-x-hidden">
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
            <div className={cn(!expanded && "flex justify-center")}>
              <Link
                href="/admin"
                title={!expanded ? "Admin Console" : undefined}
                className={cn(
                  "flex items-center rounded-[10px] bg-ink-900 text-cream-100 hover:bg-ink-700 text-[13.5px] font-medium transition-[background-color,padding] duration-150",
                  expanded
                    ? "gap-3 px-3 py-2.5"
                    : "size-10 justify-center",
                )}
              >
                <ShieldCheck
                  className="size-[18px] text-rose-300 shrink-0"
                  strokeWidth={1.8}
                />
                <span
                  className={cn(
                    "flex-1 whitespace-nowrap transition-opacity duration-150",
                    expanded ? "opacity-100" : "opacity-0 w-0",
                  )}
                >
                  Admin Console
                </span>
              </Link>
            </div>
          )}

          {isDev && (
            <div className={cn("mt-2", !expanded && "flex justify-center")}>
              <Link
                href="/dev"
                title={!expanded ? "Dev Console" : undefined}
                className={cn(
                  "flex items-center rounded-[10px] bg-[#0A0F1F] text-cream-100 hover:bg-[#111729] text-[13.5px] font-medium transition-[background-color,padding] duration-150 ring-1 ring-[rgba(59,130,246,0.32)]",
                  expanded
                    ? "gap-3 px-3 py-2.5"
                    : "size-10 justify-center",
                )}
              >
                <Terminal
                  className="size-[18px] text-[#7AA9FF] shrink-0"
                  strokeWidth={1.8}
                />
                <span
                  className={cn(
                    "flex-1 whitespace-nowrap transition-opacity duration-150",
                    expanded ? "opacity-100" : "opacity-0 w-0",
                  )}
                >
                  Dev Console
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom CTAs — single card with two icon+label rows when
            expanded; two icon-only buttons stacked when collapsed so
            the actions are still reachable from the icon rail. */}
        <div className="p-3 shrink-0">
          {expanded ? (
            <BottomCtaCard plan={plan} />
          ) : (
            <BottomCtaIcons plan={plan} />
          )}
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
          "group flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13.5px] font-medium transition-colors",
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

/* ─── Bottom CTAs — icon-only mode (collapsed rail) ────────────────────
   Two stacked rose icon buttons. Tooltips on hover so users know which
   is which. The upgrade button hides for Pro users.                       */

function BottomCtaIcons({ plan }: { plan: "free" | "basic" | "pro" }) {
  const showUpgrade = plan !== "pro";
  return (
    <div className="flex flex-col items-center gap-2">
      {showUpgrade && (
        <Link
          href="/billing?upgrade=pro"
          title="Upgrade to Pro"
          aria-label="Upgrade to Pro"
          className="flex items-center justify-center size-10 rounded-[12px] bg-rose-100 hover:bg-rose-200 transition-colors"
        >
          <Sparkles className="size-[18px] text-rose-600" strokeWidth={2} />
        </Link>
      )}
      <Link
        href="/settings/referrals"
        title="Invite friends"
        aria-label="Invite friends"
        className="flex items-center justify-center size-10 rounded-[12px] bg-rose-100 hover:bg-rose-200 transition-colors"
      >
        <Gift className="size-[18px] text-rose-600" strokeWidth={2} />
      </Link>
    </div>
  );
}

/* ─── Bottom CTA card — expanded mode ──────────────────────────────────
   One card, two icon+label rows. The upgrade row hides for Pro users so
   the card collapses to just the invite row. Each row is a full-bleed
   tap target with a subtle hover background.                              */

function BottomCtaCard({ plan }: { plan: "free" | "basic" | "pro" }) {
  const showUpgrade = plan !== "pro";
  return (
    <div className="rounded-[16px] border border-rose-100 bg-rose-50/60 p-1.5 overflow-hidden">
      {showUpgrade && (
        <>
          <CtaRow
            href="/billing?upgrade=pro"
            icon={Sparkles}
            label="Upgrade to Pro"
          />
          <div className="my-1 h-px bg-rose-100/80 mx-2" />
        </>
      )}
      <CtaRow
        href="/settings/referrals"
        icon={Gift}
        label="Invite friends"
      />
    </div>
  );
}

function CtaRow({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] hover:bg-white transition-colors"
    >
      <Icon
        className="size-[18px] text-rose-600 shrink-0"
        strokeWidth={2}
      />
      <span className="flex-1 text-[13px] font-semibold text-rose-700 truncate">
        {label}
      </span>
      <ArrowRight
        className="size-3.5 text-rose-300 group-hover:text-rose-600 transition-colors shrink-0"
        strokeWidth={2}
      />
    </Link>
  );
}
