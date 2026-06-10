/*
 * Marketing / landing page at "/".
 *
 * Renders the marketing hero. It isn't a pure redirect because:
 *   1. Google's OAuth verification cross-checks the consent app name
 *      ("Profluencer") against what's rendered on the homepage URL — the
 *      "Profluencer" wordmark in the hero nav keeps that check passing.
 *   2. Anonymous visitors deserve a real surface, not a forced login bounce.
 *
 * Signed-in users skip the marketing surface and land on /dashboard.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/marketing/hero";
import { ProvenResults } from "@/components/marketing/proven-results";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { StackedFeatures } from "@/components/marketing/stacked-features";
import { DesignedFor } from "@/components/marketing/designed-for";
import { AgentShowcase } from "@/components/marketing/agent-showcase";
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
    <main className="bg-ink-900">
      <Hero />
      <ProvenResults />
      <HowItWorks />
      <StackedFeatures />
      <DesignedFor />
      <AgentShowcase />
      <Cta />
      <Footer />
    </main>
  );
}
