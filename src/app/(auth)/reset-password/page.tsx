import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AuthHeroPhoto } from "@/components/auth/hero-photo";
import { BRAND_NAME } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Set new password · Profluencer" };

/**
 * Reset / set-new-password page.
 *
 * Layout mirrors /forgot-password: illustration panel left, form panel
 * right. The form itself is a richer client component because the
 * reference design includes a live strength meter, password-visibility
 * toggles, and per-rule validation indicators — all client-side affordances
 * that drive the existing `updatePassword` server action.
 *
 * Recovery-flow gate is unchanged: if Supabase didn't grant a temporary
 * session via the magic link, we bounce back to /forgot-password.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?error=expired");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-100">
      {/* ── LEFT — illustration / brand panel ──────────────────────────── */}
      <aside className="hidden lg:flex relative flex-col p-8 xl:p-10 overflow-hidden">
        <div className="absolute inset-4 xl:inset-6 rounded-[28px] bg-cream-200 overflow-hidden">
          <AuthHeroPhoto>
            <span aria-hidden />
          </AuthHeroPhoto>
        </div>

        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2.5 self-start hover:opacity-90 transition-opacity"
        >
          <BrandMark size={36} />
          <span className="text-h4 text-ink-900 leading-none tracking-tight">
            {BRAND_NAME}
          </span>
        </Link>

        <div className="flex-1" />

        <div className="relative z-10 max-w-[520px]">
          <p className="text-[17px] xl:text-[18px] text-ink-900 leading-relaxed font-medium mb-5">
            <span aria-hidden className="text-ink-700">&ldquo;</span>
            A strong password is the first line of defense — and Profluencer
            keeps your work, your audience, and your revenue safe.
            <span aria-hidden className="text-ink-700">&rdquo;</span>
          </p>
          <p className="text-[13px] text-ink-500 mb-6">— Security at Profluencer</p>

          <CarouselDots active={1} count={4} />
        </div>
      </aside>

      {/* ── RIGHT — form panel ────────────────────────────────────────── */}
      {/* On mobile the back button sits at top-6/left-6, so we use pt-20 on
          the panel to guarantee at least ~32px of breathing room between the
          button and the brand mark inside the form. On lg+ the illustration
          panel is visible and the back button moves down to top-8, so we
          collapse padding back to the original py-14 for proper vertical
          centering of the form. */}
      <main className="relative flex items-center justify-center px-5 sm:px-8 lg:px-10 pt-20 pb-10 lg:py-14">
        <Link
          href="/sign-in"
          aria-label="Back to sign in"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center justify-center size-10 rounded-full bg-white border border-ink-100 text-ink-700 hover:bg-cream-100 hover:text-ink-900 transition-colors shadow-soft"
        >
          <ArrowLeft className="size-[18px]" strokeWidth={2} />
        </Link>

        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-7 sm:mb-8">
            <BrandMark size={32} />
            <span className="text-h5 text-ink-900 leading-none">
              {BRAND_NAME}
            </span>
          </div>

          <header className="mb-7 sm:mb-8">
            <h1 className="text-h2 sm:text-[34px] lg:text-[40px] text-ink-900 leading-tight mb-2.5 sm:mb-3">
              Set a new password
            </h1>
            <p className="text-ink-500 text-[14px] sm:text-[14.5px] leading-relaxed">
              Create a strong password to keep your account safe and secure.
            </p>
          </header>

          <ResetForm />

          <p className="mt-7 sm:mt-8 text-center text-[13px] text-ink-500">
            Remembered it?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function CarouselDots({ active, count }: { active: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={
            i === active
              ? "h-1.5 w-6 rounded-full bg-ink-900 transition-all"
              : "h-1.5 w-1.5 rounded-full bg-ink-300 transition-all"
          }
        />
      ))}
    </div>
  );
}
