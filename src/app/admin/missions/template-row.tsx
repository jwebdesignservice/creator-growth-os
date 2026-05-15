"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Send, Check } from "lucide-react";
import { assignTemplateToCategory, deleteMissionTemplate } from "./actions";

type Template = {
  id: string;
  title: string;
  description: string | null;
  mission_type: string;
  category: string | null;
  plan_access: string;
  points: number;
};

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  monetization: "Monetization",
  scale: "Scale",
};

export function TemplateRow({ template: t }: { template: Template }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function onAssign() {
    setFeedback(null);
    startTransition(async () => {
      const res = await assignTemplateToCategory(t.id, { dueInDays: 7 });
      if (!res.ok) {
        setFeedback(`Error: ${res.error}`);
        return;
      }
      setFeedback(
        res.assigned === 0
          ? "No users match this template's filters yet."
          : `Assigned to ${res.assigned} user${res.assigned === 1 ? "" : "s"}.`,
      );
      router.refresh();
    });
  }

  function onDelete() {
    if (!confirm(`Delete the template "${t.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteMissionTemplate(t.id);
      router.refresh();
    });
  }

  return (
    <li className="px-5 py-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink-900 mb-1">
          {t.title}
        </div>
        {t.description && (
          <p className="text-[12.5px] text-ink-500 leading-snug mb-2 line-clamp-2">
            {t.description}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip chip-rose capitalize">{t.mission_type}</span>
          <span className="chip bg-cream-100 text-ink-700 capitalize">
            {t.plan_access}
          </span>
          <span className="chip bg-cream-100 text-ink-700">
            {t.category ? CATEGORY_LABEL[t.category] ?? t.category : "All categories"}
          </span>
          <span className="chip bg-cream-100 text-ink-500 tabular-nums">
            +{t.points} pts
          </span>
        </div>
        {feedback && (
          <div className="mt-2 text-[12px] text-ink-700 inline-flex items-center gap-1.5">
            <Check className="size-3 text-rose-500" strokeWidth={2.5} />
            {feedback}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onAssign}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-medium cursor-pointer transition-colors"
        >
          <Send className="size-3.5" strokeWidth={2} />
          {pending ? "Assigning…" : "Assign to matching users"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="size-10 rounded-[10px] border border-ink-200 bg-white hover:bg-rose-50 hover:text-rose-700 inline-flex items-center justify-center text-ink-500 cursor-pointer"
          aria-label="Delete template"
        >
          <Trash2 className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </li>
  );
}
