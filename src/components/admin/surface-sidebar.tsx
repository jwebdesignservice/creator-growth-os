"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  PlayCircle,
  Plus,
  Mail,
  FileText,
  History,
  Settings,
  Workflow,
  PenSquare,
  Send,
  Info,
  Sparkles,
  Image as ImageIcon,
  Route as RouteIcon,
  GraduationCap,
  Folder,
  SlidersHorizontal,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Generic admin "surface" sidebar — the inner left nav used by sections
 * like Email and Tutorials. Pure presentation: the section label and
 * items come in as props so this component is the single source of truth
 * for the look (brand strip · section label · nav items · admin chip).
 *
 * To wire a new surface: create a section layout that calls this with
 * its own `sectionLabel`, `items`, and admin info.
 *
 * IMPORTANT: `icon` is a serializable string key — NOT a component
 * reference. Layouts are server components in Next.js 16, and React 19
 * forbids passing function/class objects (including Lucide icon
 * components) across the server→client boundary. Add new icons to
 * `ICONS` below and reference them by name in the layout's nav items.
 */
export type SurfaceSidebarIconKey =
  | "play-circle"
  | "plus"
  | "mail"
  | "file-text"
  | "history"
  | "settings"
  | "workflow"
  | "pen-square"
  | "send"
  | "info"
  | "sparkles"
  | "image"
  | "route"
  | "graduation-cap"
  | "folder"
  | "sliders-horizontal"
  | "lock"
  | "chevron-left";

const ICONS: Record<SurfaceSidebarIconKey, LucideIcon> = {
  "play-circle":       PlayCircle,
  plus:                Plus,
  mail:                Mail,
  "file-text":         FileText,
  history:             History,
  settings:            Settings,
  workflow:            Workflow,
  "pen-square":        PenSquare,
  send:                Send,
  info:                Info,
  sparkles:            Sparkles,
  image:               ImageIcon,
  route:               RouteIcon,
  "graduation-cap":    GraduationCap,
  folder:              Folder,
  "sliders-horizontal": SlidersHorizontal,
  lock:                Lock,
  "chevron-left":      ChevronLeft,
};

export type SurfaceSidebarItem = {
  label: string;
  href: string;
  icon: SurfaceSidebarIconKey;
  /**
   * Explicit override for active-state highlighting. When provided this wins
   * over the default pathname match — used by surfaces that disambiguate
   * tabs via search params (e.g. the tutorial editor's `?tab=…`).
   */
  active?: boolean;
  /** Shows a small "Beta" pill next to the label — for experimental sections. */
  beta?: boolean;
};

type Props = {
  /** Brand string shown at the very top. Defaults to "profluencer". */
  brand?: string;
  /** Where the brand strip links. Defaults to "/admin". */
  homeHref?: string;
  /** Small uppercase label above the items (e.g. "EMAIL", "TUTORIALS"). */
  sectionLabel: string;
  items: SurfaceSidebarItem[];
  adminName: string;
  adminEmail: string;
};

export function AdminSurfaceSidebar({
  brand = "profluencer",
  homeHref = "/admin",
  sectionLabel,
  items,
  adminName,
  adminEmail,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-cream-100">
      {/* Brand */}
      <Link
        href={homeHref}
        className="px-6 py-6 hover:opacity-90 transition-opacity"
        title="Admin"
      >
        <span className="text-h4 text-rose-600 leading-none">
          {brand}
        </span>
      </Link>

      {/* Section label */}
      <div className="px-6 mt-2 mb-3">
        <span className="text-[10.5px] uppercase tracking-[0.18em] text-rose-600 font-semibold">
          {sectionLabel}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = item.active ?? isActive(pathname, item.href);
            const Icon = ICONS[item.icon];
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
                      "size-[17px] shrink-0",
                      active ? "text-rose-600" : "text-ink-500",
                    )}
                    strokeWidth={2}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.beta && (
                    <span className="inline-flex items-center rounded-full bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 leading-none shrink-0">
                      Beta
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin chip */}
      <div className="p-3 border-t border-ink-100">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-cream-200/70 transition-colors"
        >
          <span className="size-9 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[12px] font-bold shrink-0">
            {initials(adminName)}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-ink-900 truncate leading-tight">
              {adminName}
            </span>
            <span className="block text-[11.5px] text-ink-500 truncate">
              {adminEmail}
            </span>
          </span>
          <ChevronDown
            className="size-3.5 text-ink-400 shrink-0"
            strokeWidth={2}
          />
        </Link>
      </div>
    </aside>
  );
}

/* Active-link match. Exact for the surface root; descendants matched via
 * a trailing-slash startsWith so /admin/emails/campaigns/foo still marks
 * Campaigns active without /admin/emails (Compose) lighting up too. */
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
