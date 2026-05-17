import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { HIGHEST_VALUE_SEGMENT } from "@/lib/dev-dashboard/mock-data";

export function HighestValueSegmentCard() {
  const s = HIGHEST_VALUE_SEGMENT;
  const Icon = s.icon;
  return (
    <DevSectionCard title="Highest Value Segment">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="size-8 rounded-[8px] inline-flex items-center justify-center bg-[var(--dev-chart-violet)]/15 text-[var(--dev-chart-violet)] border border-[var(--dev-chart-violet)]/25">
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
        <span className="text-[13.5px] font-semibold text-[var(--dev-text-primary)]">
          {s.label}
        </span>
      </div>

      <div className="text-[13px] text-[var(--dev-text-secondary)] mb-3 tabular-nums">
        {s.accounts.toLocaleString()} accounts
      </div>

      <dl className="space-y-2 mb-3">
        <Row label="Avg. retention"        value={`${s.avgRetentionPercent}%`} />
        <Row label="Avg. session duration" value={s.avgSessionDuration} />
      </dl>

      <Link
        href="/dev/analytics"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View segment analysis
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <dt className="text-[var(--dev-text-secondary)]">{label}</dt>
      <dd className="text-[var(--dev-text-primary)] font-medium tabular-nums">{value}</dd>
    </div>
  );
}
