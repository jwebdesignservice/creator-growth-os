"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2 } from "lucide-react";
import { updatePostingPlan } from "@/app/(app)/posting/actions";

export function EditPlanButton({
  planId,
  title: initialTitle,
  weekStart: initialWeek,
  description: initialDesc,
}: {
  planId: string;
  title: string;
  weekStart: string;
  description: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [weekStart, setWeekStart] = useState(initialWeek);
  const [description, setDescription] = useState(initialDesc ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setErr(null);
    startTransition(async () => {
      const res = await updatePostingPlan(planId, {
        title,
        week_start: weekStart,
        description,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] border border-ink-200 bg-white text-ink-700 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
      >
        <Pencil className="size-4 text-rose-500" strokeWidth={2} />
        Edit Plan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="bg-white rounded-[18px] shadow-xl border border-ink-100 w-full max-w-[480px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between mb-4">
              <h3 className="text-h4 text-ink-900">Edit plan</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </header>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">Plan title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">Week starting</span>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="input"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-medium text-ink-700 mb-1.5 block">Description</span>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="Theme, goals, audience notes…"
                />
              </label>
              {err && (
                <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
                  {err}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
                >
                  {pending && <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />}
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
