"use client";

import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Camera,
  Repeat,
  Sparkles,
  Upload,
  Info,
  FileVideo,
  Play,
  X,
  Check,
  Lightbulb,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Thumbnail tab — covers thumbnail / cover frame + intro & outro video.

   Pure frontend-only surface: no DB columns exist yet for the cover
   frame timestamp, loop range, intro / outro files. Everything lives in
   component state so the UX is fully interactive, and a backend pass
   later can wire these to real fields without touching this component.
   ───────────────────────────────────────────────────────────────────────── */

type StagedFile = {
  name: string;
  sizeMB: number;
  durationSec: number;
};

const BEST_PRACTICES = [
  "Choose a high-quality frame with clear focus and contrast.",
  "Use a loop that showcases the best part of your tutorial.",
  "Keep intros short (5–10s) and outros concise (5–15s).",
  "Add branding in your intro/outro for better recognition.",
];

export function ThumbnailTab({
  coverImageUrl,
  durationSeconds,
  durationLabel,
}: {
  coverImageUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  durationLabel: string;
}) {
  /* ── State ─────────────────────────────────────────────────────────── */

  const safeMaxSec = Math.max(0, durationSeconds);
  const [selectedFrameSec, setSelectedFrameSec] = useState<number>(
    Math.min(7, Math.max(0, safeMaxSec - 1)),
  );
  const [showTimeOnCover, setShowTimeOnCover] = useState(true);
  const [customThumb,     setCustomThumb]     = useState<StagedFile | null>(null);
  const [introFile,       setIntroFile]       = useState<StagedFile | null>(null);
  const [outroFile,       setOutroFile]       = useState<StagedFile | null>(null);

  function fileToStaged(file: File): StagedFile {
    return {
      name:        file.name,
      sizeMB:      Math.max(0, Math.round((file.size / (1024 * 1024)) * 10) / 10),
      durationSec: 0,
    };
  }

  function nudgeFrame() {
    if (safeMaxSec <= 0) return;
    setSelectedFrameSec((s) => (s + 1) % Math.max(1, Math.floor(safeMaxSec)));
  }

  /* ── Render ────────────────────────────────────────────────────────── */

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
              Choose the perfect frame and loop to create a strong first impression.
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center h-7 px-3 rounded-full bg-cream-100 border border-ink-100 text-[11.5px] font-medium text-ink-700">
            Recommended: 16:9 (1280×720)
          </span>
        </header>

        {/* Preview + selected-frame controls */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px] gap-5 items-start">
          {/* Frame preview */}
          <div className="relative aspect-video rounded-[12px] overflow-hidden bg-ink-900 ring-1 ring-ink-100">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="Current cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-cream-100/60 text-[12px]">
                No cover frame selected yet
              </div>
            )}

            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 text-white text-[11px] font-semibold backdrop-blur-sm">
              <ImageIcon className="size-3" strokeWidth={2.5} />
              Current cover
            </span>

            {showTimeOnCover && (
              <span className="absolute bottom-3 right-3 inline-flex items-center h-6 px-2 rounded-md bg-black/65 text-white text-[11px] font-semibold tabular-nums backdrop-blur-sm">
                {formatTime(selectedFrameSec)}
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
                {formatTime(selectedFrameSec)}
              </div>
              <div className="text-[12px] text-ink-500 mt-1">of {durationLabel}</div>
            </div>

            <button
              type="button"
              onClick={nudgeFrame}
              disabled={safeMaxSec <= 0}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-900 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Camera className="size-3.5" strokeWidth={2} />
              Change frame
            </button>

            <label className="flex items-center gap-2 text-[12.5px] text-ink-700 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={showTimeOnCover}
                onChange={(e) => setShowTimeOnCover(e.target.checked)}
                className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300 cursor-pointer"
              />
              Show time on cover
            </label>
          </aside>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <ActionButton
            primary
            icon={ImageIcon}
            label="Select frame"
            onClick={nudgeFrame}
          />
          <ActionButton icon={Repeat}   label="Choose loop" />
          <ActionButton icon={Sparkles} label="Generate cover" badge="AI" />
          <ActionButton
            icon={Upload}
            label="Upload custom"
            onClick={() => document.getElementById("thumb-upload-input")?.click()}
          />
        </div>

        {/* Info notice */}
        <div className="mt-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-rose-50/60 border border-rose-100 text-[12.5px] text-ink-700">
          <Info className="size-4 text-rose-500 shrink-0 mt-[2px]" strokeWidth={2} />
          <span>
            We recommend a high-contrast frame with clear subject focus for the
            best results.
          </span>
        </div>

        {/* Custom upload */}
        <div className="mt-5">
          <div className="text-[12.5px] font-semibold text-ink-900 mb-2">
            Upload custom thumbnail{" "}
            <span className="text-ink-400 font-medium">(optional)</span>
          </div>
          {customThumb ? (
            <FileChip
              kind="image"
              file={customThumb}
              onClear={() => setCustomThumb(null)}
              onReplace={() =>
                document.getElementById("thumb-upload-input")?.click()
              }
            />
          ) : (
            <Dropzone
              inputId="thumb-upload-input"
              label="Drag and drop an image here, or"
              hint="PNG, JPG up to 10MB. Recommended: 1280×720 px"
              accept="image/png,image/jpeg"
              onFile={(f) => setCustomThumb(fileToStaged(f))}
            />
          )}
          {/* Hidden input also reachable via the "Upload custom" action button. */}
          {!customThumb && (
            <input
              id="thumb-upload-input"
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCustomThumb(fileToStaged(f));
                e.target.value = "";
              }}
            />
          )}
        </div>
      </section>

      {/* ── Intro video ──────────────────────────────────────── */}
      <FileSection
        title="Intro video"
        description="Add a short intro to welcome learners and set the context."
        accept="video/mp4"
        file={introFile}
        onFile={(f) => setIntroFile(fileToStaged(f))}
        onClear={() => setIntroFile(null)}
      />

      {/* ── Outro video ──────────────────────────────────────── */}
      <FileSection
        title="Outro video"
        description="Add an outro to wrap up your tutorial and drive action."
        accept="video/mp4"
        file={outroFile}
        onFile={(f) => setOutroFile(fileToStaged(f))}
        onClear={() => setOutroFile(null)}
      />

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
              <Check
                className="size-4 text-success shrink-0 mt-[3px]"
                strokeWidth={2.5}
              />
              <span className="leading-snug">{p}</span>
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          Learn more about creating great tutorial content
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </a>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────────────── */

