import Link from "next/link";
import { ExternalLink, Check } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type {
  SupportEscalationWorkflow,
  SupportResolutionStage,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_DOT: Record<SupportEscalationWorkflow["escalationTone"], string> = {
  danger:  "bg-[var(--dev-danger-text)]",
  warning: "bg-[var(--dev-warning-text)]",
  info:    "bg-[var(--dev-accent-text)]",
  success: "bg-[var(--dev-success-text)]",
};

const OWNER_TONE_BG: Record<SupportEscalationWorkflow["ownerTone"], string> = {
  blue:   "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]",
  green:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  amber:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  violet: "bg-[var(--dev-chart-violet)]/12 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/30",
  rose:   "bg-[var(--dev-chart-rose)]/12  text-[var(--dev-chart-rose)]  border-[var(--dev-chart-rose)]/30",
  cyan:   "bg-[var(--dev-chart-cyan)]/12  text-[var(--dev-chart-cyan)]  border-[var(--dev-chart-cyan)]/30",
};

/* Visual structure
   ────────────────
   Top "meta row" packs the 4 fields side-by-side at xl (was a 2×2 grid)
   so the card claims less vertical real estate. Below a hairline divider,
   the resolution timeline gets a tighter vertical rhythm. The currently
   active stage uses a stronger accent ring to highlight where the work
   actually is right now. */
export function EscalationWorkflowCard({ data }: { data: SupportEscalationWorkflow }) {
  return (
    <DevSectionCard title="Escalation & Workflow">
      {/* Meta row — escalation status / owner / next action / incident link. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 mb-4">
        <Field label="Escalation status">
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[data.escalationTone])} aria-hidden />
            <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">
              {data.escalationStatus}
            </span>
          </span>
        </Field>
        <Field label="Owner">
          <span className="inline-flex items-center gap-2 min-w-0">
            <span className={cn("size-6 rounded-full inline-flex items-center justify-center border text-[10px] font-semibold shrink-0", OWNER_TONE_BG[data.ownerTone])}>
              {data.ownerInitials}
            </span>
            <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">{data.ownerName}</span>
          </span>
        </Field>
        <Field label="Next action">
          <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">{data.nextAction}</span>
        </Field>
        <Field label="Incident">
          <Link
            href={data.incidentLink.href}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
          >
            <span className="font-mono truncate">{data.incidentLink.id}</span>
            <ExternalLink className="size-3 shrink-0" strokeWidth={1.9} aria-hidden />
          </Link>
        </Field>
      </div>

      <div className="h-px bg-[var(--dev-border-soft)] mb-4" />

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
            Resolution stage
          </span>
          <span className="text-[10.5px] tabular-nums text-[var(--dev-text-muted)] font-medium">
            Step {Math.min(data.currentStageIndex + 1, data.stages.length)} of {data.stages.length}
          </span>
        </div>
        <ResolutionTimeline stages={data.stages} currentIndex={data.currentStageIndex} />
      </div>
    </DevSectionCard>
  );
}

function ResolutionTimeline({
  stages,
  currentIndex,
}: {
  stages: SupportResolutionStage[];
  currentIndex: number;
}) {
  return (
    <>
      {/* Horizontal timeline — visible at sm and up. */}
      <ol
        className="hidden sm:grid gap-2 items-start"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const upcoming = i > currentIndex;
          return (
            <li key={stage.key} className="relative flex flex-col items-center text-center min-w-0">
              {i < stages.length - 1 && (
                <span
                  className={cn(
                    "absolute top-[10px] left-1/2 w-full h-0.5",
                    done ? "bg-[var(--dev-accent)]" : "bg-[var(--dev-border)]",
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative z-10 size-5 rounded-full inline-flex items-center justify-center border-2",
                  done   && "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white",
                  active && "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white ring-4 ring-[var(--dev-accent-soft)]",
                  upcoming && "bg-[var(--dev-surface)] border-[var(--dev-border)]",
                )}
              >
                {done && <Check className="size-3" strokeWidth={3} />}
                {active && <span className="size-1.5 rounded-full bg-white" aria-hidden />}
              </span>
              <span className={cn(
                "mt-1.5 text-[11px] font-medium truncate w-full px-1",
                active   ? "text-[var(--dev-text-primary)] font-semibold" :
                done     ? "text-[var(--dev-text-secondary)]" :
                           "text-[var(--dev-text-muted)]",
              )}>
                {stage.label}
              </span>
              {stage.timestamp && (
                <span className="mt-0.5 text-[10px] text-[var(--dev-text-muted)] tabular-nums truncate w-full px-1">
                  {stage.timestamp}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Vertical timeline — mobile fallback. Avoids cramped 5-column
          row under 640px. */}
      <ol className="sm:hidden space-y-3">
        {stages.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={stage.key} className="relative flex items-start gap-3">
              {i < stages.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[9px] top-5 bottom-[-12px] w-0.5",
                    done ? "bg-[var(--dev-accent)]" : "bg-[var(--dev-border)]",
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "relative z-10 size-5 rounded-full inline-flex items-center justify-center border-2 shrink-0",
                  done   && "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white",
                  active && "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white ring-4 ring-[var(--dev-accent-soft)]",
                  !done && !active && "bg-[var(--dev-surface)] border-[var(--dev-border)]",
                )}
              >
                {done && <Check className="size-3" strokeWidth={3} />}
                {active && <span className="size-1.5 rounded-full bg-white" aria-hidden />}
              </span>
              <div className="flex-1 min-w-0 pt-px">
                <div className={cn(
                  "text-[12.5px] font-medium",
                  active   ? "text-[var(--dev-text-primary)] font-semibold" :
                  done     ? "text-[var(--dev-text-secondary)]" :
                             "text-[var(--dev-text-muted)]",
                )}>
                  {stage.label}
                </div>
                {stage.timestamp && (
                  <div className="text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
                    {stage.timestamp}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-1">
        {label}
      </div>
      <div className="truncate">{children}</div>
    </div>
  );
}
