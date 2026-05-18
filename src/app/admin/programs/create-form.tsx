"use client";

import { useActionState } from "react";
import { createProgram } from "./actions";

const initial = { ok: true as const };

const CATEGORIES = [
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "monetization", label: "Monetization" },
  { value: "scale", label: "Scale" },
];

export function CreateProgramForm() {
  const [state, formAction, pending] = useActionState(createProgram, initial);
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
            placeholder="influencer-blueprint"
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
            Estimated days
          </span>
          <input
            name="estimated_days"
            type="number"
            defaultValue={30}
            className="input"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Sort order
          </span>
          <input
            name="sort_order"
            type="number"
            defaultValue={100}
            className="input"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Cover image URL
          </span>
          <input
            name="cover_image_url"
            type="url"
            placeholder="https://"
            className="input"
          />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-[12px] font-medium text-ink-700 mb-2">
            Visible to categories
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className="flex items-center gap-2 text-[13px] text-ink-800"
              >
                <input
                  type="checkbox"
                  name="category_access"
                  value={c.value}
                  defaultChecked
                  className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-ink-800">
        <input
          type="checkbox"
          name="publish"
          value="1"
          defaultChecked
          className="size-4 rounded border-ink-300 text-rose-600 focus:ring-rose-300"
        />
        Publish immediately
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
          {pending ? "Saving…" : "Create program"}
        </button>
      </div>
    </form>
  );
}
