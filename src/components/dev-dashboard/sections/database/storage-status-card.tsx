import { HardDrive } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DB_STORAGE_BUCKETS } from "@/lib/dev-dashboard/mock-data";
import type { DbStorageBucketRow, DbStorageBucketStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<DbStorageBucketStatus, string> = {
  Healthy:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Warning:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Critical: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

const BAR_TONE: Record<DbStorageBucketStatus, string> = {
  Healthy:  "bg-[var(--dev-success)]",
  Warning:  "bg-[var(--dev-warning)]",
  Critical: "bg-[var(--dev-danger)]",
};

export function StorageStatusCard({ data }: { data?: DbStorageBucketRow[] }) {
  const rows = data ?? DB_STORAGE_BUCKETS;
  return (
    <DevSectionCard title="Storage Bucket Status">
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.bucket} className="text-[12.5px]">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="size-6 rounded-[7px] inline-flex items-center justify-center bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] shrink-0"
                aria-hidden
              >
                <HardDrive className="size-3.5" strokeWidth={1.9} />
              </span>
              <span className="font-mono text-[12px] text-[var(--dev-text-primary)] flex-1 min-w-0 truncate">
                {r.bucket}
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-semibold whitespace-nowrap shrink-0",
                  STATUS_PILL[r.status],
                )}
              >
                {r.status}
              </span>
              <span className="text-[12px] tabular-nums text-[var(--dev-text-primary)] font-semibold w-14 text-right">
                {r.size}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full bg-[var(--dev-surface-elev)] overflow-hidden"
              role="progressbar"
              aria-valuenow={r.usagePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${r.bucket} usage`}
            >
              <div
                className={cn("h-full rounded-full", BAR_TONE[r.status])}
                style={{ width: `${Math.max(2, r.usagePercent)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
