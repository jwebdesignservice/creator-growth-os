"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toggleLessonPublished, deleteLesson } from "./actions";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  plan_access: "free" | "basic" | "pro";
  duration_seconds: number;
  module_number: number | null;
  module_title: string | null;
  published: boolean;
  program_title?: string;
};

export function LessonRow({ lesson }: { lesson: Lesson }) {
  const [pending, startTransition] = useTransition();

  const togglePublish = () =>
    startTransition(async () => {
      await toggleLessonPublished(lesson.id, !lesson.published);
    });

  const remove = () =>
    startTransition(async () => {
      if (!confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`))
        return;
      await deleteLesson(lesson.id);
    });

  const duration =
    lesson.duration_seconds > 0
      ? `${Math.floor(lesson.duration_seconds / 60)}m ${
          lesson.duration_seconds % 60
        }s`
      : "—";

  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink-900">
          {lesson.title}
        </div>
        <div className="text-[12px] text-ink-500 flex flex-wrap items-center gap-2 mt-0.5">
          <span className="font-mono text-[11px]">{lesson.slug}</span>
          {lesson.program_title && (
            <>
              <span>·</span>
              <span>{lesson.program_title}</span>
            </>
          )}
          {lesson.module_title && (
            <>
              <span>·</span>
              <span>
                M{lesson.module_number}: {lesson.module_title}
              </span>
            </>
          )}
          <span>·</span>
          <span className="capitalize">{lesson.plan_access}</span>
          <span>·</span>
          <span>{duration}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePublish}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[12px] font-semibold transition-colors ${
          lesson.published
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-ink-100 text-ink-600 hover:bg-ink-200"
        }`}
      >
        {lesson.published ? (
          <>
            <Eye className="size-3.5" strokeWidth={2} /> Published
          </>
        ) : (
          <>
            <EyeOff className="size-3.5" strokeWidth={2} /> Draft
          </>
        )}
      </button>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="Delete"
        className="size-9 rounded-[8px] hover:bg-rose-50 inline-flex items-center justify-center text-ink-500 hover:text-rose-600"
      >
        <Trash2 className="size-4" strokeWidth={2} />
      </button>
    </li>
  );
}
