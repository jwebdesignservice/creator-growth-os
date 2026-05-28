"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Eye,
  Save,
  Rocket,
  FileVideo,
  RefreshCw,
  UploadCloud,
  Bold,
  Italic,
  List as ListIcon,
  Link2,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Image as ImageIcon,
  Camera,
  Repeat,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import {
  saveVideoLesson,
  publishVideoLesson,
  type ActionStep,
} from "./actions";

/* ─────────────────────────────────────────────────────────────────────────
   Dedicated program-video editor — its own surface, deliberately simple:
   A) video attachment  B) lesson overview  C) what you'll learn
   D) action steps      E) thumbnail setup
   Program videos are NOT tutorials, so this lives under the program, not
   the /admin/tutorials editor.
   ───────────────────────────────────────────────────────────────────────── */

export type VideoLessonRow = {
  id:              string;
  slug:            string;
  title:           string;
  description:     string;
  videoUrl:        string | null;
  coverImageUrl:   string | null;
  durationSeconds: number;
  moduleNumber:    number | null;
  moduleTitle:     string | null;
  published:       boolean;
  learningPoints:  string[];
  actionSteps:     ActionStep[];
};

const BUCKET = "lesson-media";
const OVERVIEW_MAX = 5000;

export function VideoLessonEditor({
  programId,
  programSlug,
  lesson,
}: {
  programId: string;
  programSlug: string;
  lesson: VideoLessonRow;
}) {
  /* ── State ───────────────────────────────────────────────────────────── */
  const [description, setDescription]   = useState(lesson.description);
  const [videoUrl, setVideoUrl]         = useState<string | null>(lesson.videoUrl);
  const [duration, setDuration]         = useState(lesson.durationSeconds);
  const [coverUrl, setCoverUrl]         = useState<string | null>(lesson.coverImageUrl);
  const [learning, setLearning]         = useState<string[]>(lesson.learningPoints);
  const [steps, setSteps]               = useState<ActionStep[]>(lesson.actionSteps);
  const [published, setPublished]       = useState(lesson.published);
  const [showTimeOnCover, setShowTime]  = useState(true);

  const snapshot = useMemo(
    () => JSON.stringify({ description, videoUrl, duration, coverUrl, learning, steps }),
    [description, videoUrl, duration, coverUrl, learning, steps],
  );
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const isDirty = snapshot !== savedSnapshot;

  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<
    | { kind: "saved" }
    | { kind: "partial" }
    | { kind: "error"; msg: string }
    | null
  >(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ── Save ────────────────────────────────────────────────────────────── */
  const onSave = useCallback(() => {
    if (pending) return;
    startTransition(async () => {
      const res = await saveVideoLesson(lesson.id, programId, {
        description,
        videoUrl,
        durationSeconds: duration,
        coverImageUrl: coverUrl,
        learningPoints: learning,
        actionSteps: steps,
      });
      if (!res.ok) {
        setToast({ kind: "error", msg: res.error });
        return;
      }
      setSavedSnapshot(snapshot);
      setToast({ kind: res.partial ? "partial" : "saved" });
    });
  }, [
    pending, lesson.id, programId, description, videoUrl, duration,
    coverUrl, learning, steps, snapshot,
  ]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSave]);

  function onPublishToggle() {
    startTransition(async () => {
      const res = await publishVideoLesson(lesson.id, programId, !published);
      if (!res.ok) {
        setToast({ kind: "error", msg: res.error });
        return;
      }
      setPublished((v) => !v);
    });
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-[1400px] mx-auto">
      <SaveToast toast={toast} onClose={() => setToast(null)} />

      {/* Breadcrumb */}
      <nav className="text-[12.5px] mb-2" aria-label="Breadcrumb">
        <Link
          href={`/admin/programs/${programId}/curriculum`}
          className="text-rose-600 hover:text-rose-700 font-medium"
        >
          Curriculum
        </Link>
        {lesson.moduleNumber != null && (
          <>
            <span className="mx-2 text-ink-300">/</span>
            <span className="text-ink-500">
              Module {lesson.moduleNumber}
              {lesson.moduleTitle ? `: ${lesson.moduleTitle}` : ""}
            </span>
          </>
        )}
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700">{lesson.title}</span>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-h1 sm:text-[34px] text-ink-900 leading-tight truncate">
            {lesson.title}
          </h1>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold shrink-0",
              published
                ? "bg-success-bg text-success border border-success/20"
                : "bg-amber-100 text-amber-700 border border-amber-200",
            )}
          >
            <span className={cn("size-1.5 rounded-full", published ? "bg-success" : "bg-amber-500")} />
            {published ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={`/programs/${programSlug}/${lesson.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13.5px] font-medium hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={pending || !isDirty}
            className={cn(
              "inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border text-[13.5px] font-semibold transition-colors",
              isDirty
                ? "bg-white border-ink-200 text-ink-900 hover:bg-cream-100"
                : "bg-success-bg border-success/20 text-success cursor-default",
            )}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : isDirty ? (
              <Save className="size-4" strokeWidth={2} />
            ) : (
              <Check className="size-4" strokeWidth={2.5} />
            )}
            {isDirty ? "Save changes" : "Saved"}
          </button>
          <button
            type="button"
            onClick={onPublishToggle}
            disabled={pending}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13.5px] font-semibold shadow-sm transition-colors"
          >
            <Rocket className="size-4" strokeWidth={2} />
            {published ? "Unpublish lesson" : "Publish lesson"}
          </button>
        </div>
      </header>

      {/* Body — single column; video + cover share one card */}
      <div className="space-y-5 max-w-[1080px]">
        <VideoAndCover
          programId={programId}
          lessonId={lesson.id}
          videoUrl={videoUrl}
          duration={duration}
          coverUrl={coverUrl}
          showTime={showTimeOnCover}
          onVideoChange={(url, dur) => {
            setVideoUrl(url);
            if (dur != null) setDuration(dur);
          }}
          onCoverChange={setCoverUrl}
          onShowTimeChange={setShowTime}
          onError={(msg) => setToast({ kind: "error", msg })}
        />

        <OverviewEditor value={description} onChange={setDescription} />

        <LearningList items={learning} onChange={setLearning} />

        <ActionStepsList items={steps} onChange={setSteps} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Storage upload helper                                                   */
/* ═══════════════════════════════════════════════════════════════════════ */

async function uploadToBucket(
  programId: string,
  lessonId: string,
  file: File,
  kind: "video" | "cover",
): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const path = `${programId}/${lessonId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      if (/row-level security|not authorized|permission/i.test(error.message)) {
        return {
          error:
            "Upload blocked by storage permissions. Apply migration 0036 (lesson-media policies) to enable uploads.",
        };
      }
      if (/bucket not found/i.test(error.message)) {
        return { error: "Storage bucket 'lesson-media' is missing — create it in Supabase Storage." };
      }
      return { error: error.message };
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}

/** Read a video file's duration (seconds) via a temporary <video>. */
function readVideoDuration(file: File): Promise<number> {
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
      el.src = URL.createObjectURL(file);
    } catch {
      resolve(0);
    }
  });
}

