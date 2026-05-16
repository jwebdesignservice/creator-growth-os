import Link from "next/link";
import { TriangleAlert, CircleAlert, ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DevStatusBadge } from "../dev-status-badge";
import { CRITICAL_ALERTS } from "@/lib/dev-dashboard/mock-data";
import type { AlertSeverity } from "@/lib/dev-dashboard/types";

const SEVERITY_TONE: Record<AlertSeverity, "danger" | "warning" | "info"> = {
  high: "danger",
  medium: "warning",
  low: "info",
};

export function CriticalAlertsCard() {
  return (
    <DevSectionCard
      title={
        <span className="inline-flex items-center gap-2">
          <TriangleAlert className="size-4 text-[var(--dev-danger-text)]" strokeWidth={2} />
          Critical Alerts
        </span>
      }
      trailing={
        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md bg-[var(--dev-danger-soft)] text-[var(--dev-danger-text)] border border-[var(--dev-danger-border)] text-[11px] font-semibold">
          {CRITICAL_ALERTS.length}
        </span>
      }
    >
      <ul className="space-y-2.5">
        {CRITICAL_ALERTS.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 p-2.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)]"
          >
            <CircleAlert
              className={
                "size-4 shrink-0 " +
                (a.severity === "high" ? "text-[var(--dev-danger-text)]" : "text-[var(--dev-warning-text)]")
              }
              strokeWidth={2}
              fill="currentColor"
              fillOpacity={0.15}
            />
            <span className="flex-1 text-[13px] text-[var(--dev-text-primary)] truncate">
              {a.message}
            </span>
            <DevStatusBadge tone={SEVERITY_TONE[a.severity]}>
              {capitalize(a.severity)}
            </DevStatusBadge>
            <span className="text-[11.5px] text-[var(--dev-text-muted)] tabular-nums shrink-0">
              {a.timeLabel}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/dev/errors"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View all alerts
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
