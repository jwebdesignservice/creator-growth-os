"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Copy,
  Send,
  Trash2,
  Users,
  Loader2,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  assignAdminMissionNow,
  deleteAdminMission,
  duplicateAdminMission,
  setAdminMissionStatus,
} from "./actions";
import type { AdminMissionRow } from "@/lib/tasks/queries";
import type { TaskTemplateStatus } from "@/lib/tasks/types";

const FREQ_LABEL: Record<string, string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  scheduled: "Scheduled",
};
const PLAN_LABEL: Record<string, string> = { free: "Free", basic: "Basic", pro: "Pro" };
const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  monetization: "Monetization",
  scale: "Scale",
};

function targeting(row: AdminMissionRow): { plan: string | null; category: string | null } {
  let plan: string | null = null;
  let category: string | null = null;
  for (const r of row.rules) {
    if (r.ruleType !== "include") continue;
    if (r.targetType === "plan" && r.targetValue?.plan) plan = String(r.targetValue.plan);
    if (r.targetType === "category" && r.targetValue?.category)
      category = String(r.targetValue.category);
  }
  return { plan, category };
}

export function TemplateRow({
  row,
  onEdit,
}: {
  row: AdminMissionRow;
  onEdit: (row: AdminMissionRow) => void;
}) {
  const t = row.template;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const { plan, category } = targeting(row);

  function onAssign() {
    setFeedback(null);
    startTransition(async () => {
      const res = await assignAdminMissionNow(t.id);
      if (!res.ok) {
        setFeedback(`Error: ${res.error}`);
        return;
      }
      setFeedback(
        res.assigned === 0
          ? "No new users to assign (already up to date)."
          : `Assigned to ${res.assigned} user${res.assigned === 1 ? "" : "s"}.`,
      );
      router.refresh();
    });
  }

  function onDuplicate() {
    startTransition(async () => {
      await duplicateAdminMission(t.id);
      router.refresh();
    });
  }

  function onDelete() {
    if (!confirm(`Delete the template "${t.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteAdminMission(t.id);
      router.refresh();
    });
  }

  function onStatus(status: TaskTemplateStatus) {
    startTransition(async () => {
      await setAdminMissionStatus(t.id, status);
      router.refresh();
    });
  }

  const scheduleText =
    t.frequency === "once"
      ? "Manual · one time"
      : `${FREQ_LABEL[t.frequency]} at ${t.scheduleTime ?? "—"}`;

  return (
    <li className={cn("px-5 py-4", pending && "opacity-60")}>
      <div className="flex items-start gap-4 flex-wrap lg:flex-nowrap">
        {/* Template */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-ink-900 truncate">{t.title}</div>
            {t.description && (
              <p className="text-[12px] text-ink-500 leading-snug line-clamp-1">
                {t.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="chip chip-rose capitalize">{t.taskType}</span>
              {plan && (
                <span className="chip bg-cream-100 text-ink-700">
                  {PLAN_LABEL[plan] ?? plan}
                </span>
              )}
              <span className="chip bg-cream-100 text-ink-700">
                {category ? CATEGORY_LABEL[category] ?? category : "All categories"}
              </span>
              <span className="chip bg-cream-100 text-ink-500">{FREQ_LABEL[t.frequency]}</span>
              <span className="chip bg-cream-100 text-ink-500 tabular-nums">
                +{t.points} pts
              </span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="w-[150px] shrink-0 hidden xl:block">
          <div className="text-[12.5px] text-ink-700 inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5 text-ink-400" strokeWidth={2} />
            {scheduleText}
          </div>
          {t.timezone && t.frequency !== "once" && (
            <div className="text-[11px] text-ink-400 mt-0.5">{t.timezone}</div>
          )}
        </div>

        {/* Assignment */}
        <div className="w-[150px] shrink-0 hidden lg:block">
          <div className="text-[12.5px] text-ink-700 inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-ink-400" strokeWidth={2} />
            {t.autoAssign ? "Auto-assigned" : "Manual"}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5 tabular-nums">
            {row.assignedUsers} user{row.assignedUsers === 1 ? "" : "s"}
            {row.completed > 0 ? ` · ${row.completed} done` : ""}
          </div>
        </div>

        {/* Status */}
        <div className="shrink-0">
          <select
            value={t.status}
            onChange={(e) => onStatus(e.target.value as TaskTemplateStatus)}
            disabled={pending}
            className={cn(
              "h-8 pl-2.5 pr-7 rounded-full text-[11.5px] font-semibold border cursor-pointer focus:outline-none",
              t.status === "active"
                ? "bg-success-bg text-success border-success/30"
                : t.status === "draft"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-cream-100 text-ink-500 border-ink-200",
            )}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <IconBtn label="Edit" onClick={() => onEdit(row)} disabled={pending}>
            <Pencil className="size-3.5" strokeWidth={2} />
          </IconBtn>
          <IconBtn label="Duplicate" onClick={onDuplicate} disabled={pending}>
            <Copy className="size-3.5" strokeWidth={2} />
          </IconBtn>
          <button
            type="button"
            onClick={onAssign}
            disabled={pending}
            title="Assign to matching users now"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[12.5px] font-medium transition-colors"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Send className="size-3.5" strokeWidth={2} />
            )}
            Assign now
          </button>
          <IconBtn label="Delete" onClick={onDelete} disabled={pending} danger>
            <Trash2 className="size-3.5" strokeWidth={2} />
          </IconBtn>
        </div>
      </div>

      {feedback && (
        <div className="mt-2 ml-12 text-[12px] text-ink-700 inline-flex items-center gap-1.5">
          <CheckCircle2 className="size-3 text-rose-500" strokeWidth={2.5} />
          {feedback}
        </div>
      )}
    </li>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "size-9 rounded-[10px] border border-ink-200 bg-white inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors disabled:opacity-50",
        danger && "hover:bg-rose-50 hover:text-rose-600",
      )}
    >
      {children}
    </button>
  );
}
