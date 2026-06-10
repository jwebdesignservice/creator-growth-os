import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

/**
 * Shared SEO constants. The canonical production origin comes from
 * NEXT_PUBLIC_SITE_URL (set in Vercel env) and falls back to the brand
 * domain so metadata never renders relative/broken absolute URLs.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://profluencer.com";

export const SITE_NAME = BRAND_NAME;

export const SITE_DESCRIPTION =
  "Profluencer is a white-label creator growth platform — programs, " +
  "community, content planning, daily missions and performance tracking " +
  "in one place, branded as your own.";

export const SITE_KEYWORDS = [
  "creator growth platform",
  "creator community platform",
  "white label community platform",
  "sell online courses",
  "content creator tools",
  "influencer growth",
  "content planning calendar",
  "creator monetization",
  BRAND_NAME,
  BRAND_TAGLINE,
];
