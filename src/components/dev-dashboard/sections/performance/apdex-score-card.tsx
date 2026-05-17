import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { ApdexBand, ApdexSummary } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const BAND_PILL: Record<ApdexBand, string> = {
  Excellent:    "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Good:         "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  Fair:         "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Poor:         "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  Unacceptable: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

export function ApdexScoreCard({ apdex }: { apdex: ApdexSummary }) {
  const a = apdex;
  const deltaUp = a.deltaDirection === "up";
  const deltaColor = a.deltaIsGood
    ? "text-[var(--dev-success-text)]"
    : "text-[var(--dev-danger-text)]";
  const DeltaIcon = deltaUp ? ArrowUp : ArrowDown;
  // Clamp marker position to [0,1] in case score drifts outside the band.
  const markerPct = Math.max(0, Math.min(1, a.score)) * 100;

  return (
    <DevSectionCard title="Apdex Score">
      <div className="flex items-center gap-2.5">
        <div className="text-[34px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
          {a.score.toFixed(2)}
        </div>
        <span
          className={cn(
            "inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap",
            BAND_PILL[a.band],
          )}
        >
          {a.band}
        </span>
      </div>

      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium leading-none tabular-nums",
          deltaColor,
        )}
      >
        <DeltaIcon className="size-3" strokeWidth={2.5} />
        <span className="font-semibold">{a.delta}</span>
        <span className="text-[var(--dev-text-muted)] font-medium">{a.baseline}</span>
      </div>

      {/* Quality scale — gradient bar with marker */}
      <div className="mt-5">
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, var(--dev-danger) 0%, var(--dev-warning) 50%, var(--dev-success) 100%)",
          }}
          role="img"
          aria-label={`Apdex score ${a.score.toFixed(2)} on a 0 to 1 scale, currently ${a.band}`}
        >
          <span
            className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-white border-2 border-[var(--dev-surface)] shadow"
            style={{ left: `calc(${markerPct}% - 6px)` }}
            aria-hidden
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
          <span>0</span>
          <span>0.5</span>
          <span>0.7</span>
          <span>1</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)]">
        <Link
          href="/dev/analytics"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View apdex trend
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    </DevSectionCard>
  );
}
