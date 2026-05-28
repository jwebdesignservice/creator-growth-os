"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  SlidersHorizontal,
  Lock,
  PieChart,
  Play,
  Target,
  Gauge,
  Repeat,
  Captions,
  CheckCircle2,
  ListOrdered,
  Bookmark,
  FastForward,
  List,
  StickyNote,
  Download,
  MousePointerClick,
  Bell,
  Mail,
  Zap,
  Eye,
  Check,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  saveLessonControls,
  resetLessonControls,
} from "./controls-actions";
import {
  DEFAULT_CONTROLS,
  type LessonControls,
  type CompletionThreshold,
  type ReminderTiming,
  type FollowUpTask,
} from "./controls-types";

/* ─────────────────────────────────────────────────────────────────────────
   Controls tab — playback / progress / learner / notifications.

   Server-backed via lesson_controls (1:1 with lessons, migration 0033).
   Initial state hydrates from `initialControls` prop; saves are routed
   through the `saveLessonControls` server action.

   UX rules:
   • Unsaved-changes badge appears the moment any field diverges from
     the last saved state. "Apply controls" is disabled when there are
     no changes.
   • "Reset to defaults" is destructive and tucked into the secondary
     actions; it shows a confirm prompt.
   • If the table is missing (fresh env without migration 0033), every
     control is disabled and the panel surfaces a clear admin-only
     setup notice instead of silently no-op'ing.
   ───────────────────────────────────────────────────────────────────────── */

const ACCESS_LABELS: Record<LessonControls["accessMode"], string> = {
  open:      "Open",
  private:   "Private",
  scheduled: "Scheduled",
};
const CTA_LABELS: Record<LessonControls["ctaTrigger"], string> = {
  immediate:          "Immediate",
  "final-chapter":    "Final chapter",
  "after-completion": "After completion",
};

