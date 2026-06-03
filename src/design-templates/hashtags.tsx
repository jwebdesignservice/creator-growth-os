/* Hashtags ─────────────────────────────────────────────────────────────────
   Content-strategy hashtag tools — a research list (volume + difficulty) and
   a saved hashtag set. Creator-facing.
   ───────────────────────────────────────────────────────────────────── */

import { Hash, Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";

export function HashtagResearch() {
  const tags = [
    { t: "fitnesstips", vol: "2.4M", diff: 78 },
    { t: "homeworkout", vol: "880K", diff: 54 },
    { t: "morningroutine", vol: "1.2M", diff: 62 },
    { t: "healthyhabits", vol: "640K", diff: 41 },
  ];
  return (
    <div className="card p-5 w-[400px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-3">Hashtag research</h3>
      <div className="space-y-2.5">
        {tags.map((t) => (
          <div key={t.t} className="flex items-center gap-3">
            <span className="size-8 rounded-[9px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Hash className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900">#{t.t}</div>
              <div className="text-[11px] text-ink-400">{t.vol} posts</div>
            </div>
            <div className="w-16 shrink-0">
              <div className="flex items-center justify-between text-[10px] text-ink-400 mb-0.5">
                <span>diff</span>
                <span className="tabular-nums">{t.diff}</span>
              </div>
              <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div className={cn("h-full rounded-full", t.diff >= 70 ? "bg-rose-500" : t.diff >= 50 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${t.diff}%` }} />
              </div>
            </div>
            <Bookmark className="size-4 text-ink-300 shrink-0" strokeWidth={2} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HashtagSet() {
  const tags = ["fitnesstips", "homeworkout", "morningroutine", "healthyhabits", "noexcuses", "fitfam"];
  return (
    <div className="card p-4 w-[340px] max-w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-bold text-ink-900">Saved set · Fitness</h3>
        <span className="text-[11px] text-ink-400">6 tags</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center h-7 px-2.5 rounded-full bg-rose-50 text-rose-700 text-[12px] font-medium">#{t}</span>
        ))}
      </div>
    </div>
  );
}
