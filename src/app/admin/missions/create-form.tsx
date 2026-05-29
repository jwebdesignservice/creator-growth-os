"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Clock,
  CalendarClock,
  Play,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  createAdminMission,
  updateAdminMission,
  type AdminMissionInput,
} from "./actions";
import type { AdminMissionRow } from "@/lib/tasks/queries";
import type { TaskFrequency } from "@/lib/tasks/types";

/* ── Option vocab ────────────────────────────────────────────────────────── */

const TASK_TYPES = [
  { value: "posting", label: "Posting" },
  { value: "strategy", label: "Content Strategy" },
  { value: "engagement", label: "Engagement" },
  { value: "performance", label: "Performance" },
  { value: "monetization", label: "Monetization" },
  { value: "confidence", label: "Confidence" },
];

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "starter", label: "Starter Creator" },
  { value: "growth", label: "Growth Creator" },
  { value: "monetization", label: "Monetization Creator" },
  { value: "scale", label: "Scale Creator" },
];

const PLANS = [
  { value: "free", label: "Free" },
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
];

const CADENCES: { value: TaskFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "once", label: "Once" },
];

const TIMEZONES = [
  "Europe/Vilnius",
  "Europe/Oslo",
  "Europe/London",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
];

const WEEKDAYS = [
  "every_monday",
  "every_tuesday",
  "every_wednesday",
  "every_thursday",
  "every_friday",
  "every_saturday",
  "every_sunday",
];
const WEEKDAY_LABEL: Record<string, string> = {
  every_monday: "Every Monday",
  every_tuesday: "Every Tuesday",
  every_wednesday: "Every Wednesday",
  every_thursday: "Every Thursday",
  every_friday: "Every Friday",
  every_saturday: "Every Saturday",
  every_sunday: "Every Sunday",
};

/* Derive the form's plan/category pickers from a template's include-rules. */
function targetingFromRules(row: AdminMissionRow | null): {
  plan: string;
  category: string;
} {
  let plan = "basic";
  let category = "all";
  for (const r of row?.rules ?? []) {
    if (r.ruleType !== "include") continue;
    if (r.targetType === "plan" && r.targetValue?.plan)
      plan = String(r.targetValue.plan);
    if (r.targetType === "category" && r.targetValue?.category)
      category = String(r.targetValue.category);
  }
  return { plan, category };
}

