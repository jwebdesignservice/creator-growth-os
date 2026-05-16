import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AuthHeroPhoto, FeatureOverlayCard } from "@/components/auth/hero-photo";
import { BRAND_NAME } from "@/lib/brand";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in · Creator Growth OS" };

export default function SignInPage() {
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
            <h1 className="font-display text-[36px] text-ink-900 leading-tight flex items-center gap-2.5">
              Welcome back <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-ink-500 text-[13.5px] leading-relaxed mb-6">
              Continue your creator journey and grow your influence with
              confidence.
            </p>

            <SignInForm />

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
