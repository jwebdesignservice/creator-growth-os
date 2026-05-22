"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Lock, Film } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   IntroVideo — gated platform walkthrough on the onboarding completion screen.

   Behaviour:
   • Plays an HTML5 video. Drop the real file at  public/onboarding-intro.mp4
     (or pass a different `src`).
   • The viewer must reach the end to "complete" it — skipping ahead past the
     furthest-watched point is blocked, so the gate is real.
   • `onComplete` fires once when the video ends (or reaches ~the end).
   • Graceful fallback: if the asset is missing / fails to load, we don't brick
     the flow — we show a friendly placeholder and unlock continue.
   ───────────────────────────────────────────────────────────────────────── */

type Props = {
  /** Path to the intro video. Real file goes at public/onboarding-intro.mp4. */
  src?: string;
  poster?: string;
  onComplete: () => void;
};

export function IntroVideo({
  src = "/onboarding-intro.mp4",
  poster,
  onComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxWatched = useRef(0);
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  function markComplete() {
    if (watched) return;
    setWatched(true);
    setProgress(100);
    onComplete();
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (v.currentTime > maxWatched.current) maxWatched.current = v.currentTime;
    setProgress(Math.min(100, Math.round((v.currentTime / v.duration) * 100)));
    if (v.currentTime >= v.duration - 0.4) markComplete();
  }

  // Prevent scrubbing past the furthest point actually watched.
  function handleSeeking() {
    const v = videoRef.current;
    if (!v || watched) return;
    if (v.currentTime > maxWatched.current + 1) {
      v.currentTime = maxWatched.current;
    }
  }

  function handleError() {
    // No asset yet (or failed to load) — keep the flow usable.
    setUnavailable(true);
    markComplete();
  }

  return (
    <div className="rounded-[20px] border border-ink-100 bg-white overflow-hidden shadow-card">
      <div className="relative aspect-video bg-ink-900">
        {unavailable ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center bg-gradient-to-br from-cream-200 via-cream-100 to-rose-100/40">
            <span className="inline-flex items-center justify-center size-12 rounded-full bg-white text-rose-600 shadow-soft">
              <Film className="size-5" strokeWidth={1.8} />
            </span>
            <p className="text-[13.5px] font-semibold text-ink-900">
              Platform intro coming soon
            </p>
            <p className="text-[12px] text-ink-500 max-w-sm leading-snug">
              Your walkthrough video will play here. You&apos;re all set to
              continue to your dashboard.
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            preload="metadata"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onEnded={markComplete}
            onError={handleError}
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>

      {/* Status / progress bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={cn(
              "text-[12.5px] font-medium inline-flex items-center gap-1.5",
              watched ? "text-success" : "text-ink-700",
            )}
          >
            {watched ? (
              <CheckCircle2 className="size-4" strokeWidth={2} />
            ) : (
              <Lock className="size-3.5" strokeWidth={2} />
            )}
            {watched
              ? "Intro complete — you're good to go"
              : "Watch the full intro to unlock your dashboard"}
          </span>
          {!unavailable && (
            <span className="text-[11.5px] text-ink-500 tabular-nums">
              {progress}%
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-200",
              watched ? "bg-success" : "bg-rose-500",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
