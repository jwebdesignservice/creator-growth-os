/* Gallery ─────────────────────────────────────────────────────────────────
   Media surfaces — a thumbnail grid (with hover stats + video badges) and a
   lightbox with a thumbnail strip. Used in media kits, tutorials, profiles.
   Tiles and thumbnails are focusable so they open / select via keyboard too.
   ───────────────────────────────────────────────────────────────────── */

import { Play, Heart } from "lucide-react";
import { cn } from "@/lib/cn";

const TILE_FOCUS =
  "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50";

export function MediaGrid() {
  const tiles = [
    { hue: "from-rose-200 to-cream-200", video: false },
    { hue: "from-violet-200 to-rose-100", video: true },
    { hue: "from-amber-100 to-rose-100", video: false },
    { hue: "from-sky-200 to-cream-200", video: false },
    { hue: "from-rose-100 to-violet-100", video: true },
    { hue: "from-cream-200 to-rose-200", video: false },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 w-[360px] max-w-full">
      {tiles.map((t, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Open media ${i + 1}${t.video ? " (video)" : ""}`}
          className={cn("group relative aspect-square rounded-[12px] overflow-hidden bg-gradient-to-br", t.hue, TILE_FOCUS)}
        >
          {t.video && (
            <span className="absolute top-2 right-2 size-6 rounded-full bg-black/40 text-white inline-flex items-center justify-center">
              <Play className="size-3 ml-0.5" fill="currentColor" />
            </span>
          )}
          <span className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/30 transition-colors flex items-end p-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="size-3" fill="currentColor" />
              1.2k
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function Lightbox() {
  const thumbs = [
    "from-rose-200 to-cream-200",
    "from-violet-200 to-rose-100",
    "from-amber-100 to-rose-100",
    "from-sky-200 to-cream-200",
  ];
  return (
    <div className="w-[420px] max-w-full">
      <div className="aspect-video rounded-[14px] bg-gradient-to-br from-violet-200 to-rose-100 relative overflow-hidden">
        <button
          type="button"
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center group focus:outline-none cursor-pointer"
        >
          <span className="size-14 rounded-full bg-white/85 inline-flex items-center justify-center shadow-card transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-rose-500 group-focus-visible:ring-offset-2">
            <Play className="size-6 text-rose-600 ml-1" fill="currentColor" />
          </span>
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        {thumbs.map((h, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View image ${i + 1}`}
            aria-current={i === 1 ? "true" : undefined}
            className={cn(
              "flex-1 aspect-video rounded-[8px] bg-gradient-to-br",
              h,
              TILE_FOCUS,
              i === 1 ? "ring-2 ring-rose-500" : "opacity-70 hover:opacity-100 transition-opacity",
            )}
          />
        ))}
      </div>
    </div>
  );
}
