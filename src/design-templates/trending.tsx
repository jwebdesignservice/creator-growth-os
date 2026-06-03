/* Trending ─────────────────────────────────────────────────────────────────
   What's hot right now — trending sounds (with a mini waveform) and trending
   topics with momentum. Creator content-discovery.
   ───────────────────────────────────────────────────────────────────── */

import { Music, TrendingUp, Play } from "lucide-react";
import { cn } from "@/lib/cn";

function Wave() {
  const bars = [6, 12, 8, 16, 10, 14, 7, 13, 9, 15, 8, 11];
  return (
    <span className="inline-flex items-end gap-0.5 h-5 shrink-0">
      {bars.map((h, i) => (
        <span key={i} className="w-0.5 rounded-full bg-rose-400" style={{ height: `${h}px` }} />
      ))}
    </span>
  );
}

export function TrendingSounds() {
  const sounds = [
    { t: "original audio – calm beat", uses: "24.1K" },
    { t: "upbeat morning vibes", uses: "18.7K" },
    { t: "viral transition sound", uses: "52.3K" },
  ];
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-h5 text-ink-900">Trending sounds</h3>
        <TrendingUp className="size-4 text-rose-500" strokeWidth={2} />
      </div>
      <div className="space-y-2.5">
        {sounds.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Music className="size-4" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ink-900 truncate">{s.t}</div>
              <div className="text-[11px] text-ink-400">{s.uses} videos</div>
            </div>
            <Wave />
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-rose-600 shrink-0">
              <Play className="size-3" fill="currentColor" strokeWidth={0} />
              Use
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendingTopics() {
  const topics = [
    { t: "#75hard", up: true },
    { t: "morning routine", up: true },
    { t: "protein recipes", up: false },
    { t: "home gym", up: true },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-3">Trending in fitness</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <span key={t.t} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-cream-100 text-ink-700 text-[12.5px] font-medium">
            <TrendingUp className={cn("size-3.5", t.up ? "text-emerald-500" : "text-ink-300 rotate-180")} strokeWidth={2.2} />
            {t.t}
          </span>
        ))}
      </div>
    </div>
  );
}
