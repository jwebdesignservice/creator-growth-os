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
  MessageCircle,
  Settings,
  Sparkles,
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
  { label: "Messages", href: "/messages", icon: MessageCircle },
];

const SECONDARY: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

const WIDTH_EXPANDED = 240;
const WIDTH_COLLAPSED = 64;
/** Time (ms) the sidebar stays expanded after first page load before auto-collapsing. */
const AUTO_COLLAPSE_MS = 2500;
/** Shared motion curve — a soft ease so the width glide feels smooth, not abrupt. */
const EASE = "ease-in-out";

export function Sidebar({
  plan = "free",
  taskCount = 0,
  messageCount = 0,
}: {
  plan?: "free" | "basic" | "pro";
  taskCount?: number;
  messageCount?: number;
}) {
  const pathname = usePathname();

  // Stamp the live counts onto their nav rows so the expanded labels get a
  // badge: open tasks on "Tasks", unread DMs on "Messages".
  const primary = PRIMARY.map((item) => {
    if (item.href === "/missions" && taskCount > 0) {
      return { ...item, badge: taskCount };
    }
    if (item.href === "/messages" && messageCount > 0) {
      return { ...item, badge: messageCount };
    }
    return item;
  });

  // Three logical states represented by two booleans:
  // - collapsed = false, hoverExpanded = *      → expanded (initial 2.5s on mount)
  // - collapsed = true,  hoverExpanded = false  → collapsed icon rail
  // - collapsed = true,  hoverExpanded = true   → floating overlay (page content
  //                                                stays at WIDTH_COLLAPSED)
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // Auto-collapse after the user has had a chance to scan the labels once.
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
          Reserves the page's horizontal real estate. When the sidebar is
          hovered open from collapsed, this stays at WIDTH_COLLAPSED so the
          sidebar overlays content rather than pushing it around.            */}
      <div
        aria-hidden
        className={cn(
          "hidden lg:block shrink-0 transition-[width] duration-300",
          EASE,
        )}
        style={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED }}
      />

      {/* ── Actual sidebar ──────────────────────────────────────────────
          Fixed-positioned so the hover-overlay state doesn't shift anything.
          Only the WIDTH animates — icons keep a fixed left position and the
          labels fade, so nothing jumps as it opens/closes.                 */}
      <aside
        onMouseEnter={() => {
          if (collapsed) setHoverExpanded(true);
        }}
        onMouseLeave={() => setHoverExpanded(false)}
        className={cn(
          // z-40 so the sidebar sits ABOVE the topbar (z-30).
          "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40",
          "border-r border-ink-100 bg-cream-100 overflow-hidden",
          "transition-[width,box-shadow] duration-300",
          EASE,
          isFloatingOverlay && "shadow-xl",
        )}
        style={{ width: railWidth }}
      >
        {/* Logo — brand mark stays fixed (aligned with the nav icon column);
            the wordmark fades in/out with the rail. */}
        <Link
          href="/dashboard"
          className="flex items-center h-16 shrink-0 pl-[18px] pr-4 hover:opacity-90 transition-opacity"
        >
          <span className="shrink-0">
            <BrandMark size={30} />
          </span>
          <span
            className={cn(
              "ml-2.5 text-[16px] font-semibold tracking-tight text-ink-900 whitespace-nowrap transition-opacity duration-200",
              expanded ? "opacity-100" : "opacity-0",
            )}
          >
            profluencer
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <ul className="space-y-1">
            {primary.map((item) => (
              <NavRow
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
              <NavRow
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                expanded={expanded}
              />
            ))}
          </ul>
        </nav>

        {/* Bottom CTAs — two tidy rows that share the nav's rhythm: the icon
            stays put and the label fades, so they collapse cleanly to a solid
            (Upgrade) and a soft (Invite) square. */}
        <div className="px-3 py-3 shrink-0 space-y-1.5">
          {plan !== "pro" && (
            <CtaRow
              href="/billing?upgrade=pro"
              icon={Sparkles}
              label="Upgrade to Pro"
              expanded={expanded}
              variant="primary"
            />
          )}
          <CtaRow
            href="/settings/invites"
            icon={Gift}
            label="Invite friends"
            expanded={expanded}
            variant="soft"
          />
        </div>
      </aside>
    </>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

/* ─── Nav row ──────────────────────────────────────────────────────────
   Single fixed layout for both states: a left-aligned icon that never moves
   + a label/badge that fades. Collapsing only shrinks the rail width.     */
function NavRow({
  item,
  active,
  expanded,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;
  const hasBadge = typeof item.badge === "number" && item.badge > 0;
  return (
    <li>
      <Link
        href={item.href}
        title={!expanded ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center h-10 w-full rounded-[10px] px-3 text-[13.5px] font-medium transition-colors",
          active
            ? "bg-rose-100 text-rose-700"
            : "text-ink-700 hover:bg-cream-200 hover:text-ink-900",
        )}
      >
        <span className="relative shrink-0 inline-flex items-center justify-center">
          <Icon
            className={cn(
              "size-[18px]",
              active ? "text-rose-600" : "text-ink-500",
            )}
            strokeWidth={1.8}
          />
          {/* Collapsed: a small dot stands in for the count. */}
          {hasBadge && !expanded && (
            <span className="absolute -top-1 -right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-cream-100" />
          )}
        </span>

        <span
          className={cn(
            "ml-3 flex-1 text-left whitespace-nowrap transition-opacity duration-200",
            expanded ? "opacity-100" : "opacity-0",
          )}
        >
          {item.label}
        </span>

        {hasBadge && (
          <span
            className={cn(
              "ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold transition-opacity duration-200",
              expanded ? "opacity-100" : "opacity-0",
              active ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

/* ─── Bottom CTA row ───────────────────────────────────────────────────
   Same rhythm as the nav rows. `primary` is the solid Upgrade button;
   `soft` is the tinted Invite button.                                     */
function CtaRow({
  href,
  icon: Icon,
  label,
  expanded,
  variant,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  expanded: boolean;
  variant: "primary" | "soft";
}) {
  const primary = variant === "primary";
  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      className={cn(
        "flex items-center h-10 w-full rounded-[10px] px-3 transition-colors",
        primary
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "bg-rose-50 text-rose-700 hover:bg-rose-100",
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={2} />
      <span
        className={cn(
          "ml-3 flex-1 text-left text-[13.5px] font-semibold whitespace-nowrap transition-opacity duration-200",
          expanded ? "opacity-100" : "opacity-0",
        )}
      >
        {label}
      </span>
      <ArrowRight
        className={cn(
          "size-3.5 shrink-0 transition-opacity duration-200",
          primary ? "text-white/70" : "text-rose-400",
          expanded ? "opacity-100" : "opacity-0",
        )}
        strokeWidth={2}
      />
    </Link>
  );
}
