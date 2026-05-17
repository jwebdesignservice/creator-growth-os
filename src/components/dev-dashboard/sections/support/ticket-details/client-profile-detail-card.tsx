import Link from "next/link";
import { ExternalLink, Building2, ShieldCheck, UserCog, MessageSquare } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type {
  SupportClientAccountHealth,
  SupportClientProfileDetail,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const HEALTH_TONE: Record<SupportClientAccountHealth, string> = {
  Healthy:  "text-[var(--dev-success-text)]",
  "At Risk":"text-[var(--dev-warning-text)]",
  Critical: "text-[var(--dev-danger-text)]",
};

/** Quick-link icon mapping. Falls back to ExternalLink. */
const QUICK_LINK_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "ql-account":     Building2,
  "ql-tickets":     MessageSquare,
  "ql-impersonate": UserCog,
  "ql-contact":     ShieldCheck,
};

export function ClientProfileDetailCard({ data }: { data: SupportClientProfileDetail }) {
  return (
    <DevSectionCard title="Client Profile">
      <dl className="space-y-2.5">
        <Row label="Company"          value={
          <span className="inline-flex items-center gap-1.5">
            <span className="font-medium text-[var(--dev-text-primary)] truncate">{data.company}</span>
            <span className="size-1.5 rounded-full bg-[var(--dev-success-text)] shrink-0" aria-hidden />
          </span>
        } />
        <Row label="Account Health"   value={
          <span className={cn("font-semibold", HEALTH_TONE[data.accountHealth])}>{data.accountHealth}</span>
        } />
        <Row label="Plan"             value={<span className="text-[var(--dev-text-primary)] font-medium">{data.plan}</span>} />
        <Row label="Previous tickets" value={
          <span className="text-[var(--dev-text-primary)] tabular-nums">
            {data.previousTicketsTotal}{" "}
            <span className="text-[var(--dev-text-muted)]">({data.previousTicketsOpen} open)</span>
          </span>
        } />
        <Row label="Last activity"    value={
          <span className="text-[var(--dev-text-primary)] tabular-nums">{data.lastActivity}</span>
        } />
      </dl>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)]">
        <div className="text-[11px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-2">
          Quick Links
        </div>
        <ul className="space-y-1">
          {data.quickLinks.map((link) => {
            const Icon = QUICK_LINK_ICONS[link.id] ?? ExternalLink;
            return (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="flex items-center gap-2 px-1 py-1.5 -mx-1 rounded-md text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] hover:bg-[var(--dev-surface-soft)] transition-colors"
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.9} />
                  <span className="flex-1 truncate">{link.label}</span>
                  {link.external && (
                    <ExternalLink className="size-3 text-[var(--dev-text-muted)] shrink-0" strokeWidth={1.9} aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </DevSectionCard>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <dt className="text-[var(--dev-text-muted)]">{label}</dt>
      <dd className="text-right min-w-0 truncate">{value}</dd>
    </div>
  );
}
