import Link from "next/link";
import { cookies } from "next/headers";
import { Gift, Sparkles, Heart } from "lucide-react";
import {
  AuthHeroPhoto,
  FeatureOverlayCard,
  NotebookCallout,
} from "@/components/auth/hero-photo";
import { REF_COOKIE, sanitizeReferralCode } from "@/lib/referrals/cookie";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Create account · Creator Growth OS" };

type SearchParams = Promise<{ ref?: string }>;

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { ref } = await searchParams;
  // Prefer a fresh `?ref=`; otherwise fall back to the cookie that `proxy.ts`
  // dropped when the visitor first arrived via a referral link, so attribution
  // isn't lost if they navigated away and came back without the query param.
  const cookieStore = await cookies();
  const referralCode =
    sanitizeReferralCode(ref) ??
    sanitizeReferralCode(cookieStore.get(REF_COOKIE)?.value);

  return (
    <div className="grid lg:grid-cols-[1fr_560px] min-h-screen">
      {/* Left/main: form */}
      <div className="bg-cream-100 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 lg:py-12">
          <div className="w-full max-w-[640px]">
            <div className="card p-7 lg:p-9">
              {/* Header row: sparkle + trial badge */}
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <Sparkles
                    className="size-5 text-rose-500 mb-3"
                    strokeWidth={2}
                  />
                  <h1 className="text-h1 text-ink-900 leading-tight flex items-center gap-2.5">
                    Create your account
                    <Heart
                      className="size-5 text-rose-500"
                      strokeWidth={1.8}
                    />
                  </h1>
                  <p className="mt-2 text-ink-500 text-[13.5px] max-w-md leading-relaxed">
                    Join thousands of creators building influence, consistency,
                    and income — on their terms.
                  </p>
                </div>
                <TrialBadge />
              </div>

              <SignUpForm referralCode={referralCode} />

              <p className="mt-6 text-center text-[13px] text-ink-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-rose-600 font-semibold hover:text-rose-700"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Right: lifestyle photo + overlay */}
      <div className="hidden lg:block relative">
        <AuthHeroPhoto>
          <NotebookCallout />
          <FeatureOverlayCard
            headline="Your growth, personalized for you."
            blurb="Complete a short onboarding quiz and we'll build your custom growth roadmap."
            bullets={[
              "Onboarding quiz to get started",
              "Category-based guidance",
              "Weekly plans & content ideas",
              "Track progress & celebrate wins",
            ]}
          />
        </AuthHeroPhoto>
      </div>
    </div>
  );
}

function TrialBadge() {
  return (
    <div className="hidden sm:block shrink-0 w-[180px] rounded-[14px] bg-rose-50/70 border border-rose-100 px-4 py-3 text-center">
      <div className="inline-flex items-center justify-center size-9 rounded-full bg-rose-100 text-rose-600 mb-1.5">
        <Gift className="size-4" strokeWidth={2} />
      </div>
      <div className="text-[12px] text-ink-700 font-medium leading-tight">
        7-day free trial
      </div>
      <div className="text-h5 text-ink-900 leading-tight">
        on any paid plan
      </div>
      <div className="text-[10.5px] text-ink-500 mt-1 leading-tight">
        No long-term commitment.
        <br />
        Cancel anytime.
      </div>
    </div>
  );
}