function ActionButton({
  primary,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  primary?: boolean;
  icon: LucideIcon;
  label: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] text-[12.5px] font-semibold transition-colors",
        primary
          ? "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
          : "bg-white border border-ink-200 text-ink-900 hover:bg-cream-100",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {label}
      {badge && (
        <span
          className={cn(
            "ml-0.5 inline-flex items-center h-5 px-1.5 rounded-full text-[10px] font-bold tracking-wide",
            primary
              ? "bg-white/20 text-white"
              : "bg-rose-100 text-rose-700",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Dropzone({
  inputId,
  label,
  hint,
  accept,
  onFile,
}: {
  inputId?: string;
  label: string;
  hint: string;
  accept: string;
  onFile: (file: File) => void;
}) {
  const localRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className={cn(
        "rounded-[12px] border border-dashed transition-colors px-4 py-9 text-center",
        over
          ? "border-rose-400 bg-rose-50/50"
          : "border-ink-200 bg-cream-50/40 hover:bg-cream-50/70",
      )}
    >
      <div className="mx-auto size-10 rounded-[10px] bg-white border border-ink-100 inline-flex items-center justify-center text-ink-500 mb-3">
        <Upload className="size-4" strokeWidth={2} />
      </div>
      <div className="text-[13px] text-ink-700">
        {label}{" "}
        <button
          type="button"
          onClick={() => {
            if (inputId) {
              document.getElementById(inputId)?.click();
            } else {
              localRef.current?.click();
            }
          }}
          className="text-rose-600 hover:text-rose-700 font-semibold underline-offset-2 hover:underline"
        >
          browse
        </button>
      </div>
      <div className="text-[11.5px] text-ink-500 mt-1">{hint}</div>
      {!inputId && (
        <input
          ref={localRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      )}
    </div>
  );
}

function FileChip({
  kind,
  file,
  onClear,
  onReplace,
  showPreview,
}: {
  kind: "image" | "video";
  file: StagedFile;
  onClear: () => void;
  onReplace?: () => void;
  showPreview?: boolean;
}) {
  const Icon = kind === "video" ? FileVideo : ImageIcon;
  const typeLabel = kind === "video" ? "MP4" : "Image";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-[12px] border border-ink-200 bg-cream-50/40">
        <span className="size-10 rounded-[10px] bg-white border border-ink-100 text-ink-500 inline-flex items-center justify-center shrink-0">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink-900 truncate">
            {file.name}
          </div>
          <div className="text-[11.5px] text-ink-500 mt-0.5 inline-flex items-center gap-1.5">
            <span>{typeLabel}</span>
            <span aria-hidden>·</span>
            <span>{file.sizeMB} MB</span>
            {file.durationSec > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{formatTime(file.durationSec)}</span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove file"
          className="size-8 rounded-full hover:bg-cream-100 text-ink-500 inline-flex items-center justify-center transition-colors shrink-0"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>

      {(onReplace || showPreview) && (
        <div className="flex items-center justify-between px-1">
          {onReplace ? (
            <button
              type="button"
              onClick={onReplace}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700 hover:text-ink-900 transition-colors"
            >
              <Repeat className="size-3.5" strokeWidth={2} />
              Replace {kind === "video" ? "video" : "image"}
            </button>
          ) : <span />}
          {showPreview && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              <Play className="size-3.5" strokeWidth={2} fill="currentColor" />
              Preview
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FileSection({
  title,
  description,
  accept,
  file,
  onFile,
  onClear,
}: {
  title: string;
  description: string;
  accept: string;
  file: StagedFile | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-4">
        <h3 className="inline-flex items-center gap-2.5 text-h4 text-ink-900">
          <span className="size-7 rounded-[8px] bg-rose-50 text-rose-600 inline-flex items-center justify-center">
            <Play className="size-[13px] ml-[1px]" strokeWidth={2.5} fill="currentColor" />
          </span>
          {title}
          <span className="text-[12px] text-ink-400 font-medium">(optional)</span>
        </h3>
        <p className="text-[12.5px] text-ink-500 mt-1.5 ml-[38px]">{description}</p>
      </header>

      {file ? (
        <FileChip
          kind="video"
          file={file}
          onClear={onClear}
          onReplace={() => inputRef.current?.click()}
          showPreview
        />
      ) : (
        <Dropzone
          label="Drag and drop a video here, or"
          hint="MP4 up to 100MB"
          accept={accept}
          onFile={onFile}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </section>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
