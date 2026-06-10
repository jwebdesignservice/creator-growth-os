import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "@/components/onboarding/flow";
import { isStripeConfigured } from "@/lib/stripe/client";

export const metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // If the user has already onboarded, skip straight to the dashboard.
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, display_name, onboarded, category, primary_platform, content_frequency, platform_focus, main_goal, weekly_pace, top_value_priorities, focus_formats, help_needs",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarded) redirect("/dashboard");

  const firstName = (
    (profile?.display_name as string | undefined) ??
    (profile?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Creator"
  ).split(" ")[0];

  return (
    <OnboardingFlow
      firstName={firstName}
      stripeReady={isStripeConfigured()}
      initialDraft={{
        // Pre-fill draft from anything captured at signup, so users don't re-pick.
        primary_platform: (profile?.primary_platform as never) ?? null,
      }}
    />
  );
}
