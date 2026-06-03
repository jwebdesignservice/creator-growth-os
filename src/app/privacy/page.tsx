import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: "Privacy Policy · Creator Growth OS",
  description: "Privacy Policy for Creator Growth OS.",
};

export default function PrivacyPage() {
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
        <h1 className="text-h1 text-ink-900 leading-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-[14px] text-ink-500 mb-10">
          Last updated: {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="space-y-6 text-[14.5px] text-ink-800 leading-relaxed">
          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              1. What we collect
            </h2>
            <p>
              When you create an account we collect your email address, display
              name, and (if you choose to provide it) phone number, primary
              platform, follower base, niche, and avatar.
            </p>
            <p className="mt-2">
              As you use the Service we also store: program & lesson progress,
              missions, posting plans, performance entries, brand deals,
              revenue entries, and the content you publish (community posts,
              media kits).
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              2. Why we collect it
            </h2>
            <p>
              To run the Service: personalise your dashboard, surface relevant
              programs and content, calculate readiness scores, broadcast
              announcements to the right audience, and deliver notifications.
              We never sell your personal data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              3. Who processes it
            </h2>
            <p>
              We use a small set of trusted sub-processors:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Supabase</strong> — database, authentication and storage.</li>
              <li><strong>Stripe</strong> — subscription payments and invoice records.</li>
              <li><strong>Resend</strong> — transactional email (welcome, password reset).</li>
              <li><strong>Vercel</strong> — application hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              4. Cookies & sessions
            </h2>
            <p>
              We use a single set of cookies to keep you signed in (Supabase
              auth tokens). We do not use third-party advertising or tracking
              cookies.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              5. Your data, your control
            </h2>
            <p>You can at any time:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Edit your profile information from Settings.</li>
              <li>Unpublish a media kit you previously made public.</li>
              <li>Cancel your subscription from the Billing portal.</li>
              <li>
                Request account deletion by contacting support — we will
                remove your records within 30 days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              6. Public information
            </h2>
            <p>
              Content you intentionally make public (e.g. a published media
              kit, a community post) is visible to other signed-in users — or,
              in the case of a published media kit, to anyone with the link.
              Everything else is private to you.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              7. Children
            </h2>
            <p>
              The Service is not intended for users under 16. We do not
              knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              8. Changes
            </h2>
            <p>
              When this policy changes we&apos;ll update the &quot;Last
              updated&quot; date and notify you in-app if the change is
              material.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-ink-900 mb-2">
              9. Contact
            </h2>
            <p>
              Questions about your data? Email our support team at{" "}
              <a
                href="mailto:hei@bwstudio.no"
                className="text-rose-600 font-medium hover:text-rose-700"
              >
                hei@bwstudio.no
              </a>
              . Signed-in users can also reach us from the in-app{" "}
              <Link
                href="/support"
                className="text-rose-600 font-medium hover:text-rose-700"
              >
                Support
              </Link>{" "}
              page.
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