function formatClock(seconds: number): string {
  if (!seconds || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  A. Video & cover  (combined — player is the main preview, cover sits     */
/*  beside it as a smaller derived thumbnail)                                */
/* ═══════════════════════════════════════════════════════════════════════ */

function VideoAndCover({
  programId,
  lessonId,
  videoUrl,
  duration,
  coverUrl,
  showTime,
  onVideoChange,
  onCoverChange,
  onShowTimeChange,
  onError,
}: {
  programId: string;
  lessonId: string;
  videoUrl: string | null;
  duration: number;
  coverUrl: string | null;
  showTime: boolean;
  onVideoChange: (url: string | null, dur: number | null) => void;
  onCoverChange: (url: string | null) => void;
  onShowTimeChange: (v: boolean) => void;
  onError: (msg: string) => void;
}) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLVideoElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [frameTime, setFrameTime] = useState(Math.min(12, duration || 0));

  async function handleVideo(file: File) {
    if (!file.type.startsWith("video/")) {
      onError("Please choose a video file (MP4, MOV or WebM).");
      return;
    }
    setUploading(true);
    const dur = await readVideoDuration(file);
    const res = await uploadToBucket(programId, lessonId, file, "video");
    setUploading(false);
    if ("error" in res) { onError(res.error); return; }
    onVideoChange(res.url, dur);
    setFrameTime(Math.min(12, dur || 0));
  }

  async function handleCover(file: File) {
    if (!file.type.startsWith("image/")) {
      onError("Choose an image file (PNG, JPG or WebP).");
      return;
    }
    setBusy(true);
    const res = await uploadToBucket(programId, lessonId, file, "cover");
    setBusy(false);
    if ("error" in res) { onError(res.error); return; }
    onCoverChange(res.url);
  }

  /* Grab the current frame off a hidden capture <video> → upload as cover. */
  async function captureFrame() {
    const v = captureRef.current;
    if (!v || !videoUrl) {
      onError("Upload a video first, then you can grab a frame from it.");
      return;
    }
    setBusy(true);
    try {
      await new Promise<void>((resolve) => {
        const onSeeked = () => { v.removeEventListener("seeked", onSeeked); resolve(); };
        v.addEventListener("seeked", onSeeked);
        v.currentTime = Math.min(frameTime, Math.max(0, (v.duration || duration) - 0.1));
      });
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth || 1280;
      canvas.height = v.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable.");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      if (!blob) throw new Error("Could not capture frame.");
      const f = new File([blob], `frame-${Math.round(frameTime)}.jpg`, { type: "image/jpeg" });
      const res = await uploadToBucket(programId, lessonId, f, "cover");
      if ("error" in res) { onError(res.error); return; }
      onCoverChange(res.url);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Frame capture failed.");
    } finally {
      setBusy(false);
    }
  }

  const fileName = videoUrl ? videoUrl.split("/").pop() || "video" : null;

  return (
    <Section
      letter="A"
      title="Video & cover"
      subtitle="Upload the lesson video, then pick the cover frame learners see first."
      badge="16:9 · 1280×720"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        {/* ── Video: player when present, otherwise a compact upload box ── */}
        <div className="min-w-0">
          {videoUrl ? (
            <>
              <div className="rounded-[14px] overflow-hidden bg-ink-900 aspect-video">
                <video src={videoUrl} controls className="w-full h-full" />
              </div>
              <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-600 min-w-0">
                  <FileVideo className="size-3.5 text-rose-500 shrink-0" strokeWidth={2} />
                  <span className="truncate max-w-[200px]">{fileName}</span>
                  <span className="text-ink-300">·</span>
                  <span className="tabular-nums">{formatClock(duration)}</span>
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                  ) : (
                    <RefreshCw className="size-3.5" strokeWidth={2} />
                  )}
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onVideoChange(null, 0)}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 text-[12px] font-medium text-ink-500 hover:bg-cream-100 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                  Remove
                </button>
              </div>
              {/* cover-frame scrubber */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-ink-500">Cover frame at</span>
                  <span className="text-[12px] font-bold text-ink-900 tabular-nums">
                    {formatClock(frameTime)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, duration)}
                  value={frameTime}
                  onChange={(e) => setFrameTime(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
              {/* hidden capture source */}
              <video ref={captureRef} src={videoUrl} className="hidden" muted playsInline crossOrigin="anonymous" preload="metadata" />
            </>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="w-full aspect-video rounded-[14px] border-2 border-dashed border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 flex flex-col items-center justify-center gap-2 text-rose-700 transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="size-7 animate-spin" strokeWidth={1.8} />
              ) : (
                <UploadCloud className="size-7" strokeWidth={1.8} />
              )}
              <span className="text-[13.5px] font-semibold">
                {uploading ? "Uploading…" : "Upload video"}
              </span>
              <span className="text-[11.5px] text-ink-500">
                MP4, MOV or WebM · up to 50 MB
              </span>
            </button>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideo(f); e.target.value = ""; }}
          />
        </div>

        {/* ── Cover: smaller derived thumbnail + controls ── */}
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-1.5">
            Cover
          </div>
          <div className="relative rounded-[12px] overflow-hidden bg-ink-900 aspect-video flex items-center justify-center">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="Lesson cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-white/50 text-center px-2">
                <ImageIcon className="size-6 mx-auto mb-1" strokeWidth={1.6} />
                <p className="text-[11px]">Pick a frame or upload</p>
              </div>
            )}
            {showTime && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-ink-900/80 text-white text-[10.5px] font-semibold tabular-nums">
                {formatClock(duration)}
              </span>
            )}
          </div>

          <label className="mt-2 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTime}
              onChange={(e) => onShowTimeChange(e.target.checked)}
              className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
            />
            <span className="text-[12px] text-ink-700">Show time on cover</span>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={captureFrame}
              disabled={busy || !videoUrl}
              className="inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[12px] font-semibold"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" strokeWidth={2} /> : <Camera className="size-3.5" strokeWidth={2} />}
              Select frame
            </button>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] border border-ink-200 text-[12px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
            >
              <UploadCloud className="size-3.5" strokeWidth={2} />
              Upload
            </button>
            <button
              type="button"
              onClick={() => onError("AI cover generation is coming soon.")}
              className="inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] border border-ink-200 text-[12px] font-semibold text-ink-700 hover:bg-cream-100"
            >
              <Sparkles className="size-3.5 text-rose-500" strokeWidth={2} />
              Generate
            </button>
            <button
              type="button"
              onClick={() => onError("Looping previews are coming soon.")}
              className="inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] border border-ink-200 text-[12px] font-semibold text-ink-700 hover:bg-cream-100"
            >
              <Repeat className="size-3.5" strokeWidth={2} />
              Loop
            </button>
          </div>
          {coverUrl && (
            <button
              type="button"
              onClick={() => onCoverChange(null)}
              className="mt-2 text-[11.5px] text-ink-500 hover:text-rose-600"
            >
              Remove cover
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f); e.target.value = ""; }}
          />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  B. Lesson overview                                                      */
