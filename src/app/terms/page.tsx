import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: "Terms of Service · Creator Growth OS",
  description: "Terms of Service for Creator Growth OS.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream-100">
      <header className="px-6 lg:px-12 py-6 flex items-center gap-3 border-b border-ink-100 bg-white">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark size={36} />
          <div className="text-[14px] font-semibold text-ink-900">
            {BRAND_NAME}
          </div>
        </Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 lg:py-16">
        <div className="text-[12px] text-ink-500 uppercase tracking-wide mb-2">
          Legal
        </div>
        <h1 className="font-display text-[40px] lg:text-[48px] text-ink-900 leading-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-[14px] text-ink-500 mb-10">
          Last updated: {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="prose-card space-y-6 text-[14.5px] text-ink-800 leading-relaxed">
          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or using Creator Growth OS (&quot;the
              Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              2. Eligibility
            </h2>
            <p>
              You must be at least 16 years old to use the Service. By using
              the Service you represent that you are old enough to enter into a
              binding contract.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              3. Subscription & Payment
            </h2>
            <p>
              Paid plans renew automatically until cancelled. You can cancel at
              any time from the Billing page. Payments are processed by Stripe;
              we do not store full card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              4. Your Content
            </h2>
            <p>
              You retain ownership of any content you create or upload (media
              kits, posts, replies, performance data). By making content
              public — for example, publishing a media kit — you grant us a
              limited license to display it on the Service. We do not sell your
              content to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              5. Acceptable Use
            </h2>
            <p>
              You agree not to use the Service to publish hateful, illegal, or
              harmful content; to harass other users; to scrape or
              reverse-engineer the Service; or to circumvent rate limits and
              access controls. We may suspend accounts that breach these rules.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              6. Termination
            </h2>
            <p>
              You may delete your account at any time. We may terminate or
              suspend accounts that violate these terms. On termination, paid
              access continues until the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              7. Disclaimer
            </h2>
            <p>
              The Service is provided &quot;as is&quot;. We make no guarantees
              about audience growth, brand deals, or revenue outcomes. The
              programs and templates are guidance, not a guarantee of results.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              8. Changes
            </h2>
            <p>
              We may update these terms occasionally. If we do, we&apos;ll
              notify you in-app and update the &quot;Last updated&quot; date.
              Continued use of the Service after changes means you accept the
              new terms.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              9. Contact
            </h2>
            <p>
              Questions about these terms? Visit{" "}
              <Link
                href="/support"
                className="text-rose-600 font-medium hover:text-rose-700"
              >
                Support
              </Link>{" "}
              or email our support team from there.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-100">
          <Link
            href="/sign-up"
            className="text-[13px] font-medium text-rose-600 hover:text-rose-700"
          >
            ← Back to sign up
          </Link>
        </div>
      </article>
    </main>
  );
}
