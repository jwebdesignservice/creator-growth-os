/* Video ──────────────────────────────────────────────────────────────────
   Video surfaces that complement the player already in "Learning" — a
   lesson playlist row and a video upload / processing card. Presentational.
   ───────────────────────────────────────────────────────────────────── */

import { Play, Clock, Film } from "lucide-react";

export function VideoListItem() {
  const rows = [
    { title: "Intro: why hooks matter", dur: "4:12", done: true, current: false },
    { title: "The 3-second hook framework", dur: "8:30", done: false, current: true },
    { title: "Writing your first hook", dur: "6:45", done: false, current: false },
  ];
  return (
    <div className="card p-2 w-[420px] max-w-full">
      {rows.map((r, i) => (
        <div
          key={i}
          className={"flex items-center gap-3 p-2 rounded-[12px] " + (r.current ? "bg-rose-50" : "hover:bg-cream-100")}
        >
          <div className="relative size-16 rounded-[10px] bg-gradient-to-br from-rose-100 to-cream-200 shrink-0 overflow-hidden flex items-center justify-center">
            <Play className="size-5 text-rose-600" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <div className={"text-[13px] font-semibold leading-snug line-clamp-1 " + (r.current ? "text-rose-700" : "text-ink-900")}>
              {r.title}
            </div>
            <div className="text-[11.5px] text-ink-400 inline-flex items-center gap-1 mt-1">
              <Clock className="size-3" strokeWidth={2} />
              {r.dur}
            </div>
          </div>
          {r.done && <span className="text-[11px] font-semibold text-success shrink-0">Watched</span>}
        </div>
      ))}
    </div>
  );
}

export function VideoUploadCard() {
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <div className="flex items-center gap-3">
        <div className="relative size-16 rounded-[10px] bg-gradient-to-br from-rose-100 to-cream-200 shrink-0 overflow-hidden flex items-center justify-center">
          <Film className="size-5 text-rose-500" strokeWidth={1.9} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 truncate">hook-framework-final.mp4</div>
          <div className="text-[11.5px] text-ink-400">128 MB · processing…</div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden mt-2">
            <div className="h-full w-2/3 bg-rose-500 rounded-full" />
          </div>
        </div>
        <span className="text-[12px] font-semibold text-ink-500 tabular-nums">67%</span>
      </div>
    </div>
  );
}
