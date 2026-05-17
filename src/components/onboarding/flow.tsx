"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StepHeader } from "./step-header";
import { StageStep } from "./steps/stage";
import { PlatformStep } from "./steps/platform";
import { GoalsStep } from "./steps/goals";
import { ContentStep } from "./steps/content";
import { CompleteStep } from "./steps/complete";
import {
  EMPTY_DRAFT,
  isStepComplete,
  type OnboardingDraft,
} from "./types";
import { saveOnboarding } from "@/app/onboarding/actions";

type StepKey = "stage" | "platform" | "goals" | "content";
const STEPS: StepKey[] = ["stage", "platform", "goals", "content"];

type Props = {
  initialDraft?: Partial<OnboardingDraft>;
  firstName?: string;
};

export function OnboardingFlow({ initialDraft, firstName }: Props) {
  const [draft, setDraft] = useState<OnboardingDraft>({
    ...EMPTY_DRAFT,
    ...initialDraft,
  });
  const [step, setStep] = useState<StepKey | "complete">("stage");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onChange = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const goNext = useCallback(() => {
    if (step === "complete") return;
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }, [step]);

  const goBack = useCallback(() => {
    if (step === "complete") {
      setStep("content");
      return;
    }
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }, [step]);

  const submit = useCallback(() => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await saveOnboarding(draft);
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      setStep("complete");
    });
  }, [draft]);

  const canAdvance =
    step === "complete" ? true : isStepComplete(step, draft);

  return (
    <div className="min-h-screen bg-rose-100/40 px-4 py-8 lg:py-10">
      <div className="max-w-[1240px] mx-auto bg-white rounded-[28px] border border-ink-100 shadow-card overflow-hidden">
        <div className="p-6 lg:p-10 space-y-8">
          <StepHeader current={step} />

          {step === "stage" && <StageStep draft={draft} onChange={onChange} />}
          {step === "platform" && <PlatformStep draft={draft} onChange={onChange} />}
          {step === "goals" && <GoalsStep draft={draft} onChange={onChange} />}
          {step === "content" && <ContentStep draft={draft} onChange={onChange} />}
          {step === "complete" && (
            <CompleteStep draft={draft} firstName={firstName} onBack={goBack} />
          )}

          {submitError && (
            <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
              {submitError}
            </div>
          )}

          {step !== "complete" && (
            <footer className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={goBack}
                disabled={STEPS.indexOf(step) === 0}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="size-4" strokeWidth={2} />
                Back
              </button>

              {step !== "content" ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold transition-colors shadow-sm"
                >
                  Continue
                  <ArrowRight className="size-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canAdvance || pending}
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold transition-colors shadow-sm"
                >
                  {pending ? "Personalizing…" : "Finish & Personalize Dashboard"}
                  {!pending && <ArrowRight className="size-4" strokeWidth={2} />}
                </button>
              )}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
