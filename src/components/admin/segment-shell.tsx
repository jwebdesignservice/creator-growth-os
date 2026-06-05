"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AdminSegment = { key: string; label: string; icon: LucideIcon };

/**
 * Full-bleed admin "workspace" shell for filter-driven pages (Missions,
 * Posting). Mirrors the shared {@link WorkspaceShell} rail look — a flush white
 * left panel with a rose-box icon + title header and rose-active tabs — but the
 * rail items are client-side SEGMENTS (`onSelect`), not routed links, so a page
 * can switch its filter without navigating.
 *
 * It cancels the admin `<main>`'s padding (`px-6 lg:px-8 py-6 lg:py-8`) with
 * matching negative margins so the rail sits flush + full-height under the 68px
 * admin topbar; the right panel is the only scroll area and re-applies the page
 * padding so existing page content keeps its insets.
 */
export function AdminSegmentShell({
  icon: Icon,
  title,
  segments,
  activeKey,
  onSelect,
  children,
}: {
  icon: LucideIcon;
  title: string;
  segments: AdminSegment[];
  activeKey: string;
  onSelect: (key: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row -mx-6 -my-6 lg:-mx-8 lg:-my-8 lg:h-[calc(100vh_-_68px)] lg:overflow-hidden">
      {/* LEFT RAIL — flush white panel (WorkspaceShell rail chrome) */}
      <aside className="lg:w-[230px] lg:shrink-0 lg:h-full bg-white border-b border-ink-100 lg:border-b-0 lg:border-r lg:overflow-hidden">
        <header className="flex items-center gap-2.5 p-[15px] border-b border-ink-100">
          <span className="size-8 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Icon className="size-[17px]" strokeWidth={2} />
          </span>
          <h1 className="text-[15px] font-semibold text-ink-900 leading-tight">
            {title}
          </h1>
        </header>
        <nav aria-label={title} className="p-[15px] space-y-1">
          {segments.map((s) => {
            const isActive = s.key === activeKey;
            const SegIcon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onSelect(s.key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 h-10 px-3 rounded-[10px] text-[13.5px] font-medium text-left transition-colors",
                  isActive
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                    : "text-ink-600 hover:bg-cream-100 hover:text-ink-900",
                )}
              >
                <SegIcon
                  className={cn(
                    "size-[18px] shrink-0",
                    isActive ? "text-rose-600" : "text-ink-400",
                  )}
                  strokeWidth={2}
                />
                <span className="flex-1">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* RIGHT PANEL — the only scroll area; re-applies the page padding */}
      <div className="flex-1 min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </div>
    </div>
  );
}
