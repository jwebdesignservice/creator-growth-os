import { DevSectionCard } from "../../dev-section-card";
import { TOP_AFFECTED_SERVICES } from "@/lib/dev-dashboard/mock-data";
import type {
  AffectedService,
  AffectedServiceStatus,
  ServiceTone,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const TONE_BG: Record<ServiceTone, string> = {
  blue:   "bg-[var(--dev-chart-blue)]/15   text-[var(--dev-chart-blue)]",
  purple: "bg-[var(--dev-chart-purple)]/15 text-[var(--dev-chart-purple)]",
  green:  "bg-[var(--dev-chart-green)]/15  text-[var(--dev-chart-green)]",
  amber:  "bg-[var(--dev-chart-amber)]/15  text-[var(--dev-chart-amber)]",
  cyan:   "bg-[var(--dev-chart-cyan)]/15   text-[var(--dev-chart-cyan)]",
  rose:   "bg-[var(--dev-chart-rose)]/15   text-[var(--dev-chart-rose)]",
  pink:   "bg-[var(--dev-chart-pink)]/15   text-[var(--dev-chart-pink)]",
  violet: "bg-[var(--dev-chart-violet)]/15 text-[var(--dev-chart-violet)]",
};

const STATUS_PILL: Record<AffectedServiceStatus, string> = {
  operational: "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  degraded:    "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  down:        "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

function statusLabel(s: AffectedServiceStatus) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function TopAffectedServicesCard({ data }: { data?: AffectedService[] }) {
  const services = data ?? TOP_AFFECTED_SERVICES;
  return (
    <DevSectionCard title="Top Affected Services">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-0">
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] pb-2">Service</div>
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] pb-2 text-right">Errors (24h)</div>
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] pb-2 text-right">Status</div>

        {services.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === services.length - 1;
          return (
            <div key={s.key} className="contents">
              <div className={cn("flex items-center gap-2.5 py-2", !isLast && "border-b border-[var(--dev-border-soft)]")}>
                <div className={cn("size-7 rounded-[8px] inline-flex items-center justify-center shrink-0", TONE_BG[s.tone])}>
                  <Icon className="size-[15px]" strokeWidth={1.9} />
                </div>
                <span className="text-[13px] text-[var(--dev-text-primary)] font-medium truncate">
                  {s.label}
                </span>
              </div>
              <div className={cn("text-[13px] text-[var(--dev-text-primary)] tabular-nums text-right py-2", !isLast && "border-b border-[var(--dev-border-soft)]")}>
                {s.errors24h}
              </div>
              <div className={cn("text-right py-2", !isLast && "border-b border-[var(--dev-border-soft)]")}>
                <span className={cn("inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap", STATUS_PILL[s.status])}>
                  {statusLabel(s.status)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DevSectionCard>
  );
}
