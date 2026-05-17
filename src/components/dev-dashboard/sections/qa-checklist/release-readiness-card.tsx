import { DevSectionCard } from "../../dev-section-card";
import { DevDonut } from "../../dev-donut";
import { QA_RELEASE_READINESS } from "@/lib/dev-dashboard/mock-data";
import type { QaReleaseReadiness } from "@/lib/dev-dashboard/types";

export function ReleaseReadinessCard({ data }: { data?: QaReleaseReadiness }) {
  const r = data ?? QA_RELEASE_READINESS;
  return (
    <DevSectionCard title="Release Readiness">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 items-center">
        <DevDonut
          slices={[
            { value: r.percent,        color: "var(--dev-accent)"        },
            { value: 100 - r.percent,  color: "var(--dev-surface-elev)"  },
          ]}
          size={104}
          strokeWidth={12}
          trackColor="var(--dev-surface-elev)"
        >
          <span className="text-[20px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
            {r.percent}%
          </span>
        </DevDonut>

        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[var(--dev-text-primary)] leading-snug mb-1">
            {r.headline}
          </div>
          <p className="text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed mb-3">
            {r.body}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-[var(--dev-text-muted)]">
            <span>Last run: {r.lastRun}</span>
            <span className="text-[var(--dev-text-faint)]" aria-hidden>•</span>
            <span className="font-mono">{r.release}</span>
          </div>
        </div>
      </div>
    </DevSectionCard>
  );
}
