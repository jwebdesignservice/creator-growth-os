"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CalendarClock,
  Tag,
  Share2,
  Target,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Check,
  Circle,
  Loader2,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
  SnapchatIcon,
  LinkedinIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import type {
  PostingItem,
  PlatformKey,
  ContentStatus,
} from "@/lib/posting/queries";
import { deletePostingItem } from "@/app/(app)/posting/actions";
import {
  getPostingItemDetail,
  getPostingItemPhases,
  savePostingItemPhases,
  updatePostingItemDetail,
  duplicatePostingItem,
  type PostingItemPhase,
} from "@/app/(app)/posting/detail-actions";

/**
 * Per-post detail + edit popup. Opens centered on double-clicking a calendar
 * card (and can be reused by the card's Edit button). Shows the post's
 * platform, schedule, status, goal/objective and notes/caption direction, plus
 * where it sits in the 7-stage content pipeline. "More actions" exposes Edit /
 * Duplicate / Delete; Edit turns the title, goal, notes and status into an
 * inline form saved via updatePostingItemDetail.
 *
 * Self-contained (own label maps, own server actions in detail-actions.ts) so
 * it stays stable while the calendar component is actively iterated on.
 */

const STATUS_ORDER: ContentStatus[] = [
  "idea",
  "planned",
  "scripted",
  "filmed",
  "edited",
  "posted",
  "reviewed",
];

const STATUS_LABEL: Record<ContentStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  scripted: "Scripted",
  filmed: "Filmed",
  edited: "Edited",
  posted: "Posted",
  reviewed: "Reviewed",
};

const STATUS_TONE: Record<ContentStatus, string> = {
  idea: "bg-cream-100 text-ink-700 border-ink-200",
  planned: "bg-rose-50 text-rose-700 border-rose-200",
  scripted: "bg-cream-200 text-ink-700 border-ink-200",
  filmed: "bg-cream-200 text-ink-700 border-ink-200",
  edited: "bg-rose-100 text-rose-700 border-rose-200",
  posted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reviewed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const PLATFORM_LABEL: Record<PlatformKey, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  snapchat: "Snapchat",
  linkedin: "LinkedIn",
  multiple: "Multiple",
  other: "Other",
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  reel: "Reel",
  short_video: "Short Video",
  carousel: "Carousel",
  story: "Story",
  video: "Video",
  youtube_video: "YouTube",
  post: "Post",
};

function platformIcon(p: PlatformKey | null) {
  if (p === "instagram") return <InstagramIcon className="size-5" />;
  if (p === "tiktok") return <TiktokIcon className="size-5" />;
  if (p === "youtube") return <YoutubeIcon className="size-5" />;
  if (p === "snapchat") return <SnapchatIcon className="size-5" />;
  if (p === "linkedin") return <LinkedinIcon className="size-5" />;
  return <Globe className="size-5 text-ink-400" strokeWidth={2} />;
}

// Options for the inline edit dropdowns.
const PLATFORM_OPTIONS: PlatformKey[] = [
  "instagram",
  "tiktok",
  "youtube",
  "snapchat",
  "linkedin",
  "multiple",
  "other",
];

const CONTENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "reel", label: "Reel" },
  { value: "short_video", label: "Short Video" },
  { value: "carousel", label: "Carousel" },
  { value: "story", label: "Story" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "post", label: "Post" },
];

/** Cycle to the next platform — used when the header icon is clicked. */
function nextPlatform(p: PlatformKey | null): PlatformKey {
  const i = p ? PLATFORM_OPTIONS.indexOf(p) : -1;
  return PLATFORM_OPTIONS[(i + 1) % PLATFORM_OPTIONS.length];
}

const inputCls =
  "w-full rounded-[10px] border border-ink-200 px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors";

const selectCls =
  "rounded-[8px] border border-ink-200 bg-white px-2 py-1 text-[13px] text-ink-900 cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors";

