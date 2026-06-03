/* Integrations ─────────────────────────────────────────────────────────────
   Social-account connection surfaces — the rows + cards the app uses on
   /performance and Settings → Connected accounts to link creator platforms
   for analytics sync. Covers connected / not-connected / setup-pending states.
   Presentational; the live version is
   src/components/performance/connect-social-card.tsx.
   ───────────────────────────────────────────────────────────────────────── */

import { Check, RefreshCw, AlertCircle, Plus, Loader2 } from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";

/* 1 · A connected platform row — handle, follower count, sync state + actions. */
export function ConnectedPlatformRow() {
  return (
    <div className="w-[440px] max-w-full rounded-[14px] border border-ink-100 bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <InstagramIcon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900 leading-tight flex items-center gap-1.5">
            Instagram
            <Check className="size-3.5 text-emerald-500" strokeWidth={2.4} />
          </div>
          <div className="text-[11.5px] text-emerald-700 mt-0.5 truncate">
            Connected as @yourcreator
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            aria-label="Sync now"
            className="inline-flex items-center justify-center size-8 rounded-[10px] text-ink-500 transition-colors cursor-pointer hover:text-ink-900 hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            <RefreshCw className="size-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium bg-white border border-ink-100 text-ink-700 transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1"
          >
            Disconnect
          </button>
        </div>
      </div>
      <div className="px-4 -mt-0.5 pb-2.5 text-[10.5px] text-ink-400">
        12,480 followers · synced 2m ago
      </div>
    </div>
  );
}

/* 2 · A grid of connect targets in mixed states (the /performance card body). */
export function PlatformConnectGrid() {
  return (
    <div className="w-[460px] max-w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Not connected — actionable */}
      <div className="rounded-[12px] bg-cream-50 border border-ink-100 px-3 py-2.5 flex items-center gap-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <TiktokIcon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 leading-tight">TikTok</div>
          <div className="text-[11px] text-ink-500 mt-0.5">Not connected</div>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium bg-rose-600 text-white shrink-0 transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
        >
          Connect
        </button>
      </div>

      {/* Setup pending — disabled with hint */}
      <div className="rounded-[12px] bg-cream-50 border border-ink-100 px-3 py-2.5 flex items-center gap-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <YoutubeIcon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 leading-tight flex items-center gap-1.5">
            YouTube
            <AlertCircle className="size-3.5 text-amber-500" strokeWidth={2.2} />
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5 truncate">Setup pending</div>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center h-8 px-3 rounded-[10px] text-[12.5px] font-medium bg-white border border-ink-100 text-ink-400 cursor-not-allowed shrink-0"
        >
          Pending
        </button>
      </div>
    </div>
  );
}

/* 3 · A single integration card with a connect CTA. */
export function IntegrationCard() {
  return (
    <div className="w-[320px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <InstagramIcon size={20} />
        </span>
        <div className="min-w-0">
          <div className="text-[14.5px] font-bold text-ink-900 leading-tight">Instagram</div>
          <div className="text-[12px] text-ink-500">Auto-sync followers & reach</div>
        </div>
      </div>
      <p className="text-[12.5px] text-ink-500 leading-relaxed mb-4">
        Connect a Business or Creator account to enable automatic performance
        tracking for your posts.
      </p>
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
      >
        <Plus className="size-4" strokeWidth={2.2} />
        Connect account
      </button>
    </div>
  );
}

/* 4 · Connecting — a platform mid-connect (the loading state). */
export function PlatformConnecting() {
  return (
    <div className="w-[440px] max-w-full rounded-[14px] border border-ink-100 bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <TiktokIcon size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">TikTok</div>
          <div className="text-[11.5px] text-ink-500 mt-0.5 inline-flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" strokeWidth={2.5} /> Connecting…
          </div>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-[10px] text-[12.5px] font-medium bg-white border border-ink-100 text-ink-400 cursor-wait shrink-0"
        >
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
          Connecting
        </button>
      </div>
    </div>
  );
}
