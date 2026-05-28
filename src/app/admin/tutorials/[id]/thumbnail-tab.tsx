"use client";

import { useRef, useState, useTransition } from "react";
import {
  Image as ImageIcon,
  Camera,
  Upload,
  Info,
  Lightbulb,
  Check,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createSignedMediaUpload, publicMediaUrl } from "../new/actions";
import { updateLesson } from "@/app/admin/lessons/actions";

/* ─────────────────────────────────────────────────────────────────────────
   Thumbnail tab — pick the cover learners see first. Fully backend-wired:
   both "Upload custom" and "Select frame" produce a real image in the
   lesson-media bucket and persist it to lessons.cover_image_url. The
   frame grab loads the lesson video into a hidden <video>, seeks to the
   chosen second, and captures it to a canvas.

   Intro / outro / loop have no schema yet, so they're surfaced as a
   clearly-labelled "coming soon" note rather than a fake control.
   ───────────────────────────────────────────────────────────────────────── */

const BEST_PRACTICES = [
  "Choose a high-quality frame with clear focus and contrast.",
  "Aim for a 16:9 image around 1280×720 for crisp cards.",
  "Avoid busy frames — one clear subject reads best at small sizes.",
  "Add light branding so your tutorials feel consistent.",
];

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "saved" }
  | { kind: "error"; msg: string };

