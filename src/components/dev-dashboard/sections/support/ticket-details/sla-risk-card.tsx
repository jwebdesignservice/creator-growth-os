import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import { DevDonut } from "../../../dev-donut";
import type { SupportSlaRisk } from "@/lib/dev-dashboard/types";

const LABEL_TONE: Record<SupportSlaRisk["label"], string> = {
  Healthy:   "text-[var(--dev-success-text)]",
  "At Risk": "text-[var(--dev-warning-text)]",
  Breached:  "text-[var(--dev-danger-text)]",
};

const LABEL_COLOR: Record<SupportSlaRisk["label"], string> = {
  Healthy:   "var(--dev-success)",
  "At Risk": "var(--dev-warning)",
  Breached:  "var(--dev-danger)",
};

export function SlaRiskCard({ data }: { data: SupportSlaRisk }) {
  return (
    <DevSectionCard title="SLA Risk">
      <div className="flex items-center gap-4">
        <DevDonut
          slices={[
            { value: data.percent,        color: LABEL_COLOR[data.label]     },
            { value: 100 - data.percent,  color: "var(--dev-surface-elev)"   },
          ]}
          size={96}
          strokeWidth={11}
          trackColor="var(--dev-surface-elev)"
        >
          <span className="text-[18px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
            {data.percent}%
          </span>
          <span className={"text-[10.5px] mt-1 font-semibold " + LABEL_TONE[data.label]}>
            {data.label}
          </span>
        </DevDonut>

        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed mb-1.5">
            {data.headline}
          </p>
          <div className="text-[11px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
            Time remaining
          </div>
          <div className="text-[14px] text-[var(--dev-warning-text)] font-semibold tabular-nums leading-tight">
            {data.timeRemaining}
          </div>
        </div>
      </div>

      <Link
        href="/dev/performance"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View SLA report
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
