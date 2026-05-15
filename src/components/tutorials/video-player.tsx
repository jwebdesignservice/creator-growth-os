"use client";

import { useState } from "react";
import { Play, Pause, Volume2, Maximize2, Subtitles } from "lucide-react";

type Props = {
  title: string;
  duration: string;
  videoUrl?: string | null;
};

/**
 * Stylized lesson-player container matching the design comps. The real
 * <video> embed will land when admin uploads files; for now this renders
 * a polished placeholder with the proper transport controls UI.
 */
export function LessonVideoPlayer({ title, duration, videoUrl }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="rounded-[18px] overflow-hidden border border-ink-100 bg-cream-200 relative aspect-video">
      {/* Decorative cover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-cream-200 to-rose-200/40"
        aria-hidden
      />
      <CoverArt />

      {/* Center play button */}
      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="absolute inset-0 flex items-center justify-center group cursor-pointer"
        >
          <span className="size-20 rounded-full bg-white/90 backdrop-blur shadow-card group-hover:scale-105 transition-transform flex items-center justify-center">
            <Play
              className="size-9 text-rose-600 ml-1.5"
              fill="currentColor"
            />
          </span>
        </button>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent">
        <div className="flex items-center gap-3 px-4 py-3 text-white">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
            className="size-9 rounded-full bg-white/20 hover:bg-white/30 inline-flex items-center justify-center cursor-pointer"
          >
            {playing ? (
              <Pause className="size-4" fill="currentColor" />
            ) : (
              <Play className="size-4 ml-0.5" fill="currentColor" />
            )}
          </button>
          <span className="text-[12px] tabular-nums font-medium">00:00</span>
          <div className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
            <div className="h-full w-0 bg-rose-500" />
          </div>
          <span className="text-[12px] tabular-nums font-medium">{duration}</span>
          <Volume2 className="size-4" strokeWidth={2} />
          <span className="text-[11px] font-semibold bg-white/20 rounded px-1.5 py-0.5">
            1x
          </span>
          <Subtitles className="size-4" strokeWidth={2} />
          <Maximize2 className="size-4" strokeWidth={2} />
        </div>
      </div>

      {/* Hide unused-prop warning */}
      <span hidden>{videoUrl}</span>
    </section>
  );
}

function CoverArt() {
  return (
    <svg
      className="absolute inset-0 w-full h-full text-rose-300/70"
      viewBox="0 0 1200 675"
      fill="currentColor"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="200" cy="180" r="55" />
      <circle cx="380" cy="120" r="30" className="text-rose-200" fill="currentColor" />
      <circle cx="950" cy="200" r="42" />
      <circle cx="1080" cy="120" r="22" />
      <circle cx="850" cy="540" r="38" />
      <circle cx="120" cy="540" r="48" className="text-rose-200" fill="currentColor" />
      <rect x="540" y="280" width="120" height="180" rx="14" className="text-cream-100" fill="currentColor" />
      <rect x="555" y="295" width="90" height="6" rx="3" className="text-rose-300" fill="currentColor" />
      <rect x="555" y="310" width="60" height="6" rx="3" className="text-rose-300" fill="currentColor" />
    </svg>
  );
}
