import { Server } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DB_RPC_HEALTH } from "@/lib/dev-dashboard/mock-data";
import type { DbRpcRow, DbRpcStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<DbRpcStatus, string> = {
  Healthy:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Warning:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Critical: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

const LATENCY_TONE: Record<DbRpcStatus, string> = {
  Healthy:  "text-[var(--dev-text-primary)]",
  Warning:  "text-[var(--dev-warning-text)]",
  Critical: "text-[var(--dev-danger-text)]",
};

export function RpcHealthCard({ data }: { data?: DbRpcRow[] }) {
  const rows = data ?? DB_RPC_HEALTH;
  return (
    <DevSectionCard title="RPC / Functions Health">
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.fn} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="size-6 rounded-[7px] inline-flex items-center justify-center bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] shrink-0"
              aria-hidden
            >
              <Server className="size-3.5" strokeWidth={1.9} />
            </span>
            <span className="font-mono text-[12px] text-[var(--dev-text-primary)] flex-1 min-w-0 truncate">
              {r.fn}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-semibold whitespace-nowrap shrink-0",
                STATUS_PILL[r.status],
              )}
            >
              {r.status}
            </span>
            <span
              className={cn(
                "tabular-nums font-semibold w-14 text-right",
                LATENCY_TONE[r.status],
              )}
            >
              {r.avgMs}ms
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