export function ThumbnailTab({
  lessonId,
  coverImageUrl,
  videoUrl,
  durationSeconds,
  durationLabel,
}: {
  lessonId: string;
  coverImageUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  durationLabel: string;
}) {
  const safeMax = Math.max(0, durationSeconds);
  const [cover, setCover] = useState<string | null>(coverImageUrl);
  const [frameSec, setFrameSec] = useState<number>(Math.min(7, Math.max(0, safeMax - 1)));
  const [showTime, setShowTime] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [, startTransition] = useTransition();

  const fileRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLVideoElement>(null);

  /* Persist a cover URL to the lesson row. */
  function persistCover(url: string | null) {
    startTransition(async () => {
      const res = await updateLesson(lessonId, { cover_image_url: url });
      if (!res.ok) {
        setStatus({ kind: "error", msg: res.error });
        return;
      }
      setStatus({ kind: "saved" });
      window.setTimeout(() => setStatus({ kind: "idle" }), 2500);
    });
  }

  /* Upload an image file → cover. */
  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus({ kind: "error", msg: "Choose an image (PNG, JPG or WebP)." });
      return;
    }
    setStatus({ kind: "busy", msg: "Uploading thumbnail…" });
    const signed = await createSignedMediaUpload(file.name, "image");
    if (!signed.ok) { setStatus({ kind: "error", msg: signed.error }); return; }
    const supabase = createClient();
    const up = await supabase.storage
      .from(signed.bucket)
      .uploadToSignedUrl(signed.path, signed.token, file);
    if (up.error) { setStatus({ kind: "error", msg: up.error.message }); return; }
    const url = await publicMediaUrl(signed.path);
    setCover(url);
    persistCover(url);
  }

  /* Capture the current frame from the lesson video → cover. */
  async function captureFrame() {
    const v = captureRef.current;
    if (!v || !videoUrl) {
      setStatus({ kind: "error", msg: "This tutorial has no video to grab a frame from." });
      return;
    }
    setStatus({ kind: "busy", msg: "Capturing frame…" });
    try {
      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => { v.removeEventListener("seeked", onSeeked); resolve(); };
        const onErr = () => { v.removeEventListener("error", onErr); reject(new Error("Could not load the video.")); };
        v.addEventListener("seeked", onSeeked);
        v.addEventListener("error", onErr);
        v.currentTime = Math.min(frameSec, Math.max(0, (v.duration || safeMax) - 0.1));
      });
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth || 1280;
      canvas.height = v.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable.");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      if (!blob) throw new Error("Could not capture the frame.");
      const file = new File([blob], `frame-${Math.round(frameSec)}.jpg`, { type: "image/jpeg" });
      const signed = await createSignedMediaUpload(file.name, "image");
      if (!signed.ok) { setStatus({ kind: "error", msg: signed.error }); return; }
      const supabase = createClient();
      const up = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (up.error) { setStatus({ kind: "error", msg: up.error.message }); return; }
      const url = await publicMediaUrl(signed.path);
      setCover(url);
      persistCover(url);
    } catch (e) {
      setStatus({ kind: "error", msg: e instanceof Error ? e.message : "Frame capture failed." });
    }
  }

  function removeCover() {
    setCover(null);
    persistCover(null);
  }

  const busy = status.kind === "busy";

  return (
    <>
      {/* ── Thumbnail setup ──────────────────────────────────── */}
      <section className="card p-5 sm:p-6">
        <header className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div className="min-w-0">
            <h3 className="inline-flex items-center gap-2.5 text-h4 text-ink-900">
              <span className="size-7 rounded-[8px] bg-rose-50 text-rose-600 inline-flex items-center justify-center">
                <ImageIcon className="size-[15px]" strokeWidth={2} />
              </span>
              Thumbnail setup
            </h3>
            <p className="text-[12.5px] text-ink-500 mt-1.5 ml-[38px]">
              Pick the cover learners see first — capture a frame from the
              video or upload your own image.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center h-7 px-3 rounded-full bg-cream-100 border border-ink-100 text-[11.5px] font-medium text-ink-700">
            Recommended: 16:9 (1280×720)
          </span>
        </header>

        {/* Preview + controls */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] gap-5 items-start">
          {/* Preview */}
          <div className="relative aspect-video rounded-[12px] overflow-hidden bg-ink-900 ring-1 ring-ink-100">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="Current cover" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-cream-100/60 text-[12px]">
                No cover frame selected yet
              </div>
            )}
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 text-white text-[11px] font-semibold backdrop-blur-sm">
              <ImageIcon className="size-3" strokeWidth={2.5} />
              Current cover
            </span>
            {showTime && (
              <span className="absolute bottom-3 right-3 inline-flex items-center h-6 px-2 rounded-md bg-black/65 text-white text-[11px] font-semibold tabular-nums backdrop-blur-sm">
                {formatTime(frameSec)}
              </span>
            )}
          </div>

          {/* Side controls */}
          <aside className="space-y-3.5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-500">
                Selected frame
              </div>
              <div className="text-[26px] font-bold text-ink-900 leading-none tabular-nums mt-1.5">
                {formatTime(frameSec)}
              </div>
              <div className="text-[12px] text-ink-500 mt-1">of {durationLabel}</div>
            </div>

            {videoUrl && safeMax > 0 && (
              <input
                type="range"
                min={0}
                max={Math.max(1, safeMax)}
                value={frameSec}
                onChange={(e) => setFrameSec(Number(e.target.value))}
                aria-label="Cover frame position"
                className="w-full accent-rose-600"
              />
            )}

            <label className="flex items-center gap-2 text-[12.5px] text-ink-700 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={showTime}
                onChange={(e) => setShowTime(e.target.checked)}
                className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300 cursor-pointer"
              />
              Show time on cover
            </label>
          </aside>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={captureFrame}
            disabled={busy || !videoUrl}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 disabled:bg-rose-300 shadow-sm transition-colors"
          >
            {busy && status.msg.startsWith("Capturing") ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Camera className="size-3.5" strokeWidth={2} />
            )}
            Select frame
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-semibold hover:bg-cream-100 disabled:opacity-50 transition-colors"
          >
            {busy && status.msg.startsWith("Uploading") ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Upload className="size-3.5" strokeWidth={2} />
            )}
            Upload custom
          </button>
          {cover && (
            <button
              type="button"
              onClick={removeCover}
              disabled={busy}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-ink-200 text-ink-500 text-[12.5px] font-medium hover:bg-cream-100 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
              Remove
            </button>
          )}

          {/* Status */}
          <span className="ml-auto text-[12px]">
            {status.kind === "saved" && (
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check className="size-3.5" strokeWidth={2.5} /> Saved
              </span>
            )}
            {status.kind === "busy" && (
              <span className="inline-flex items-center gap-1.5 text-ink-500">
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} /> {status.msg}
              </span>
            )}
            {status.kind === "error" && (
              <span className="inline-flex items-center gap-1.5 text-rose-600">
                <AlertCircle className="size-3.5" strokeWidth={2} /> {status.msg}
              </span>
            )}
          </span>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
        />
        {/* Hidden capture source — must allow CORS so the canvas isn't tainted. */}
        {videoUrl && (
          <video ref={captureRef} src={videoUrl} className="hidden" muted playsInline crossOrigin="anonymous" preload="metadata" />
        )}

        {/* Info notice */}
        <div className="mt-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-rose-50/60 border border-rose-100 text-[12.5px] text-ink-700">
          <Info className="size-4 text-rose-500 shrink-0 mt-[2px]" strokeWidth={2} />
          <span>
            We recommend a high-contrast frame with clear subject focus for the
            best results.
          </span>
        </div>
      </section>

      {/* ── Intro / outro / loop — not in this phase ─────────────── */}
      <section className="card p-5">
        <header className="flex items-center gap-2.5 mb-2">
          <span className="size-7 rounded-[8px] bg-ink-100 text-ink-500 inline-flex items-center justify-center">
            <ImageIcon className="size-[15px]" strokeWidth={2} />
          </span>
          <h3 className="text-h4 text-ink-900">Intro, outro &amp; looping cover</h3>
        </header>
        <p className="text-[12.5px] text-ink-500 leading-relaxed">
          Branded intro / outro clips and animated looping covers aren&apos;t
          part of this phase yet — they need their own media slots on the
          lesson. The static cover above is fully live.
        </p>
      </section>

      {/* ── Best practices ───────────────────────────────────── */}
      <section className="card p-5">
        <header className="flex items-center gap-2.5 mb-3.5">
          <span className="size-7 rounded-[8px] bg-amber-100 text-amber-700 inline-flex items-center justify-center">
            <Lightbulb className="size-[15px]" strokeWidth={2} />
          </span>
          <h3 className="text-h4 text-ink-900">Best practices</h3>
        </header>
        <ul className="space-y-2.5 text-[13px] text-ink-700">
          {BEST_PRACTICES.map((p) => (
            <li key={p} className="flex items-start gap-2.5">
              <Check className="size-4 text-success shrink-0 mt-[3px]" strokeWidth={2.5} />
              <span className="leading-snug">{p}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
