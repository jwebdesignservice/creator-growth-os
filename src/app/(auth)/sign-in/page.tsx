import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AuthHeroPhoto, FeatureOverlayCard } from "@/components/auth/hero-photo";
import { BRAND_NAME } from "@/lib/brand";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in · Profluencer" };

type SearchParams = Promise<{
  redirect?: string | string[];
  error?: string | string[];
}>;

/** Friendly copy for the `?error=` codes other pages redirect here with. */
const SIGN_IN_ERRORS: Record<string, string> = {
  auth_callback_failed:
    "That sign-in link was invalid or has expired. Please sign in again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.redirect)
    ? params.redirect[0]
    : params.redirect;
  // Only forward safe internal paths; the action validates again server-side.
  const redirectTo =
    raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;
  const errorParam = Array.isArray(params.error)
    ? params.error[0]
    : params.error;
  const errorMessage = errorParam
    ? (SIGN_IN_ERRORS[errorParam] ??
      "Something went wrong. Please sign in again.")
    : null;

  return (
    <div className="grid lg:grid-cols-[1fr_520px] min-h-screen bg-cream-100">
      {/* CENTER — form card */}
      <main className="flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <BrandMark size={36} />
            <div className="text-[14px] font-semibold text-ink-900">
              {BRAND_NAME}
            </div>
          </div>

          <div className="card p-7 lg:p-9">
            <Sparkles className="size-5 text-rose-500 mb-3" strokeWidth={2} />
            <h1 className="text-h1 text-ink-900 leading-tight flex items-center gap-2.5">
              Welcome back <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-ink-500 text-[13.5px] leading-relaxed mb-6">
              Continue your creator journey and grow your influence with
              confidence.
            </p>

            {errorMessage && (
              <div className="mb-4 px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
                {errorMessage}
              </div>
            )}

            <SignInForm redirectTo={redirectTo} />

            <div className="mt-5">
              <Link
                href="/sign-up"
                className="flex items-center justify-between gap-2 px-4 h-11 rounded-[12px] bg-rose-50/70 border border-rose-100 hover:bg-rose-100 text-[13.5px] font-medium text-ink-700 transition-colors"
              >
                <span>
                  New here?{" "}
                  <span className="text-rose-600 font-semibold">
                    Create your account
                  </span>
                </span>
                <ArrowRight className="size-4 text-rose-600" strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-ink-500">
            <ShieldCheck className="size-3.5" strokeWidth={2} />
            Your data is safe with us. We never share your information.
          </div>
        </div>
      </main>

      {/* RIGHT — lifestyle photo + overlay */}
      <div className="hidden lg:block relative">
        <AuthHeroPhoto>
          <FeatureOverlayCard
            headline="Everything you need to grow and succeed"
            blurb="Access your dashboard, posting plans, tutorials, and community in one beautiful space."
            bullets={[
              "Plan your content",
              "Track your progress",
              "Learn from experts",
              "Connect with creators",
            ]}
          />
        </AuthHeroPhoto>
      </div>
    </div>
  );
}
