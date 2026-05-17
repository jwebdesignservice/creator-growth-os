import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DevSparkline } from "../dev-sparkline";
import { USAGE_CHART } from "@/lib/dev-dashboard/mock-data";

export function UsageOverviewCard() {
  return (
    <DevSectionCard
      title={
        <span>
          Usage Overview <span className="text-[var(--dev-text-muted)] font-normal">(24h)</span>
        </span>
      }
      trailing={
        <Link
          href="/dev/analytics"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View full analytics
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pr-3 py-1 text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
          {USAGE_CHART.yLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 min-w-0">
          <div className="relative h-[180px]">
            {/* Horizontal gridlines */}
            <div className="absolute inset-0 flex flex-col-reverse justify-between pointer-events-none">
              {USAGE_CHART.yLabels.map((_, i) => (
                <div
                  key={i}
                  className="border-t border-dashed border-[var(--dev-border-soft)] h-0"
                />
              ))}
            </div>
            <DevSparkline
              data={USAGE_CHART.series}
              color="var(--dev-chart-blue)"
              gradientId="usage-grad"
              height={180}
              className="relative"
            />
          </div>

          {/* X axis */}
          <div className="mt-2 flex justify-between text-[10.5px] text-[var(--dev-text-muted)] tabular-nums">
            {USAGE_CHART.timeLabels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </DevSectionCard>
  );
}
