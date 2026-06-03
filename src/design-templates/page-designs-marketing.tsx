/* Page Designs · marketing & funnels ─────────────────────────────────────────
   The public-facing funnel pages creators build to grow — landing, sales / VSL,
   opt-in, webinar registration, waitlist, blog index, blog article, features,
   comparison, and thank-you. Same visual language as the rest of Page Designs
   (a 560×268 frame from skeleton bars, rose / ink / cream / emerald accents,
   flat inner cards) but with a public site nav instead of the app rail.
   Self-contained & presentational — no shared deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { Megaphone, type LucideIcon } from "lucide-react";
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

/* Public marketing-site nav — logo, links, CTA. */
function NavBar() {
  return (
    <div className="h-8 shrink-0 border-b border-ink-100 bg-white flex items-center gap-2 px-3.5">
      <div className="size-4 rounded bg-rose-400" />
      <div className="h-1.5 w-14 rounded bg-ink-200" />
      <div className="ml-auto flex items-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 w-8 rounded bg-ink-100" />
        ))}
        <div className="h-6 w-16 rounded-md bg-rose-400" />
      </div>
    </div>
  );
}

function PlayGlyph() {
  return <div className="ml-0.5 size-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-ink-900" />;
}

/* ── 1 · Landing page — hero + value props + logo strip ────────────────────── */
export function LandingPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <NavBar />
        <div className="flex-1 grid grid-cols-2 gap-3 px-4 py-3 bg-gradient-to-b from-rose-50/50 to-white min-h-0">
          <div className="flex flex-col justify-center gap-2">
            <div className="h-3 w-14 rounded-full bg-rose-100" />
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded bg-ink-300" />
              <div className="h-4 w-2/3 rounded bg-ink-300" />
            </div>
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
            <div className="flex gap-2 mt-1">
              <div className="h-8 w-24 rounded-md bg-rose-400" />
              <div className="h-8 w-20 rounded-md bg-white border border-ink-200" />
            </div>
          </div>
          <div className="rounded-xl bg-cream-100 border border-ink-100 flex items-center justify-center p-3">
            <div className="w-full h-full rounded-lg bg-white border border-ink-100 overflow-hidden flex flex-col shadow-sm">
              <div className="h-3 bg-cream-100 border-b border-ink-100 flex items-center gap-0.5 px-1.5">
                <div className="size-1 rounded-full bg-rose-300" />
                <div className="size-1 rounded-full bg-amber-300" />
                <div className="size-1 rounded-full bg-emerald-300" />
              </div>
              <div className="flex-1 p-1.5 grid grid-cols-2 grid-rows-2 gap-1">
                <div className="rounded bg-rose-50" />
                <div className="rounded bg-cream-100" />
                <div className="rounded bg-cream-100" />
                <div className="rounded bg-emerald-50" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-10 shrink-0 border-t border-ink-100 bg-white flex items-center justify-center gap-4 px-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 w-10 rounded bg-cream-200" />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 2 · Sales page — headline + VSL + benefits + CTA ──────────────────────── */
export function SalesPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col items-center overflow-hidden p-3 gap-2">
        <div className="h-2 w-16 rounded-full bg-rose-100 mt-0.5" />
        <div className="h-3 w-2/3 rounded bg-ink-300" />
        <div className="w-3/4 h-[86px] rounded-lg bg-ink-900 relative flex items-center justify-center shrink-0">
          <div className="size-9 rounded-full bg-white/90 flex items-center justify-center">
            <PlayGlyph />
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20">
            <div className="h-full w-1/3 bg-rose-400" />
          </div>
        </div>
        <div className="w-3/4 space-y-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-emerald-300 shrink-0" />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="h-8 w-32 rounded-md bg-rose-400 mt-0.5" />
      </div>
    </Frame>
  );
}