/* ═══════════════════════════════════════════════════════════════════════ */

function OverviewEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(prefix: string, suffix = prefix, placeholder = "") {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const sel = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + prefix + sel + suffix + value.slice(end);
    onChange(next.slice(0, OVERVIEW_MAX));
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length + sel.length + suffix.length;
      el.setSelectionRange(pos, pos);
    });
  }
  function bulletLine() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const ls = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    onChange((value.slice(0, ls) + "- " + value.slice(ls)).slice(0, OVERVIEW_MAX));
  }

  return (
    <Section letter="B" title="Lesson overview" subtitle="This overview appears under the lesson for your learners." badge="Lesson page">
      <div className="rounded-[10px] border border-ink-200 bg-white overflow-hidden focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-colors">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60">
          <TBtn icon={Bold} label="Bold" onClick={() => wrap("**", "**", "bold")} />
          <TBtn icon={Italic} label="Italic" onClick={() => wrap("*", "*", "italic")} />
          <TBtn icon={ListIcon} label="Bulleted list" onClick={bulletLine} />
          <TBtn icon={Link2} label="Link" onClick={() => wrap("[", "](https://)")} />
        </div>
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, OVERVIEW_MAX))}
            rows={5}
            placeholder="In this lesson, we'll walk through the key concepts and steps…"
            className="w-full px-3.5 py-3 pb-7 text-[13.5px] text-ink-900 placeholder:text-ink-400 resize-y focus:outline-none leading-relaxed bg-white"
          />
          <span className="absolute right-3 bottom-2 text-[11px] tabular-nums text-ink-400 select-none pointer-events-none">
            {value.length} characters
          </span>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  C. What you will learn                                                  */
