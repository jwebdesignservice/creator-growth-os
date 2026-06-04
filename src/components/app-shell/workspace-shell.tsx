import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Shared two-panel "workspace" layout — the design template used across the
 * app (Community, Performance, …). It renders full-bleed on desktop: a flush,
 * full-height white left panel (icon + title + vertically-stacked tabs) with a
 * divider line, and a single right-hand scroll area for the active section.
 *
 * Server-rendered + presentational: the active tab is resolved on the page
 * (from the URL) and passed in, so there's no client JS here. Each page owns
 * its own data-fetching + section switching and just hands the selected
 * section's content in as `children`.
 *
 * Pair the right-panel section headers with <WorkspaceHeader> so every page's
 * heading line levels with the left-panel title line.
 */

export type WorkspaceTab = {
  /** Stable key compared against `activeKey` to mark the active tab. */
  key: string;
  label: string;
  icon: LucideIcon;
  /** Full href for the tab (e.g. "/community" or "/performance?tab=accounts"). */
  href: string;
  /** Optional count pill shown on the right of the tab. */
  badge?: number;
};

export function WorkspaceShell({
  title,
  icon: Icon,
  tabs,
  activeKey,
  /** When true the right panel sits flush (no insets) — e.g. embedded chat. */
  flush = false,
  /** When true the rail title is centered (even space) instead of left-aligned. */
  centerTitle = false,
  children,
}: {
  title: string;
  icon: LucideIcon;
  tabs: WorkspaceTab[];
  activeKey: string;
  flush?: boolean;
  centerTitle?: boolean;
  children: ReactNode;
}) {
  return (
    // On desktop this is full-bleed: the negative margins cancel the page
    // padding so the left panel sits flush against the top/left/bottom edges
    // (full-height white, with a divider line + a slight gap to the right).
    // The right panel keeps the normal insets and is the only scroll area.
    // On mobile the panels stack and the page scrolls.
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 lg:h-[calc(100dvh_-_var(--topbar-height))] lg:overflow-hidden lg:-mt-[var(--space-page-y)] lg:-mb-[var(--space-page-y)] lg:-ml-[var(--space-page-x)] lg:-mr-[var(--space-page-x)]">
      {/* LEFT PANEL — flush, full-height white panel with a divider line */}
      <aside className="lg:w-[230px] lg:shrink-0 lg:h-full bg-white border-b border-ink-100 lg:border-b-0 lg:border-r lg:border-ink-100 lg:overflow-hidden">
        <header
          className={cn(
            "flex items-center gap-2.5 p-[15px] border-b border-ink-100",
            centerTitle && "justify-center",
          )}
        >
          <span className="size-8 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Icon className="size-[17px]" strokeWidth={2} />
          </span>
          <h1 className="text-[15px] font-semibold text-ink-900 leading-tight">
            {title}
          </h1>
        </header>
        <div className="px-[15px] pt-[15px] pb-3 lg:pb-0">
          <WorkspaceTabs tabs={tabs} activeKey={activeKey} ariaLabel={title} />
        </div>
      </aside>

      {/* RIGHT PANEL — content (the only scroll area). Flush content (chat)
          sits tight; standard tabs keep the normal insets + left gap. */}
      <div
        className={cn(
          "flex-1 min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto",
          flush
            ? "lg:p-0"
            : "lg:pl-6 lg:pr-[var(--space-page-x)] lg:pb-[var(--space-page-y)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Vertically-stacked section nav for the left panel. URL-driven so each
 * section is shareable + back-button friendly. The active tab is resolved on
 * the page and passed in (no client JS).
 */
export function WorkspaceTabs({
  tabs,
  activeKey,
  ariaLabel = "Sections",
}: {
  tabs: WorkspaceTab[];
  activeKey: string;
  ariaLabel?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className="space-y-1">
      {tabs.map((t) => {
        const isActive = t.key === activeKey;
        const Icon = t.icon;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 h-10 px-3 rounded-[10px] text-[13.5px] font-medium transition-colors",
              isActive
                ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                : "text-ink-600 hover:bg-cream-100 hover:text-ink-900",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0",
                isActive ? "text-rose-600" : "text-ink-400",
              )}
              strokeWidth={2}
            />
            <span className="flex-1 truncate">{t.label}</span>
            {typeof t.badge === "number" && t.badge > 0 && (
              <span
                className={cn(
                  "ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold",
                  isActive
                    ? "bg-rose-600 text-white"
                    : "bg-rose-100 text-rose-700",
                )}
              >
                {t.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The leveled header band for a right-panel section. Sits at the flush top of
 * the scroll area as a 63px band with a full-width bottom divider — so its
 * line lands exactly level with the left-panel title's underline. The negative
 * margins break the line out to the panel edges (cancelling the right panel's
 * `lg:pl-6` / `lg:pr` insets) while the heading + actions stay inset.
 *
 * Provide either `title` (rendered as the standard h2) or a custom `left`
 * node; `children` renders right-aligned actions (filters, sort, etc.).
 *
 * Only valid inside the standard (non-`flush`) right panel.
 */
export function WorkspaceHeader({
  title,
  left,
  children,
}: {
  title?: string;
  left?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap min-h-[63px] border-b border-ink-100 lg:-ml-6 lg:-mr-[var(--space-page-x)] lg:pl-6 lg:pr-[var(--space-page-x)]">
      {left ?? (
        <h2 className="text-h4 sm:text-[22px] text-ink-900">{title}</h2>
      )}
      {children}
    </div>
  );
}