/* ── 3 · Opt-in — lead-magnet split with form ──────────────────────────────── */
export function OptInPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 grid grid-cols-2">
        <div className="bg-white flex flex-col justify-center gap-2 p-4">
          <div className="h-3 w-3/4 rounded bg-ink-300" />
          <div className="h-1.5 w-full rounded bg-ink-100" />
          <div className="space-y-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-rose-200 shrink-0" />
                <div className="h-1.5 flex-1 rounded bg-ink-100" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5 mt-1.5">
            <div className="h-8 rounded-md bg-cream-50 border border-ink-200" />
            <div className="h-8 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-100 to-cream-200 flex items-center justify-center p-4">
          <div className="w-28 h-36 rounded-lg bg-white shadow-md border border-ink-100" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 4 · Webinar registration — dark hero + register form ──────────────────── */
export function WebinarRegister() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-gradient-to-b from-ink-900 to-ink-700 flex flex-col items-center justify-center gap-2 p-3 text-center">
        <div className="h-1.5 w-12 rounded-full bg-rose-400/70" />
        <div className="h-3 w-2/3 rounded bg-white/80" />
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-16 rounded-full bg-white/15" />
          <div className="h-5 w-12 rounded-full bg-white/15" />
        </div>
        <div className="w-1/2 flex gap-1.5 mt-1">
          <div className="flex-1 h-8 rounded-md bg-white/10 border border-white/20" />
          <div className="h-8 w-16 rounded-md bg-rose-400" />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="size-5 rounded-full bg-white/15" />
          <div className="h-1.5 w-16 rounded bg-white/20" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 5 · Waitlist — coming soon + email + social proof ─────────────────────── */
export function WaitlistPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-gradient-to-b from-cream-50 to-rose-50 flex flex-col items-center justify-center gap-2 p-3 text-center">
        <div className="size-10 rounded-xl bg-rose-400" />
        <div className="h-3 w-1/2 rounded bg-ink-300" />
        <div className="h-1.5 w-2/3 rounded bg-ink-200" />
        <div className="w-1/2 flex gap-1.5 mt-1">
          <div className="flex-1 h-8 rounded-full bg-white border border-ink-200" />
          <div className="h-8 w-16 rounded-full bg-rose-400" />
        </div>
        <div className="flex -space-x-1.5 mt-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="size-5 rounded-full bg-cream-200 border-2 border-white" />
          ))}
          <div className="size-5 rounded-full bg-ink-900 border-2 border-white" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 6 · Blog index — featured + article grid ──────────────────────────────── */
export function BlogIndex() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <NavBar />
        <div className="flex-1 p-3 flex flex-col gap-2 bg-cream-50 min-h-0">
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden flex shrink-0">
            <div className="w-28 h-16 bg-cream-200 shrink-0" />
            <div className="flex-1 p-2 space-y-1 flex flex-col justify-center">
              <div className="h-2 w-10 rounded-full bg-rose-100" />
              <div className="h-2 w-3/4 rounded bg-ink-300" />
              <div className="h-1.5 w-full rounded bg-ink-100" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden flex flex-col">
                <div className={cn("h-8", i % 3 === 0 ? "bg-rose-100" : i % 3 === 1 ? "bg-cream-200" : "bg-emerald-100")} />
                <div className="p-1.5 space-y-1 flex-1">
                  <div className="h-1.5 w-full rounded bg-ink-200" />
                  <div className="h-1.5 w-2/3 rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 7 · Blog article — cover + title + author + body ──────────────────────── */
