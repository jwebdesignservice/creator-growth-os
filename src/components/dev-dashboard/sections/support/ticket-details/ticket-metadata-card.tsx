import { Globe, Box, Map, Code2, Monitor, Cpu } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type { SupportTicketMetadata } from "@/lib/dev-dashboard/types";

export function TicketMetadataCard({ data }: { data: SupportTicketMetadata }) {
  return (
    <DevSectionCard title="Ticket Metadata">
      <dl className="space-y-2.5">
        <Row icon={Globe}   label="Source"           value={data.source} />
        <Row icon={Box}     label="Product Area"     value={data.productArea} />
        <Row icon={Map}     label="Region"           value={data.region} />
        <Row icon={Code2}   label="App Version"      value={<span className="font-mono">{data.appVersion}</span>} />
        <Row icon={Monitor} label="Browser"          value={data.browser} />
        <Row icon={Cpu}     label="Operating System" value={data.operatingSystem} />
      </dl>
    </DevSectionCard>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <dt className="text-[var(--dev-text-muted)]">{label}</dt>
      <dd className="inline-flex items-center gap-1.5 text-[var(--dev-text-primary)] font-medium min-w-0 truncate">
        <span className="truncate">{value}</span>
        <Icon className="size-3.5 text-[var(--dev-text-muted)] shrink-0" strokeWidth={1.9} aria-hidden />
      </dd>
    </div>
  );
}
