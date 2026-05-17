"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { buildErrorsSearch, type ErrorsFilterState } from "@/lib/dev-dashboard/errors-filters";

type Props = {
  totalPages: number;
  currentPage: number;
  /** Current filter state — used to build per-page URLs that preserve filters.
   *  Passed as serializable data instead of a function so this Client Component
   *  can be rendered from a Server Component parent. */
  filters?: ErrorsFilterState;
};

/**
 * Client-side renderer that turns pagination into real <Link>s pointing at
 * URLs the page's filter state can decode. Using <Link> instead of buttons
 * lets users open pages in a new tab and gives the browser a real history
 * entry per page change.
 */
export function GroupedErrorsPagination({ totalPages, currentPage, filters }: Props) {
  const buildHref = (page: number) => {
    const params = buildErrorsSearch({ ...(filters ?? {}), page });
    return `?${params.toString()}`;
  };

  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPages, currentPage + 1);

  // Compact page list: current ± 1, plus ellipsis to last page.
  const pages: (number | "…")[] = [];
  const seen = new Set<number>();
  function push(p: number) {
    if (p < 1 || p > totalPages || seen.has(p)) return;
    seen.add(p);
    pages.push(p);
  }
  push(currentPage);
  push(currentPage + 1);
  push(currentPage + 2);
  if (totalPages > currentPage + 3) pages.push("…");
  if (totalPages > currentPage + 2) push(totalPages);

  return (
    <nav className="inline-flex items-center gap-1" aria-label="Pagination">
      <PageLink
        href={buildHref(prev)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </PageLink>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-[12px] text-[var(--dev-text-muted)]">
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={buildHref(p)}
            active={p === currentPage}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </PageLink>
        ),
      )}

      <PageLink
        href={buildHref(next)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
} & React.AriaAttributes & { "aria-label"?: string }) {
  const cls = cn(
    "inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-[8px] text-[12.5px] font-medium border transition-colors",
    active
      ? "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white"
      : "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)]",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) {
    return (
      <span className={cls} aria-disabled {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} className={cls} {...rest}>
      {children}
    </Link>
  );
}
