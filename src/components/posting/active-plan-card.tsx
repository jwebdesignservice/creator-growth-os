import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PlanActionsMenu } from "./plan-actions-menu";

type Props = {
  title: string;
  description: string | null;
  progress: number;
  weekLabel: string;
  href?: string;
  planId?: string;
};

export function ActivePlanCard({
  title,
  description,
  progress,
  weekLabel,
  href = "/posting?view=calendar",
  planId,
}: Props) {
  return (
    <section className="card overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] items-center gap-5 p-5">
        {/* Cover ornament */}
        <div className="h-[120px] sm:h-[140px] rounded-[14px] bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/40 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="56"
              height="56"
              viewBox="0 0 48 48"
              fill="none"
              className="text-rose-300"
              aria-hidden
            >
              <rect x="8" y="6" width="32" height="36" rx="4" fill="currentColor" />
              <rect x="14" y="12" width="20" height="2" rx="1" fill="white" opacity="0.7" />
              <rect x="14" y="17" width="16" height="2" rx="1" fill="white" opacity="0.7" />
              <rect x="14" y="22" width="20" height="2" rx="1" fill="white" opacity="0.5" />
              <rect x="14" y="27" width="14" height="2" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-[10.5px] tracking-[0.12em] uppercase text-rose-600 font-semibold mb-1">
            Active Plan
          </div>
          <h3 className="font-display text-[24px] text-ink-900 leading-tight mb-1">
            {title}
          </h3>
          <p className="text-[13px] text-ink-500 leading-snug mb-4 max-w-md">
            {description ??
              "A balanced weekly plan focused on growth, engagement and conversion."}
          </p>
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-ink-500 font-medium">
                Progress
              </span>
              <span className="text-[12.5px] text-ink-900 font-semibold tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-ink-500">{weekLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          {planId && <PlanActionsMenu planId={planId} />}
          <Link
            href={href}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-white border border-ink-200 hover:bg-cream-100 text-ink-900 text-[13.5px] font-medium transition-colors"
          >
            <CalendarDays className="size-4 text-rose-500" strokeWidth={2} />
            View Calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