export function CreateMissionForm({
  editing,
  onDone,
}: {
  editing?: AdminMissionRow | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const t = editing?.template ?? null;
  const initialTargeting = useMemo(() => targetingFromRules(editing ?? null), [editing]);

  const [title, setTitle] = useState(t?.title ?? "");
  const [taskType, setTaskType] = useState(t?.taskType ?? "posting");
  const [points, setPoints] = useState<number>(t?.points ?? 10);
  const [description, setDescription] = useState(t?.description ?? "");
  const [category, setCategory] = useState(initialTargeting.category);
  const [plan, setPlan] = useState(initialTargeting.plan);
  const [frequency, setFrequency] = useState<TaskFrequency>(t?.frequency ?? "daily");
  const [scheduleTime, setScheduleTime] = useState(t?.scheduleTime ?? "09:00");
  const [timezone, setTimezone] = useState(t?.timezone ?? "Europe/Vilnius");
  const [recurrence, setRecurrence] = useState(t?.recurrence ?? "every_day");
  const [autoAssign, setAutoAssign] = useState<boolean>(t?.autoAssign ?? true);

  const isEditing = !!editing;
  const showSchedule = frequency !== "once";

  function reset() {
    setTitle("");
    setTaskType("posting");
    setPoints(10);
    setDescription("");
    setCategory("all");
    setPlan("basic");
    setFrequency("daily");
    setScheduleTime("09:00");
    setTimezone("Europe/Vilnius");
    setRecurrence("every_day");
    setAutoAssign(true);
  }

  function submit() {
    setError(null);
    setOk(false);
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    const input: AdminMissionInput = {
      title: title.trim(),
      description: description.trim(),
      taskType,
      points,
      status: "active",
      frequency,
      scheduleTime: showSchedule ? scheduleTime : null,
      timezone: showSchedule ? timezone : null,
      recurrence: showSchedule ? recurrence : null,
      autoAssign: showSchedule ? autoAssign : false,
      plan,
      category,
    };
    startTransition(async () => {
      const res = editing
        ? await updateAdminMission(editing.template.id, input)
        : await createAdminMission(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOk(true);
      if (!isEditing) reset();
      router.refresh();
      onDone?.();
    });
  }

  const startLabel = showSchedule
    ? `Starts at ${scheduleTime} · ${CADENCES.find((c) => c.value === frequency)?.label ?? "Once"}`
    : "Assigned manually · one time";

  return (
    <section className="card p-6">
      <header className="flex items-center justify-between gap-3 mb-5">
        <h2 className="inline-flex items-center gap-2 text-h4 text-ink-900">
          <Sparkles className="size-4 text-rose-500" strokeWidth={2} fill="currentColor" />
          {isEditing ? "Edit task template" : "Create new task template"}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={() => onDone?.()}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-[8px] text-[12.5px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
          >
            <X className="size-3.5" strokeWidth={2} />
            Cancel edit
          </button>
        )}
      </header>

      {/* Row 1 — title / type / points */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_140px] gap-4">
        <Field label="Task title" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Post 1 short-form video"
            className={inputCls}
          />
        </Field>
        <Field label="Task type">
          <Select value={taskType} onChange={setTaskType} options={TASK_TYPES} />
        </Field>
        <Field label="Points">
          <input
            type="number"
            min={0}
            max={9999}
            value={points}
            onChange={(e) => setPoints(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className={inputCls + " tabular-nums"}
          />
        </Field>
      </div>

      {/* Row 2 — description / category / plan */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-4 mt-4">
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short, actionable instructions…"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none"
          />
        </Field>
        <Field label="Category">
          <Select value={category} onChange={setCategory} options={CATEGORIES} />
        </Field>
        <Field label="Required plan">
          <Select value={plan} onChange={setPlan} options={PLANS} />
        </Field>
      </div>

      {/* Row 3 — cadence / schedule / recurrence / assignment logic */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_300px] gap-4 mt-5">
        <Field label="Cadence">
          <div className="inline-flex items-center rounded-[12px] border border-ink-200 bg-white p-1 w-full">
            {CADENCES.map((c) => {
              const active = frequency === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setFrequency(c.value);
                    setRecurrence(
                      c.value === "daily"
                        ? "every_day"
                        : c.value === "weekly"
                          ? "every_monday"
                          : c.value === "monthly"
                            ? "day_1"
                            : "",
                    );
                  }}
                  className={cn(
                    "flex-1 h-9 rounded-[9px] text-[12.5px] font-semibold transition-colors",
                    active ? "bg-rose-100 text-rose-700" : "text-ink-600 hover:bg-cream-100",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Schedule">
          {showSchedule ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400" strokeWidth={2} />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-11 pl-9 pr-2 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <Select
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace("_", " ") }))}
              />
            </div>
          ) : (
            <div className="h-11 inline-flex items-center px-3.5 rounded-[12px] bg-cream-50 border border-ink-100 text-[12.5px] text-ink-500">
              No schedule — one-time
            </div>
          )}
        </Field>

        <Field label="Recurrence">
          {frequency === "daily" && (
            <Select value="every_day" onChange={() => undefined} options={[{ value: "every_day", label: "Every day" }]} />
          )}
          {frequency === "weekly" && (
            <Select
              value={recurrence || "every_monday"}
              onChange={setRecurrence}
              options={WEEKDAYS.map((w) => ({ value: w, label: WEEKDAY_LABEL[w] }))}
            />
          )}
          {frequency === "monthly" && (
            <Select
              value={recurrence || "day_1"}
              onChange={setRecurrence}
              options={Array.from({ length: 28 }, (_, i) => ({
                value: `day_${i + 1}`,
                label: `Day ${i + 1} of month`,
              }))}
            />
          )}
          {frequency === "once" && (
            <div className="h-11 inline-flex items-center px-3.5 rounded-[12px] bg-cream-50 border border-ink-100 text-[12.5px] text-ink-500">
              One time
            </div>
          )}
        </Field>

        {/* Assignment logic */}
        <div className="rounded-[14px] bg-rose-50/60 border border-rose-100 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-ink-900">
                Auto-assign to eligible users
              </div>
              <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
                Runs on the schedule above for{" "}
                {plan === "all" ? "all plans" : `${plan} plan`}
                {category !== "all" ? ` · ${category}` : ""}.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoAssign}
              disabled={!showSchedule}
              onClick={() => setAutoAssign((v) => !v)}
              className={cn(
                "relative inline-flex items-center h-6 w-11 rounded-full transition-colors shrink-0 disabled:opacity-40",
                autoAssign && showSchedule ? "bg-rose-500" : "bg-ink-200",
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
                  autoAssign && showSchedule ? "translate-x-[22px]" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {error}
        </div>
      )}
      {ok && !error && (
        <div className="mt-4 px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success">
          {isEditing ? "Template updated." : "Template created — it appears below."}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 text-[12.5px] text-ink-500">
          <CalendarClock className="size-4 text-ink-400" strokeWidth={2} />
          {startLabel}
        </span>
        <div className="flex items-center gap-2.5">
          {isEditing && (
            <button
              type="button"
              onClick={() => onDone?.()}
              className="inline-flex items-center h-11 px-5 rounded-[12px] border border-ink-200 bg-white text-ink-700 text-[14px] font-medium hover:bg-cream-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-semibold transition-colors shadow-sm"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <Play className="size-4" strokeWidth={2} fill="currentColor" />
            )}
            {isEditing ? "Save changes" : "Create template"}
          </button>
        </div>
      </footer>
    </section>
  );
}

/* ── Small field + select primitives ────────────────────────────────────── */

const inputCls =
  "w-full h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
