"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildAuthSearch, type AuthFilterState } from "@/lib/dev-dashboard/auth-filters";
import { cn } from "@/lib/cn";

type Props = {
  totalPages: number;
  currentPage: number;
  /** Current filter state, serializable. URLs are built client-side. */
  filters?: AuthFilterState;
};

export function AuthEventsPagination({ totalPages, currentPage, filters }: Props) {
  const buildHref = (page: number) => {
    const params = buildAuthSearch({ ...(filters ?? {}), page });
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  };

  const prev = Math.max(1, currentPage - 1);
  const next = Math.min(totalPages, currentPage + 1);

  // Compact page list: current, current+1, current+2, …, lastPage.
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
      <PageLink href={buildHref(prev)} disabled={currentPage === 1} aria-label="Previous page">
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

      <PageLink href={buildHref(next)} disabled={currentPage === totalPages} aria-label="Next page">
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
