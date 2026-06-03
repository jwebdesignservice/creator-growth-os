import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AuthHeroPhoto } from "@/components/auth/hero-photo";
import { BRAND_NAME } from "@/lib/brand";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Forgot password · Creator Growth OS" };

/**
 * Forgot-password page.
 *
 * Visual structure mirrors the approved reference: illustration panel on
 * the left, form panel on the right. The illustration uses the existing
 * `AuthHeroPhoto` (warm cream + rose ornament) so we stay inside the
 * creator-app's visual identity instead of pulling in a different palette.
 *
 * The form itself (`ForgotForm`) is unchanged behaviour-wise — same
 * `requestPasswordReset` server action, same success/error states — only
 * the surrounding layout and copy have been rebuilt.
 */
type SearchParams = Promise<{ error?: string | string[] }>;

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error)
    ? params.error[0]
    : params.error;
  // The reset-password page bounces here with ?error=expired when the recovery
  // link is no longer valid. Tell the user why they're back instead of silently
  // showing a blank form.
  const notice =
    errorParam === "expired"
      ? "Your password reset link has expired. Enter your email below to get a fresh one."
      : null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-100">
      {/* ── LEFT — illustration / brand panel ──────────────────────────── */}
      <aside className="hidden lg:flex relative flex-col p-8 xl:p-10 overflow-hidden">
        {/* Card-style wrapper so the panel has rounded corners and breathes
            from the viewport edge — matches the reference's framing. */}
        <div className="absolute inset-4 xl:inset-6 rounded-[28px] bg-cream-200 overflow-hidden">
          <AuthHeroPhoto>
            {/* No overlay card here — we want the hero to read as a calm
                creator scene. Brand + quote sit on top via the outer wrapper. */}
            <span aria-hidden />
          </AuthHeroPhoto>
        </div>

        {/* Brand mark — top-left, on top of the panel. */}
        <Link
          href="/"
          className="relative z-10 inline-flex items-center gap-2.5 self-start hover:opacity-90 transition-opacity"
        >
          <BrandMark size={36} />
          <span className="text-h4 text-ink-900 leading-none tracking-tight">
            {BRAND_NAME}
          </span>
        </Link>

        {/* Spacer pushes quote to the bottom. */}
        <div className="flex-1" />

        {/* Quote + carousel-dot indicator — bottom of panel. */}
        <div className="relative z-10 max-w-[520px]">
          <p className="text-[17px] xl:text-[18px] text-ink-900 leading-relaxed font-medium mb-5">
            <span aria-hidden className="text-ink-700">&ldquo;</span>
            Personalized learning paths and a steady plan have helped me grow
            my audience faster than ever before.
            <span aria-hidden className="text-ink-700">&rdquo;</span>
          </p>
          <p className="text-[13px] text-ink-500 mb-6">— Sophie M., Creator</p>

          <CarouselDots active={0} count={4} />
        </div>
      </aside>

      {/* ── RIGHT — form panel ────────────────────────────────────────── */}
      <main className="relative flex items-center justify-center px-6 sm:px-10 py-10 lg:py-14">
        {/* Back button — top-left of form panel, matches reference's circular icon. */}
        <Link
          href="/sign-in"
          aria-label="Back to sign in"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center justify-center size-10 rounded-full bg-white border border-ink-100 text-ink-700 hover:bg-cream-100 hover:text-ink-900 transition-colors shadow-soft"
        >
          <ArrowLeft className="size-[18px]" strokeWidth={2} />
        </Link>

        <div className="w-full max-w-[420px]">
          {/* Mobile brand — visible only when illustration panel is hidden. */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 mt-2">
            <BrandMark size={32} />
            <span className="text-h5 text-ink-900 leading-none">
              {BRAND_NAME}
            </span>
          </div>

          <header className="mb-8 text-center">
            <h1 className="text-h1 sm:text-[40px] text-ink-900 leading-tight mb-3">
              Forgot Password?
            </h1>
            <p className="text-ink-500 text-[14.5px] leading-relaxed">
              No worries — we&apos;ll send you reset instructions.
            </p>
          </header>

          {notice && (
            <div className="mb-5 px-4 py-3 rounded-[10px] bg-amber-50 border border-amber-200 text-[13px] text-amber-800 text-center">
              {notice}
            </div>
          )}

          <ForgotForm />

          <Link
            href="/sign-in"
            className="mt-5 inline-flex items-center justify-center gap-1.5 w-full text-[13.5px] font-medium text-ink-500 hover:text-ink-900 transition-colors"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} />
            Back to log in
          </Link>

          <p className="mt-10 text-center text-[13px] text-ink-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

/** Decorative pagination dots — purely visual, matches the reference's
 *  carousel indicator. Static for now; could later drive a real testimonial
 *  carousel if we add multiple quotes. */
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