/* ═══════════════════════════════════════════════════════════════════════ */

function LearningList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (v: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
    setAdding(false);
  }
  function commitEdit() {
    if (editIdx == null) return;
    const v = editText.trim();
    onChange(v ? items.map((it, i) => (i === editIdx ? v : it)) : items.filter((_, i) => i !== editIdx));
    setEditIdx(null);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  }

  return (
    <Section letter="C" title="What you will learn" subtitle="Key outcomes for this lesson — these render as cards on the lesson page, separate from the program overview's “What You'll Learn”." badge="Lesson page">
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            draggable={editIdx !== i}
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx != null) reorder(dragIdx, i);
              setDragIdx(null);
            }}
            className={cn(
              "group flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] hover:bg-cream-50/70",
              dragIdx === i && "opacity-50",
            )}
          >
            <GripVertical className="size-3.5 text-ink-300 shrink-0 cursor-grab" strokeWidth={2} aria-hidden />
            <CheckCircle2 className="size-4 text-success shrink-0" strokeWidth={2} />
            {editIdx === i ? (
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditIdx(null);
                }}
                className="flex-1 h-7 px-2 rounded-[6px] border border-rose-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            ) : (
              <span className="flex-1 text-[13px] text-ink-900">{it}</span>
            )}
            <RowBtn icon={Pencil} label="Edit" onClick={() => { setEditIdx(i); setEditText(it); }} />
            <RowBtn icon={Trash2} label="Delete" danger onClick={() => remove(i)} />
          </li>
        ))}
      </ul>

      {adding ? (
        <InlineAdd
          value={draft}
          onChange={setDraft}
          onAdd={add}
          onCancel={() => { setAdding(false); setDraft(""); }}
          placeholder="New learning outcome…"
        />
      ) : (
        <AddButton label="Add learning point" onClick={() => setAdding(true)} />
      )}
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  D. Action steps                                                         */
/* ═══════════════════════════════════════════════════════════════════════ */

