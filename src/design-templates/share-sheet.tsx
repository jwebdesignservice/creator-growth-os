/* Share sheet ─────────────────────────────────────────────────────────────────
   Sharing surfaces — a share-to grid (socials + copy link) and a compact inline
   share row. For sharing a profile, program, or link-in-bio. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Copy, Link2, Mail, MessageCircle, X } from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";

type Target = { label: string; node: React.ReactNode; bg: string };

const TARGETS: Target[] = [
  { label: "Instagram", node: <InstagramIcon size={20} />, bg: "bg-rose-100 text-rose-600" },
  { label: "TikTok", node: <TiktokIcon size={20} />, bg: "bg-ink-100 text-ink-900" },
  { label: "YouTube", node: <YoutubeIcon size={20} />, bg: "bg-rose-100 text-rose-600" },
  { label: "Message", node: <MessageCircle className="size-5" strokeWidth={2} />, bg: "bg-indigo-100 text-indigo-600" },
  { label: "Email", node: <Mail className="size-5" strokeWidth={2} />, bg: "bg-amber-100 text-amber-600" },
];

/* 1 · Share sheet — modal with a target grid + copy-link field. */
export function ShareSheet() {
  return (
    <div className="w-[360px] max-w-full rounded-[18px] bg-white border border-ink-100 shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-ink-900">Share your profile</h3>
        <button type="button" aria-label="Close" className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 cursor-pointer transition-colors hover:bg-cream-100 hover:text-ink-700 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {TARGETS.map((t) => (
          <button key={t.label} type="button" aria-label={`Share to ${t.label}`} className="flex flex-col items-center gap-1.5 group rounded-[12px] py-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
            <span className={`size-12 rounded-[14px] inline-flex items-center justify-center ${t.bg} group-hover:brightness-95 transition`}>
              {t.node}
            </span>
            <span className="text-[10.5px] text-ink-500">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 h-11 px-3 rounded-[12px] border border-ink-200 bg-cream-50">
        <Link2 className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
        <span className="flex-1 min-w-0 text-[13px] text-ink-700 truncate">profluencer.app/@yourcreator</span>
        <button type="button" className="inline-flex items-center gap-1 h-8 px-3 rounded-[9px] bg-rose-600 text-white text-[12px] font-semibold shrink-0 transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          <Copy className="size-3.5" strokeWidth={2} /> Copy
        </button>
      </div>
    </div>
  );
}

/* 2 · Inline share row — compact button cluster. */
export function ShareRow() {
  return (
    <div className="w-[360px] max-w-full flex items-center gap-2 flex-wrap">
      <span className="text-[12.5px] font-medium text-ink-500 mr-1">Share:</span>
      {TARGETS.slice(0, 3).map((t) => (
        <button key={t.label} type="button" aria-label={`Share to ${t.label}`} className={`size-9 rounded-[10px] inline-flex items-center justify-center ${t.bg} transition cursor-pointer hover:brightness-95 active:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2`}>
          {t.node}
        </button>
      ))}
      <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 text-ink-700 text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2">
        <Copy className="size-3.5" strokeWidth={2} /> Copy link
      </button>
    </div>
  );
}
