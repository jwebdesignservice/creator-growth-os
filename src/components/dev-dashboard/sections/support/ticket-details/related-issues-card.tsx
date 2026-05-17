import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type {
  SupportRelatedIssue,
  SupportRelatedIssueStatus,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<SupportRelatedIssueStatus, string> = {
  open:          "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  investigating: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  resolved:      "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
};

const STATUS_LABEL: Record<SupportRelatedIssueStatus, string> = {
  open:          "Open",
  investigating: "Investigating",
  resolved:      "Resolved",
};

export function RelatedIssuesCard({ data }: { data: SupportRelatedIssue[] }) {
  return (
    <DevSectionCard title="Related Issues">
      <ul className="space-y-2">
        {data.map((issue) => (
          <li key={issue.id}>
            <Link
              href={issue.href}
              className="flex items-center gap-2.5 px-1 py-1.5 -mx-1 rounded-md hover:bg-[var(--dev-surface-soft)] transition-colors"
            >
              <span className="font-mono text-[11.5px] text-[var(--dev-accent-text)] shrink-0">
                {issue.id}
              </span>
              <span className="flex-1 min-w-0 truncate text-[12.5px] text-[var(--dev-text-primary)]">
                {issue.subject}
              </span>
              <span className={cn("inline-flex items-center px-2 h-[20px] rounded-md text-[10.5px] font-semibold whitespace-nowrap shrink-0", STATUS_PILL[issue.status])}>
                {STATUS_LABEL[issue.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/dev/support"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View all related issues
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