export function ControlsTab({
  lessonId,
  slug,
  initialControls,
  tableMissing = false,
}: {
  lessonId: string;
  slug: string;
  initialControls: LessonControls;
  tableMissing?: boolean;
}) {
  /* ── State ─────────────────────────────────────────────────────────── */

  const [values,      setValues]      = useState<LessonControls>(initialControls);
  const [savedValues, setSavedValues] = useState<LessonControls>(initialControls);
  const [saving,      startSaving]    = useTransition();
  const [resetting,   startReset]     = useTransition();
  const [error,       setError]       = useState<string | null>(null);
  const [savedFlash,  setSavedFlash]  = useState<Date | null>(null);
  const [recentlySaved, setRecentlySaved] = useState(false);

  // Flip the "Saved" pill off ~5s after a save, without reading the clock
  // during render (which would be impure). The boolean is set true in the
  // save handlers; this only schedules the reset.
  useEffect(() => {
    if (!savedFlash) return;
    const id = window.setTimeout(() => setRecentlySaved(false), 5000);
    return () => window.clearTimeout(id);
  }, [savedFlash]);

  const disabled = tableMissing || saving || resetting;
  const dirty    = useMemo(() => !shallowEqual(values, savedValues), [values, savedValues]);

  /* ── Updater helper ───────────────────────────────────────────────── */

  function update<K extends keyof LessonControls>(key: K, v: LessonControls[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setError(null);
  }

  /* ── Handlers ─────────────────────────────────────────────────────── */

  function onApply() {
    if (!dirty || disabled) return;
    setError(null);
    startSaving(async () => {
      const res = await saveLessonControls(lessonId, values);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const next = res.data ?? values;
      setValues(next);
      setSavedValues(next);
      setSavedFlash(new Date());
      setRecentlySaved(true);
    });
  }

  function onResetDefaults() {
    if (disabled) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset every control on this tutorial to the platform defaults? Your saved settings will be removed.",
      );
      if (!ok) return;
    }
    setError(null);
    startReset(async () => {
      const res = await resetLessonControls(lessonId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setValues(DEFAULT_CONTROLS);
      setSavedValues(DEFAULT_CONTROLS);
      setSavedFlash(new Date());
      setRecentlySaved(true);
    });
  }

  function onDiscard() {
    setValues(savedValues);
    setError(null);
  }

  function onPreview() {
    // Open the real learner-facing tutorial page in a new tab — the same
    // surface the editor header's Preview opens.
    if (typeof window !== "undefined") {
      window.open(`/tutorials/${slug}`, "_blank", "noopener,noreferrer");
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <section className="rounded-[16px] bg-gradient-to-br from-rose-50/50 via-cream-50/50 to-rose-50/30 border border-rose-100/60 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-3 text-h3 text-ink-900">
            <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
              <SlidersHorizontal className="size-[18px]" strokeWidth={2} />
            </span>
            Controls
          </h3>
          <p className="text-[13px] text-ink-500 mt-1.5 ml-[52px] max-w-2xl leading-snug">
            Manage how this tutorial behaves, how learners progress, and what
            actions are enabled.
          </p>
        </div>

        {/* Live save-status pill */}
        <StatusPill
          tableMissing={tableMissing}
          dirty={dirty}
          savedFlash={savedFlash}
          recentlySaved={recentlySaved}
        />
      </header>

      {/* Setup notice — only when the table is missing */}
      {tableMissing && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-[12px] bg-amber-50 border border-amber-200 text-[12.5px] text-amber-900">
          <AlertCircle className="size-4 text-amber-600 shrink-0 mt-px" strokeWidth={2} />
          <div className="leading-snug">
            <span className="font-semibold">Lesson controls aren&apos;t set up yet.</span>{" "}
            Apply{" "}
            <code className="bg-amber-100/70 px-1.5 py-0.5 rounded text-[11.5px]">
              supabase/migrations/0033_lesson_controls.sql
            </code>{" "}
            and reload to enable saving.
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-[12px] bg-rose-50 border border-rose-200 text-[12.5px] text-rose-900">
          <AlertCircle className="size-4 text-rose-600 shrink-0 mt-px" strokeWidth={2} />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      {/* Quick-status row */}
      <div className="rounded-[12px] bg-white border border-ink-100 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-100 overflow-hidden">
        <QuickStatus
          icon={Lock}
          label="Access mode"
          value={ACCESS_LABELS[values.accessMode]}
          dim={tableMissing}
        />
        <QuickStatus
          icon={PieChart}
          label="Completion rule"
          value={`${values.completionThreshold}% watched`}
          dim={tableMissing}
        />
        <QuickStatus
          icon={Play}
          label="Autoplay"
          value={values.autoplayNextChapter ? "On" : "Off"}
          dim={tableMissing}
        />
        <QuickStatus
          icon={Target}
          label="CTA trigger"
          value={CTA_LABELS[values.ctaTrigger]}
          dim={tableMissing}
        />
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* 1 · Playback controls */}
        <DetailCard n={1} title="Playback controls">
          <ToggleRow
            icon={Play}
            title="Autoplay next chapter"
            description="Automatically play the next chapter when current ends"
            on={values.autoplayNextChapter}
            onChange={(v) => update("autoplayNextChapter", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={Gauge}
            title="Allow playback speed"
            description="Let learners change video speed"
            on={values.allowPlaybackSpeed}
            onChange={(v) => update("allowPlaybackSpeed", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={Repeat}
            title="Loop preview"
            description="Loop the preview video on the lesson page"
            on={values.loopPreview}
            onChange={(v) => update("loopPreview", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={Captions}
            title="Show captions by default"
            description="Captions are enabled when the video starts"
            on={values.showCaptionsDefault}
            onChange={(v) => update("showCaptionsDefault", v)}
            disabled={disabled}
          />
        </DetailCard>

        {/* 2 · Progress & completion */}
        <DetailCard n={2} title="Progress & completion">
          <DropdownRow
            icon={CheckCircle2}
            title="Mark complete when watched"
            description="Completion is unlocked at the selected percentage"
            value={String(values.completionThreshold)}
            onChange={(v) =>
              update("completionThreshold", Number(v) as CompletionThreshold)
            }
            options={[
              { value: "50",  label: "50%"  },
              { value: "60",  label: "60%"  },
              { value: "70",  label: "70%"  },
              { value: "80",  label: "80%"  },
              { value: "90",  label: "90%"  },
              { value: "100", label: "100%" },
            ]}
            disabled={disabled}
          />
          <ToggleRow
            icon={ListOrdered}
            title="Require chapters in order"
            description="Learners must complete chapters sequentially"
            on={values.requireChaptersInOrder}
            onChange={(v) => update("requireChaptersInOrder", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={Bookmark}
            title="Resume from last position"
            description="Return learners to where they left off"
            on={values.resumeFromLastPosition}
            onChange={(v) => update("resumeFromLastPosition", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={FastForward}
            title="Allow skipping ahead"
            description="Learners can skip to any chapter"
            on={values.allowSkippingAhead}
            onChange={(v) => update("allowSkippingAhead", v)}
            disabled={disabled}
          />
        </DetailCard>

        {/* 3 · Learner experience */}
        <DetailCard n={3} title="Learner experience">
          <ToggleRow
            icon={List}
            title="Show chapter list"
            description="Display chapter list beside the player"
            on={values.showChapterList}
            onChange={(v) => update("showChapterList", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={StickyNote}
            title="Enable notes"
            description="Allow learners to take and save notes"
            on={values.enableNotes}
            onChange={(v) => update("enableNotes", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={Download}
            title="Enable downloadable resources"
            description="Make attached resources available to download"
            on={values.enableDownloads}
            onChange={(v) => update("enableDownloads", v)}
            disabled={disabled}
          />
          <ToggleRow
            icon={MousePointerClick}
            title="Show CTA at end"
            description="Display call-to-action after the final chapter"
            on={values.showCtaAtEnd}
            onChange={(v) => update("showCtaAtEnd", v)}
            disabled={disabled}
          />
        </DetailCard>

        {/* 4 · Notifications & follow-ups */}
        <DetailCard n={4} title="Notifications & follow-ups">
          <DropdownRow
            icon={Bell}
            title="Send reminder if not completed"
            description="Email learners who haven't finished"
            value={values.reminderTiming}
            onChange={(v) => update("reminderTiming", v as ReminderTiming)}
            options={[
              { value: "never", label: "Never"                },
              { value: "1d",    label: "1 day after enroll"   },
              { value: "3d",    label: "3 days after enroll"  },
              { value: "7d",    label: "7 days after enroll"  },
              { value: "14d",   label: "14 days after enroll" },
            ]}
            disabled={disabled}
          />
          <ToggleRow
            icon={Mail}
            title="Notify on completion"
            description="Send a completion email to learners"
            on={values.notifyOnCompletion}
            onChange={(v) => update("notifyOnCompletion", v)}
            disabled={disabled}
          />
          <DropdownRow
            icon={Zap}
            title="Trigger follow-up task"
            description="Create a task after tutorial completion"
            value={values.followUpTask}
            onChange={(v) => update("followUpTask", v as FollowUpTask)}
            options={[
              { value: "",         label: "Select task"          },
              { value: "feedback", label: "Send feedback survey" },
              { value: "next",     label: "Assign next tutorial" },
              { value: "checkin",  label: "1:1 check-in"         },
              { value: "review",   label: "Leave a review"       },
            ]}
            disabled={disabled}
          />
        </DetailCard>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <button
          type="button"
          onClick={onResetDefaults}
          disabled={disabled}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-700 text-[13px] font-semibold hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="size-4" strokeWidth={2} />
          {resetting ? "Resetting…" : "Reset to defaults"}
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {dirty && !saving && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={disabled}
              className="inline-flex items-center gap-2 h-11 px-3 rounded-[12px] bg-transparent text-ink-700 text-[13px] font-semibold hover:text-ink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Discard changes
            </button>
          )}
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview learner behavior
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={!dirty || disabled}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
                Saving…
              </>
            ) : (
              <>
                <Check className="size-4" strokeWidth={2.5} />
                Apply controls
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────────────── */

function StatusPill({
  tableMissing,
  dirty,
  savedFlash,
  recentlySaved,
}: {
  tableMissing: boolean;
  dirty: boolean;
  savedFlash: Date | null;
  recentlySaved: boolean;
}) {
  const base =
    "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full border text-[12px] font-medium";

  if (tableMissing) {
    return (
      <div className={cn(base, "bg-amber-50 border-amber-200 text-amber-900")}>
        <AlertCircle className="size-3.5 text-amber-600" strokeWidth={2} />
        Setup required
      </div>
    );
  }
  if (dirty) {
    return (
      <div className={cn(base, "bg-amber-50 border-amber-200 text-amber-900")}>
        <span className="size-2 rounded-full bg-amber-500" aria-hidden />
        Unsaved changes
      </div>
    );
  }
  if (recentlySaved) {
    return (
      <div className={cn(base, "bg-emerald-50 border-emerald-200 text-emerald-900")}>
        <Check className="size-3.5 text-success" strokeWidth={2.5} />
        Saved {formatJustNow(savedFlash!)}
      </div>
    );
  }
  return (
    <div className={cn(base, "bg-white border-ink-100 text-ink-700")}>
      <Check className="size-3.5 text-success" strokeWidth={2.5} />
      All changes saved
    </div>
  );
}

function QuickStatus({
  icon: Icon,
  label,
  value,
  dim,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className={cn("px-4 py-3.5 flex items-center gap-3 min-w-0", dim && "opacity-60")}>
      <span className="size-10 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[17px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[11.5px] text-ink-500 leading-tight">{label}</div>
        <div className="text-[14px] font-semibold text-ink-900 leading-tight mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <header className="flex items-center gap-2.5 mb-3.5">
        <span className="size-6 rounded-[7px] bg-rose-50 text-rose-600 inline-flex items-center justify-center text-[11.5px] font-bold tabular-nums">
          {n}
        </span>
        <h4 className="text-[14.5px] font-bold text-ink-900">{title}</h4>
      </header>
      <ul className="divide-y divide-ink-100/70">{children}</ul>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  on,
  onChange,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <li className={cn(
      "py-3 first:pt-1 last:pb-1 flex items-center gap-3",
      disabled && "opacity-60",
    )}>
      <span className={cn(
        "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0 transition-colors",
        on ? "bg-rose-50 text-rose-600" : "bg-cream-100 text-ink-500",
      )}>
        <Icon className="size-[15px]" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 leading-tight">
          {title}
        </div>
        <div className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
          {description}
        </div>
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </li>
  );
}

function DropdownRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  options,
  disabled,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <li className={cn(
      "py-3 first:pt-1 last:pb-1 flex items-center gap-3",
      disabled && "opacity-60",
    )}>
      <span className="size-9 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[15px]" strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 leading-tight">
          {title}
        </div>
        <div className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
          {description}
        </div>
      </div>
      <CompactSelect value={value} onChange={onChange} options={options} disabled={disabled} />
    </li>
  );
}

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 h-6 w-[44px] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
        on ? "bg-rose-600" : "bg-ink-200",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-[23px]" : "translate-x-[3px]",
        )}
        aria-hidden
      />
    </button>
  );
}

function CompactSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none h-9 pl-3 pr-8 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-900 cursor-pointer focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-w-[160px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-400"
        strokeWidth={2}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

function shallowEqual(a: LessonControls, b: LessonControls): boolean {
  const keys = Object.keys(a) as (keyof LessonControls)[];
  for (const k of keys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

function formatJustNow(d: Date): string {
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (diff < 5)  return "just now";
  if (diff < 60) return `${Math.round(diff)}s ago`;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
