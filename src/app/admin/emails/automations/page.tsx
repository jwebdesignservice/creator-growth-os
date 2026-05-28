import Link from "next/link";
import { Workflow, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Automations · Email · Admin · Creator Growth OS",
};

/**
 * /admin/emails/automations — placeholder.
 *
 * Lifecycle automations (welcome series, re-engagement, completion
 * follow-ups) are a future phase. The transactional welcome email already
 * sends on onboarding via src/lib/email/send.ts; broader automation tooling
 * isn't built yet. Honest "not in this phase" surface so the nav resolves.
 */
export default function EmailAutomationsPage() {
  return (
    <div className="max-w-[920px] mx-auto">
      <div className="card p-10 text-center">
        <span className="size-14 rounded-[14px] bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4 mx-auto">
          <Workflow className="size-6" strokeWidth={1.8} />
        </span>
        <h1 className="text-h3 text-ink-900">Automations</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
          Triggered lifecycle emails — welcome series, re-engagement, and
          completion follow-ups — are a future phase. The onboarding welcome
          email already sends automatically today; richer automation builders
          will land here later.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Link
            href="/admin/emails"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors"
          >
            Go to Compose
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
          <Link
            href="/admin/emails/templates"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-white border border-ink-200 text-ink-700 text-[13.5px] font-medium hover:bg-cream-100 transition-colors"
          >
            Manage Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
