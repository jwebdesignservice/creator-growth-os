import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DevDonut } from "../../dev-donut";
import { SUPPORT_SLA_SUMMARY } from "@/lib/dev-dashboard/mock-data";
import type { SupportSlaSummary } from "@/lib/dev-dashboard/types";

type Props = {
  data?: SupportSlaSummary;
};

export function SlaPerformanceCard({ data }: Props) {
  const s = data ?? SUPPORT_SLA_SUMMARY;
  return (
    <DevSectionCard
      title="SLA Performance"
      trailing={
        <span className="text-[11.5px] text-[var(--dev-text-muted)] font-medium">
          (Last 7 Days)
        </span>
      }
    >
      {/*
        Layout: donut + legend.
        - At narrow card widths (xl:col-span-3, lg full-bleed sub-cell, tablet
          2-up split): stack donut on top, legend full-width below. Prevents
          legend rows like "9 (23%) MET" from wrapping the count below the
          colored dot when there's no horizontal room.
        - At sm+ outside that narrow xl rail: side-by-side reads cleaner.
        The `@container` directive would be ideal here but isn't part of the
        project tokens — `sm:flex-row` is a pragmatic substitute that still
        stacks for mobile and side-by-sides on tablet+. The card itself sits
        in a min-w-0 grid cell, so the layout responds to the actual cell
        width instead of viewport breakpoints alone.
      */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        <DevDonut
          slices={s.buckets.map((b) => ({ value: b.count, color: b.color }))}
          size={132}
          strokeWidth={14}
        >
          <span className="text-[22px] font-semibold text-[var(--dev-text-primary)] leading-none tabular-nums">
            {s.metPercent}%
          </span>
          <span className="mt-1 text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
            Met
          </span>
        </DevDonut>

        <ul className="w-full sm:flex-1 min-w-0 space-y-2.5">
          {s.buckets.map((b) => (
            <li key={b.key} className="flex items-center gap-2.5 whitespace-nowrap">
              <span
                className="inline-block size-2.5 rounded-full shrink-0"
                style={{ background: b.color }}
                aria-hidden
              />
              <span className="text-[12.5px] text-[var(--dev-text-primary)] tabular-nums">
                {b.count} ({b.percent}%)
              </span>
              <span className="text-[12px] text-[var(--dev-text-muted)] ml-auto truncate">
                {b.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/dev/support?view=sla"
        scroll={false}
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View SLA report
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
