"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  X,
  Trash2,
  Archive,
  ArchiveRestore,
  MoreVertical,
  Crown,
  Link2,
  Copy,
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";
import {
  updateProgram,
  archiveProgram,
  deleteProgram,
} from "@/app/admin/programs/actions";
import { cn } from "@/lib/cn";

/* ────────────────────────────────────────────────────────────────────── */
/*  Base modal — reused by every edit dialog on this page.               */
/* ────────────────────────────────────────────────────────────────────── */

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[10vh]"
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full rounded-[18px] bg-white shadow-card border border-ink-100 p-6",
          size === "lg" ? "max-w-lg" : "max-w-md",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-ink-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 cursor-pointer transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Shared bits — pencil button + error banner + footer actions.         */
/* ────────────────────────────────────────────────────────────────────── */

function PencilTrigger({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="size-8 rounded-[8px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors shrink-0 cursor-pointer"
    >
      <Pencil className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-[8px] px-3 py-2 leading-snug">
      {message}
    </p>
  );
}

function ModalFooter({
  onCancel,
  onSave,
  canSave,
  pending,
  saveLabel = "Save",
  saveTone = "primary",
}: {
  onCancel: () => void;
  onSave: () => void;
  canSave: boolean;
  pending: boolean;
  saveLabel?: string;
  saveTone?: "primary" | "danger";
}) {
  return (
    <div className="flex justify-end gap-2 pt-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave || pending}
        className={cn(
          "h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-colors",
          saveTone === "danger"
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-rose-600 hover:bg-rose-700",
        )}
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        {saveLabel}
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  EditTitleButton                                                      */
/* ────────────────────────────────────────────────────────────────────── */

export function EditTitleButton({
  programId,
  currentTitle,
}: {
  programId: string;
  currentTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setValue(currentTitle);
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateProgram(programId, { title: value });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <PencilTrigger onClick={openDialog} label="Edit program title" />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit program title"
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Title
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder="The Influencer Blueprint"
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
            />
          </label>
          <ErrorBanner message={error} />
          <ModalFooter
            onCancel={() => setOpen(false)}
            onSave={save}
            canSave={value.trim().length > 0 && value !== currentTitle}
            pending={pending}
          />
        </div>
      </Modal>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  EditDescriptionButton                                                */
/* ────────────────────────────────────────────────────────────────────── */

export function EditDescriptionButton({
  programId,
  currentDescription,
}: {
  programId: string;
  currentDescription: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setValue(currentDescription ?? "");
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateProgram(programId, { description: value });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <PencilTrigger onClick={openDialog} label="Edit program description" />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit program description"
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Description
            </span>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              rows={5}
              placeholder="A short pitch — what the program is and who it's for."
              className="w-full px-3 py-2.5 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px] leading-relaxed resize-y min-h-[120px]"
            />
          </label>
          <ErrorBanner message={error} />
          <ModalFooter
            onCancel={() => setOpen(false)}
            onSave={save}
            canSave={value !== (currentDescription ?? "")}
            pending={pending}
          />
        </div>
      </Modal>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  EditThumbnailButton                                                  */
/* ────────────────────────────────────────────────────────────────────── */

const ACCEPTED_IMAGE_MIME = "image/png,image/jpeg,image/webp";
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB raw before downscale

export function EditThumbnailButton({
  programId,
  currentUrl,
}: {
  programId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  function openDialog() {
    setValue(currentUrl ?? "");
    setError(null);
    setShowUrl(false);
    setDragging(false);
    setOpen(true);
  }

  function pickFile() {
    inputRef.current?.click();
  }

  async function handleFile(f: File | null) {
    setError(null);
    if (!f) return;
    if (!ACCEPTED_IMAGE_TYPES.has(f.type)) {
      setError("Unsupported format. Use PNG, JPG, or WEBP.");
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError("That image is over 8 MB. Pick a smaller file.");
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await fileToScaledDataUrl(f);
      setValue(dataUrl);
    } catch {
      setError("Could not read that image. Try another file.");
    } finally {
      setProcessing(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
    e.target.value = "";
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

  function save(nextUrl?: string) {
    setError(null);
    const url = nextUrl !== undefined ? nextUrl : value;
    startTransition(async () => {
      const res = await updateProgram(programId, { cover_image_url: url });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const hasImage = value.trim().length > 0;
  const isData = value.startsWith("data:");
  const dirty = value.trim() !== (currentUrl ?? "");

  return (
    <>
      <PencilTrigger onClick={openDialog} label="Edit thumbnail" />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit thumbnail"
        description="Drop an image or browse — recommended 16:9, at least 1280×720."
        size="lg"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_MIME}
          className="sr-only"
          onChange={onInputChange}
        />

        <div className="space-y-4">
          {hasImage ? (
            /* ── Preview state — image set (current or freshly picked) ── */
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-[14px] overflow-hidden border border-ink-100 bg-cream-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value.trim()}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500">
                  <CheckCircle2
                    className="size-3.5 text-success"
                    strokeWidth={2.2}
                  />
                  {isData ? "New image ready to save" : "Current thumbnail"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={pickFile}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="size-3.5" strokeWidth={2} />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("");
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12.5px] font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Drop zone — mirrors the tutorial video upload design ── */
            <button
              type="button"
              onClick={pickFile}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              aria-label="Drop image here or click to browse"
              className={cn(
                "w-full block rounded-[16px] border-2 border-dashed transition-colors px-6 py-9 text-center cursor-pointer",
                dragging
                  ? "border-rose-400 bg-rose-50"
                  : "border-rose-200 bg-rose-50/40 hover:border-rose-300 hover:bg-rose-50",
              )}
            >
              <div className="relative inline-block">
                <div
                  className="size-20 rounded-[18px] bg-rose-100 flex items-center justify-center mx-auto"
                  aria-hidden
                >
                  <ImageMotif />
                </div>
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 size-9 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shadow-md"
                >
                  <UploadCloud className="size-4" strokeWidth={2} />
                </span>
              </div>

              <div className="mt-4 text-[18px] font-semibold text-ink-900">
                {processing ? "Processing…" : "Drop your image here"}
              </div>
              <div className="mt-1.5 text-[13px] text-ink-500">
                or{" "}
                <span className="text-rose-600 font-semibold underline underline-offset-2">
                  browse files
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-ink-500">
                <CheckCircle2 className="size-3.5 text-success" strokeWidth={2.2} />
                PNG, JPG, WEBP
                <span className="text-ink-300">·</span>
                16:9 · 1280×720+
              </div>

              <div className="mt-5">
                <span className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 text-white text-[14px] font-semibold shadow-sm pointer-events-none">
                  <UploadCloud className="size-4" strokeWidth={2} />
                  Choose image file
                </span>
              </div>
            </button>
          )}

          {/* Secondary — paste a URL (keeps the original capability) */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
            >
              <Link2 className="size-3.5" strokeWidth={2} />
              {showUrl ? "Hide URL field" : "or paste an image URL"}
            </button>
          </div>
          {showUrl && (
            <label className="block">
              <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
                Image URL
              </span>
              <input
                type="url"
                value={isData ? "" : value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://…"
                className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
              />
            </label>
          )}

          <ErrorBanner message={error} />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => save()}
              disabled={pending || processing || !dirty}
              className="h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {pending && <Loader2 className="size-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Thumbnail helpers — image motif + client-side downscale to data URL. */
/* ────────────────────────────────────────────────────────────────────── */

/** Picture-frame motif (rose tones) for the thumbnail drop zone — the
 *  image-tab analogue of the video upload's play motif. */
function ImageMotif() {
  return (
    <svg width="44" height="44" viewBox="0 0 46 46" fill="none" aria-hidden>
      <rect x="6" y="9" width="34" height="28" rx="4" fill="#FEE2E2" />
      <rect
        x="6"
        y="9"
        width="34"
        height="28"
        rx="4"
        stroke="#FECACA"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="18" r="3.2" fill="#E11D48" />
      <path d="M10 33L19 24L25 30L31 21.5L36 33H10Z" fill="#E11D48" />
    </svg>
  );
}

/**
 * Reads a picked image and downscales it via canvas so the stored data
 * URL stays reasonable (matches the create-wizard's "data URLs stored
 * inline for now" approach — a real Storage upload can replace this later
 * without changing the schema). Falls back to the raw data URL if the
 * canvas path is unavailable.
 */
async function fileToScaledDataUrl(
  file: File,
  maxW = 1280,
  quality = 0.82,
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

/* ────────────────────────────────────────────────────────────────────── */
/*  PlanAccessPicker — inline (no modal, immediate click-to-save).      */
/* ────────────────────────────────────────────────────────────────────── */

export function PlanAccessPicker({
  programId,
  current,
}: {
  programId: string;
  current: "free" | "basic" | "pro";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Local override is null until the user picks something; a successful
  // server refresh re-renders with the new `current` and we clear the
  // override implicitly by ignoring it once it matches.
  const [override, setOverride] = useState<typeof current | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Treat override as authoritative only while it differs from `current`.
  // Once the server catches up, fall back to the prop.
  const optimistic =
    override !== null && override !== current ? override : current;

  function pick(tier: typeof current) {
    if (tier === optimistic) return;
    setOverride(tier);
    setError(null);
    startTransition(async () => {
      const res = await updateProgram(programId, { plan_access: tier });
      if (!res.ok) {
        setError(res.error);
        setOverride(null); // revert
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[12.5px] text-ink-500 shrink-0">
          Current access tier:
        </span>
        {(["free", "basic", "pro"] as const).map((tier) => {
          const active = optimistic === tier;
          return (
            <button
              type="button"
              key={tier}
              onClick={() => pick(tier)}
              disabled={pending}
              className={cn(
                "inline-flex items-center h-8 px-3.5 rounded-[8px] text-[12.5px] font-semibold capitalize transition-colors cursor-pointer disabled:cursor-wait",
                active
                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                  : "bg-white text-ink-500 border border-ink-100 hover:bg-cream-100 hover:text-ink-700",
              )}
              aria-pressed={active}
            >
              {tier}
            </button>
          );
        })}
        <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-500 ml-auto">
          <Crown className="size-3 text-rose-500" strokeWidth={2} />
          {optimistic.charAt(0).toUpperCase() + optimistic.slice(1)} members
          only
        </span>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  SalesPageEditor — inline URL row + Save + Copy + Preview            */
/* ────────────────────────────────────────────────────────────────────── */

export function SalesPageEditor({
  programId,
  currentUrl,
}: {
  programId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateProgram(programId, { sales_page_url: value });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function copyLink() {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const dirty = value.trim() !== (currentUrl ?? "");

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12.5px] text-ink-500 shrink-0 w-[72px]">
          Sales page
        </span>
        <div className="flex-1 min-w-[220px] inline-flex items-center gap-2 h-10 px-3 rounded-[10px] bg-white border border-ink-200 focus-within:border-rose-400 transition-colors">
          <Link2
            className="size-3.5 text-ink-500 shrink-0"
            strokeWidth={2}
          />
          <input
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https:// — paste your sales page URL"
            className="flex-1 min-w-0 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </div>
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-3.5" strokeWidth={2} /> Preview
          </a>
        )}
        <button
          type="button"
          onClick={copyLink}
          disabled={!currentUrl}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {copied ? (
            <CheckCircle2 className="size-3.5 text-success" strokeWidth={2} />
          ) : (
            <Copy className="size-3.5" strokeWidth={2} />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Save
        </button>
      </div>
      <ErrorBanner message={error} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  ProgramHeaderActions — Archive + Delete (kebab menu)                */
/* ────────────────────────────────────────────────────────────────────── */

export function ProgramHeaderActions({
  programId,
  programTitle,
  archived,
}: {
  programId: string;
  programTitle: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function toggleArchive() {
    setOpen(false);
    setError(null);
    startTransition(async () => {
      const res = await archiveProgram(programId, !archived);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteProgram(programId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/programs");
      router.refresh();
    });
  }

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="size-10 rounded-[10px] bg-white border border-ink-200 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors cursor-pointer"
          title="More actions"
        >
          <MoreVertical className="size-4" strokeWidth={2} />
        </button>
        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+6px)] z-20 w-52 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
          >
            <button
              type="button"
              role="menuitem"
              onClick={toggleArchive}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100 cursor-pointer"
            >
              {archived ? (
                <>
                  <ArchiveRestore className="size-3.5" strokeWidth={2} />
                  Restore from archive
                </>
              ) : (
                <>
                  <Archive className="size-3.5" strokeWidth={2} />
                  Archive program
                </>
              )}
            </button>
            <div aria-hidden className="h-px my-1 bg-ink-100" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
              Delete program
            </button>
          </div>
        )}
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this program?"
        description={`This deletes "${programTitle}" and removes its connection to existing lessons. This can't be undone.`}
      >
        <div className="space-y-3">
          <ErrorBanner message={error} />
          <ModalFooter
            onCancel={() => setConfirmDelete(false)}
            onSave={doDelete}
            canSave={true}
            pending={pending}
            saveLabel="Delete program"
            saveTone="danger"
          />
        </div>
      </Modal>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  PreviewLink — opens the public program page in a new tab.           */
/* ────────────────────────────────────────────────────────────────────── */

export function PreviewProgramLink({ slug }: { slug: string }) {
  return (
    <a
      href={`/programs/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors"
    >
      <Eye className="size-4" strokeWidth={2} />
      Preview
      <ExternalLink className="size-3 text-ink-400" strokeWidth={2} />
    </a>
  );
}
