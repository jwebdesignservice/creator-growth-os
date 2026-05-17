import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { QA_BLOCKERS } from "@/lib/dev-dashboard/mock-data";
import type { QaBlocker, QaBlockerSeverity } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const SEVERITY_PILL: Record<QaBlockerSeverity, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const ICON_TONE: Record<QaBlockerSeverity, string> = {
  high:   "text-[var(--dev-danger-text)]",
  medium: "text-[var(--dev-warning-text)]",
  low:    "text-[var(--dev-accent-text)]",
};

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function BlockersCard({ data }: { data?: QaBlocker[] }) {
  const blockers = data ?? QA_BLOCKERS;
  return (
    <DevSectionCard
      title={
        <span className="inline-flex items-center gap-2">
          Blockers
          <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-md bg-[var(--dev-danger-soft)] text-[var(--dev-danger-text)] border border-[var(--dev-danger-border)] text-[10.5px] font-semibold">
            {blockers.length}
          </span>
        </span>
      }
      trailing={
        <Link
          href="/dev/errors?severity=critical"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View all blockers
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2">
        {blockers.map((b) => (
          <li
            key={b.id}
            className="flex items-center gap-2.5 text-[12.5px]"
          >
            <CircleAlert
              className={cn("size-4 shrink-0", ICON_TONE[b.severity])}
              strokeWidth={2}
              fill="currentColor"
              fillOpacity={0.18}
            />
            <span className="flex-1 text-[var(--dev-text-primary)] truncate">
              {b.title}
            </span>
            <span className={cn("inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0", SEVERITY_PILL[b.severity])}>
              {titleCase(b.severity)}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
