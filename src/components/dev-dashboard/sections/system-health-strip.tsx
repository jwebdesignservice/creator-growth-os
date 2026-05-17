import { CircleCheck } from "lucide-react";
import { sparklinePath } from "@/lib/dev-dashboard/dev-utils";
import { SYSTEM_OVERALL_STATUS, SYSTEM_SERVICES } from "@/lib/dev-dashboard/mock-data";
import type { ServiceTone } from "@/lib/dev-dashboard/types";

const TONE_BG: Record<ServiceTone, string> = {
  blue:   "bg-[var(--dev-chart-blue)]/15   text-[var(--dev-chart-blue)]   border-[var(--dev-chart-blue)]/25",
  purple: "bg-[var(--dev-chart-purple)]/15 text-[var(--dev-chart-purple)] border-[var(--dev-chart-purple)]/25",
  green:  "bg-[var(--dev-chart-green)]/15  text-[var(--dev-chart-green)]  border-[var(--dev-chart-green)]/25",
  amber:  "bg-[var(--dev-chart-amber)]/15  text-[var(--dev-chart-amber)]  border-[var(--dev-chart-amber)]/25",
  cyan:   "bg-[var(--dev-chart-cyan)]/15   text-[var(--dev-chart-cyan)]   border-[var(--dev-chart-cyan)]/25",
  rose:   "bg-[var(--dev-chart-rose)]/15   text-[var(--dev-chart-rose)]   border-[var(--dev-chart-rose)]/25",
  pink:   "bg-[var(--dev-chart-pink)]/15   text-[var(--dev-chart-pink)]   border-[var(--dev-chart-pink)]/25",
  violet: "bg-[var(--dev-chart-violet)]/15 text-[var(--dev-chart-violet)] border-[var(--dev-chart-violet)]/25",
};

export function SystemHealthStrip() {
  const overallOk = SYSTEM_OVERALL_STATUS === "operational";
  const pulse = [40, 42, 40, 44, 42, 41, 43, 41, 44, 42, 42];

  return (
    <section className="grid grid-cols-1 gap-[var(--mobile-grid-gap)] sm:gap-3 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
      {/* Overall status */}
      <div className="dev-card p-4 flex flex-col justify-between gap-3 min-h-[140px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11.5px] text-[var(--dev-text-muted)] mb-1">Overall Status</div>
            <div className="text-[22px] font-semibold text-[var(--dev-success-text)] leading-tight">
              {overallOk ? "Operational" : "Degraded"}
            </div>
          </div>
          <div className="size-9 shrink-0 rounded-full bg-[var(--dev-success-soft)] border border-[var(--dev-success-border)] inline-flex items-center justify-center">
            <CircleCheck className="size-5 text-[var(--dev-success-text)]" strokeWidth={2} />
          </div>
        </div>
        <div className="text-[12px] text-[var(--dev-text-muted)]">
          All systems are running normally
        </div>
        {/* Subtle pulse line */}
        <svg viewBox="0 0 240 24" width="100%" height="24" preserveAspectRatio="none" aria-hidden>
          <path
            d={sparklinePath(pulse, 240, 24, 4)}
            fill="none"
            stroke="var(--dev-success-text)"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Service tiles — auto-fit grid. Tile min-width is tuned so it lays out:
            2-col at very small mobile (≥360px), 3 at sm, 4 at md, up to 7 at lg+.
            min-h-0 lets the row collapse cleanly when the outer grid stacks. */}
      <div
        className="grid gap-[var(--mobile-grid-gap)] sm:gap-3 min-w-0"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 8rem), 1fr))" }}
      >
        {SYSTEM_SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="dev-card p-3 flex flex-col items-center text-center min-h-[132px] gap-2 justify-between"
            >
              <div
                className={
                  "size-9 rounded-[10px] inline-flex items-center justify-center border shrink-0 " + TONE_BG[s.tone]
                }
              >
                <Icon className="size-[18px]" strokeWidth={1.8} />
              </div>
              <div className="space-y-0.5 min-w-0 w-full">
                <div className="text-[12.5px] font-semibold text-[var(--dev-text-primary)] leading-tight truncate">
                  {s.label}
                </div>
                <div className="text-[11px] text-[var(--dev-success-text)]">
                  {labelForStatus(s.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function labelForStatus(status: string) {
  if (status === "operational") return "Operational";
  if (status === "degraded") return "Degraded";
  if (status === "maintenance") return "Maintenance";
  return "Down";
}
