import type { ReactNode } from "react";

/**
 * Composes a page's main canvas with an optional per-page right rail.
 * Used inside the `(app)` route group so each page can opt into its own
 * rail (or skip it entirely).
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
      <main className="flex-1 min-w-0 px-6 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
      {rail}
    </div>
  );
}
