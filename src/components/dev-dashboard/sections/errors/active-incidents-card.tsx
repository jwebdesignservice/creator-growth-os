import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { ACTIVE_INCIDENTS } from "@/lib/dev-dashboard/mock-data";
import type { ActiveIncident, ErrorSeverity } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const SEVERITY_PILL: Record<ErrorSeverity, string> = {
  critical: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  high:     "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium:   "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:      "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const ICON_COLOR: Record<ErrorSeverity, string> = {
  critical: "text-[var(--dev-danger-text)]",
  high:     "text-[var(--dev-danger-text)]",
  medium:   "text-[var(--dev-warning-text)]",
  low:      "text-[var(--dev-accent-text)]",
};

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ActiveIncidentsCard({ data }: { data?: ActiveIncident[] }) {
  const incidents = data ?? ACTIVE_INCIDENTS;
  return (
    <DevSectionCard
      title="Active Incidents"
      trailing={
        <Link
          href="/dev/errors?status=investigating"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View all incidents
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2">
        {incidents.map((inc) => (
          <li
            key={inc.id}
            className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)]"
          >
            <CircleAlert
              className={cn("size-4 shrink-0", ICON_COLOR[inc.severity])}
              strokeWidth={2}
              fill="currentColor"
              fillOpacity={0.18}
            />
            <span className="font-mono text-[11.5px] text-[var(--dev-text-muted)] shrink-0">
              {inc.id}
            </span>
            <span className="flex-1 text-[12.5px] text-[var(--dev-text-primary)] truncate">
              {inc.title}
            </span>
            <span className={cn("inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap", SEVERITY_PILL[inc.severity])}>
              {titleCase(inc.severity)}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
