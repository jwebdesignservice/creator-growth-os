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

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/seo";
import { Hero } from "@/components/marketing/hero";
import { ProvenResults } from "@/components/marketing/proven-results";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { StackedFeatures } from "@/components/marketing/stacked-features";
import { DesignedFor } from "@/components/marketing/designed-for";
import { AgentShowcase } from "@/components/marketing/agent-showcase";
import { Cta } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  // Root layout's template would render "… · Profluencer"; the homepage
  // carries the full brand title itself.
  title: { absolute: "Profluencer — Creator Growth Platform" },
  description:
    "Profluencer is a white-label creator growth platform: programs, " +
    "community, content planning, daily missions and performance tracking " +
    "across Instagram, TikTok and YouTube — branded as your own, with no " +
    "upfront cost.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Profluencer — Creator Growth Platform",
    description:
      "Programs, community, content planning and performance tracking in " +
      "one platform — branded as your own.",
    url: "/",
    siteName: "Profluencer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profluencer — Creator Growth Platform",
    description:
      "Programs, community, content planning and performance tracking in " +
      "one platform — branded as your own.",
  },
};

/* Structured data — tells Google + AI answer engines what this site IS.
   Organization (brand identity), WebSite (sitelinks), SoftwareApplication
   (product card: category + free-entry pricing). */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Profluencer",
      url: SITE_URL,
      email: "hello@profluencer.com",
      logo: `${SITE_URL}/opengraph-image`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Profluencer",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "Profluencer",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "White-label creator growth platform — programs, community, " +
        "content planning, daily missions and performance tracking, " +
        "branded as your own.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
        description: "Free to start — paid community plans available.",
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="bg-ink-900">
      <script
        type="application/ld+json"
        // Static, build-time JSON — no user input flows in.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Hero />
      <ProvenResults />
      <HowItWorks />
      <div id="features" className="scroll-mt-24">
        <StackedFeatures />
      </div>
      <DesignedFor />
      <AgentShowcase />
      <Cta />
      <Footer />
    </main>
  );
}
