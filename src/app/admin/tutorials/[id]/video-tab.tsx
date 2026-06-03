"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  UploadCloud,
  Clock,
  Check,
  Loader2,
  Trash2,
  AlertCircle,
  Info,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createSignedMediaUpload, publicMediaUrl } from "../new/actions";
import { updateLesson } from "@/app/admin/lessons/actions";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Video tab — upload or replace the lesson video. Fully backend-wired: the
   file is sent straight to the `lesson-media` bucket via a one-time signed
   URL, then `lessons.video_url` + `duration_seconds` are persisted through
   the existing `updateLesson` action — the same path the new-tutorial
   upload flow already uses. No new server action or schema is introduced.
   ───────────────────────────────────────────────────────────────────────── */

const MAX_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB
const ACCEPTED_EXTS = [".mp4", ".mov", ".avi", ".webm"];
const ACCEPTED_MIME = "video/mp4,video/quicktime,video/x-msvideo,video/webm";

const BEST_PRACTICES = [
  "Record in landscape (16:9) for the best viewing experience.",
  "Use clear audio and even lighting to keep learners engaged.",
  "Keep each lesson focused — shorter, sharper videos finish better.",
  "Export 1080p MP4 (H.264) for the broadest device support.",
];

type Status =
  | { kind: "idle" }
  | { kind: "busy"; msg: string }
  | { kind: "saved" }
  | { kind: "error"; msg: string };

