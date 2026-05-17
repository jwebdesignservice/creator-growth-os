import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { PerfSlowestRouteRow } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const METHOD_TONE: Record<PerfSlowestRouteRow["method"], string> = {
  GET:    "text-[var(--dev-success-text)]",
  POST:   "text-[var(--dev-accent-text)]",
  PUT:    "text-[var(--dev-warning-text)]",
  PATCH:  "text-[var(--dev-warning-text)]",
  DELETE: "text-[var(--dev-danger-text)]",
};

export function TopSlowestRoutesCard({ routes }: { routes: PerfSlowestRouteRow[] }) {
  const rows = routes;
  const top = rows[0]?.p95Ms ?? 1;

  return (
    <DevSectionCard title="Top Slowest Routes (p95)">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0">
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] pb-2">
          Route
        </div>
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] pb-2 text-right">
          p95 (ms)
        </div>

        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;
          // Scale bar width relative to the slowest route so the leader fills
          // the bar and the rest read proportionally.
          const widthPct = (r.p95Ms / top) * 100;
          return (
            <div key={r.key} className="contents">
              <div
                className={cn(
                  "py-2 min-w-0",
                  !isLast && "border-b border-[var(--dev-border-soft)]",
                )}
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[12px] truncate">
                  <span className={cn("font-semibold", METHOD_TONE[r.method])}>
                    {r.method}
                  </span>
                  <span className="text-[var(--dev-text-primary)] truncate">{r.path}</span>
                </span>
                <div
                  className="mt-1.5 h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={r.p95Ms}
                  aria-valuemin={0}
                  aria-valuemax={top}
                  aria-label={`${r.method} ${r.path}: ${r.p95Ms}ms`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--dev-danger)]"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
              <div
                className={cn(
                  "py-2 pl-3 text-right text-[12.5px] text-[var(--dev-text-primary)] font-medium tabular-nums whitespace-nowrap",
                  !isLast && "border-b border-[var(--dev-border-soft)]",
                )}
              >
                {r.p95Ms.toLocaleString()} ms
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)]">
        <Link
          href="/dev/performance"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View full routes
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    </DevSectionCard>
  );
}
