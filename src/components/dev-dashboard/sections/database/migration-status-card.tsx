import { CheckCircle2, GitBranch, Clock, AlertOctagon } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DB_MIGRATION_STATUS } from "@/lib/dev-dashboard/mock-data";
import type { DbMigrationStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATE_TONE: Record<DbMigrationStatus["status"], string> = {
  Applied: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Pending: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Failed:  "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

const STATE_ICON: Record<DbMigrationStatus["status"], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Applied: CheckCircle2,
  Pending: Clock,
  Failed:  AlertOctagon,
};

export function MigrationStatusCard({ data }: { data?: DbMigrationStatus }) {
  const m = data ?? DB_MIGRATION_STATUS;
  const StateIcon = STATE_ICON[m.status];
  return (
    <DevSectionCard title="Migration Status">
      <div className="flex items-start gap-3 mb-4">
        <span
          className="size-9 rounded-[10px] inline-flex items-center justify-center bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border border-[var(--dev-accent-border)] shrink-0"
          aria-hidden
        >
          <GitBranch className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-1">
            Latest migration
          </div>
          <div className="font-mono text-[12.5px] text-[var(--dev-text-primary)] font-semibold truncate">
            {m.latestMigration}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0",
            STATE_TONE[m.status],
          )}
        >
          <StateIcon className="size-3" strokeWidth={2} />
          {m.status}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--dev-border-soft)]">
        <Stat label="Last run" value={m.lastRun} tone="muted" />
        <Stat
          label="Pending"
          value={m.pendingCount.toString()}
          tone={m.pendingCount > 0 ? "warn" : "ok"}
        />
        <Stat
          label="Failed"
          value={m.failedCount.toString()}
          tone={m.failedCount > 0 ? "danger" : "ok"}
        />
      </dl>
    </DevSectionCard>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "danger" | "muted";
}) {
  const valueClass =
    tone === "ok"     ? "text-[var(--dev-text-primary)]"   :
    tone === "warn"   ? "text-[var(--dev-warning-text)]"   :
    tone === "danger" ? "text-[var(--dev-danger-text)]"    :
                        "text-[var(--dev-text-secondary)]";
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-1">
        {label}
      </dt>
      <dd className={cn("text-[13px] font-semibold tabular-nums truncate", valueClass)}>
        {value}
      </dd>
    </div>
  );
}
