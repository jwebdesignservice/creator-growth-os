"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Subtitles,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  duration: string;
  videoUrl?: string | null;
  coverUrl?: string | null;
};

const RATES = [1, 1.25, 1.5, 2];

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Lesson player — fully custom controls in the platform's rose/ink language
 * (no native chrome): center play, scrubber with buffered track + drag
 * seeking, time, speed cycle, mute + volume, fullscreen. Controls fade away
 * while watching and return on movement, pause, or keyboard focus.
 * Keyboard: Space/K play · ←/→ seek 5s · M mute · F fullscreen.
 */
export function LessonVideoPlayer({ title, duration, videoUrl, coverUrl }: Props) {
  // Real uploaded video → the custom player below; none → design placeholder.
  if (videoUrl) {
    return <CustomPlayer title={title} videoUrl={videoUrl} coverUrl={coverUrl} />;
  }
  return <PlaceholderPlayer title={title} duration={duration} />;
}

/* ─── Custom player ────────────────────────────────────────────────────── */

function CustomPlayer({
  title,
  videoUrl,
  coverUrl,
}: {
  title: string;
  videoUrl: string;
  coverUrl?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [controlsOn, setControlsOn] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [isFs, setIsFs] = useState(false);

  /* Controls auto-hide: any interaction shows them; while playing they
     retire after 2.6s of stillness. Always visible when paused/ended. */
  const wake = useCallback(() => {
    setControlsOn(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v && !v.paused && !v.ended) setControlsOn(false);
    }, 2600);
  }, []);
  useEffect(
    () => () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    },
    [],
  );

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) void v.play();
    else v.pause();
    wake();
  }, [wake]);

  const seekBy = useCallback(
    (delta: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration)) return;
      v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
      wake();
    },
    [wake],
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    wake();
  }, [wake]);

  const toggleFs = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
    wake();
  }, [wake]);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  /* Scrubber — pointer-driven so click + drag both seek live. */
  const seekToClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    const v = videoRef.current;
    if (!track || !v || !Number.isFinite(v.duration)) return;
    const rect = track.getBoundingClientRect();
    const frac = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = frac * v.duration;
    setCurrent(v.currentTime);
  }, []);

  const onScrubDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true);
    seekToClientX(e.clientX);
  };
  const onScrubMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scrubbing) seekToClientX(e.clientX);
  };
  const onScrubUp = () => setScrubbing(false);

  const cycleRate = () => {
    const v = videoRef.current;
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    if (v) v.playbackRate = next;
    setRate(next);
    wake();
  };

  const onVolume = (val: number) => {
    const v = videoRef.current;
    setVolume(val);
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setMuted(v.muted);
    wake();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Don't steal keys from the volume slider.
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === " " || e.key.toLowerCase() === "k") {
      e.preventDefault();
      toggle();
    } else if (e.key === "ArrowRight") seekBy(5);
    else if (e.key === "ArrowLeft") seekBy(-5);
    else if (e.key.toLowerCase() === "m") toggleMute();
    else if (e.key.toLowerCase() === "f") toggleFs();
  };

  const pct = total > 0 ? (current / total) * 100 : 0;
  const bufPct = total > 0 ? (buffered / total) * 100 : 0;
  const showControls = controlsOn || !playing || scrubbing;

  const ctlBtn =
    "inline-flex size-9 items-center justify-center rounded-[10px] text-white/90 transition-all duration-150 hover:bg-white/15 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 cursor-pointer";

  return (
    <section id="lesson-video" className="scroll-mt-24 relative">
      {/* ambient stage glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-6 -bottom-10 blur-2xl"
        style={{
          backgroundImage:
            "radial-gradient(55% 65% at 50% 35%, rgba(208,129,113,0.16), transparent 70%)",
        }}
      />
      <div className="relative rounded-[20px] p-px bg-gradient-to-b from-ink-900/[0.16] via-ink-900/[0.07] to-ink-900/[0.18] shadow-[0_28px_70px_-30px_rgba(26,24,22,0.5)]">
        <div
          ref={frameRef}
          tabIndex={0}
          role="group"
          aria-label={`Video player: ${title}`}
          onKeyDown={onKeyDown}
          onMouseMove={wake}
          onMouseLeave={() => {
            const v = videoRef.current;
            if (v && !v.paused && !v.ended) setControlsOn(false);
          }}
          className={cn(
            "group/player relative aspect-video overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
            isFs ? "rounded-none" : "rounded-[19px]",
            showControls ? "cursor-default" : "cursor-none",
          )}
        >
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            poster={coverUrl ?? undefined}
            playsInline
            preload="metadata"
            aria-label={title}
            onClick={toggle}
            onPlay={() => {
              setPlaying(true);
              setStarted(true);
              setEnded(false);
              wake();
            }}
            onPause={() => {
              setPlaying(false);
              setControlsOn(true);
            }}
            onEnded={() => {
              setEnded(true);
              setControlsOn(true);
            }}
            onWaiting={() => setWaiting(true)}
            onPlaying={() => setWaiting(false)}
            onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
            onDurationChange={(e) => setTotal(e.currentTarget.duration || 0)}
            onProgress={(e) => {
              const b = e.currentTarget.buffered;
              if (b.length > 0) setBuffered(b.end(b.length - 1));
            }}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />

          {/* top edge light */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />

          {/* buffering spinner */}
          {waiting && started && !ended && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="block size-11 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            </span>
          )}

          {/* center play / replay — the calm brand moment */}
          {(!playing || ended) && !waiting && (
            <button
              type="button"
              onClick={toggle}
              aria-label={ended ? `Replay ${title}` : `Play ${title}`}
              className="group/center absolute inset-0 flex items-center justify-center focus-visible:outline-none"
            >
              <span className="flex size-[72px] items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-[0_18px_44px_-12px_rgba(0,0,0,0.55)] ring-1 ring-black/5 backdrop-blur transition-transform duration-200 ease-out group-hover/center:scale-105 group-focus-visible/center:ring-2 group-focus-visible/center:ring-rose-300">
                {ended ? (
                  <RotateCcw className="size-7" strokeWidth={2.2} />
                ) : (
                  <Play className="ml-1 size-8" fill="currentColor" strokeWidth={0} />
                )}
              </span>
            </button>
          )}

          {/* control deck — scrim + scrubber + buttons */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 transition-all duration-300 ease-out",
              showControls
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0",
            )}
          >
            {/* scrim */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-14 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
            />

            {/* scrubber */}
            <div
              ref={trackRef}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(total)}
              aria-valuenow={Math.round(current)}
              aria-valuetext={`${fmt(current)} of ${fmt(total)}`}
              onPointerDown={onScrubDown}
              onPointerMove={onScrubMove}
              onPointerUp={onScrubUp}
              className="group/track relative mx-4 flex h-6 cursor-pointer touch-none items-center"
            >
              <div className="relative h-[4px] w-full overflow-visible rounded-full bg-white/20 transition-[height] duration-150 group-hover/track:h-[6px]">
                {/* buffered */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-full bg-white/25"
                  style={{ width: `${bufPct}%` }}
                />
                {/* played — brand rose */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                  style={{ width: `${pct}%` }}
                />
                {/* handle */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 size-[13px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] ring-2 ring-rose-400 transition-transform duration-150",
                    scrubbing
                      ? "scale-110"
                      : "scale-0 group-hover/track:scale-100",
                  )}
                  style={{ left: `${pct}%` }}
                />
              </div>
            </div>

            {/* buttons row */}
            <div className="relative flex items-center gap-1 px-3 pb-2.5 pt-0.5">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className={ctlBtn}
              >
                {playing ? (
                  <Pause className="size-[18px]" fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play className="ml-0.5 size-[18px]" fill="currentColor" strokeWidth={0} />
                )}
              </button>

              {/* volume cluster */}
              <div className="group/vol flex items-center">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className={ctlBtn}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="size-[18px]" strokeWidth={2} />
                  ) : (
                    <Volume2 className="size-[18px]" strokeWidth={2} />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => onVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="h-1 w-0 cursor-pointer accent-rose-400 opacity-0 transition-all duration-200 group-hover/vol:ml-1 group-hover/vol:w-16 group-hover/vol:opacity-100 focus-visible:ml-1 focus-visible:w-16 focus-visible:opacity-100"
                />
              </div>

              <span className="ml-1.5 text-[12px] font-medium tabular-nums text-white/85">
                {fmt(current)}
                <span className="mx-1 text-white/40">/</span>
                {fmt(total)}
              </span>

              <span className="flex-1" />

              <button
                type="button"
                onClick={cycleRate}
                aria-label={`Playback speed ${rate}x`}
                className="inline-flex h-7 items-center rounded-[8px] px-2 text-[11.5px] font-bold tabular-nums text-white/90 transition-all duration-150 hover:bg-white/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 cursor-pointer"
              >
                {rate}x
              </button>
              <button
                type="button"
                aria-label="Subtitles (coming soon)"
                disabled
                className="inline-flex size-9 items-center justify-center rounded-[10px] text-white/35 cursor-default"
              >
                <Subtitles className="size-[18px]" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={toggleFs}
                aria-label={isFs ? "Exit fullscreen" : "Fullscreen"}
                className={ctlBtn}
              >
                {isFs ? (
                  <Minimize2 className="size-[17px]" strokeWidth={2} />
                ) : (
                  <Maximize2 className="size-[17px]" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Placeholder (no video uploaded yet) ──────────────────────────────── */

function PlaceholderPlayer({ title, duration }: { title: string; duration: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="lesson-video" className="scroll-mt-24 rounded-[20px] overflow-hidden bg-cream-200 relative aspect-video ring-1 ring-ink-900/10 shadow-[0_24px_60px_-28px_rgba(26,24,22,0.35)]">
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
