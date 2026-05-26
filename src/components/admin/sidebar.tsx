"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Megaphone,
  Mail,
  ShieldCheck,
  ExternalLink,
  GraduationCap,
  PlayCircle,
  CalendarDays,
  BarChart3,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Top-of-sidebar: platform-level admin tools that don't belong to any one
 * content type — your home, your people, your stats, your broadcasts.
 */
const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Performance", href: "/admin/performance", icon: BarChart3 },
  { label: "Email", href: "/admin/emails", icon: Mail },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

/**
 * The "CONTENT" section — everything that lives in a creator's catalog and
 * has its own admin surface. Mirrors the reference's "PRODUCTS" group.
 */
const CONTENT_NAV: NavItem[] = [
  { label: "Programs", href: "/admin/programs", icon: GraduationCap },
  // Labels mirror the main creator app's sidebar (Tutorials, Tasks) so
  // admins and members are talking about the same things. Tutorials lives
  // at its own route now; the legacy /admin/lessons redirects there.
  { label: "Tutorials", href: "/admin/tutorials", icon: PlayCircle },
  { label: "Tasks", href: "/admin/missions", icon: CheckSquare },
  { label: "Posting Plans", href: "/admin/posting", icon: CalendarDays },
];

/** Routes that show their own inner sub-nav — sidebar collapses to icons. */
const COMPACT_ROUTES = ["/admin/emails"];

/**
 * Single-program detail routes (`/admin/programs/<id>` and deeper) also
 * render their own inner sub-nav (see `src/app/admin/programs/[id]/layout.tsx`),
 * so the parent sidebar collapses to icons there too. The list page
 * (`/admin/programs`) and the create form (`/admin/programs/new`) stay
 * full-width — they don't have an inner nav.
 */
function isProgramDetailRoute(pathname: string): boolean {
  if (!pathname.startsWith("/admin/programs/")) return false;
  if (pathname.startsWith("/admin/programs/new")) return false;
  return true;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const compact =
    COMPACT_ROUTES.some((p) => pathname.startsWith(p)) ||
    isProgramDetailRoute(pathname);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-white/5 bg-ink-900 text-cream-100 transition-[width] duration-200",
        compact ? "w-[68px]" : "w-[252px]",
      )}
    >
      {/* Brand */}
      <Link
        href="/admin"
        className={cn(
          "flex items-start gap-3 hover:opacity-90 transition-opacity",
          compact ? "justify-center px-3 py-5" : "px-6 py-6",
        )}
        title="Creator Growth Admin"
      >
        <BrandMark size={compact ? 32 : 36} className="text-rose-400" />
        {!compact && (
          <div className="leading-tight pt-0.5">
            <div className="text-[14px] font-semibold text-white">
              Creator Growth
            </div>
            <div className="text-[10.5px] tracking-[0.16em] uppercase text-rose-300/80">
              Admin Console
            </div>
          </div>
        )}
      </Link>

      {/* Divider under the brand — matches the reference's clean separation */}
      <div
        aria-hidden
        className={cn("border-t border-white/5", compact ? "mx-3" : "mx-6")}
      />

      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4",
          compact ? "px-2" : "px-3",
        )}
      >
        {/* Main nav (no section label, just like the reference's top group) */}
        <ul className="space-y-1">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              compact={compact}
            />
          ))}
        </ul>

        {/* CONTENT section header with + action — unified create flow */}
        <SectionHeader
          label="Content"
          addHref="/create-new"
          compact={compact}
        />

        <ul className="space-y-1">
          {CONTENT_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              compact={compact}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-white/10",
          compact ? "p-2" : "p-4",
        )}
      >
        {compact ? (
          <Link
            href="/dashboard"
            title="Exit to creator app"
            className="flex items-center justify-center size-12 rounded-[10px] text-cream-100/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="size-4" strokeWidth={2} />
          </Link>
        ) : (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12.5px] text-cream-100/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ExternalLink className="size-3.5" strokeWidth={2} />
              Exit to creator app
            </Link>
            <div className="mt-3 flex items-center gap-2 px-3 text-[11px] text-cream-100/40">
              <ShieldCheck className="size-3.5 text-rose-300" strokeWidth={2} />
              Admin access verified
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function SectionHeader({
  label,
  addHref,
  compact,
}: {
  label: string;
  addHref?: string;
  compact: boolean;
}) {
  if (compact) {
    // In compact mode, the section is just a hairline divider — labels and
    // the + action move to the inner sub-nav of the active surface.
    return <div aria-hidden className="mt-4 mb-2 mx-2 border-t border-white/5" />;
  }
  return (
    <div className="mt-6 mb-2 px-3 flex items-center justify-between">
      <span className="text-[10.5px] uppercase tracking-[0.18em] text-cream-100/40 font-semibold">
        {label}
      </span>
      {addHref && (
        <Link
          href={addHref}
          aria-label={`New ${label.toLowerCase()}`}
          title={`New ${label.toLowerCase()}`}
          className="size-5 rounded-full border border-white/15 inline-flex items-center justify-center text-cream-100/50 hover:text-white hover:border-rose-300/60 hover:bg-white/5 transition-colors"
        >
          <Plus className="size-3" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function NavLink({
  item,
  active,
  compact,
}: {
  item: NavItem;
  active: boolean;
  compact: boolean;
}) {
  const Icon = item.icon;
  if (compact) {
    return (
      <li>
        <Link
          href={item.href}
          title={item.label}
          aria-label={item.label}
          className={cn(
            "flex items-center justify-center size-12 rounded-[10px] transition-colors",
            active
              ? "bg-rose-600 text-white shadow-sm"
              : "text-cream-100/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon
            className={cn(
              "size-[18px]",
              active ? "text-white" : "text-cream-100/70",
            )}
            strokeWidth={1.8}
          />
        </Link>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors",
          active
            ? "bg-rose-600 text-white shadow-sm"
            : "text-cream-100/80 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            active ? "text-white" : "text-cream-100/60",
          )}
          strokeWidth={1.8}
        />
        <span className="flex-1">{item.label}</span>
      </Link>
    </li>
  );
}
