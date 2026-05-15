import { Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

type StepKey = "stage" | "platform" | "goals" | "content" | "complete";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "stage", label: "Stage" },
  { key: "platform", label: "Platform" },
  { key: "goals", label: "Goals" },
  { key: "content", label: "Content" },
];

type Props = {
  current: StepKey;
};

export function StepHeader({ current }: Props) {
  const currentIndex =
    current === "complete" ? STEPS.length : STEPS.findIndex((s) => s.key === current);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        {/* Logo lockup */}
        <div className="flex items-start gap-3">
          <BrandMark size={42} />
          <div className="text-[12.5px] font-medium leading-[1.25] text-ink-900 pt-0.5">
            How To Become
            <br />
            A Successful
            <br />
            Social Media Influencer
          </div>
        </div>

        {/* Step counter + time */}
        <div className="flex items-center gap-3">
          {current === "complete" ? (
            <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success font-medium">
              <CheckCircle2 className="size-4" strokeWidth={2} />
              Onboarding complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700 font-medium">
              <Sparkles
                className="size-4 text-rose-500"
                strokeWidth={2}
              />
              Step {currentIndex + 1} of {STEPS.length}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[10px] bg-white border border-ink-100 text-[12.5px] text-ink-700">
            <Clock className="size-3.5 text-ink-500" strokeWidth={2} />
            Takes about 2 min
          </span>
        </div>
      </div>

      {/* Step indicator */}
      <ol className="grid grid-cols-4 gap-2 relative">
        {STEPS.map((step, idx) => {
          const isCurrent = current === step.key;
          const isComplete = idx < currentIndex || current === "complete";
          return (
            <li key={step.key} className="flex flex-col items-center gap-1.5">
              <div className="relative w-full flex items-center justify-center">
                {/* Connector line (left of this circle, except first) */}
                {idx > 0 && (
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-px",
                      idx <= currentIndex || current === "complete"
                        ? "bg-rose-500"
                        : "bg-ink-200",
                    )}
                    style={{ width: "calc(50% - 18px)" }}
                  />
                )}
                {/* Connector line (right of this circle, except last) */}
                {idx < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "absolute right-0 top-1/2 -translate-y-1/2 h-px",
                      idx < currentIndex || current === "complete"
                        ? "bg-rose-500"
                        : "bg-ink-200",
                    )}
                    style={{ width: "calc(50% - 18px)" }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 inline-flex items-center justify-center size-9 rounded-full font-semibold text-[13.5px] transition-colors",
                    isComplete
                      ? "bg-rose-500 text-white"
                      : isCurrent
                        ? "bg-rose-500 text-white ring-4 ring-rose-100"
                        : "bg-white border-2 border-ink-200 text-ink-500",
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2
                      className="size-5"
                      strokeWidth={2.5}
                      fill="currentColor"
                    />
                  ) : (
                    idx + 1
                  )}
                </span>
              </div>
              <span
                className={cn(
                  "text-[12.5px] font-medium",
                  isCurrent || isComplete ? "text-ink-900" : "text-ink-500",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
