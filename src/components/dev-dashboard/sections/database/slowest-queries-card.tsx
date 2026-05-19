import Link from "next/link";
import { ArrowRight, Timer } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DB_SLOW_QUERIES } from "@/lib/dev-dashboard/mock-data";
import type { DbSlowQueryRow } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

/** p95 thresholds for the inline urgency stripe. */
function urgencyFor(p95Ms: number): "ok" | "warn" | "crit" {
  if (p95Ms >= 1000) return "crit";
  if (p95Ms >= 500)  return "warn";
  return "ok";
}

const URGENCY_TONE: Record<"ok" | "warn" | "crit", { dot: string; text: string }> = {
  ok:   { dot: "bg-[var(--dev-success-text)]", text: "text-[var(--dev-success-text)]" },
  warn: { dot: "bg-[var(--dev-warning-text)]", text: "text-[var(--dev-warning-text)]" },
  crit: { dot: "bg-[var(--dev-danger-text)]",  text: "text-[var(--dev-danger-text)]"  },
};

export function SlowestQueriesCard({ data }: { data?: DbSlowQueryRow[] }) {
  const rows = data ?? DB_SLOW_QUERIES;
  const peak = rows.length > 0 ? Math.max(...rows.map((r) => r.p95Ms)) : 1;

  return (
    <DevSectionCard
      title="Slowest Queries"
      trailing={
        <Link
          href="/dev/performance"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View full report
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {rows.map((r) => {
          const u = urgencyFor(r.p95Ms);
          const tone = URGENCY_TONE[u];
          const widthPct = Math.max(8, Math.round((r.p95Ms / peak) * 100));
          return (
            <li key={r.key} className="text-[12.5px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("size-1.5 rounded-full shrink-0", tone.dot)} aria-hidden />
                <span className="font-mono text-[12px] text-[var(--dev-text-secondary)] truncate flex-1 min-w-0">
                  {r.query}
                </span>
                <span className={cn("inline-flex items-center gap-1 tabular-nums font-semibold whitespace-nowrap", tone.text)}>
                  <Timer className="size-3" strokeWidth={2} aria-hidden />
                  {r.p95Ms.toLocaleString()}ms
                </span>
              </div>
              {/* Visual urgency bar so the eye can scan the list at a glance. */}
              <div
                className="h-1 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden"
                role="presentation"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    u === "crit" && "bg-[var(--dev-danger)]",
                    u === "warn" && "bg-[var(--dev-warning)]",
                    u === "ok"   && "bg-[var(--dev-success)]",
                  )}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
