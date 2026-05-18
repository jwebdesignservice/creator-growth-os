/**
 * Minimal onboarding loader — no shell visible at this route, so the
 * page-skeleton wouldn't make sense. A centered brand mark + pulse
 * keeps the flow feeling smooth during step transitions.
 */
import { BrandMark } from "@/components/brand-mark";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <BrandMark size={64} />
        <div className="text-[12.5px] uppercase tracking-[0.12em] text-rose-600 font-semibold">
          Loading
        </div>
      </div>
    </div>
  );
}
