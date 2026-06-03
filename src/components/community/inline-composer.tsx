"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  PencilLine,
  X,
  Loader2,
  ImagePlus,
  Film,
  Link2,
  BarChart3,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { createPost } from "@/app/(app)/community/actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { PostAttachment } from "@/lib/community/queries";
import { cn } from "@/lib/cn";

type SpaceOption = { slug: string; name: string };

const MEDIA_BUCKET = "community-media";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_POLL_OPTIONS = 6;

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `o-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

/**
 * Feed composer. Collapsed it's a tappable "Start a discussion…" row; tapping
 * opens a modal where you enter a title + description and optionally attach a
 * link, image, video, or a poll, then pick the target audience and post.
 */
export function InlineComposer({
  spaces,
  userId,
  flat = false,
}: {
  spaces: SpaceOption[];
  userId: string;
  /** When true, render without its own card chrome (sits inside a parent panel). */
  flat?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          flat
            ? "w-full flex items-center gap-3 p-4 text-left hover:bg-cream-50 transition-colors"
            : "card w-full flex items-center gap-3 p-3.5 text-left hover:border-rose-200 transition-colors"
        }
      >
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <PencilLine className="size-[18px]" strokeWidth={1.9} />
        </span>
        <span className="flex-1 text-[14px] text-ink-400">
          Start a discussion or ask a question…
        </span>
        <span className="hidden sm:inline-flex items-center h-8 px-4 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold shrink-0">
          Post
        </span>
      </button>
      {open && (
        <ComposerModal
          spaces={spaces}
          userId={userId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

type PollOpt = { id: string; text: string };

function ComposerModal({
  spaces,
  userId,
  onClose,
}: {
  spaces: SpaceOption[];
  userId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [space, setSpace] = useState(spaces[0]?.slug ?? "");
  const [media, setMedia] = useState<PostAttachment[]>([]);
  const [showLink, setShowLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [poll, setPoll] = useState<PollOpt[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList) {
    setError(null);
    const supabase = createBrowserClient();
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        if (!isImage && !isVideo) {
          setError("Only images (PNG/JPEG/WebP/GIF) or video (MP4/WebM/MOV).");
          continue;
        }
        if (isImage && file.size > MAX_IMAGE_BYTES) {
          setError(`"${file.name}" is over the 5MB image limit.`);
          continue;
        }
        if (isVideo && file.size > MAX_VIDEO_BYTES) {
          setError(`"${file.name}" is over the 50MB video limit.`);
          continue;
        }
        const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "png");
        const path = `${userId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) {
          setError(
            /bucket not found/i.test(upErr.message)
              ? "Media isn't set up yet — create the 'community-media' bucket."
              : upErr.message,
          );
          continue;
        }
        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        setMedia((prev) => [
          ...prev,
          {
            url: data.publicUrl,
            type: isVideo ? "video" : "image",
            name: file.name,
          },
        ]);
      }
    } finally {
      setUploading(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = "";
  }

  const addLink = () => {
    const u = linkDraft.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) {
      setError("Links must start with http:// or https://");
      return;
    }
    setLinks((p) => [...p, u]);
    setLinkDraft("");
    setError(null);
  };

  const enablePoll = () =>
    setPoll((p) => p ?? [{ id: newId(), text: "" }, { id: newId(), text: "" }]);

  const submit = () => {
    setError(null);
    const cleanPoll =
      poll && poll.some((o) => o.text.trim())
        ? {
            options: poll
              .map((o) => ({ id: o.id, text: o.text.trim() }))
              .filter((o) => o.text),
          }
        : null;
    if (cleanPoll && cleanPoll.options.length < 2) {
      setError("A poll needs at least 2 filled-in options.");
      return;
    }
    const attachments: PostAttachment[] = [
      ...media,
      ...links.map((u) => ({ url: u, type: "link" as const, name: u })),
    ];
    startTransition(async () => {
      const res = await createPost(space, title, body, attachments, cleanPoll);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  };

  if (typeof document === "undefined") return null;

  const busy = pending || uploading;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Start a discussion"
    >
      <div
        className="bg-white rounded-[18px] shadow-xl border border-ink-100 w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <header className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-[18px] z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-9 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <PencilLine className="size-[18px]" strokeWidth={1.9} />
            </span>
            <h3 className="text-h4 text-ink-900 leading-tight">
              Start a discussion
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 disabled:opacity-50 shrink-0"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        <div className="px-5 sm:px-6 py-4 space-y-4">
          {/* title */}
          <div>
            <label
              htmlFor="dc-title"
              className="block text-[12px] font-semibold text-ink-700 mb-1.5"
            >
              Title
            </label>
            <input
              id="dc-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best way to write a 3-second hook?"
              className="w-full h-11 rounded-[10px] border border-ink-200 bg-white px-3.5 text-[14px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
            />
          </div>

          {/* description */}
          <div>
            <label
              htmlFor="dc-body"
              className="block text-[12px] font-semibold text-ink-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="dc-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Share context, your thinking, and what you'd like feedback on…"
              className="w-full rounded-[10px] border border-ink-200 bg-white p-3.5 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-y leading-relaxed transition"
            />
          </div>

          {/* toolbar: link / image / video / poll */}
          <div className="flex items-center gap-2 flex-wrap">
            <ToolButton
              icon={Link2}
              label="Link"
              active={showLink || links.length > 0}
              onClick={() => setShowLink((s) => !s)}
            />
            <ToolButton
              icon={ImagePlus}
              label="Image"
              onClick={() => imgRef.current?.click()}
            />
            <ToolButton
              icon={Film}
              label="Video"
              onClick={() => vidRef.current?.click()}
            />
            <ToolButton
              icon={BarChart3}
              label="Poll"
              active={!!poll}
              onClick={enablePoll}
            />
            {uploading && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-500">
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                Uploading…
              </span>
            )}
          </div>

          <input
            ref={imgRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={onPick}
          />
          <input
            ref={vidRef}
            type="file"
            accept={ALLOWED_VIDEO_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={onPick}
          />

          {/* link input + chips */}
          {showLink && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                  placeholder="https://…"
                  className="flex-1 h-10 rounded-[10px] border border-ink-200 bg-white px-3 text-[13px] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
                <button
                  type="button"
                  onClick={addLink}
                  className="h-10 px-3.5 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100"
                >
                  Add
                </button>
              </div>
              {links.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {links.map((u, i) => (
                    <span
                      key={u + i}
                      className="inline-flex items-center gap-1.5 max-w-full h-8 pl-2.5 pr-1.5 rounded-full bg-cream-100 border border-ink-200 text-[12px] text-ink-700"
                    >
                      <Link2 className="size-3.5 text-rose-500 shrink-0" strokeWidth={2} />
                      <span className="truncate max-w-[220px]">{u}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setLinks((p) => p.filter((_, j) => j !== i))
                        }
                        aria-label="Remove link"
                        className="size-5 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      >
                        <X className="size-3" strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* media previews */}
          {media.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {media.map((a) => (
                <div
                  key={a.url}
                  className="relative rounded-[10px] overflow-hidden border border-ink-100 bg-cream-50"
                >
                  {a.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} className="size-20 object-cover" />
                  ) : (
                    <div className="size-20 flex flex-col items-center justify-center gap-1 text-ink-500">
                      <Film className="size-5" strokeWidth={1.8} />
                      <span className="text-[10px] px-1 truncate max-w-[72px]">
                        {a.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setMedia((p) => p.filter((x) => x.url !== a.url))
                    }
                    aria-label={`Remove ${a.name}`}
                    className="absolute top-1 right-1 size-5 rounded-full bg-ink-900/70 text-white inline-flex items-center justify-center hover:bg-ink-900"
                  >
                    <X className="size-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* poll builder */}
          {poll && (
            <div className="rounded-[12px] border border-ink-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-700">
                  <BarChart3 className="size-4 text-rose-500" strokeWidth={2} />
                  Poll
                </span>
                <button
                  type="button"
                  onClick={() => setPoll(null)}
                  className="text-[12px] text-ink-500 hover:text-rose-600"
                >
                  Remove poll
                </button>
              </div>
              {poll.map((o, i) => (
                <div key={o.id} className="flex items-center gap-2">
                  <input
                    value={o.text}
                    onChange={(e) =>
                      setPoll(
                        (p) =>
                          p?.map((x) =>
                            x.id === o.id ? { ...x, text: e.target.value } : x,
                          ) ?? p,
                      )
                    }
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 h-10 rounded-[10px] border border-ink-200 bg-white px-3 text-[13px] focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                  {poll.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPoll((p) =>
                          p && p.length > 2
                            ? p.filter((x) => x.id !== o.id)
                            : p,
                        )
                      }
                      aria-label="Remove option"
                      className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-rose-600"
                    >
                      <X className="size-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
              ))}
              {poll.length < MAX_POLL_OPTIONS && (
                <button
                  type="button"
                  onClick={() =>
                    setPoll((p) =>
                      p && p.length < MAX_POLL_OPTIONS
                        ? [...p, { id: newId(), text: "" }]
                        : p,
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
                >
                  <Plus className="size-4" strokeWidth={2} />
                  Add option
                </button>
              )}
            </div>
          )}

          {/* audience / category */}
          <div>
            <label
              htmlFor="dc-space"
              className="block text-[12px] font-semibold text-ink-700 mb-1.5"
            >
              Target audience
            </label>
            <select
              id="dc-space"
              value={space}
              onChange={(e) => setSpace(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-ink-200 bg-white px-3 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-400"
            >
              {spaces.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
              {error}
            </div>
          )}
        </div>

        {/* footer CTAs */}
        <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-ink-100 sticky bottom-0 bg-white rounded-b-[18px]">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !title.trim()}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold transition-colors"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />}
            Post
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border text-[12.5px] font-medium transition-colors",
        active
          ? "border-rose-300 bg-rose-50 text-rose-700"
          : "border-ink-200 text-ink-600 hover:bg-cream-100 hover:text-rose-600",
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
      {label}
    </button>
  );
}
