"use client";

import { useState, useTransition } from "react";
import { Play, Check, Bookmark, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { markLessonComplete } from "@/app/(app)/programs/[slug]/actions";

type Props = {
  lessonSlug: string;
  initialCompleted: boolean;
};

export function LessonActionRow({ lessonSlug, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function toggle() {
    setErr(null);
    const next = !completed;
    // Optimistic
    setCompleted(next);
    startTransition(async () => {
      const res = await markLessonComplete(lessonSlug, next);
      if (!res.ok) {
        setCompleted(!next);
        setErr(res.error);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
      <button
        type="button"
        onClick={() => {
          if (!completed) toggle();
        }}
        className="inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors cursor-pointer disabled:bg-rose-300"
        disabled={pending}
      >
        <Play className="size-4" fill="currentColor" />
        Continue Watching
      </button>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-11 rounded-[12px] border text-[14px] font-medium transition-colors cursor-pointer",
          completed
            ? "bg-rose-100 border-rose-200 text-rose-700"
            : "bg-white border-ink-200 text-ink-900 hover:bg-cream-100",
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full inline-flex items-center justify-center",
            completed ? "bg-rose-500 text-white" : "border border-ink-300",
          )}
        >
          {completed && <Check className="size-3" strokeWidth={3} />}
        </span>
        {completed ? "Completed" : pending ? "Saving…" : "Mark Complete"}
      </button>
      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-11 rounded-[12px] border text-[14px] font-medium transition-colors cursor-pointer",
          saved
            ? "bg-cream-200 border-ink-200 text-ink-900"
            : "bg-white border-ink-200 text-ink-900 hover:bg-cream-100",
        )}
      >
        <Bookmark
          className="size-4"
          strokeWidth={1.8}
          fill={saved ? "currentColor" : "none"}
        />
        {saved ? "Saved" : "Save Notes"}
      </button>
      <button
        type="button"
        className="size-11 rounded-[12px] border border-ink-200 bg-white text-ink-700 hover:bg-cream-100 inline-flex items-center justify-center cursor-pointer"
        aria-label="More actions"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>

      {err && (
        <div className="sm:col-span-4 text-[12px] text-rose-700">{err}</div>
      )}
    </div>
  );
}