export function VideoTab({
  lessonId,
  videoUrl,
  durationSeconds,
}: {
  lessonId: string;
  videoUrl: string | null;
  durationSeconds: number;
}) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(videoUrl);
  const [duration, setDuration] = useState<number>(Math.max(0, durationSeconds));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const busy = status.kind === "busy";

  /* Read a video file's duration (seconds) via a throwaway <video>. */
  function readDuration(f: File): Promise<number> {
    return new Promise((resolve) => {
      try {
        const el = document.createElement("video");
        el.preload = "metadata";
        el.onloadedmetadata = () => {
          const d = Number.isFinite(el.duration) ? Math.round(el.duration) : 0;
          URL.revokeObjectURL(el.src);
          resolve(d);
        };
        el.onerror = () => resolve(0);
        el.src = URL.createObjectURL(f);
      } catch {
        resolve(0);
      }
    });
  }

  function validate(f: File): string | null {
    if (f.size > MAX_BYTES)
      return "That video is over 4 GB. Compress it or choose a smaller file.";
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ACCEPTED_EXTS.includes(ext))
      return `Unsupported format. Use ${ACCEPTED_EXTS.join(", ")}.`;
    return null;
  }

  /* Upload a video file → Storage → persist video_url + duration. */
  async function handleUpload(file: File) {
    const err = validate(file);
    if (err) {
      setStatus({ kind: "error", msg: err });
      return;
    }
    try {
      setStatus({ kind: "busy", msg: "Reading video…" });
      const dur = await readDuration(file);

      setStatus({ kind: "busy", msg: "Uploading video…" });
      const signed = await createSignedMediaUpload(file.name, "video");
      if (!signed.ok) {
        setStatus({ kind: "error", msg: signed.error });
        return;
      }
      const supabase = createClient();
      const up = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (up.error) {
        setStatus({
          kind: "error",
          msg: up.error.message || "Video upload failed. Try again.",
        });
        return;
      }

      setStatus({ kind: "busy", msg: "Saving…" });
      const newUrl = await publicMediaUrl(signed.path);
      const res = await updateLesson(lessonId, {
        video_url: newUrl,
        duration_seconds: dur,
      });
      if (!res.ok) {
        setStatus({ kind: "error", msg: res.error });
        return;
      }
      setUrl(newUrl);
      setDuration(dur);
      setStatus({ kind: "saved" });
      router.refresh(); // reflect in the publishing-readiness card + preview
      window.setTimeout(() => setStatus({ kind: "idle" }), 2500);
    } catch (e) {
      setStatus({
        kind: "error",
        msg: e instanceof Error ? e.message : "Something went wrong.",
      });
    }
  }

  /* Clear the video off the lesson. */
  async function removeVideo() {
    if (busy) return;
    if (
      !window.confirm(
        "Remove this video from the tutorial? You can upload a new one anytime.",
      )
    ) {
      return;
    }
    setStatus({ kind: "busy", msg: "Removing…" });
    const res = await updateLesson(lessonId, {
      video_url: null,
      duration_seconds: 0,
    });
    if (!res.ok) {
      setStatus({ kind: "error", msg: res.error });
      return;
    }
    setUrl(null);
    setDuration(0);
    setStatus({ kind: "saved" });
    router.refresh();
    window.setTimeout(() => setStatus({ kind: "idle" }), 2500);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleUpload(f);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!busy) setDragging(true);
  }
  function onDragLeave() {
    setDragging(false);
  }

  return (
    <>
      <section className="card p-5 sm:p-6">
        <header className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div className="min-w-0">
            <h3 className="inline-flex items-center gap-2.5 text-h4 text-ink-900">
              <span className="size-7 rounded-[8px] bg-rose-50 text-rose-600 inline-flex items-center justify-center">
                <PlayCircle className="size-[15px]" strokeWidth={2} />
              </span>
              Lesson video
            </h3>
            <p className="text-[12.5px] text-ink-500 mt-1.5 ml-[38px]">
              Upload the video for this tutorial — or replace the current one.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center h-7 px-3 rounded-full bg-cream-100 border border-ink-100 text-[11.5px] font-medium text-ink-700">
            MP4, MOV, AVI, WEBM · up to 4 GB
          </span>
        </header>

        {/* Media area — current video, or a drop zone when empty */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "rounded-[14px] transition-shadow",
            url && dragging && "ring-2 ring-rose-400 ring-offset-2",
          )}
        >
          {url ? (
            <div className="relative aspect-video rounded-[12px] overflow-hidden bg-ink-900 ring-1 ring-ink-100">
              <video
                key={url}
                src={url}
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full bg-black object-contain"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 text-white text-[11px] font-semibold backdrop-blur-sm">
                <PlayCircle className="size-3" strokeWidth={2.5} />
                Current video
              </span>
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 h-6 px-2 rounded-md bg-black/65 text-white text-[11px] font-semibold tabular-nums backdrop-blur-sm">
                <Clock className="size-3" strokeWidth={2.5} />
                {formatTime(duration)}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              aria-label="Drop video here or click to browse"
              className={cn(
                "w-full block rounded-[14px] border-2 border-dashed transition-colors px-6 py-12 text-center disabled:opacity-60",
                dragging
                  ? "border-rose-400 bg-rose-50"
                  : "border-rose-200 bg-rose-50/40 hover:border-rose-300 hover:bg-rose-50",
              )}
            >
              <span className="size-16 rounded-[18px] bg-rose-100 text-rose-600 inline-flex items-center justify-center mx-auto">
                <UploadCloud className="size-7" strokeWidth={1.9} />
              </span>
              <div className="mt-4 text-[16px] font-semibold text-ink-900">
                Drop your video here
              </div>
              <div className="mt-1 text-[13px] text-ink-500">
                or{" "}
                <span className="text-rose-600 font-semibold underline underline-offset-2">
                  browse files
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-ink-500">
                <CheckCircle2 className="size-3.5 text-success" strokeWidth={2.2} />
                MP4, MOV, AVI, WEBM
                <span className="text-ink-300">·</span>
                Up to 4 GB
              </div>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 disabled:bg-rose-300 shadow-sm transition-colors"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <UploadCloud className="size-3.5" strokeWidth={2} />
            )}
            {url ? "Replace video" : "Upload video"}
          </button>
          {url && (
            <button
              type="button"
              onClick={removeVideo}
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
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />{" "}
                {status.msg}
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
          accept={ACCEPTED_MIME}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />

        {/* Info notice */}
        <div className="mt-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-rose-50/60 border border-rose-100 text-[12.5px] text-ink-700">
          <Info className="size-4 text-rose-500 shrink-0 mt-[2px]" strokeWidth={2} />
          <span>
            Replacing the video swaps what learners watch right away. The
            thumbnail and chapters stay as-is — update the cover from the
            Thumbnail tab if the new video looks different.
          </span>
        </div>
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
