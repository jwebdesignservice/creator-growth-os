import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DevStatusBadge } from "../dev-status-badge";
import { DEPLOYMENT_STATUS } from "@/lib/dev-dashboard/mock-data";

export function DeploymentStatusCard() {
  const d = DEPLOYMENT_STATUS;
  return (
    <DevSectionCard title="Deployment Status">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-[var(--dev-text-secondary)]">Latest Deployment</div>
        <DevStatusBadge tone={d.state === "Successful" ? "success" : d.state === "Failed" ? "danger" : "warning"}>
          {d.state}
        </DevStatusBadge>
      </div>
      <dl className="space-y-2.5">
        <Row label="Deployed by" value={d.deployedBy} />
        <Row label="Time"        value={d.timeLabel} />
        <Row label="Duration"    value={d.duration} mono />
        <Row label="Version"     value={d.version} mono />
        <Row label="Commit"      value={d.commit} mono />
      </dl>

      <Link
        href="/dev/deployments"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View deployments
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <dt className="text-[var(--dev-text-secondary)]">{label}</dt>
      <dd className={"text-[var(--dev-text-primary)] font-medium " + (mono ? "tabular-nums" : "")}>
        {value}
      </dd>
    </div>
  );
}
