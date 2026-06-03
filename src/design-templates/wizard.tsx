/* Wizard ──────────────────────────────────────────────────────────────────
   Full multi-step form panel — step indicator + form body + back/next
   footer — and the completion step. Mirrors src/components/onboarding/
   {step-header,flow}.tsx. Distinct from the Stepper indicator in Navigation.
   ───────────────────────────────────────────────────────────────────── */

import { CircleCheck, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const STEPS = ["Stage", "Platform", "Goals", "Content"];

export function WizardPanel() {
  const current = 2; // "Goals"
  return (
    <div className="card p-6 w-[520px] max-w-full">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-700 font-medium">
          <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
          Step {current + 1} of {STEPS.length}
        </span>
        <span className="text-[12px] text-ink-500">Takes about 2 min</span>
      </div>

      <ol className="grid grid-cols-4 gap-2 mb-6">
        {STEPS.map((s, idx) => {
          const done = idx < current;
          const cur = idx === current;
          return (
            <li key={s} className="flex flex-col items-center gap-1.5">
              <span className={cn("inline-flex items-center justify-center size-9 rounded-full font-semibold text-[13.5px]", done ? "bg-rose-500 text-white" : cur ? "bg-rose-500 text-white ring-4 ring-rose-100" : "bg-white border-2 border-ink-200 text-ink-500")}>
                {done ? <CircleCheck className="size-5" strokeWidth={2.5} /> : idx + 1}
              </span>
              <span className={cn("text-[12.5px] font-medium", cur || done ? "text-ink-900" : "text-ink-500")}>{s}</span>
            </li>
          );
        })}
      </ol>

      <h3 className="text-h4 text-ink-900">What are your main goals?</h3>
      <p className="text-[13px] text-ink-500 mt-1 mb-4">Pick what matters most — we&apos;ll tailor your plan.</p>
      <div className="grid grid-cols-2 gap-2.5">
        {["Grow my audience", "Land brand deals", "Stay consistent", "Improve content"].map((g, i) => (
          <span key={g} className={cn("rounded-[12px] border-2 px-3.5 py-3 text-[13px] font-medium", i === 0 || i === 2 ? "border-rose-500 bg-rose-50/70 text-ink-900" : "border-ink-100 text-ink-700")}>
            {g}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-5 border-t border-ink-100">
        <span className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] border border-ink-200 text-ink-700 text-[13.5px] font-medium">
          <ArrowLeft className="size-4" strokeWidth={2} />
          Back
        </span>
        <span className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-semibold shadow-sm">
          Continue <ArrowRight className="size-4" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

export function WizardComplete() {
  return (
    <div className="card p-8 w-[420px] max-w-full flex flex-col items-center text-center">
      <span className="size-16 rounded-full bg-success-bg text-success inline-flex items-center justify-center mb-4">
        <CircleCheck className="size-8" strokeWidth={2} />
      </span>
      <h3 className="text-h3 text-ink-900">You&apos;re all set!</h3>
      <p className="text-[13.5px] text-ink-500 mt-1.5 leading-snug max-w-[34ch]">
        We&apos;ve tailored your dashboard and first program based on your answers.
      </p>
      <span className="mt-5 inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-rose-600 text-white text-[14px] font-semibold shadow-sm">
        Go to dashboard <ArrowRight className="size-4" strokeWidth={2} />
      </span>
    </div>
  );
}
