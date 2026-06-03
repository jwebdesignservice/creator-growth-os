/* Page Designs · growth & money ──────────────────────────────────────────────
   Monetization- and growth-focused page blueprints for a creator platform —
   earnings, payouts, referrals, brand deals, audience insights, a multi-platform
   composer, membership tiers, thumbnail A/B tests, a moderation queue, and a
   digital storefront. Same visual language as Page Designs (a 560×268 app-shell
   frame from skeleton bars with rose / ink / cream / emerald accents), composed
   denser for more detail. Self-contained & presentational — no shared deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Shell primitives ─────────────────────────────────────────────────────── */

function Topbar() {
  return (
    <div className="h-7 shrink-0 bg-white border-b border-ink-100 flex items-center gap-1.5 px-3">
      <div className="size-2 rounded-full bg-rose-300" />
      <div className="size-2 rounded-full bg-amber-300" />
      <div className="size-2 rounded-full bg-emerald-300" />
      <div className="ml-2 h-3 w-44 rounded bg-cream-200" />
      <div className="ml-auto size-4 rounded-full bg-cream-200" />
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden flex flex-col shadow-sm">
      <Topbar />
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}

function Rail({ active = 1 }: { active?: number }) {
  return (
    <div className="w-[110px] shrink-0 bg-white border-r border-ink-100 p-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-1 pb-2">
        <div className="size-5 rounded-md bg-rose-400" />
        <div className="h-2 w-11 rounded bg-ink-200" />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1.5", i === active && "bg-rose-50")}>
          <div className={cn("size-3 rounded shrink-0", i === active ? "bg-rose-400" : "bg-ink-200")} />
          <div className={cn("h-1.5 rounded", i === active ? "w-11 bg-rose-300" : "w-9 bg-ink-100")} />
        </div>
      ))}
      <div className="mt-auto flex items-center gap-1.5 px-1 pt-2 border-t border-ink-100">
        <div className="size-5 rounded-full bg-cream-200" />
        <div className="h-1.5 w-9 rounded bg-ink-100" />
      </div>
    </div>
  );
}

function PlayGlyph() {
  return <div className="ml-0.5 size-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-ink-900" />;
}

