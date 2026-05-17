import { Gauge, UsersRound, LineChart, Network } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type {
  SupportInvestigationNotes,
  SupportTicketPriority,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const SEVERITY_PILL: Record<SupportTicketPriority, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

const SEVERITY_ICON_TILE: Record<SupportTicketPriority, string> = {
  high:   "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
  medium: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  low:    "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
};

/* Visual structure
   ────────────────
   • Notes block first (it's the narrative an agent needs to read).
   • Stats as 4 elevated tiles in a 2×2 grid (4 across at xl). Each tile
     gets a tinted icon square, a label, and an emphasized value so the
     numbers scan without effort. The severity tile uses a warm border to
     visually emphasize the field most agents act on. */
export function InternalInvestigationCard({ data }: { data: SupportInvestigationNotes }) {
  return (
    <DevSectionCard title="Internal Investigation">
      {/* Notes */}
      <section className="mb-5">
        <h4 className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-2.5">
          Investigation notes
        </h4>
        <ul className="space-y-2 text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed">
          {data.notes.map((note, i) => (
            <li key={i} className="relative pl-4">
              <span
                aria-hidden
                className="absolute left-0 top-[8px] size-1.5 rounded-full bg-[var(--dev-accent-text)]/70"
              />
              {note}
            </li>
          ))}
        </ul>
      </section>

      <div className="h-px bg-[var(--dev-border-soft)] mb-4" />

      {/* Stats as tiles. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        <StatTile
          icon={Network}
          iconTone="bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]"
          label="Affected service"
          value={<span className="text-[13px] text-[var(--dev-text-primary)] font-semibold truncate">{data.affectedService}</span>}
        />
        <StatTile
          icon={Gauge}
          iconTone={SEVERITY_ICON_TILE[data.suspectedSeverity]}
          label="Suspected severity"
          value={
            <span className={cn(
              "inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold",
              SEVERITY_PILL[data.suspectedSeverity],
            )}>
              {data.suspectedSeverity.charAt(0).toUpperCase() + data.suspectedSeverity.slice(1)}
            </span>
          }
          emphasized={data.suspectedSeverity === "high"}
        />
        <StatTile
          icon={LineChart}
          iconTone="bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]"
          label="Occurrences (24h)"
          value={
            <span className="text-[15px] text-[var(--dev-text-primary)] font-semibold tabular-nums leading-none">
              {data.occurrences24h.toLocaleString()}
            </span>
          }
        />
        <StatTile
          icon={UsersRound}
          iconTone="bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/30"
          label="Affected accounts"
          value={
            <span className="text-[15px] text-[var(--dev-text-primary)] font-semibold tabular-nums leading-none">
              {data.affectedAccounts.toLocaleString()}
            </span>
          }
        />
      </div>
    </DevSectionCard>
  );
}

function StatTile({
  icon: Icon,
  iconTone,
  label,
  value,
  emphasized,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconTone: string;
  label: string;
  value: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] min-w-0",
        emphasized && "border-[var(--dev-warning-border)]",
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("size-7 rounded-[8px] inline-flex items-center justify-center border shrink-0", iconTone)} aria-hidden>
          <Icon className="size-3.5" strokeWidth={1.9} />
        </span>
        <span className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold truncate">
          {label}
        </span>
      </div>
      <div className="min-w-0">{value}</div>
    </div>
  );
}
