"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Film,
  UploadCloud,
  FolderOpen,
  Video,
  Sparkles,
  RectangleHorizontal,
  Mic,
  Type as TypeIcon,
  Star,
  ClipboardCheck,
  Info,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import {
  createSignedMediaUpload,
  publicMediaUrl,
  createTutorial,
} from "./actions";

const MAX_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB
const ACCEPTED_EXTS = [".mp4", ".mov", ".avi", ".webm"];
const ACCEPTED_MIME = "video/mp4,video/quicktime,video/x-msvideo,video/webm";

/**
 * Modal-style upload card for step 1 of the new-tutorial workflow.
 * Frontend-only: keeps the picked file in local state, validates type/size,
 * and surfaces best-practice tips. "Upload & continue" is wired to the
 * existing /create-new/video wizard for now — replace with a real upload
 * action when the backend lands.
 */
export function TutorialUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile]       = useState<File | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<string>("");

  function pickFiles() {
    inputRef.current?.click();
  }

  function handleFile(f: File | null) {
    setError(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("That video is over 4 GB. Compress it or pick a smaller file.");
      return;
    }
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ACCEPTED_EXTS.includes(ext)) {
      setError(`Unsupported format. Use ${ACCEPTED_EXTS.join(", ")}.`);
      return;
    }
    setFile(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onCancel() {
    router.push("/admin/tutorials");
  }

  /** Read a video file's duration (seconds) via a throwaway <video>. */
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

  /** "module-1_final.mp4" → "Module 1 Final" so the editor opens with a
   *  sensible draft title the admin can refine. */
  function deriveTitle(name: string): string {
    const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
    if (!base) return "Untitled tutorial";
    return base.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 100);
  }

  async function onContinue() {
    if (!file || uploading) return;
    setError(null);
    setUploading(true);
    try {
      // 1) Duration (best-effort) + a signed, one-time upload URL.
      setStage("Preparing upload…");
      const duration = await readDuration(file);
      const signed = await createSignedMediaUpload(file.name, "video");
      if (!signed.ok) {
        setError(signed.error);
        setUploading(false);
        return;
      }

      // 2) Upload the bytes straight to Storage with the token.
      setStage("Uploading video…");
      const supabase = createClient();
      const up = await supabase.storage
        .from(signed.bucket)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (up.error) {
        setError(up.error.message || "Video upload failed. Try again.");
        setUploading(false);
        return;
      }

      // 3) Resolve the public URL + create the tutorial row.
      setStage("Creating tutorial…");
      const videoUrl = await publicMediaUrl(signed.path);
      const res = await createTutorial({
        title: deriveTitle(file.name),
        videoUrl,
        durationSeconds: duration,
      });
      if (!res.ok) {
        setError(res.error);
        setUploading(false);
        return;
      }

      // 4) Into the editor to add details / thumbnail / publish.
      router.push(`/admin/tutorials/${res.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setUploading(false);
    }
  }

  /* Checklist state derived from the file + (placeholder) future fields. */
  const checks = {
    file:  !!file,
    title: false, // wired in step 2
    desc:  false, // wired in step 2
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-start justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME}
        className="sr-only"
        onChange={onInputChange}
      />

      <div className="card w-full max-w-[1100px] p-6 sm:p-8 relative">
        {/* Close — top right */}
        <Link
          href="/admin/tutorials"
          aria-label="Close upload"
          className="absolute top-4 right-4 size-9 inline-flex items-center justify-center rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-100 transition-colors"
        >
          <X className="size-[18px]" strokeWidth={2} />
        </Link>

        {/* Header — title left, step indicator right */}
        <header className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6 sm:mb-7">
          <div className="min-w-0 max-w-xl pr-12 sm:pr-0">
            <h1 className="text-h3 sm:text-[28px] text-ink-900 leading-tight">
              Add a new tutorial video
            </h1>
            <p className="mt-1.5 text-[13.5px] text-ink-500 leading-relaxed">
              Upload your lesson video to get started. You can add details,
              thumbnail, and publish settings after upload.
            </p>
          </div>
          <Stepper current={1} />
        </header>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 lg:gap-6">
          {/* ── LEFT: drop zone + secondary actions + preview ──────────── */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={pickFiles}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              aria-label="Drop video here or click to browse"
              className={cn(
                "w-full block rounded-[16px] border-2 border-dashed transition-colors px-6 py-10 sm:py-12 text-center",
                dragging
                  ? "border-rose-400 bg-rose-50"
                  : "border-rose-200 bg-rose-50/40 hover:border-rose-300 hover:bg-rose-50",
              )}
            >
              {/* Cloud + play motif */}
              <div className="relative inline-block">
                <div
                  className="size-24 rounded-[20px] bg-rose-100 flex items-center justify-center mx-auto"
                  aria-hidden
                >
                  <PlayMotif />
                </div>
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 size-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shadow-md"
                >
                  <UploadCloud className="size-4" strokeWidth={2} />
                </span>
              </div>

              <div className="mt-5 text-[18px] sm:text-[20px] font-semibold text-ink-900">
                Drop your video here
              </div>
              <div className="mt-1.5 text-[13px] text-ink-500">
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

              <div className="mt-5">
                <span className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 text-white text-[14px] font-semibold shadow-sm pointer-events-none">
                  <UploadCloud className="size-4" strokeWidth={2} />
                  Choose video file
                </span>
              </div>
            </button>

            {error && (
              <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SecondaryButton
                icon={FolderOpen}
                label="Import from library"
                onClick={() => router.push("/admin/tutorials")}
              />
              <SecondaryButton
                icon={Video}
                label="Record instead"
                onClick={() => alert("In-browser recording is coming soon.")}
              />
            </div>

            {/* Upload preview */}
            <section className="rounded-[14px] border border-ink-100 bg-white p-4">
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-semibold mb-2.5">
                Upload preview
              </div>
              <div className="flex items-center gap-3">
                <div className="size-16 rounded-[10px] bg-cream-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {file ? (
                    <Film className="size-6 text-rose-600" strokeWidth={1.8} />
                  ) : (
                    <ImageIcon className="size-6 text-ink-400" strokeWidth={1.8} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {file ? (
                    <>
                      <div className="text-[13px] font-semibold text-ink-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-[11.5px] text-ink-500 mt-0.5 tabular-nums">
                        {formatBytes(file.size)} · ready to upload
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[13px] font-semibold text-ink-900">
                        No video selected yet
                      </div>
                      <div className="text-[11.5px] text-ink-500 mt-0.5">
                        Your video preview will appear here once uploaded.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ── RIGHT: side cards ───────────────────────────────────────── */}
          <aside className="space-y-3.5 min-w-0">
            <SideCard icon={Sparkles} title="Best results">
              <Tip
                icon={RectangleHorizontal}
                title="Record in landscape (16:9)"
                body="for the best viewing experience."
              />
              <Tip
                icon={Mic}
                title="Use clear audio and good lighting"
                body="to keep learners engaged."
              />
              <Tip
                icon={TypeIcon}
                title="Give your lesson a strong title"
                body="that describes what they'll learn."
              />
            </SideCard>

            <SideCard icon={Star} title="What happens next">
              <NextStep
                n={1}
                title="Add details"
                body="Add title, description, and tags."
              />
              <NextStep
                n={2}
                title="Choose thumbnail"
                body="Pick an engaging cover image."
              />
              <NextStep
                n={3}
                title="Publish tutorial"
                body="Make your tutorial live for learners."
              />
            </SideCard>

            <SideCard icon={ClipboardCheck} title="Upload checklist">
              <Checkbox checked={checks.file}  label="Video file ready"          />
              <Checkbox checked={checks.title} label="Title idea ready"           />
              <Checkbox checked={checks.desc}  label="Caption / description ready" />
            </SideCard>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-7 pt-5 border-t border-ink-100 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500">
            <Info className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
            You can update title, thumbnail, and lesson details after upload.
          </p>
          <div className="flex items-center gap-2.5">
            {uploading && stage && (
              <span className="text-[12.5px] text-ink-500 tabular-nums mr-1">
                {stage}
              </span>
            )}
            <button
              type="button"
              onClick={onCancel}
              disabled={uploading}
              className="h-11 px-5 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!file || uploading}
              className={cn(
                "inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] text-white text-[14px] font-semibold transition-colors shadow-sm",
                file && !uploading
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-rose-300 cursor-not-allowed",
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.2} />
                  Uploading…
                </>
              ) : (
                <>
                  Upload &amp; continue
                  <ArrowRight className="size-4" strokeWidth={2.2} />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Stepper — three-step circle indicator. Mirrors the support stepper but
   uses rose accent + a film icon on step 1.
   ───────────────────────────────────────────────────────────────────────── */

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex flex-col items-end shrink-0">
      <ol className="flex items-center gap-2" aria-label="Tutorial upload steps">
        <StepCircle index={1} current={current} icon={Film} />
        <Connector done={current > 1} />
        <StepCircle index={2} current={current} />
        <Connector done={current > 2} />
        <StepCircle index={3} current={current} />
      </ol>
      <div className="mt-2 text-[11.5px] text-ink-500 tabular-nums">
        Step {current} of 3 <span className="text-ink-300">·</span> Tutorial workflow
      </div>
    </div>
  );
}

function StepCircle({
  index,
  current,
  icon: Icon,
}: {
  index: 1 | 2 | 3;
  current: 1 | 2 | 3;
  icon?: LucideIcon;
}) {
  const state =
    index < current ? "done" : index === current ? "active" : "upcoming";

  if (state === "active") {
    return (
      <span
        aria-current="step"
        className="size-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center ring-4 ring-rose-100 shadow-sm"
      >
        {Icon ? (
          <Icon className="size-4" strokeWidth={2} />
        ) : (
          <span className="text-[13.5px] font-semibold">{index}</span>
        )}
      </span>
    );
  }
  if (state === "done") {
    return (
      <span className="size-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center text-[13.5px] font-semibold">
        {index}
      </span>
    );
  }
  return (
    <span className="size-9 rounded-full bg-white border border-ink-200 text-ink-500 inline-flex items-center justify-center text-[13.5px] font-semibold">
      {index}
    </span>
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block w-10 h-px rounded-full",
        done ? "bg-rose-600" : "bg-ink-200",
      )}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Side card primitive — icon + title header, then content rows.
   ───────────────────────────────────────────────────────────────────────── */

function SideCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4">
      <header className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-rose-600" strokeWidth={2} aria-hidden />
        <h2 className="text-[13.5px] font-semibold text-ink-900">{title}</h2>
      </header>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

function Tip({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="size-7 rounded-full bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0 mt-0.5"
        aria-hidden
      >
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-900 leading-snug">
          {title}
        </div>
        <p className="text-[12px] text-ink-500 leading-snug">{body}</p>
      </div>
    </li>
  );
}

function NextStep({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="size-6 rounded-full bg-cream-200 text-ink-700 inline-flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold"
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-900 leading-snug">
          {title}
        </div>
        <p className="text-[12px] text-ink-500 leading-snug">{body}</p>
      </div>
    </li>
  );
}

function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          "size-5 rounded-full border-2 inline-flex items-center justify-center shrink-0 transition-colors",
          checked
            ? "bg-rose-600 border-rose-600 text-white"
            : "bg-white border-ink-200 text-transparent",
        )}
      >
        {checked && <CheckCircle2 className="size-3" strokeWidth={3} />}
      </span>
      <span
        className={cn(
          "text-[12.5px] leading-snug",
          checked ? "text-ink-900 font-medium" : "text-ink-700",
        )}
      >
        {label}
      </span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Secondary action — outline button with leading icon.
   ───────────────────────────────────────────────────────────────────────── */

function SecondaryButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors"
    >
      <Icon className="size-4 text-ink-500" strokeWidth={1.9} />
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Pure-SVG play motif used inside the drop zone's avatar tile.
   ───────────────────────────────────────────────────────────────────────── */

function PlayMotif() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden>
      <rect x="6" y="11" width="34" height="24" rx="4" fill="#FEE2E2" />
      <rect
        x="6"
        y="11"
        width="34"
        height="24"
        rx="4"
        stroke="#FECACA"
        strokeWidth="1.5"
      />
      <path
        d="M21 18.5L29 23L21 27.5V18.5Z"
        fill="#E11D48"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