export function BlogArticle() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <NavBar />
        <div className="h-16 shrink-0 bg-gradient-to-br from-rose-200 to-cream-200" />
        <div className="flex-1 px-8 py-3 flex flex-col gap-2 overflow-hidden">
          <div className="h-2 w-10 rounded-full bg-rose-100" />
          <div className="h-3 w-3/4 rounded bg-ink-300" />
          <div className="flex items-center gap-1.5">
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          </div>
          <div className="space-y-1.5 mt-1">
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 8 · Features — alternating feature rows ───────────────────────────────── */
export function FeaturesPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <NavBar />
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden bg-cream-50">
          <div className="h-2.5 w-32 rounded bg-ink-300 mx-auto" />
          {[0, 1].map((i) => (
            <div key={i} className={cn("flex items-center gap-3", i === 1 && "flex-row-reverse")}>
              <div className="w-28 h-16 rounded-lg bg-cream-200 border border-ink-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="size-5 rounded-md bg-rose-100" />
                <div className="h-2 w-2/3 rounded bg-ink-300" />
                <div className="h-1.5 w-full rounded bg-ink-100" />
                <div className="h-1.5 w-3/4 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 9 · Comparison — feature × plan matrix ────────────────────────────────── */
export function ComparisonPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col overflow-hidden">
        <NavBar />
        <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
          <div className="h-2.5 w-28 rounded bg-ink-300 mx-auto" />
          <div className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-ink-200 bg-cream-50">
              <div className="px-3 py-2">
                <div className="h-1.5 w-16 rounded bg-ink-300" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("px-2 py-2 flex justify-center", i === 1 && "bg-rose-50")}>
                  <div className="h-1.5 w-8 rounded bg-ink-300" />
                </div>
              ))}
            </div>
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-ink-100 last:border-0">
                <div className="px-3 py-1.5">
                  <div className="h-1.5 w-20 rounded bg-ink-100" />
                </div>
                {[0, 1, 2].map((c) => (
                  <div key={c} className={cn("px-2 py-1.5 flex justify-center", c === 1 && "bg-rose-50/40")}>
                    <div className={cn("size-2.5 rounded-full", c === 2 && r > 1 ? "bg-cream-200" : "bg-emerald-300")} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 10 · Thank you — confirmation + next steps ────────────────────────────── */
export function ThankYouPage() {
  return (
    <Frame>
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col items-center justify-center gap-2 p-3 text-center">
        <div className="size-14 rounded-full bg-emerald-100 flex items-center justify-center ring-8 ring-emerald-50">
          <div className="size-7 rounded-full bg-emerald-300" />
        </div>
        <div className="h-3 w-2/5 rounded bg-ink-300" />
        <div className="h-1.5 w-1/2 rounded bg-ink-100" />
        <div className="w-2/3 rounded-lg bg-white border border-ink-100 p-2 space-y-1.5 mt-1">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="size-5 rounded-md bg-rose-100 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-1/2 rounded bg-ink-200" />
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-8 w-28 rounded-md bg-rose-400 mt-0.5" />
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

export const PAGE_DESIGNS_MARKETING: PageCategory[] = [
  {
    id: "page-designs-marketing",
    label: "Marketing & funnels",
    icon: Megaphone,
    blurb: "Public-facing funnel pages creators build to grow — landing, sales / VSL, opt-in, webinar register, waitlist, blog index, blog article, features, comparison & thank-you.",
    items: [
      { label: "Landing page · hero + proof", code: "LandingPage", node: <LandingPage /> },
      { label: "Sales page · VSL + benefits", code: "SalesPage", node: <SalesPage /> },
      { label: "Opt-in · lead magnet", code: "OptInPage", node: <OptInPage /> },
      { label: "Webinar · registration", code: "WebinarRegister", node: <WebinarRegister /> },
      { label: "Waitlist · coming soon", code: "WaitlistPage", node: <WaitlistPage /> },
      { label: "Blog · index", code: "BlogIndex", node: <BlogIndex /> },
      { label: "Blog · article", code: "BlogArticle", node: <BlogArticle /> },
      { label: "Features · sections", code: "FeaturesPage", node: <FeaturesPage /> },
      { label: "Comparison · matrix", code: "ComparisonPage", node: <ComparisonPage /> },
      { label: "Thank you · confirmation", code: "ThankYouPage", node: <ThankYouPage /> },
    ],
  },
];
