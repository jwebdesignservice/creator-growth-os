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
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
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
        className="relative w-full max-w-md rounded-[18px] bg-white shadow-card border border-ink-100 p-6"
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

export function EditThumbnailButton({
  programId,
  currentUrl,
}: {
  programId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setValue(currentUrl ?? "");
    setError(null);
    setOpen(true);
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

  return (
    <>
      <PencilTrigger onClick={openDialog} label="Edit thumbnail" />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit thumbnail"
        description="Paste a public image URL — recommended 16:9, at least 1280×720."
      >
        <div className="space-y-3">
          {value.trim() && /^https?:\/\//i.test(value.trim()) && (
            <div className="w-full aspect-video rounded-[10px] overflow-hidden border border-ink-100 bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.trim()}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <label className="block">
            <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">
              Image URL
            </span>
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              placeholder="https://…"
              className="w-full h-11 px-3 rounded-[10px] border border-ink-200 focus:outline-none focus:border-rose-400 text-[14px]"
            />
          </label>
          <ErrorBanner message={error} />
          <div className="flex justify-between gap-2 pt-3">
            {currentUrl && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  save("");
                }}
                disabled={pending}
                className="h-10 px-3 rounded-[10px] text-[13px] font-medium text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
              >
                Remove image
              </button>
            )}
            <div className="ml-auto flex gap-2">
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
                disabled={pending || value === (currentUrl ?? "")}
                className="h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {pending && <Loader2 className="size-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
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