export function PostDetailModal({
  item,
  onClose,
}: {
  item: PostingItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Display state (kept in sync with the server after a save).
  const [topic, setTopic] = useState<string>(item.topic ?? "");
  const [status, setStatus] = useState<ContentStatus>(item.status);
  const [goal, setGoal] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [platform, setPlatform] = useState<PlatformKey | null>(item.platform);
  const [contentType, setContentType] = useState<string | null>(
    item.content_type,
  );
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [moreOpen, setMoreOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which stage is mid-save from a quick (view-mode) status change → spinner.
  const [savingStatus, setSavingStatus] = useState<ContentStatus | null>(null);

  // Production schedule: single day vs phases spread across days.
  const [phased, setPhased] = useState(false);
  // YYYY-MM-DD per stage (absent = that phase isn't scheduled).
  const [phaseDates, setPhaseDates] = useState<
    Partial<Record<ContentStatus, string>>
  >({});
  const [savingPhases, setSavingPhases] = useState(false);

  // Draft state used only while editing.
  const [draftTopic, setDraftTopic] = useState("");
  const [draftGoal, setDraftGoal] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftStatus, setDraftStatus] = useState<ContentStatus>(item.status);
  const [draftPlatform, setDraftPlatform] = useState<PlatformKey | null>(
    item.platform,
  );
  const [draftContentType, setDraftContentType] = useState<string | null>(
    item.content_type,
  );

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Fetch goal + notes (not carried on the lightweight calendar row). The
  // setState lives in a microtask (.then) to avoid synchronous-setState-in-
  // effect, and is guarded so a quick close doesn't update an unmounted modal.
  useEffect(() => {
    let alive = true;
    Promise.all([
      getPostingItemDetail(item.id),
      getPostingItemPhases(item.id),
    ]).then(([d, phases]) => {
      if (!alive) return;
      if (d) {
        setGoal(d.goal ?? "");
        setNotes(d.notes ?? "");
        if (d.topic !== null) setTopic(d.topic);
        setStatus(d.status);
        setPlatform((d.platform as PlatformKey | null) ?? null);
        setContentType(d.content_type ?? null);
        setPhased(d.is_phased);
      }
      const map: Partial<Record<ContentStatus, string>> = {};
      for (const p of phases) {
        if (p.scheduled_for) map[p.stage] = isoToDateInput(p.scheduled_for);
      }
      setPhaseDates(map);
      setLoadingDetail(false);
    });
    return () => {
      alive = false;
    };
  }, [item.id]);

  const time = item.scheduled_for
    ? new Date(item.scheduled_for).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const dateLabel = item.scheduled_for
    ? new Date(item.scheduled_for).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Unscheduled";
  const effPlatform = mode === "edit" ? draftPlatform : platform;
  const effContentType = mode === "edit" ? draftContentType : contentType;
  const typeLabel = effContentType
    ? (CONTENT_TYPE_LABEL[effContentType] ?? effContentType)
    : "—";
  const platformLabel = effPlatform ? PLATFORM_LABEL[effPlatform] : "—";

  const activeStatus = mode === "edit" ? draftStatus : status;
  const stage = Math.max(1, STATUS_ORDER.indexOf(activeStatus) + 1);
  const total = STATUS_ORDER.length;
  const pct = Math.round((stage / total) * 100);

  function enterEdit() {
    setError(null);
    setDraftTopic(topic);
    setDraftGoal(goal);
    setDraftNotes(notes);
    setDraftStatus(status);
    setDraftPlatform(platform);
    setDraftContentType(contentType);
    setMode("edit");
    setMoreOpen(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await updatePostingItemDetail(item.id, {
        topic: draftTopic,
        goal: draftGoal,
        notes: draftNotes,
        status: draftStatus,
        platform: draftPlatform ?? undefined,
        content_type: draftContentType ?? undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTopic(draftTopic.trim());
      setGoal(draftGoal.trim());
      setNotes(draftNotes.trim());
      setStatus(draftStatus);
      setPlatform(draftPlatform);
      setContentType(draftContentType);
      setMode("view");
      router.refresh();
    });
  }

  // Quick status change from view mode — tap a pipeline stage and it saves
  // immediately (optimistic, reverts on failure). In edit mode the chips still
  // just stage the draft until "Save changes".
  function changeStatus(s: ContentStatus) {
    if (s === status || pending) return;
    setError(null);
    const prev = status;
    setStatus(s); // optimistic
    setSavingStatus(s);
    startTransition(async () => {
      const res = await updatePostingItemDetail(item.id, { status: s });
      setSavingStatus(null);
      if (!res.ok) {
        setStatus(prev); // revert
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  // Persist the production schedule (single-day flag + per-phase dates).
  function savePhases() {
    setError(null);
    setSavingPhases(true);
    const phases: PostingItemPhase[] = phased
      ? (Object.entries(phaseDates) as [ContentStatus, string][])
          .filter(([, d]) => d)
          .map(([stage, d]) => ({ stage, scheduled_for: dateInputToIso(d) }))
      : [];
    startTransition(async () => {
      const res = await savePostingItemPhases(item.id, {
        isPhased: phased,
        phases,
      });
      setSavingPhases(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  // Spread all seven phases over consecutive days, with "Posted" on the post's
  // publish date — a one-click starting point the user can then tweak.
  function autoSpace() {
    const base = item.scheduled_for ? new Date(item.scheduled_for) : new Date();
    const postedIdx = STATUS_ORDER.indexOf("posted");
    const next: Partial<Record<ContentStatus, string>> = {};
    STATUS_ORDER.forEach((s, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + (i - postedIdx));
      next[s] = isoToDateInput(d.toISOString());
    });
    setPhaseDates(next);
  }

  function handleDuplicate() {
    setMoreOpen(false);
    startTransition(async () => {
      const res = await duplicatePostingItem(item.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    setMoreOpen(false);
    if (!confirm("Delete this post? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deletePostingItem(item.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  const editing = mode === "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div aria-hidden className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={topic || "Post details"}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-[18px] bg-white shadow-card border border-ink-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-ink-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {editing ? (
              <button
                type="button"
                onClick={() => setDraftPlatform((p) => nextPlatform(p))}
                title="Click to change platform"
                aria-label="Change platform"
                className="relative size-11 rounded-[12px] bg-cream-100 border border-ink-200 inline-flex items-center justify-center shrink-0 text-ink-700 cursor-pointer hover:border-rose-300 hover:bg-cream-200 transition-colors"
              >
                {platformIcon(draftPlatform)}
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-rose-600 text-white inline-flex items-center justify-center ring-2 ring-white">
                  <Pencil className="size-2.5" strokeWidth={2.5} />
                </span>
              </button>
            ) : (
              <span className="size-11 rounded-[12px] bg-cream-100 border border-ink-100 inline-flex items-center justify-center shrink-0 text-ink-700">
                {platformIcon(platform)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              {editing ? (
                <input
                  value={draftTopic}
                  onChange={(e) => setDraftTopic(e.target.value)}
                  placeholder="Post title"
                  className={cn(inputCls, "font-semibold")}
                  autoFocus
                />
              ) : (
                <h3 className="text-[16px] font-bold text-ink-900 leading-tight truncate">
                  {topic || "Untitled post"}
                </h3>
              )}
              <p className="text-[12px] text-ink-500 mt-0.5">
                {platformLabel}
                {typeLabel !== "—" && ` · ${typeLabel}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 cursor-pointer transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-ink-500">Status</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                STATUS_TONE[activeStatus],
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {STATUS_LABEL[activeStatus]}
            </span>
          </div>

          <DetailRow icon={CalendarClock} label="Scheduled">
            {dateLabel}
            {time && <span className="text-ink-500"> · {time}</span>}
          </DetailRow>
          <DetailRow icon={Tag} label="Content type">
            {editing ? (
              <select
                value={draftContentType ?? ""}
                onChange={(e) => setDraftContentType(e.target.value || null)}
                className={selectCls}
                aria-label="Content type"
              >
                <option value="">—</option>
                {CONTENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
                {draftContentType &&
                  !CONTENT_TYPE_OPTIONS.some(
                    (o) => o.value === draftContentType,
                  ) && (
                    <option value={draftContentType}>
                      {CONTENT_TYPE_LABEL[draftContentType] ?? draftContentType}
                    </option>
                  )}
              </select>
            ) : (
              typeLabel
            )}
          </DetailRow>
          <DetailRow icon={Share2} label="Platform">
            {editing ? (
              <select
                value={draftPlatform ?? ""}
                onChange={(e) =>
                  setDraftPlatform((e.target.value || null) as PlatformKey | null)
                }
                className={selectCls}
                aria-label="Platform"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABEL[p]}
                  </option>
                ))}
              </select>
            ) : (
              platformLabel
            )}
          </DetailRow>

          {/* Production schedule — single day vs phases spread across days */}
          <div className="rounded-[12px] border border-ink-100 bg-cream-50/40 p-3">
            <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
              <span className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-500">
                <CalendarClock className="size-3.5" strokeWidth={2} />
                Production schedule
              </span>
              <div className="inline-flex items-center rounded-[8px] border border-ink-200 bg-white p-0.5">
                {[
                  { k: false, l: "Single day" },
                  { k: true, l: "Spread over phases" },
                ].map((o) => (
                  <button
                    key={String(o.k)}
                    type="button"
                    onClick={() => setPhased(o.k)}
                    aria-pressed={phased === o.k}
                    className={cn(
                      "h-7 px-2.5 rounded-[6px] text-[11.5px] font-semibold transition-colors cursor-pointer",
                      phased === o.k
                        ? "bg-rose-600 text-white"
                        : "text-ink-600 hover:text-ink-900",
                    )}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {!phased ? (
              <p className="text-[12.5px] text-ink-600 leading-snug">
                The whole post happens on{" "}
                <span className="font-semibold text-ink-900">{dateLabel}</span>
                {time && <span className="text-ink-500"> · {time}</span>}. Switch
                to <span className="font-medium">Spread over phases</span> to plan
                the work across several days.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11.5px] text-ink-400 leading-snug">
                    Give each phase the day you&apos;ll do it. Leave a phase blank
                    to skip it.
                  </p>
                  <button
                    type="button"
                    onClick={autoSpace}
                    className="shrink-0 text-[11.5px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Auto-space
                  </button>
                </div>
                <ul className="space-y-1">
                  {STATUS_ORDER.map((s) => {
                    const val = phaseDates[s] ?? "";
                    return (
                      <li key={s} className="flex items-center gap-2">
                        <span className="w-[74px] shrink-0 text-[12px] font-medium text-ink-700">
                          {STATUS_LABEL[s]}
                        </span>
                        <input
                          type="date"
                          value={val}
                          onChange={(e) =>
                            setPhaseDates((p) => ({ ...p, [s]: e.target.value }))
                          }
                          aria-label={`${STATUS_LABEL[s]} date`}
                          className="flex-1 min-w-0 rounded-[8px] border border-ink-200 px-2 py-1 text-[12.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPhaseDates((p) => {
                              const n = { ...p };
                              delete n[s];
                              return n;
                            })
                          }
                          disabled={!val}
                          aria-label={`Clear ${STATUS_LABEL[s]} date`}
                          className="size-6 shrink-0 inline-flex items-center justify-center rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-default cursor-pointer transition-colors"
                        >
                          <X className="size-3.5" strokeWidth={2} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-2.5 pt-2.5 border-t border-ink-100 flex justify-end">
              <button
                type="button"
                onClick={savePhases}
                disabled={savingPhases || pending}
                className="h-8 px-3.5 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {savingPhases && <Loader2 className="size-3 animate-spin" />}
                Save schedule
              </button>
            </div>
          </div>

          {/* Goal / objective */}
          <Field icon={Target} label="Goal / objective">
            {editing ? (
              <textarea
                value={draftGoal}
                onChange={(e) => setDraftGoal(e.target.value)}
                rows={2}
                placeholder="What should this post achieve?"
                className={cn(inputCls, "resize-y leading-relaxed")}
              />
            ) : loadingDetail ? (
              <Skeleton />
            ) : goal ? (
              <p className="text-[13px] text-ink-800 leading-relaxed whitespace-pre-wrap">
                {goal}
              </p>
            ) : (
              <Empty>No goal set yet.</Empty>
            )}
          </Field>

          {/* Notes / caption direction */}
          <Field icon={Pencil} label="Notes / caption direction">
            {editing ? (
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={4}
                placeholder="Caption, hook ideas, references…"
                className={cn(inputCls, "resize-y leading-relaxed")}
              />
            ) : loadingDetail ? (
              <Skeleton lines={2} />
            ) : notes ? (
              <p className="text-[13px] text-ink-800 leading-relaxed whitespace-pre-wrap">
                {notes}
              </p>
            ) : (
              <Empty>No notes or caption direction yet.</Empty>
            )}
          </Field>

          {/* Pipeline progress */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-medium text-ink-500">
                Pipeline progress
              </span>
              <span className="text-[12px] font-semibold text-ink-900 tabular-nums">
                Stage {stage} of {total}
              </span>
            </div>
            <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s, i) => {
                const done = i + 1 < stage;
                const current = i + 1 === stage;
                const saving = savingStatus === s;
                const cls = cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium border transition-colors cursor-pointer hover:border-rose-300 disabled:cursor-default disabled:opacity-60",
                  done && "bg-rose-50 text-rose-600 border-rose-100",
                  current && "bg-rose-600 text-white border-rose-600",
                  !done && !current && "bg-white text-ink-400 border-ink-100",
                );
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      editing ? setDraftStatus(s) : changeStatus(s)
                    }
                    disabled={!editing && pending}
                    aria-pressed={current}
                    title={`Mark as ${STATUS_LABEL[s]}`}
                    className={cls}
                  >
                    {saving ? (
                      <Loader2 className="size-3 animate-spin" strokeWidth={2.5} />
                    ) : done ? (
                      <Check className="size-3" strokeWidth={2.5} />
                    ) : current ? (
                      <span className="size-1.5 rounded-full bg-current" />
                    ) : (
                      <Circle className="size-3" strokeWidth={2} />
                    )}
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
            {!editing && (
              <p className="mt-2 text-[11px] text-ink-400">
                Tap a stage to update the status.
              </p>
            )}
          </div>

          {error && (
            <p className="text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-[8px] px-3 py-2 leading-snug">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-ink-100 bg-cream-100/50 flex items-center justify-between gap-2 shrink-0">
          {/* More actions */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              disabled={pending}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
              More actions
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMoreOpen(false)}
                  className="fixed inset-0 z-0 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute bottom-full left-0 mb-1.5 z-10 w-[180px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5"
                >
                  <MenuItem icon={Pencil} onClick={enterEdit}>
                    Edit
                  </MenuItem>
                  <MenuItem icon={Copy} onClick={handleDuplicate}>
                    Duplicate
                  </MenuItem>
                  <div className="my-1 h-px bg-ink-100" />
                  <MenuItem icon={Trash2} danger onClick={handleDelete}>
                    Delete
                  </MenuItem>
                </div>
              </>
            )}
          </div>

          {/* Right side */}
          {editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("view");
                  setError(null);
                }}
                disabled={pending}
                className="h-9 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className="h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {pending && <Loader2 className="size-3.5 animate-spin" />}
                Save changes
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-500 shrink-0">
        <Icon className="size-3.5" strokeWidth={2} />
        {label}
      </span>
      <span className="text-[13px] text-ink-900 text-right">{children}</span>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-ink-100 bg-cream-50/40 p-3">
      <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-500 mb-1.5">
        <Icon className="size-3.5" strokeWidth={2} />
        {label}
      </div>
      {children}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium cursor-pointer",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-cream-100",
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2} />
      {children}
    </button>
  );
}

function Skeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-cream-200 animate-pulse"
          style={{ width: i === lines - 1 ? "70%" : "100%" }}
        />
      ))}
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] text-ink-400 italic">{children}</p>;
}

/** ISO datetime → local YYYY-MM-DD for a <input type="date"> value. */
function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD → ISO anchored at local noon (avoids timezone day-shift). */
function dateInputToIso(date: string): string {
  return new Date(`${date}T12:00:00`).toISOString();
}
