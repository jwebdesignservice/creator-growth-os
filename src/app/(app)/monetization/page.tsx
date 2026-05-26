import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Crown } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import {
  getMediaKit,
  listPitchTemplates,
  listBrandDeals,
  listRevenueEntries,
  getReadinessSnapshot,
  computeRevenueTotals,
} from "@/lib/monetization/queries";
import { ReadinessScore } from "@/components/monetization/readiness-score";
import { MediaKitBuilder } from "@/components/monetization/media-kit-builder";
import { PitchTemplates } from "@/components/monetization/pitch-templates";
import { DealTracker } from "@/components/monetization/deal-tracker";
import { RevenueTracker } from "@/components/monetization/revenue-tracker";

export const metadata = { title: "Monetization Path · Creator Growth OS" };

export default async function MonetizationPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  if (ctx.plan !== "pro") {
    return (
      <PageShell>
        <div className="space-y-7">
          <ProUpsell firstName={ctx.name.split(" ")[0]} />
        </div>
      </PageShell>
    );
  }

  const [mediaKit, templates, deals, revenue, readiness] = await Promise.all([
    getMediaKit(ctx.user.id),
    listPitchTemplates(),
    listBrandDeals(ctx.user.id),
    listRevenueEntries(ctx.user.id),
    getReadinessSnapshot(ctx.user.id),
  ]);

  const firstName = ctx.name.split(" ")[0];

  return (
    <PageShell>
      <div className="space-y-7">
        <header>
          <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
            <Sparkles className="size-4" strokeWidth={2} />
            Welcome to your monetization path, {firstName}
          </div>
          <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-1">
            Monetization Path
          </h1>
          <p className="text-ink-500 text-[14px]">
            Build your media kit, track every deal, and grow income with proven
            pitch scripts and rate guidance.
          </p>
        </header>

        <ReadinessScore snap={readiness} />

        <MediaKitBuilder initial={mediaKit} />

        <PitchTemplates templates={templates} plan={ctx.plan} />

        <DealTracker deals={deals} />

        <RevenueTracker
          entries={revenue}
          totals={computeRevenueTotals(revenue)}
        />
      </div>
    </PageShell>
  );
}

function ProUpsell({ firstName }: { firstName: string }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-rose-50/60 border border-rose-100 p-8 lg:p-12 text-center">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-5">
        <Crown className="size-6" strokeWidth={1.8} />
      </div>
      <div className="text-rose-600 font-medium text-[12px] uppercase tracking-wide mb-3">
        Pro feature
      </div>
      <h1 className="font-display text-[36px] lg:text-[42px] text-ink-900 leading-tight mb-3 max-w-2xl mx-auto">
        Hey {firstName}, monetize your audience with intention.
      </h1>
      <p className="text-[15px] text-ink-700 max-w-xl mx-auto mb-6">
        Pro unlocks the full Monetization Path — readiness score, media kit
        builder, brand pitch scripts, deal tracker, and revenue logging — so you
        can land paid brand partnerships, sooner.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <Link
          href="/billing?upgrade=pro"
          className="inline-flex items-center justify-center h-12 px-6 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14.5px] font-semibold shadow-sm"
        >
          Upgrade to Pro
        </Link>
        <Link
          href="/billing"
          className="inline-flex items-center justify-center h-12 px-6 rounded-[14px] bg-white border border-ink-200 hover:bg-cream-100 text-[14px] font-medium"
        >
          Compare plans
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-[16px] border border-ink-100 p-5"
          >
            <div className="text-[14px] font-semibold text-ink-900 mb-1">
              {f.title}
            </div>
            <p className="text-[12.5px] text-ink-500 leading-snug">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "Readiness Score",
    body: "See exactly which milestones to hit before brands start paying you.",
  },
  {
    title: "Media Kit Builder",
    body: "One-page pitch deck with rates, stats and links — share by URL.",
  },
  {
    title: "Pitch Templates",
    body: "Field-tested cold + warm scripts including rate negotiation.",
  },
  {
    title: "Deal Tracker",
    body: "Pipeline view of every lead, negotiation and paid invoice.",
  },
  {
    title: "Rate Guidance",
    body: "Recommended pricing per format, indexed to your audience size.",
  },
  {
    title: "Revenue Tracker",
    body: "Log every NOK you earn across brand deals, UGC and affiliates.",
  },
];
