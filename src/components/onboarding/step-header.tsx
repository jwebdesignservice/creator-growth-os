import { Clock } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { STEPS, type StepKey } from "./types";

type Props = {
  current: StepKey;
};

/**
 * Slim quiz chrome: brand mark · "Question N of 6" · time estimate, over a
 * single animated progress bar. One glance tells the user exactly where they
 * are and how little is left — no step-name decoding required.
 */
export function StepHeader({ current }: Props) {
  const idx = STEPS.indexOf(current);
  const pct = ((idx + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark size={30} />
          <span className="text-[14px] font-bold tracking-tight text-ink-900 truncate">
            Profluencer
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[13px] font-semibold text-ink-700 tabular-nums">
            Question {idx + 1}{" "}
            <span className="font-normal text-ink-400">of {STEPS.length}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-cream-100 text-[12px] text-ink-500">
            <Clock className="size-3.5" strokeWidth={2} />
            ~1 min
          </span>
        </div>
      </div>

      {/* progress */}
      <div
        className="h-1.5 rounded-full bg-cream-200 overflow-hidden"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={idx + 1}
        aria-label={`Question ${idx + 1} of ${STEPS.length}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