function ActionStepsList({
  items,
  onChange,
}: {
  items: ActionStep[];
  onChange: (v: ActionStep[]) => void;
}) {
  const [editing, setEditing] = useState<ActionStep | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  function startAdd() {
    setEditing({ id: `as-${Date.now()}`, title: "", description: "" });
  }
  function save(step: ActionStep) {
    const title = step.title.trim();
    if (!title) { setEditing(null); return; }
    const exists = items.some((s) => s.id === step.id);
    onChange(exists ? items.map((s) => (s.id === step.id ? { ...step, title } : s)) : [...items, { ...step, title }]);
    setEditing(null);
  }
  function remove(id: string) {
    onChange(items.filter((s) => s.id !== id));
  }
  function reorder(from: string, to: string) {
    if (from === to) return;
    const fi = items.findIndex((s) => s.id === from);
    const ti = items.findIndex((s) => s.id === to);
    if (fi < 0 || ti < 0) return;
    const next = [...items];
    const [m] = next.splice(fi, 1);
    next.splice(ti, 0, m);
    onChange(next);
  }

  return (
    <Section letter="D" title="Action steps" subtitle="Actions learners take after watching — shown under “What you'll learn” on the lesson page." badge="Lesson page">
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li
            key={s.id}
            draggable
            onDragStart={() => setDragId(s.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) reorder(dragId, s.id); setDragId(null); }}
            className={cn(
              "group flex items-start gap-2.5 px-2.5 py-2.5 rounded-[10px] border border-ink-100 bg-white hover:bg-cream-50/60",
              dragId === s.id && "opacity-50",
            )}
          >
            <GripVertical className="size-3.5 text-ink-300 shrink-0 mt-1 cursor-grab" strokeWidth={2} aria-hidden />
            <span className="size-6 rounded-full bg-rose-600 text-white inline-flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900">{s.title}</div>
              {s.description && (
                <p className="text-[12px] text-ink-500 leading-snug mt-0.5">{s.description}</p>
              )}
            </div>
            <RowBtn icon={Pencil} label="Edit" onClick={() => setEditing(s)} />
            <RowBtn icon={Trash2} label="Delete" danger onClick={() => remove(s.id)} />
          </li>
        ))}
      </ul>

      <AddButton label="Add action step" onClick={startAdd} />

      {editing && (
        <StepModal
          step={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </Section>
  );
}

function StepModal({
  step,
  onClose,
  onSave,
}: {
  step: ActionStep;
  onClose: () => void;
  onSave: (s: ActionStep) => void;
}) {
  const [title, setTitle] = useState(step.title);
  const [desc, setDesc] = useState(step.description);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-md rounded-[16px] bg-white shadow-card border border-ink-100 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[15px] font-bold text-ink-900 mb-3">
          {step.title ? "Edit action step" : "New action step"}
        </h3>
        <label className="block text-[12px] font-semibold text-ink-900 mb-1">Title</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Review the key concepts"
          className="w-full h-10 px-3 rounded-[10px] border border-ink-200 text-[13.5px] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 mb-3"
        />
        <label className="block text-[12px] font-semibold text-ink-900 mb-1">Description <span className="text-ink-400 font-normal">(optional)</span></label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="What exactly should they do?"
          className="w-full px-3 py-2 rounded-[10px] border border-ink-200 text-[13px] resize-y focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ ...step, title, description: desc })}
            disabled={!title.trim()}
            className="h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
          >
            Save step
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Shared primitives                                                       */
/* ═══════════════════════════════════════════════════════════════════════ */

function Section({
  letter,
  title,
  subtitle,
  badge,
  children,
}: {
  letter: string;
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink-900">
            {letter}. {title}
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink-500">{subtitle}</p>
        </div>
        {badge && (
          <span className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full bg-rose-50 text-rose-600 text-[10.5px] font-semibold shrink-0 whitespace-nowrap">
            <Eye className="size-3" strokeWidth={2} aria-hidden />
            {badge}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function TBtn({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="size-7 inline-flex items-center justify-center rounded-[6px] text-ink-600 hover:bg-cream-200 hover:text-ink-900"
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function RowBtn({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "opacity-0 group-hover:opacity-100 size-7 rounded-[8px] inline-flex items-center justify-center transition-opacity shrink-0",
        danger ? "text-ink-400 hover:bg-rose-50 hover:text-rose-600" : "text-ink-400 hover:bg-cream-200 hover:text-ink-700",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-100 transition-colors"
    >
      <Plus className="size-3.5" strokeWidth={2.5} />
      {label}
    </button>
  );
}

function InlineAdd({
  value,
  onChange,
  onAdd,
  onCancel,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  placeholder: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onAdd(); if (e.key === "Escape") onCancel(); }}
        placeholder={placeholder}
        className="flex-1 h-10 px-3 rounded-[10px] border border-ink-200 text-[13px] focus:outline-none focus:border-rose-400"
      />
      <button type="button" onClick={onAdd} disabled={!value.trim()} className="h-10 px-3 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 disabled:bg-rose-300">
        Add
      </button>
      <button type="button" onClick={onCancel} className="h-10 px-3 rounded-[10px] border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100">
        Cancel
      </button>
    </div>
  );
}

function SaveToast({
  toast,
  onClose,
}: {
  toast:
    | { kind: "saved" }
    | { kind: "partial" }
    | { kind: "error"; msg: string }
    | null;
  onClose: () => void;
}) {
  if (!toast) return null;
  if (toast.kind === "saved") {
    return (
      <div className="fixed top-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-success-bg border border-success/20 text-success text-[12.5px] font-semibold shadow-card">
        <Check className="size-3.5" strokeWidth={2.5} /> Saved
      </div>
    );
  }
  if (toast.kind === "partial") {
    return (
      <div className="fixed top-6 right-6 z-50 inline-flex items-start gap-2 px-4 py-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[12.5px] shadow-card max-w-sm">
        <AlertCircle className="size-3.5 mt-0.5 shrink-0" strokeWidth={2} />
        <span className="leading-snug">
          Video, overview &amp; thumbnail saved. Learning points / action steps
          need migration 0036 to persist.
        </span>
      </div>
    );
  }
  return (
    <div className="fixed top-6 right-6 z-50 inline-flex items-start gap-2 px-4 py-3 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px] shadow-card max-w-sm">
      <AlertCircle className="size-3.5 mt-0.5 shrink-0" strokeWidth={2} />
      <span className="flex-1 leading-snug">{toast.msg}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="size-5 inline-flex items-center justify-center rounded-full hover:bg-rose-100">
        <X className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
}
