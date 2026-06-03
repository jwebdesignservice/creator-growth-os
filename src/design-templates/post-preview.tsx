/* Post preview ─────────────────────────────────────────────────────────────
   How a post will look once published — an Instagram-style post mock and a
   3×3 profile-grid preview. Creator-facing (the posting composer preview).
   ───────────────────────────────────────────────────────────────────── */

import { Heart, MessageCircle, Send, Bookmark, Ellipsis } from "lucide-react";

export function IgPostPreview() {
  return (
    <div className="w-[300px] max-w-full rounded-[16px] border border-ink-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 h-12">
        <span className="size-8 rounded-full bg-rose-600 text-white text-[11px] font-semibold inline-flex items-center justify-center">JW</span>
        <span className="text-[13px] font-semibold text-ink-900 flex-1">jackwilson</span>
        <Ellipsis className="size-4 text-ink-400" strokeWidth={2} />
      </div>
      <div className="aspect-square bg-gradient-to-br from-rose-200 via-cream-200 to-violet-200" />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-4 mb-2">
          <Heart className="size-5 text-rose-500" fill="currentColor" strokeWidth={0} />
          <MessageCircle className="size-5 text-ink-700" strokeWidth={1.8} />
          <Send className="size-5 text-ink-700" strokeWidth={1.8} />
          <Bookmark className="size-5 text-ink-700 ml-auto" strokeWidth={1.8} />
        </div>
        <div className="text-[12.5px] font-semibold text-ink-900">2,481 likes</div>
        <p className="text-[12.5px] text-ink-700 mt-0.5 leading-snug">
          <span className="font-semibold">jackwilson</span> 3 micro-habits that changed my training 💪
        </p>
      </div>
    </div>
  );
}

export function PostGridPreview() {
  const tiles = [
    "from-rose-200 to-cream-200",
    "from-violet-200 to-rose-100",
    "from-amber-100 to-rose-100",
    "from-sky-200 to-cream-200",
    "from-rose-100 to-violet-100",
    "from-cream-200 to-rose-200",
    "from-rose-200 to-amber-100",
    "from-violet-100 to-sky-100",
    "from-cream-200 to-violet-100",
  ];
  return (
    <div className="w-[300px] max-w-full">
      <div className="grid grid-cols-3 gap-0.5 rounded-[12px] overflow-hidden border border-ink-100">
        {tiles.map((t, i) => (
          <div key={i} className={"aspect-square bg-gradient-to-br " + t} />
        ))}
      </div>
    </div>
  );
}
