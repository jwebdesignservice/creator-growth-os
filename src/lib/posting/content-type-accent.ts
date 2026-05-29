/* Single source of truth for the content-type color system, shared by the
   posting calendar cards and the Planned Posts table so the two views never
   drift. Each content type maps to: a colored left border, a label tint, a
   progress-bar fill, and an icon-tile style. */

export type ContentTypeAccent = {
  /** Left-border colour, e.g. "border-l-violet-500". */
  border: string;
  /** Text tint, e.g. "text-violet-600". */
  label: string;
  /** Progress-bar fill, e.g. "bg-violet-500". */
  bar: string;
  /** Icon-tile background + text, e.g. "bg-violet-50 text-violet-600". */
  tile: string;
};

const ACCENTS: Record<string, ContentTypeAccent> = {
  reel: { border: "border-l-violet-500", label: "text-violet-600", bar: "bg-violet-500", tile: "bg-violet-50 text-violet-600" },
  short_video: { border: "border-l-fuchsia-500", label: "text-fuchsia-600", bar: "bg-fuchsia-500", tile: "bg-fuchsia-50 text-fuchsia-600" },
  story: { border: "border-l-amber-500", label: "text-amber-600", bar: "bg-amber-500", tile: "bg-amber-50 text-amber-600" },
  carousel: { border: "border-l-sky-500", label: "text-sky-600", bar: "bg-sky-500", tile: "bg-sky-50 text-sky-600" },
  post: { border: "border-l-emerald-500", label: "text-emerald-600", bar: "bg-emerald-500", tile: "bg-emerald-50 text-emerald-600" },
  video: { border: "border-l-rose-500", label: "text-rose-600", bar: "bg-rose-500", tile: "bg-rose-50 text-rose-600" },
  youtube_video: { border: "border-l-red-500", label: "text-red-600", bar: "bg-red-500", tile: "bg-red-50 text-red-600" },
};

const FALLBACK: ContentTypeAccent = {
  border: "border-l-ink-300",
  label: "text-ink-500",
  bar: "bg-rose-500",
  tile: "bg-cream-100 text-ink-500",
};

/** Resolve the accent for a content-type slug (falls back to a neutral tone). */
export function contentTypeAccent(type: string | null | undefined): ContentTypeAccent {
  return (type ? ACCENTS[type] : undefined) ?? FALLBACK;
}

const LABELS: Record<string, string> = {
  reel: "Reel",
  short_video: "Short Video",
  story: "Story",
  carousel: "Carousel",
  post: "Post",
  video: "Video",
  youtube_video: "YouTube Video",
};

/** Human-readable label for a content-type slug (e.g. "youtube_video" → "YouTube Video"). */
export function contentTypeLabel(type: string | null | undefined): string {
  if (!type) return "Post";
  return (
    LABELS[type] ??
    type
      .split("_")
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ")
  );
}
