"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  CalendarCheck,
  Target,
  FileText,
  CalendarDays,
  Clock,
  Eye,
  Info,
  Lightbulb,
  Ban,
  ChevronDown,
  Clapperboard,
  Loader2,
} from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import {
  createPostingPlan,
  createPostingItem,
} from "@/app/(app)/posting/actions";
import type { PlatformKey } from "@/lib/posting/queries";

const GOALS = [
  { value: "", label: "Select a goal (optional)" },
  { value: "awareness", label: "Awareness / Reach" },
  { value: "engagement", label: "Engagement" },
  { value: "growth", label: "Follower growth" },
  { value: "conversion", label: "Conversion / Sales" },
  { value: "education", label: "Educate / Teach" },
  { value: "community", label: "Community" },
  { value: "promotion", label: "Promotion" },
];

const QUICK = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "this_week", label: "This week" },
  { key: "next_week", label: "Next week" },
  { key: "none", label: "No schedule", ban: true },
];

function PlatformGlyph({ platform, size = 16 }: { platform: PlatformKey; size?: number }) {
  if (platform === "instagram") return <InstagramIcon className="text-rose-600" size={size} />;
  if (platform === "tiktok") return <TiktokIcon className="text-ink-900" size={size} />;
  if (platform === "youtube") return <YoutubeIcon className="text-rose-600" size={size} />;
  return <span className="inline-block size-3 rounded-full bg-rose-400" />;
}

function toDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function quickDate(kind: string) {
  const d = new Date();
  if (kind === "tomorrow") d.setDate(d.getDate() + 1);
  else if (kind === "this_week") d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); // upcoming Friday
  else if (kind === "next_week") d.setDate(d.getDate() + (((8 - d.getDay()) % 7) || 7)); // next Monday
  return toDateInput(d);
}

/** Current local time as HH:MM — based on the browser's (user's) timezone. */
function nowTimeHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

const PLATFORMS: { value: PlatformKey; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "snapchat", label: "Snapchat" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
];

const CONTENT_TYPES = [
  { value: "reel", label: "Reel" },
  { value: "short_video", label: "Short Video" },
  { value: "carousel", label: "Carousel" },
  { value: "story", label: "Story" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "post", label: "Post" },
];

function mondayIso() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function PostingActions({
  activePlanId,
}: {
  activePlanId: string | null;
}) {
  const [mode, setMode] = useState<"closed" | "plan" | "item">("closed");

  return (
    <>
      <button
        type="button"
        onClick={() => setMode(activePlanId ? "item" : "plan")}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {activePlanId ? "Add Post" : "Create New Plan"}
      </button>

      {mode === "plan" && (
        <NewPlanForm onClose={() => setMode("closed")} />
      )}
      {mode === "item" && activePlanId && (
        <NewItemForm
          planId={activePlanId}
          onClose={() => setMode("closed")}
        />
      )}
    </>
  );
}

function NewPlanForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState(
    `Content Plan – Week of ${new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })}`,
  );
  const [weekStart, setWeekStart] = useState(mondayIso());
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      setErr(null);
      const res = await createPostingPlan({
        title,
        week_start: weekStart,
        description: description || undefined,
      });
      if (!res.ok) setErr(res.error);
      else onClose();
    });

  return (
    <DialogShell title="New posting plan" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Plan title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Week starting">
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Description (optional)">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="Theme, goals, audience notes…"
          />
        </Field>
        {err && (
          <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {err}
          </div>
        )}
        <p className="text-[11.5px] text-ink-500">
          Creating this plan will archive your current active plan.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
          >
            {pending ? "Creating…" : "Create plan"}
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

export function NewItemForm({
  planId,
  onClose,
  initialDate,
}: {
  planId: string;
  onClose: () => void;
  /** Pre-select a calendar day (YYYY-MM-DD) — used by the per-column "Add post". */
  initialDate?: string;
}) {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformKey>("instagram");
  const [contentType, setContentType] = useState("reel");
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  // Default to the user's current local date + time (their timezone), unless a
  // specific calendar day was passed in (per-column "Add post").
  const [date, setDate] = useState(() => initialDate ?? toDateInput(new Date()));
  const [time, setTime] = useState(() => nowTimeHHMM());
  const [quick, setQuick] = useState<string | null>(initialDate ? null : "today");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const platformLabel = PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
  const contentLabel = CONTENT_TYPES.find((t) => t.value === contentType)?.label ?? contentType;
  const goalLabel = GOALS.find((g) => g.value === goal && g.value)?.label ?? null;
  const scheduleLabel = date
    ? new Date(`${date}T${time || nowTimeHHMM()}`).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  function pickQuick(kind: string) {
    setQuick(kind);
    if (kind === "none") {
      setDate("");
      setTime("");
      return;
    }
    setDate(quickDate(kind));
    if (!time) setTime(nowTimeHHMM());
  }

  function save(status: "idea" | "planned") {
    setErr(null);
    const scheduledFor = date
      ? new Date(`${date}T${time || nowTimeHHMM()}`).toISOString()
      : undefined;
    startTransition(async () => {
      const res = await createPostingItem({
        plan_id: planId,
        platform,
        content_type: contentType,
        topic: topic.trim() || undefined,
        goal: goal || undefined,
        notes: notes.trim() || undefined,
        scheduled_for: scheduledFor,
        status,
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  const sel =
    "w-full h-11 pl-10 pr-9 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 appearance-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
  const fieldCls =
    "w-full px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] shadow-xl border border-ink-100 w-full max-w-[960px] my-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start gap-3 px-6 sm:px-8 pt-6">
          <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <CalendarCheck className="size-5" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-h3 sm:text-[26px] text-ink-900 leading-tight">
              Add a planned post
            </h3>
            <p className="text-[13px] text-ink-500 mt-0.5">
              Plan and organize your content ahead of time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-9 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 sm:px-8 py-6">
          {/* LEFT — form */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[12.5px] font-medium text-ink-700 mb-1.5 block">Platform</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <PlatformGlyph platform={platform} />
                  </span>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformKey)}
                    className={sel}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
                </div>
              </label>
              <label className="block">
                <span className="text-[12.5px] font-medium text-ink-700 mb-1.5 block">Content type</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-rose-500">
                    <Clapperboard className="size-4" strokeWidth={2} />
                  </span>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className={sel}
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
                </div>
              </label>
            </div>

            {/* Topic */}
            <label className="block">
              <span className="text-[12.5px] font-medium text-ink-700 mb-1.5 block">Topic / hook</span>
              <div className="relative">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value.slice(0, 160))}
                  rows={2}
                  maxLength={160}
                  placeholder="e.g. 3 hooks to stop the scroll"
                  className={cn(fieldCls, "py-2.5 pr-16 resize-none")}
                />
                <span className="absolute bottom-2 right-3 text-[11px] text-ink-400 tabular-nums pointer-events-none">
                  {topic.length} / 160
                </span>
              </div>
              <p className="text-[11.5px] text-ink-500 mt-1">
                Write a short, attention-grabbing hook or topic for your post.
              </p>
            </label>

            {/* Goal */}
            <label className="block">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700 mb-1.5">
                <Target className="size-3.5 text-rose-500" strokeWidth={2} />
                Goal / objective
              </span>
              <div className="relative">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full h-11 px-3.5 pr-9 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 appearance-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
              </div>
              <p className="text-[11.5px] text-ink-500 mt-1">
                Choose the primary purpose of this post.
              </p>
            </label>

            {/* Notes */}
            <label className="block">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700 mb-1.5">
                <FileText className="size-3.5 text-rose-500" strokeWidth={2} />
                Notes / caption direction <span className="text-ink-400 font-normal">(optional)</span>
              </span>
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={3}
                  maxLength={500}
                  placeholder="Add any notes, caption ideas, CTAs, hashtags, or creative direction…"
                  className={cn(fieldCls, "py-2.5 pr-16 resize-none")}
                />
                <span className="absolute bottom-2 right-3 text-[11px] text-ink-400 tabular-nums pointer-events-none">
                  {notes.length} / 500
                </span>
              </div>
              <p className="text-[11.5px] text-ink-500 mt-1">
                Use this space to capture ideas and important details for your content.
              </p>
            </label>

            {/* Schedule */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700 mb-1.5">
                <CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} />
                Schedule
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setQuick(e.target.value ? null : "none");
                    }}
                    className={cn(fieldCls, "h-11 pl-9")}
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none" strokeWidth={2} />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={cn(fieldCls, "h-11 pl-9")}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                {QUICK.map((q) => {
                  const active = quick === q.key;
                  return (
                    <button
                      key={q.key}
                      type="button"
                      onClick={() => pickQuick(q.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[12.5px] font-medium border transition-colors",
                        active
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : "bg-white border-ink-200 text-ink-700 hover:bg-cream-100",
                      )}
                    >
                      {q.ban && <Ban className="size-3.5" strokeWidth={2} />}
                      {q.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11.5px] text-ink-500 mt-1.5">
                Select when you want this post to go live. You can leave it unscheduled.
              </p>
            </div>

            {err && (
              <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
                {err}
              </div>
            )}
          </div>

          {/* RIGHT — preview */}
          <aside className="space-y-3.5">
            <div className="rounded-[16px] border border-ink-100 bg-white p-4">
              <header className="flex items-start gap-2 mb-3">
                <Eye className="size-4 text-rose-500 mt-0.5" strokeWidth={2} />
                <div>
                  <div className="text-[13px] font-bold text-ink-900">Post preview</div>
                  <p className="text-[11.5px] text-ink-500">A quick overview of your planned post.</p>
                </div>
              </header>
              <ul className="divide-y divide-ink-100">
                <PreviewRow icon={<PlatformGlyph platform={platform} size={16} />} label="Platform" value={platformLabel} />
                <PreviewRow icon={<Clapperboard className="size-4 text-rose-500" strokeWidth={2} />} label="Content type" value={contentLabel} />
                <PreviewRow icon={<Target className="size-4 text-rose-500" strokeWidth={2} />} label="Goal" value={goalLabel ?? "—"} muted={!goalLabel} />
                <PreviewRow
                  icon={<CalendarDays className="size-4 text-rose-500" strokeWidth={2} />}
                  label="Schedule"
                  value={scheduleLabel ?? "No schedule set"}
                  badge={scheduleLabel ? null : "Unscheduled"}
                  muted={!scheduleLabel}
                />
              </ul>
            </div>

            <div className="rounded-[16px] bg-cream-50/70 border border-ink-100 p-4">
              <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-900 mb-1">
                <Info className="size-3.5 text-rose-500" strokeWidth={2} />
                Good to know
              </div>
              <p className="text-[12px] text-ink-600 leading-relaxed">
                You can edit or reschedule this post after saving. Drafts are saved in
                your content calendar.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 sm:px-8 py-4 border-t border-ink-100 bg-cream-50/40">
          <div className="inline-flex items-start gap-2 rounded-[12px] bg-rose-50/70 border border-rose-100 px-3.5 py-2.5 max-w-md">
            <Lightbulb className="size-4 text-rose-500 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] text-ink-700 leading-snug">
              <span className="font-semibold text-ink-900">Planning tip:</span> Great content
              starts with a plan. Stay consistent and keep your audience engaged! ✨
            </p>
          </div>
          <div className="flex items-center gap-2.5 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[14px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => save("idea")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[14px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 transition-colors"
            >
              <FileText className="size-4" strokeWidth={2} />
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => save("planned")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-semibold transition-colors shadow-sm"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <CalendarCheck className="size-4" strokeWidth={2} />
              )}
              Save planned post
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PreviewRow({
  icon,
  label,
  value,
  badge,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string | null;
  muted?: boolean;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="size-9 rounded-[10px] bg-cream-100 inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-ink-500">{label}</div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[13.5px] font-semibold truncate",
              muted ? "text-ink-400" : "text-ink-900",
            )}
          >
            {value}
          </span>
          {badge && (
            <span className="chip bg-amber-50 text-amber-700 text-[10px] shrink-0">
              {badge}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-xl border border-ink-100 w-full max-w-[480px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-h4 text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-700 mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}
