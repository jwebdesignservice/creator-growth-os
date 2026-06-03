/*
 * Marketing / landing page at "/".
 *
 * Two reasons this isn't a pure redirect:
 *   1. Google's OAuth verification cross-checks the OAuth consent app name
 *      ("Profluencer") against what's actually rendered on the homepage URL.
 *      A bare redirect leaves nothing for their crawler to find and trips a
 *      "homepage doesn't match app name" failure during branding review.
 *   2. Random visitors who hit the bare domain deserve a real surface — a
 *      logo, a one-line pitch, and clear "sign in" / "get started" CTAs —
 *      not a forced bounce to a login form.
 *
 * Signed-in users still skip the marketing surface and land straight on
 * /dashboard. Replace this with a richer marketing page when ready;
 * keeping it minimal here so we don't ship half-finished copy.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandMark } from "@/components/brand-mark";

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
    <main className="min-h-screen bg-cream-100 text-ink-900 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <div className="flex justify-center mb-6">
          <BrandMark size={64} />
        </div>

        {/* H1 with the explicit app name — what Google's OAuth verifier looks for. */}
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-ink-900 mb-3">
          Profluencer
        </h1>

        <p className="text-lg text-ink-700 mb-3">
          Creator growth platform
        </p>

        <p className="text-ink-500 max-w-md mx-auto leading-relaxed mb-9">
          Track your weekly performance across Instagram, TikTok, YouTube and
          more. See what&apos;s working. Grow consistently.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/sign-up"
            className="inline-flex items-center h-11 px-6 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium shadow-sm transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center h-11 px-6 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[14px] font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
