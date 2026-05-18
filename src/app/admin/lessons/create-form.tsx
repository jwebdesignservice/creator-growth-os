"use client";

import { useActionState } from "react";
import { createLesson } from "./actions";

type Program = { id: string; title: string };

const initial = { ok: true as const };

export function CreateLessonForm({ programs }: { programs: Program[] }) {
  const [state, formAction, pending] = useActionState(createLesson, initial);
  const error = state && "ok" in state && state.ok === false ? state.error : null;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Title *
          </span>
          <input name="title" required className="input" />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Slug *
          </span>
          <input
            name="slug"
            required
            placeholder="hooks-that-stop-the-scroll"
            className="input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Description
          </span>
          <textarea name="description" rows={2} className="input" />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Program
          </span>
          <select name="program_id" className="input" defaultValue="">
            <option value="">— No program (standalone tutorial)</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Plan access
          </span>
          <select name="plan_access" className="input" defaultValue="basic">
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Module number
          </span>
          <input name="module_number" type="number" className="input" />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Module title
          </span>
          <input name="module_title" className="input" />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Duration (seconds)
          </span>
          <input
            name="duration_seconds"
            type="number"
            defaultValue={0}
            className="input"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Video URL
          </span>
          <input
            name="video_url"
            type="url"
            placeholder="https://"
            className="input"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-ink-800">
        <input
          type="checkbox"
          name="publish"
          value="1"
          defaultChecked
          className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
        />
        Publish immediately and notify eligible users
      </label>

      {error && (
        <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-semibold"
        >
          {pending ? "Saving…" : "Save lesson"}
        </button>
      </div>
    </form>
  );
}
