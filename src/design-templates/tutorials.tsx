/* Tutorials ─────────────────────────────────────────────────────────────
   Tutorials-library surfaces: the featured-lesson hero (gradient + big play),
   a tutorial grid card (thumbnail + play overlay + completed badge + runtime),
   and a compact creator-drill list row. Pure presentational mirrors of
   src/components/tutorials/* and src/app/(app)/tutorials/*.
   ───────────────────────────────────────────────────────────────────── */

import {
  Play,
  Sparkles,
  Clock,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Featured lesson hero — gradient banner with meta + big play button.
// ─────────────────────────────────────────────────────────────────────────────

export function FeaturedLessonHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-rose-100 via-cream-200 to-cream-100 w-[720px] max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-6 p-8">
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-[12.5px] mb-3">
            <Sparkles className="size-4" strokeWidth={2} /> Featured Lesson
          </span>
          <h2 className="text-[32px] font-display text-ink-900 leading-tight mb-3">
            Film a Clean Talking-Head Clip
          </h2>
          <p className="text-[14px] text-ink-600 leading-relaxed mb-4">
            A 3-minute walkthrough for framing, focus, and audio so your
            on-camera clips look sharp with just a phone.
          </p>
          <div className="flex items-center gap-5 text-[13px] text-ink-600 mb-5">
            <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-rose-500" strokeWidth={2} /> 03:00</span>
            <span className="inline-flex items-center gap-1.5"><BarChart3 className="size-3.5 text-rose-500" strokeWidth={2} /> Beginner</span>
          </div>
          <span className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 text-white text-[15px] font-medium shadow-sm">
            <Play className="size-4" fill="currentColor" /> Continue Watching
          </span>
        </div>

        {/* Big play button */}
        <div className="hidden sm:flex items-center justify-center shrink-0 pr-4">
          <span className="size-28 rounded-full bg-white shadow-card inline-flex items-center justify-center">
            <Play className="size-10 text-rose-600 ml-1.5" fill="currentColor" />
          </span>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutorial card — video thumbnail with play overlay, badges, runtime.
// ─────────────────────────────────────────────────────────────────────────────

export function TutorialCard() {
  return (
    <div className="w-[280px] rounded-[16px] border border-ink-100 bg-white overflow-hidden shadow-sm">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-rose-100 via-cream-200 to-cream-300">
        {/* type chips */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/85 backdrop-blur text-[10.5px] font-semibold text-ink-700">All</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/85 backdrop-blur text-[10.5px] font-semibold text-ink-700">Video</span>
        </div>
        {/* completed badge */}
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10.5px] font-semibold">
          <CheckCircle2 className="size-3" strokeWidth={2.4} /> Completed
        </span>
        {/* play overlay */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="size-12 rounded-full bg-white/90 inline-flex items-center justify-center shadow-md">
            <Play className="size-5 text-rose-600 ml-0.5" fill="currentColor" />
          </span>
        </span>
        {/* runtime */}
        <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-ink-900/80 text-white text-[10.5px] font-semibold tabular-nums">
          03:00
        </span>
      </div>
      {/* Body */}
      <div className="p-3.5">
        <h4 className="text-[14px] font-bold text-ink-900 leading-snug line-clamp-2">
          Film a Clean Talking-Head Clip
        </h4>
        <p className="text-[12px] text-ink-500 leading-snug mt-1 line-clamp-2">
          Framing, focus, and audio so your clips look sharp with just a phone.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Creator drill row — compact play-row used in the "Creator Drills" list.
// ─────────────────────────────────────────────────────────────────────────────

export function CreatorDrillRow() {
  const drills = [
    { title: "Hooks That Stop The Scroll", duration: "11:20" },
    { title: "Content Pillars That Work", duration: "15:30" },
    { title: "How To Read Platform Performance", duration: "13:45" },
  ];
  return (
    <div className="card p-5 w-[360px] max-w-full">
      <h3 className="text-h4 text-ink-900 mb-3">Creator Drills</h3>
      <ul className="space-y-2.5">
        {drills.map((d) => (
          <li key={d.title} className="flex items-center gap-3 group cursor-pointer">
            <span className="size-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-200 transition-colors">
              <Play className="size-3.5 text-rose-600 ml-0.5" fill="currentColor" />
            </span>
            <span className="flex-1 text-[13px] text-ink-900 truncate">{d.title}</span>
            <span className={cn("text-[12px] text-ink-500 tabular-nums inline-flex items-center gap-1")}>
              <Clock className="size-3 text-ink-400" strokeWidth={2} />
              {d.duration}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
