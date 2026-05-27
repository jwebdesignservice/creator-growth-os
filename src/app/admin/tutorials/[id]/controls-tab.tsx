"use client";

import { useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Controls tab — playback / progress / learner experience / notifications.

   Pure frontend-only surface: no DB columns exist yet for any of these
   per-tutorial control settings. Everything lives in component state so
   the UX is fully interactive; a backend pass later can wire these
   without touching this component.
   ───────────────────────────────────────────────────────────────────────── */

export function ControlsTab() {
  /* ── Top-level state ───────────────────────────────────────────────── */

  // Quick statuses. `accessMode` + `ctaTrigger` are read-only summary chips
  // here — the editable controls for those live (or will live) on the
  // Access tab and Lesson path tab respectively. Reading-only avoids
  // wiring duplicate sources of truth across tabs.
  const [accessMode]          = useState<"open" | "private" | "scheduled">("open");
  const [completionThreshold, setCompletionThreshold] = useState<"60" | "70" | "80" | "90" | "100">("80");
  const [autoplay,            setAutoplay]            = useState(false);
  const [ctaTrigger]          = useState<"immediate" | "final-chapter" | "after-completion">("final-chapter");

  // 1 · Playback controls
  const [autoplayNext,     setAutoplayNext]     = useState(false);
  const [allowSpeed,       setAllowSpeed]       = useState(true);
  const [loopPreview,      setLoopPreview]      = useState(false);
  const [captionsDefault,  setCaptionsDefault]  = useState(true);

  // 2 · Progress & completion
  const [requireOrder,     setRequireOrder]     = useState(true);
  const [resumeLastPos,    setResumeLastPos]    = useState(true);
  const [allowSkip,        setAllowSkip]        = useState(false);

  // 3 · Learner experience
  const [showChapterList,  setShowChapterList]  = useState(true);
  const [enableNotes,      setEnableNotes]      = useState(true);
  const [enableDownloads,  setEnableDownloads]  = useState(true);
  const [showCtaAtEnd,     setShowCtaAtEnd]     = useState(true);

  // 4 · Notifications & follow-ups
  const [reminderTiming,   setReminderTiming]   = useState<"never" | "1d" | "3d" | "7d" | "14d">("3d");
  const [notifyOnDone,     setNotifyOnDone]     = useState(true);
  const [followUpTask,     setFollowUpTask]     = useState<string>("");

  /* ── Derived labels for the quick-status row ──────────────────────── */

  const accessLabel: Record<typeof accessMode, string> = {
    open: "Open",
    private: "Private",
    scheduled: "Scheduled",
  };
  const ctaLabel: Record<typeof ctaTrigger, string> = {
    immediate: "Immediate",
    "final-chapter": "Final chapter",
    "after-completion": "After completion",
  };

  /* ── Apply / preview handlers (stub) ──────────────────────────────── */

  function onApply() {
    if (typeof window !== "undefined") {
      window.alert("Control settings applied (frontend-only — wiring backend persistence next).");
    }
  }
  function onPreview() {
    if (typeof window !== "undefined") {
      window.alert("Preview learner behavior — opens a learner-view simulation. Coming next.");
    }
  }
  function onSavePreset() {
    if (typeof window !== "undefined") {
      window.alert("Saved as a control preset you can re-apply to other tutorials. Coming next.");
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <section className="rounded-[16px] bg-rose-50/40 border border-rose-100/60 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <header>
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
      </header>

      {/* Quick-status row */}
      <div className="rounded-[12px] bg-white border border-ink-100 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-100 overflow-hidden">
        <QuickStatus
          icon={Lock}
          label="Access mode"
          value={accessLabel[accessMode]}
        />
        <QuickStatus
          icon={PieChart}
          label="Completion rule"
          value={`${completionThreshold}% watched`}
        />
        <QuickStatus
          icon={Play}
          label="Autoplay"
          value={autoplay ? "On" : "Off"}
        />
        <QuickStatus
          icon={Target}
          label="CTA trigger"
          value={ctaLabel[ctaTrigger]}
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
            on={autoplayNext}
            onChange={(v) => { setAutoplayNext(v); setAutoplay(v); }}
          />
          <ToggleRow
            icon={Gauge}
            title="Allow playback speed"
            description="Let learners change video speed"
            on={allowSpeed}
            onChange={setAllowSpeed}
          />
          <ToggleRow
            icon={Repeat}
            title="Loop preview"
            description="Loop the preview video on the lesson page"
            on={loopPreview}
            onChange={setLoopPreview}
          />
          <ToggleRow
            icon={Captions}
            title="Show captions by default"
            description="Captions are enabled when the video starts"
            on={captionsDefault}
            onChange={setCaptionsDefault}
          />
        </DetailCard>

        {/* 2 · Progress & completion */}
        <DetailCard n={2} title="Progress & completion">
          <DropdownRow
            icon={CheckCircle2}
            title="Mark complete when watched"
            description="Completion is unlocked at the selected percentage"
            value={completionThreshold}
            onChange={(v) => setCompletionThreshold(v as typeof completionThreshold)}
            options={[
              { value: "60",  label: "60%"  },
              { value: "70",  label: "70%"  },
              { value: "80",  label: "80%"  },
              { value: "90",  label: "90%"  },
              { value: "100", label: "100%" },
            ]}
          />
          <ToggleRow
            icon={ListOrdered}
            title="Require chapters in order"
            description="Learners must complete chapters sequentially"
            on={requireOrder}
            onChange={setRequireOrder}
          />
          <ToggleRow
            icon={Bookmark}
            title="Resume from last position"
            description="Return learners to where they left off"
            on={resumeLastPos}
            onChange={setResumeLastPos}
          />
          <ToggleRow
            icon={FastForward}
            title="Allow skipping ahead"
            description="Learners can skip to any chapter"
            on={allowSkip}
            onChange={setAllowSkip}
          />
        </DetailCard>

        {/* 3 · Learner experience */}
        <DetailCard n={3} title="Learner experience">
          <ToggleRow
            icon={List}
            title="Show chapter list"
            description="Display chapter list beside the player"
            on={showChapterList}
            onChange={setShowChapterList}
          />
          <ToggleRow
            icon={StickyNote}
            title="Enable notes"
            description="Allow learners to take and save notes"
            on={enableNotes}
            onChange={setEnableNotes}
          />
          <ToggleRow
            icon={Download}
            title="Enable downloadable resources"
            description="Make attached resources available to download"
            on={enableDownloads}
            onChange={setEnableDownloads}
          />
          <ToggleRow
            icon={MousePointerClick}
            title="Show CTA at end"
            description="Display call-to-action after the final chapter"
            on={showCtaAtEnd}
            onChange={setShowCtaAtEnd}
          />
        </DetailCard>

        {/* 4 · Notifications & follow-ups */}
        <DetailCard n={4} title="Notifications & follow-ups">
          <DropdownRow
            icon={Bell}
            title="Send reminder if not completed"
            description="Email learners who haven't finished"
            value={reminderTiming}
            onChange={(v) => setReminderTiming(v as typeof reminderTiming)}
            options={[
              { value: "never", label: "Never"               },
              { value: "1d",    label: "1 day after enroll"  },
              { value: "3d",    label: "3 days after enroll" },
              { value: "7d",    label: "7 days after enroll" },
              { value: "14d",   label: "14 days after enroll"},
            ]}
          />
          <ToggleRow
            icon={Mail}
            title="Notify on completion"
            description="Send a completion email to learners"
            on={notifyOnDone}
            onChange={setNotifyOnDone}
          />
          <DropdownRow
            icon={Zap}
            title="Trigger follow-up task"
            description="Create a task after tutorial completion"
            value={followUpTask}
            onChange={setFollowUpTask}
            options={[
              { value: "",         label: "Select task"          },
              { value: "feedback", label: "Send feedback survey" },
              { value: "next",     label: "Assign next tutorial" },
              { value: "checkin",  label: "1:1 check-in"         },
              { value: "review",   label: "Leave a review"       },
            ]}
          />
        </DetailCard>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <button
          type="button"
          onClick={onSavePreset}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
        >
          <Bookmark className="size-4" strokeWidth={2} />
          Save control preset
        </button>

        <div className="flex items-center gap-2">
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
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold shadow-sm transition-colors"
          >
            <Check className="size-4" strokeWidth={2.5} />
            Apply controls
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────────────── */

function QuickStatus({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3 min-w-0">
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
      <ul className="divide-y divide-ink-100/70">
        {children}
      </ul>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  on,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <li className="py-3 first:pt-1 last:pb-1 flex items-center gap-3">
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
      <Toggle on={on} onChange={onChange} />
    </li>
  );
}

function DropdownRow<T extends string>({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  options,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <li className="py-3 first:pt-1 last:pb-1 flex items-center gap-3">
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
      <CompactSelect value={value} onChange={onChange} options={options} />
    </li>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex shrink-0 h-6 w-[44px] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300",
        on ? "bg-rose-600" : "bg-ink-200",
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

function CompactSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none h-9 pl-3 pr-8 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-900 cursor-pointer focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors min-w-[120px]"
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
