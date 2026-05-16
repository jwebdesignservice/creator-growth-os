import type { ReactNode } from "react";

/**
 * Composes a page's main canvas with an optional per-page right rail.
 * Used inside the `(app)` route group so each page can opt into its own
 * rail (or skip it entirely).
 *
 * Mobile (<lg): tighter content padding + extra bottom padding so the
 * fixed bottom-nav never overlaps the last card.
 * Desktop (lg+): original fluid page padding; right rail (if any) docks
 * to the side.
 */
export function PageShell({
  children,
  rail,
}: {
  children: ReactNode;
  rail?: ReactNode;
}) {
  return (
    <div className="flex flex-1 min-w-0">
      <main
        className="flex-1 min-w-0 px-[var(--mobile-content-x)] py-[var(--mobile-content-y)] pb-[var(--mobile-bottomnav-safe-pad)] lg:px-[var(--space-page-x)] lg:py-[var(--space-page-y)] lg:pb-[var(--space-page-y)]"
      >
        {children}
      </main>
      {rail}
    </div>
  );
}
