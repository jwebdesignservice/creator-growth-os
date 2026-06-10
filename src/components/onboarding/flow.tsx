"use client";

import { useCallback, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StepHeader } from "./step-header";
import { StageStep } from "./steps/stage";
import { PlatformStep } from "./steps/platform";
import { GoalsStep } from "./steps/goals";
import { ContentStep } from "./steps/content";
import { PlanStep } from "./steps/plan";
import { CompleteStep } from "./steps/complete";
import {
  EMPTY_DRAFT,
  isStepComplete,
  type OnboardingDraft,
} from "./types";
import { saveOnboarding } from "@/app/onboarding/actions";

type StepKey = "stage" | "platform" | "goals" | "content" | "plan";
const STEPS: StepKey[] = ["stage", "platform", "goals", "content", "plan"];

type Props = {
  initialDraft?: Partial<OnboardingDraft>;
  firstName?: string;
  /** Whether Stripe is configured — gates the Pro checkout redirect. */
  stripeReady?: boolean;
};

export function OnboardingFlow({ initialDraft, firstName, stripeReady }: Props) {
  const [draft, setDraft] = useState<OnboardingDraft>({
    ...EMPTY_DRAFT,
    ...initialDraft,
  });
  const [step, setStep] = useState<StepKey | "complete">("stage");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      setStep("plan");
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

      // Pro choice → hand off to Stripe checkout (7-day trial). Onboarding is
      // already saved, so if they bail out of checkout they simply stay on the
      // Free plan — Pro is only granted once payment succeeds (via webhook).
      if (draft.selected_plan === "pro" && stripeReady) {
        try {
          const res = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ plan: "pro" }),
          });
          const body = (await res.json().catch(() => ({}))) as {
            url?: string;
            error?: string;
          };
          if (res.ok && body.url) {
            window.location.href = body.url;
            return; // navigating away — keep the spinner up
          }
          // Couldn't start checkout — fall through to the success screen on Free.
        } catch {
          // Network error — fall through; the user is onboarded on Free.
        }
      }

      setStep("complete");
    });
  }, [draft, stripeReady]);

  const canAdvance =
    step === "complete" ? true : isStepComplete(step, draft);

  return (
    <div
      className="min-h-screen px-4 py-8 sm:py-10 lg:py-14 bg-cream-100"
      style={{
        // Premium soft creator-warmth gradient — matches the dashboard hero
        // tones without being loud. Single inline declaration so we don't
        // touch the global token system.
        backgroundImage:
          "radial-gradient(60% 60% at 50% 0%, rgba(244, 213, 209, 0.7) 0%, rgba(244, 213, 209, 0) 60%), linear-gradient(180deg, var(--cream-50) 0%, var(--cream-100) 100%)",
      }}
    >
      <div className="max-w-[1240px] mx-auto bg-white rounded-[20px] sm:rounded-[28px] border border-ink-100 shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
          {/* Stepper is hidden on the completion screen — no need to show the
              steps again once the user is done. */}
          {step !== "complete" && <StepHeader current={step} />}

          {step === "stage" && <StageStep draft={draft} onChange={onChange} />}
          {step === "platform" && <PlatformStep draft={draft} onChange={onChange} />}
          {step === "goals" && <GoalsStep draft={draft} onChange={onChange} />}
          {step === "content" && <ContentStep draft={draft} onChange={onChange} />}
          {step === "plan" && <PlanStep draft={draft} onChange={onChange} />}
          {step === "complete" && (
            <CompleteStep firstName={firstName} onBack={goBack} />
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

              {step !== "plan" ? (
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
                  {pending
                    ? draft.selected_plan === "pro"
                      ? "Starting your trial…"
                      : "Personalizing…"
                    : draft.selected_plan === "pro"
                      ? "Start 7-day free trial"
                      : "Finish & Personalize Dashboard"}
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
