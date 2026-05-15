import { Sprout, Repeat2, Crown, Wallet, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Milestone = {
  key: string;
  label: string;
  caption: string;
  icon: LucideIcon;
  status: "done" | "current" | "todo";
};

type Props = {
  currentStep?: number; // 1-4
};

export function LearningPath({ currentStep = 2 }: Props) {
  const milestones: Milestone[] = [
    {
      key: "start",
      label: "Start",
      caption: "Find your niche & lay the foundation",
      icon: Sprout,
      status: currentStep > 1 ? "done" : currentStep === 1 ? "current" : "todo",
    },
    {
      key: "consistency",
      label: "Build Consistency",
      caption: "Create content systems that stick",
      icon: Repeat2,
      status: currentStep > 2 ? "done" : currentStep === 2 ? "current" : "todo",
    },
    {
      key: "authority",
      label: "Grow Authority",
      caption: "Build trust, grow your audience",
      icon: Crown,
      status: currentStep > 3 ? "done" : currentStep === 3 ? "current" : "todo",
    },
    {
      key: "monetize",
      label: "Monetize",
      caption: "Turn your influence into income",
      icon: Wallet,
      status: currentStep > 4 ? "done" : currentStep === 4 ? "current" : "todo",
    },
  ];

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-[19px] text-ink-900">
          Your Learning Path
        </h3>
        <span className="text-[12px] text-rose-600 font-medium">
          Step {currentStep} of {milestones.length} · Keep going!
        </span>
      </div>

      <ol className="relative grid grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          const isDone = m.status === "done";
          const isCurrent = m.status === "current";
          return (
            <li key={m.key} className="relative">
              {/* Connector */}
              {i < milestones.length - 1 && (
                <span
                  className={cn(
                    "hidden lg:block absolute top-6 left-[calc(50%+22px)] right-[-12px] h-px",
                    isDone ? "bg-rose-500" : "bg-ink-200",
                  )}
                />
              )}
              <div className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    "relative size-12 rounded-full inline-flex items-center justify-center mb-2 transition-colors",
                    isDone
                      ? "bg-rose-500 text-white"
                      : isCurrent
                        ? "bg-rose-100 text-rose-600 ring-4 ring-rose-100/60"
                        : "bg-cream-100 text-ink-400 border border-ink-200",
                  )}
                >
                  {isDone ? (
                    <Check className="size-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="size-5" strokeWidth={1.8} />
                  )}
                </span>
                <div
                  className={cn(
                    "text-[13px] font-semibold leading-tight",
                    isDone || isCurrent ? "text-ink-900" : "text-ink-500",
                  )}
                >
                  {m.label}
                </div>
                <div className="text-[11px] text-ink-500 mt-1 max-w-[160px] leading-snug">
                  {m.caption}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
