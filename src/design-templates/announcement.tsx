/* Announcements ──────────────────────────────────────────────────────────────
   Product-announcement / what's-new surfaces — a dismissible top banner, a
   changelog feed (versioned entries), and a single announcement card with a
   New / Improved tag. From admin Announcements + the in-app updates feed.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Megaphone, Sparkles, X, Wrench, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* 1 · Dismissible announcement banner — the top-of-app "what's new" strip. */
export function AnnouncementBanner() {
  return (
    <div className="w-[480px] max-w-full rounded-[14px] bg-gradient-to-r from-rose-50 to-cream-100 border border-rose-100 px-4 py-3 flex items-center gap-3">
      <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Megaphone className="size-[18px]" strokeWidth={1.9} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 leading-tight">
          35 GB video uploads are here
        </div>
        <div className="text-[12px] text-ink-500 mt-0.5 truncate">
          Resumable uploads mean big lessons never fail mid-way.
        </div>
      </div>
      <button type="button" className="text-[12.5px] font-semibold text-rose-600 shrink-0 rounded px-1 -mx-1 cursor-pointer transition-colors hover:text-rose-700 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
        See what&apos;s new
      </button>
      <button type="button" aria-label="Dismiss" className="size-7 inline-flex items-center justify-center rounded-full text-ink-400 shrink-0 cursor-pointer transition-colors hover:bg-white/60 active:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

/* 2 · Changelog feed — versioned entries with tagged change types. */
const TAGS = {
  new: { label: "New", icon: Plus, cls: "bg-emerald-100 text-emerald-700" },
  improved: { label: "Improved", icon: Sparkles, cls: "bg-rose-100 text-rose-700" },
  fixed: { label: "Fixed", icon: Wrench, cls: "bg-amber-100 text-amber-700" },
} as const;

const ENTRIES: { tag: keyof typeof TAGS; text: string }[] = [
  { tag: "new", text: "Resumable 35 GB video uploads" },
  { tag: "improved", text: "Notification preferences now live in Settings" },
  { tag: "fixed", text: "Performance KPIs reset correctly after disconnect" },
];

export function ChangelogFeed() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900">What&apos;s new</h3>
        <span className="text-[11px] font-mono text-ink-400">v2.8.0 · May 2026</span>
      </div>
      <ul className="space-y-3">
        {ENTRIES.map((e, i) => {
          const t = TAGS[e.tag];
          const Icon = t.icon;
          return (
            <li key={i} className="flex items-start gap-2.5">
              <span className={cn("inline-flex items-center gap-1 h-5 px-1.5 rounded-full text-[10.5px] font-semibold shrink-0 mt-px", t.cls)}>
                <Icon className="size-2.5" strokeWidth={2.5} />
                {t.label}
              </span>
              <span className="text-[13px] text-ink-700 leading-snug">{e.text}</span>
            </li>
          );
        })}
      </ul>
      <button type="button" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 rounded px-1 -mx-1 cursor-pointer transition-colors hover:text-rose-700 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
        Full changelog <ArrowRight className="size-3.5" strokeWidth={2.4} />
      </button>
    </div>
  );
}

/* 3 · Announcement card — a single highlighted update with a type tag. */
export function AnnouncementCard() {
  return (
    <div className="w-[340px] max-w-full rounded-[16px] border border-ink-100 bg-white overflow-hidden shadow-card">
      <div className="h-20 bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 flex items-center justify-center">
        <Sparkles className="size-7 text-rose-500" strokeWidth={1.8} />
      </div>
      <div className="p-4">
        <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10.5px] font-semibold mb-2">
          <Plus className="size-2.5" strokeWidth={2.5} /> New
        </span>
        <h3 className="text-[14.5px] font-bold text-ink-900 leading-tight">Brand-deal pipeline</h3>
        <p className="text-[12.5px] text-ink-500 mt-1 leading-relaxed">
          Track sponsorships from first pitch to paid, right inside Monetization.
        </p>
        <button type="button" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 rounded px-1 -mx-1 cursor-pointer transition-colors hover:text-rose-700 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
          Try it now <ArrowRight className="size-3.5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
