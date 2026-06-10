import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Served at /robots.txt. The indexable surface is the marketing layer
 * (landing, demo, legal, auth, public media kits) — everything behind the
 * login wall is disallowed so crawlers don't burn budget on redirects and
 * Search Console stays free of soft-404 noise. Private surfaces also carry
 * a noindex meta as belt-and-braces.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Authed app shell
          "/dashboard",
          "/programs",
          "/tutorials",
          "/posting",
          "/missions",
          "/performance",
          "/monetization",
          "/community",
          "/messages",
          "/settings",
          "/billing",
          "/support",
          "/profile",
          "/notifications",
          // Flows + internal surfaces
          "/onboarding",
          "/create-new",
          "/invoices",
          "/email-preview",
          "/design",
          // Admin / dev / machine endpoints
          "/admin",
          "/dev",
          "/api/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
