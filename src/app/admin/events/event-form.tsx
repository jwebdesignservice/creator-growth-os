"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, ImagePlus, Loader2, X } from "lucide-react";
import { createEvent } from "./actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { EVENT_KINDS } from "@/lib/community/event-kinds";

type State = { ok: true } | { ok: false; error: string };

const MEDIA_BUCKET = "community-media";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

const inputCls =
  "w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
const labelCls = "block text-[12.5px] font-medium text-ink-700 mb-1.5";

export function EventForm({
  userId,
  redirectTo,
}: {
  userId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const initial: State = { ok: false, error: "" };
  const [state, formAction, pending] = useActionState<State, FormData>(
    createEvent,
    initial,
  );
  const errMessage = state.ok ? null : state.error || null;

  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setCover(null);
      setUploadErr(null);
      if (redirectTo) router.push(redirectTo);
    }
  }, [state, redirectTo, router]);

  async function uploadCover(file: File) {
    setUploadErr(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadErr("Use a PNG, JPEG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadErr("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${userId}/events/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        setUploadErr(
          /bucket not found/i.test(error.message)
            ? "The 'community-media' Storage bucket is missing."
            : error.message,
        );
        return;
      }
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      setCover(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadCover(file);
    e.target.value = "";
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={labelCls}>
            Event type <span className="text-rose-500">*</span>
          </span>
          <select name="kind" defaultValue="live" className={inputCls}>
            {EVENT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Host</span>
          <input
            type="text"
            name="host_name"
            placeholder="e.g. Coach Lia"
            className={inputCls}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>
          Title <span className="text-rose-500">*</span>
        </span>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Pitching Your First Brand Deal"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className={labelCls}>Description</span>
        <textarea
          name="description"
          rows={3}
          placeholder="What's this session about? Anything members should prepare or bring?"
          className="w-full px-4 py-3 rounded-[12px] bg-white border border-ink-200 text-[14px] leading-relaxed resize-y focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </label>

      {/* Cover image (optional) */}
      <div>
        <span className={labelCls}>
          Cover image{" "}
          <span className="text-ink-400 font-normal">(optional)</span>
        </span>
        <input type="hidden" name="cover_image_url" value={cover ?? ""} />
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={onFileSelect}
        />
        {cover ? (
          <div className="relative w-full max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt="Event cover"
              className="w-full aspect-video object-cover rounded-[12px] border border-ink-200"
            />
            <button
              type="button"
              onClick={() => setCover(null)}
              aria-label="Remove cover image"
              className="absolute top-2 right-2 size-7 rounded-full bg-ink-900/70 text-white inline-flex items-center justify-center hover:bg-ink-900"
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-dashed border-ink-300 text-[13px] font-medium text-ink-600 hover:bg-cream-100 hover:border-rose-300 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <ImagePlus className="size-4" strokeWidth={2} />
            )}
            {uploading ? "Uploading…" : "Add cover image"}
          </button>
        )}
        {uploadErr && (
          <p className="mt-1.5 text-[12px] text-rose-700">{uploadErr}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className={labelCls}>
            Date &amp; time <span className="text-rose-500">*</span>
          </span>
          <input
            type="datetime-local"
            name="starts_at"
            required
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Duration (min)</span>
          <input
            type="number"
            name="duration_min"
            min={5}
            max={600}
            step={5}
            defaultValue={60}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Join link</span>
          <input
            type="url"
            name="url"
            placeholder="https://zoom.us/j/…"
            className={inputCls}
          />
        </label>
      </div>

      {errMessage && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {errMessage}
        </div>
      )}
      {state.ok && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success">
          Event created — it&apos;s now live in the members&apos; Events tab.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium"
        >
          <CalendarPlus className="size-4" strokeWidth={2} />
          {pending ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}
