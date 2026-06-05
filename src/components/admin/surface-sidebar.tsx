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
 * Generic admin "surface" sidebar — the inner left nav used by sections like
 * Email and Tutorials. Built on the shared WorkspaceShell rail idiom (white
 * panel · rose-box icon + title header with a bottom divider · vertically
 * stacked, rose-active tabs) so it reads as the exact same "workspace" pattern
 * as the creator-side Settings / Performance / Tutorials rails.
 *
 * Pure presentation: the section `icon`, `sectionLabel` (title) and `items`
 * come in as props. (Uses a hand-rolled tab list rather than the shared
 * `WorkspaceTabs` because admin surfaces need the `active` override — for
 * `?tab=`-driven editors — and `beta` pills, which `WorkspaceTabs` doesn't
 * support; the styling is matched 1:1.)
 *
 * IMPORTANT: `icon` is a serializable string key — NOT a component reference.
 * Layouts are server components in Next.js 16, and React 19 forbids passing
 * function/class objects (including Lucide icon components) across the
 * server→client boundary. Add new icons to `ICONS` below and reference them by
 * name in the layout's nav items.
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
  /** Section icon shown in the header's rose box (serializable key). */
  icon: SurfaceSidebarIconKey;
  /** Section title shown next to the icon (e.g. "Email", "Editing"). */
  sectionLabel: string;
  items: SurfaceSidebarItem[];
  adminName: string;
  adminEmail: string;
};

export function AdminSurfaceSidebar({
  icon,
  sectionLabel,
  items,
  adminName,
  adminEmail,
}: Props) {
  const pathname = usePathname();
  const HeaderIcon = ICONS[icon];

  return (
    <aside className="hidden lg:flex lg:flex-col w-[230px] shrink-0 h-screen sticky top-0 bg-white border-r border-ink-100 overflow-hidden">
      {/* Header — rose-box icon + title + divider (WorkspaceShell rail chrome) */}
      <header className="flex items-center gap-2.5 p-[15px] border-b border-ink-100">
        <span className="size-8 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <HeaderIcon className="size-[17px]" strokeWidth={2} />
        </span>
        <h1 className="text-[15px] font-semibold text-ink-900 leading-tight">
          {sectionLabel}
        </h1>
      </header>

      {/* Nav items — WorkspaceTabs styling (rose-50 active + ring) */}
      <nav className="flex-1 px-[15px] pt-[15px] overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = item.active ?? isActive(pathname, item.href);
            const Icon = ICONS[item.icon];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 h-10 px-3 rounded-[10px] text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                      : "text-ink-600 hover:bg-cream-100 hover:text-ink-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      active ? "text-rose-600" : "text-ink-400",
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
          className="flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-cream-100 transition-colors"
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
