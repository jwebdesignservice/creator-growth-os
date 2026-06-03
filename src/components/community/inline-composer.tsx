"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, X, Loader2, ImagePlus, Film } from "lucide-react";
import { createPost } from "@/app/(app)/community/actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { PostAttachment } from "@/lib/community/queries";

type SpaceOption = { slug: string; name: string };

const MEDIA_BUCKET = "community-media";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPT = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",");

/**
 * Inline discussion composer that sits at the top of the Feed. Collapsed it
 * looks like a tappable input ("Start a discussion…"); focused it expands to
 * a title + description + image/video attachments + space picker. Uploads go
 * to the public `community-media` Storage bucket; only the resulting URLs are
 * passed to `createPost`. Refreshes the feed on success.
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
  const [space, setSpace] = useState(spaces[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = () => {
    setOpen(false);
    setTitle("");
    setBody("");
    setAttachments([]);
    setError(null);
  };

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
              ? "Media isn't set up yet — create the 'community-media' Storage bucket (migration 0050)."
              : upErr.message,
          );
          continue;
        }
        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        setAttachments((prev) => [
          ...prev,
          { url: data.publicUrl, type: isVideo ? "video" : "image", name: file.name },
        ]);
      }
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file
  }

  const removeAttachment = (url: string) =>
    setAttachments((prev) => prev.filter((a) => a.url !== url));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createPost(space, title, body, attachments);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      close();
      router.refresh(); // surface the new post in the feed
    });
  };

  if (!open) {
    return (
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
    );
  }

  return (
    <div className={flat ? "p-4 sm:p-5" : "card p-4 sm:p-5"}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-ink-900">
          Start a discussion
        </h3>
        <button
          type="button"
          onClick={close}
          disabled={pending}
          aria-label="Close"
          className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 disabled:opacity-50"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="composer-title"
            className="block text-[12px] font-semibold text-ink-700 mb-1.5"
          >
            Title
          </label>
          <input
            id="composer-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best way to write a 3-second hook?"
            className="w-full h-11 rounded-[10px] border border-ink-200 bg-white px-3.5 text-[14px] font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
          />
        </div>
        <div>
          <label
            htmlFor="composer-body"
            className="block text-[12px] font-semibold text-ink-700 mb-1.5"
          >
            Description
          </label>
          <textarea
            id="composer-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Share context, your thinking, and what you'd like feedback on…"
            className="w-full rounded-[10px] border border-ink-200 bg-white p-3.5 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-y leading-relaxed transition"
          />
        </div>

        {/* attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div
                key={a.url}
                className="relative group rounded-[10px] overflow-hidden border border-ink-100 bg-cream-50"
              >
                {a.type === "image" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
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
                  onClick={() => removeAttachment(a.url)}
                  aria-label={`Remove ${a.name}`}
                  className="absolute top-1 right-1 size-5 rounded-full bg-ink-900/70 text-white inline-flex items-center justify-center hover:bg-ink-900"
                >
                  <X className="size-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || pending}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 text-[12.5px] font-medium text-ink-600 hover:bg-cream-100 hover:text-rose-600 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <ImagePlus className="size-4" strokeWidth={2} />
              )}
              Photo / video
            </button>

            <label className="inline-flex items-center gap-2 text-[12.5px] text-ink-500">
              Post to
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="h-9 rounded-[10px] border border-ink-200 bg-white px-2.5 text-[13px] text-ink-900 focus:outline-none focus:border-rose-400"
              >
                {spaces.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || uploading || !title.trim() || !body.trim()}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold transition-colors"
            >
              {pending && <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />}
              Post discussion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
