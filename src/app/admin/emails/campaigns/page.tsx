import Link from "next/link";
import { Send, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Campaigns · Email · Admin · Profluencer",
};

/**
 * /admin/emails/campaigns — placeholder.
 *
 * The Email nav links here, but multi-step campaign management (sequences,
 * A/B variants, audience segments) is a future phase. Until then this is an
 * honest "not in this phase" surface that points admins at the working
 * Compose + History tools so the nav never dead-ends.
 */
export default function EmailCampaignsPage() {
  return (
    <div className="max-w-[920px] mx-auto">
      <div className="card p-10 text-center">
        <span className="size-14 rounded-[14px] bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4 mx-auto">
          <Send className="size-6" strokeWidth={1.8} />
        </span>
        <h1 className="text-h3 text-ink-900">Campaigns</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
          Multi-step campaigns, audience segments, and A/B variants are a future
          phase. For now you can compose, preview, test, schedule, and track
          one-off campaigns from the Compose and History tabs — all fully wired.
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
            href="/admin/emails/history"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-white border border-ink-200 text-ink-700 text-[13.5px] font-medium hover:bg-cream-100 transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}
