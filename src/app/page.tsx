/*
 * Marketing / landing page at "/".
 *
 * Two reasons this isn't a pure redirect:
 *   1. Google's OAuth verification cross-checks the OAuth consent app name
 *      ("Profluencer") against what's actually rendered on the homepage URL.
 *      A bare redirect leaves nothing for their crawler to find and trips a
 *      "homepage doesn't match app name" failure during branding review.
 *      The "Profluencer" wordmark in <SiteHeader> keeps that check passing.
 *   2. Random visitors who hit the bare domain deserve a real surface — nav,
 *      a headline, clear CTAs — not a forced bounce to a login form.
 *
 * Signed-in users still skip the marketing surface and land straight on
 * /dashboard. Built section by section; this is the hero.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { TrustedBy } from "@/components/marketing/trusted-by";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { ServicesGrid } from "@/components/marketing/services-grid";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { Integrations } from "@/components/marketing/integrations";
import { ProgramsTutorials } from "@/components/marketing/programs-tutorials";
import { Pricing } from "@/components/marketing/pricing";
import { Cta } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Profluencer — Creator Growth Platform",
  description:
    "Profluencer is a creator growth platform that tracks weekly performance " +
    "across Instagram, TikTok, YouTube and more so creators can see what's " +
    "working and grow consistently.",
  applicationName: "Profluencer",
  openGraph: {
    title: "Profluencer — Creator Growth Platform",
    description:
      "Track weekly performance across your connected social accounts. See " +
      "what's working. Grow consistently.",
    siteName: "Profluencer",
    type: "website",
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-cream-50 text-ink-900">
      <SiteHeader />
      <Hero />
      <TrustedBy />
      <FeaturesGrid />
      <ServicesGrid />
      <FeatureShowcase />
      <ProgramsTutorials />
      <Integrations />
      <Pricing />
      <Cta />
      <Footer />
    </main>
  );
}
