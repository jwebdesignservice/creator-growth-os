"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createPost } from "@/app/(app)/community/actions";

type SpaceOption = { slug: string; name: string };

export function NewPostForm({ spaces }: { spaces: SpaceOption[] }) {
  const [open, setOpen] = useState(false);
  const [space, setSpace] = useState(spaces[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createPost(space, title, body);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTitle("");
      setBody("");
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors"
      >
        <Plus className="size-4" strokeWidth={2} />
        Start a discussion
      </button>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h4 text-ink-900">
          Start a discussion
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500"
          aria-label="Close"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Space
          </span>
          <select
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
        </label>

        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best way to write a 3-second hook?"
            className="w-full h-11 rounded-[10px] border border-ink-200 bg-white px-3 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-400"
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-medium text-ink-700 mb-1 block">
            Body
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Share context, your thinking, and what you'd like feedback on."
            className="w-full rounded-[10px] border border-ink-200 bg-white p-3 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-400"
          />
        </label>

        {error && (
          <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !title.trim() || !body.trim()}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium transition-colors"
          >
            {pending ? "Posting…" : "Post discussion"}
          </button>
        </div>
      </div>
    </div>
  );
}