function Bars({ data, className = "h-[44px]", bar = "bg-rose-200" }: { data: number[]; className?: string; bar?: string }) {
  return (
    <div className={cn("flex items-end gap-1", className)}>
      {data.map((h, i) => (
        <div key={i} className={cn("flex-1 rounded-t", bar)} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function Donut({ size = 44 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-[6px] border-cream-200" />
      <div className="absolute inset-0 rounded-full border-[6px] border-rose-400 border-r-transparent border-b-transparent" />
    </div>
  );
}

/* ── 1 · Earnings overview — revenue chart + payout + top sources ──────────── */
export function EarningsOverview() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-1.5 w-16 rounded bg-ink-200" />
            <div className="h-4 w-28 rounded bg-ink-300" />
          </div>
          <div className="h-5 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <div className="h-1.5 w-8 rounded bg-emerald-400" />
          </div>
        </div>
        <div className="grid grid-cols-[1.5fr_1fr] gap-2.5 flex-1 min-h-0">
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="flex gap-1">
                <div className="h-1.5 w-6 rounded-full bg-rose-300" />
                <div className="h-1.5 w-6 rounded-full bg-ink-100" />
              </div>
            </div>
            <Bars data={[40, 60, 46, 72, 54, 80, 62, 90]} className="flex-1" />
          </div>
          <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-2">
            <div className="rounded-md bg-rose-50 border border-rose-100 p-2 space-y-1">
              <div className="h-1.5 w-12 rounded bg-rose-300" />
              <div className="h-2 w-16 rounded bg-ink-300" />
            </div>
            <div className="space-y-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="size-4 rounded-full bg-cream-200 shrink-0" />
                  <div className="h-1.5 flex-1 rounded bg-ink-100" />
                  <div className="h-1.5 w-8 rounded bg-ink-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 2 · Payouts — next-payout banner + history table ──────────────────────── */
export function PayoutsTable() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="rounded-lg bg-gradient-to-r from-rose-100 to-cream-50 border border-rose-100 p-2.5 flex items-center gap-2.5">
          <div className="size-8 rounded-md bg-white/70 shrink-0" />
          <div className="space-y-1">
            <div className="h-1.5 w-20 rounded bg-ink-200" />
            <div className="h-2.5 w-24 rounded bg-ink-300" />
          </div>
          <div className="ml-auto h-7 w-20 rounded-md bg-rose-400" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-ink-200 bg-cream-50">
            <div className="h-1.5 w-12 rounded bg-ink-300" />
            <div className="h-1.5 w-14 rounded bg-ink-300" />
            <div className="ml-auto h-1.5 w-10 rounded bg-ink-300" />
            <div className="h-1.5 w-10 rounded bg-ink-300" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 border-b border-ink-100">
              <div className="h-1.5 w-12 rounded bg-ink-200" />
              <div className="h-1.5 w-16 rounded bg-ink-100" />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-200" />
              <div className={cn("h-3 w-10 rounded-full", i === 0 ? "bg-amber-100" : "bg-emerald-100")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 3 · Referrals — share link + stat cards + referred list ───────────────── */
export function ReferralDashboard() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="h-2.5 w-28 rounded bg-ink-300" />
        <div className="flex items-stretch gap-2">
          <div className="flex-1 h-8 rounded-md bg-white border border-dashed border-ink-300 flex items-center px-2.5">
            <div className="h-1.5 w-32 rounded bg-ink-200" />
          </div>
          <div className="h-8 w-16 rounded-md bg-rose-400 shrink-0" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["bg-rose-200", "bg-emerald-200", "bg-amber-200"].map((c, i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
              <div className={cn("size-2 rounded-sm", c)} />
              <div className="h-3 w-10 rounded bg-ink-300" />
              <div className="h-1.5 w-12 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1.5 flex-1 min-h-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
              <div className="space-y-1">
                <div className="h-1.5 w-20 rounded bg-ink-200" />
                <div className="h-1.5 w-12 rounded bg-ink-100" />
              </div>
              <div className="ml-auto h-2.5 w-10 rounded-full bg-emerald-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 4 · Brand deals — sponsorship pipeline ────────────────────────────────── */
export function BrandDeals() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-6 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-2">
          {[2, 1, 2].map((n, ci) => (
            <div key={ci} className="rounded-lg bg-cream-100/60 border border-ink-100 p-1.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-0.5">
                <div className="h-1.5 w-10 rounded bg-ink-200" />
                <div className="size-3 rounded-full bg-white border border-ink-200" />
              </div>
              {Array.from({ length: n }).map((_, i) => (
                <div key={i} className="rounded-md bg-white border border-ink-100 p-1.5 space-y-1">
                  <div className="flex items-center gap-1">
                    <div className="size-4 rounded bg-cream-200 shrink-0" />
                    <div className="h-1.5 w-10 rounded bg-ink-200" />
                  </div>
                  <div className="h-2 w-12 rounded bg-emerald-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 5 · Audience insights — demographics charts ───────────────────────────── */
export function AudienceInsights() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 grid grid-cols-2 gap-2.5 overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex flex-col">
          <div className="h-1.5 w-12 rounded bg-ink-200 mb-2" />
          <Bars data={[30, 55, 80, 65, 40, 25]} bar="bg-rose-300" className="flex-1" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex items-center gap-2.5">
          <Donut size={48} />
          <div className="space-y-1.5">
            {["bg-rose-400", "bg-cream-300", "bg-ink-200"].map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-sm", c)} />
                <div className="h-1.5 w-10 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
          <div className="h-1.5 w-12 rounded bg-ink-200" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-2 w-3 rounded-sm bg-cream-200 shrink-0" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
              <div className="h-1.5 w-6 rounded bg-ink-200" />
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex flex-col">
          <div className="h-1.5 w-14 rounded bg-ink-200 mb-2" />
          <Bars data={[20, 35, 30, 50, 45, 65, 60]} bar="bg-emerald-300" className="flex-1" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 6 · Content composer — multi-platform editor + live preview ───────────── */
export function ContentComposer() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 flex">
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            {["bg-rose-400", "bg-white", "bg-white"].map((c, i) => (
              <div key={i} className={cn("size-7 rounded-full border border-ink-200", c)} />
            ))}
            <div className="ml-auto h-1.5 w-10 rounded bg-ink-100" />
          </div>
          <div className="flex-1 rounded-lg bg-white border border-ink-100 p-2.5 space-y-1.5">
            <div className="h-1.5 w-full rounded bg-ink-200" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
            <div className="flex gap-1.5 pt-1">
              <div className="h-10 w-12 rounded-md bg-cream-200" />
              <div className="h-10 w-12 rounded-md bg-cream-100 border border-dashed border-ink-200" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="size-7 rounded-md bg-white border border-ink-200" />
            ))}
            <div className="ml-auto h-8 w-20 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="w-[150px] shrink-0 bg-ink-900 flex items-center justify-center p-3">
          <div className="w-[96px] h-full rounded-xl bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="h-7 bg-cream-100 flex items-center gap-1 px-1.5">
              <div className="size-3 rounded-full bg-cream-300" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
            <div className="flex-1 bg-cream-50 p-1.5 space-y-1">
              <div className="h-1.5 w-full rounded bg-ink-100" />
              <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              <div className="h-12 rounded bg-cream-200 mt-1" />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 7 · Membership tiers — perks + recommended tier ───────────────────────── */
export function MembershipTiers() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="h-2.5 w-28 rounded bg-ink-300" />
        <div className="flex-1 min-h-0 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("rounded-lg border p-2.5 flex flex-col gap-1.5", i === 1 ? "border-rose-300 bg-white ring-1 ring-rose-100" : "border-ink-100 bg-white")}>
              <div className={cn("h-1.5 w-10 rounded", i === 1 ? "bg-rose-400" : "bg-ink-200")} />
              <div className="h-3 w-12 rounded bg-ink-300" />
              <div className="space-y-1 mt-0.5">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-emerald-300 shrink-0" />
                    <div className="h-1.5 flex-1 rounded bg-ink-100" />
                  </div>
                ))}
              </div>
              <div className={cn("mt-auto h-6 rounded-md", i === 1 ? "bg-rose-400" : "bg-white border border-ink-200")} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 8 · Thumbnail A/B test — two variants + winner ────────────────────────── */
export function ThumbnailAbTest() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-5 w-16 rounded-full bg-cream-200" />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2.5">
          {[true, false].map((win, i) => (
            <div key={i} className={cn("rounded-lg border p-2 flex flex-col gap-2", win ? "border-emerald-300 bg-white" : "border-ink-100 bg-white")}>
              <div className="relative rounded-md bg-ink-900 flex-1 overflow-hidden flex items-center justify-center">
                <div className="size-7 rounded-full bg-white/90 flex items-center justify-center">
                  <PlayGlyph />
                </div>
                {win && <div className="absolute top-1 right-1 h-3 w-8 rounded-full bg-emerald-400" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-1.5 w-8 rounded bg-ink-100" />
                  <div className="h-2 w-12 rounded bg-ink-300" />
                </div>
                <div className={cn("h-1.5 w-6 rounded", win ? "bg-emerald-400" : "bg-ink-200")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 9 · Moderation queue — pending comments + approve / reject ────────────── */
export function ModerationQueue() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-5 w-12 rounded-full", i === 0 ? "bg-rose-100" : "bg-cream-100")} />
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0 p-2.5 space-y-2 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex gap-2">
              <div className="size-6 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-14 rounded bg-ink-200" />
                  <div className="h-1.5 w-8 rounded bg-ink-100" />
                </div>
                <div className="h-1.5 w-full rounded bg-ink-100" />
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <div className="size-6 rounded-md bg-emerald-100" />
                <div className="size-6 rounded-md bg-rose-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 10 · Digital storefront — product grid + cart ─────────────────────────── */
export function DigitalStorefront() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="h-2.5 w-20 rounded bg-ink-300" />
          <div className="ml-auto h-6 w-24 rounded-full bg-cream-100 border border-ink-200" />
          <div className="size-7 rounded-md bg-rose-400 shrink-0" />
        </div>
        <div className="flex-1 min-h-0 p-2.5 grid grid-cols-3 gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden flex flex-col">
              <div className={cn("h-12", i % 3 === 0 ? "bg-rose-100" : i % 3 === 1 ? "bg-cream-200" : "bg-emerald-100")} />
              <div className="p-1.5 space-y-1 flex-1">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="flex items-center justify-between pt-0.5">
                  <div className="h-2 w-8 rounded bg-ink-300" />
                  <div className="size-3 rounded bg-rose-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Category registration ─────────────────────────────────────────────────── */

type PageCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scale?: number;
  items: { label: string; code: string; node: ReactNode; scale?: number }[];
};

export const PAGE_DESIGNS_GROWTH: PageCategory[] = [
  {
    id: "page-designs-growth",
    label: "Growth & money",
    icon: TrendingUp,
    blurb: "Monetization & growth page blueprints — earnings, payouts, referrals, brand deals, audience insights, composer, memberships, A/B thumbnails, moderation & storefront.",
    items: [
      { label: "Earnings · overview + chart", code: "EarningsOverview", node: <EarningsOverview /> },
      { label: "Payouts · banner + history", code: "PayoutsTable", node: <PayoutsTable /> },
      { label: "Referrals · link + stats", code: "ReferralDashboard", node: <ReferralDashboard /> },
      { label: "Brand deals · pipeline", code: "BrandDeals", node: <BrandDeals /> },
      { label: "Audience insights · demographics", code: "AudienceInsights", node: <AudienceInsights /> },
      { label: "Content composer · multi-platform", code: "ContentComposer", node: <ContentComposer /> },
      { label: "Membership tiers · perks", code: "MembershipTiers", node: <MembershipTiers /> },
      { label: "Thumbnail A/B test", code: "ThumbnailAbTest", node: <ThumbnailAbTest /> },
      { label: "Moderation queue", code: "ModerationQueue", node: <ModerationQueue /> },
      { label: "Digital storefront · products", code: "DigitalStorefront", node: <DigitalStorefront /> },
    ],
  },
];
