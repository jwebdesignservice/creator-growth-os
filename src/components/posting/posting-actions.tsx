"use client";

import { useRef, useState, useTransition } from "react";
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
  Sparkles,
  Maximize2,
  Smile,
  Hash,
  ImagePlus,
  Ghost,
  Globe,
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
import { savePostingItemPhases } from "@/app/(app)/posting/detail-actions";
import type { PlatformKey, ContentStatus } from "@/lib/posting/queries";

// The 7 production phases (reused from the content pipeline) a post can be
// spread across when scheduled over multiple days.
const PHASE_ORDER: ContentStatus[] = [
  "idea",
  "planned",
  "scripted",
  "filmed",
  "edited",
  "posted",
  "reviewed",
];
const PHASE_LABEL: Record<ContentStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  scripted: "Scripted",
  filmed: "Filmed",
  edited: "Edited",
  posted: "Posted",
  reviewed: "Reviewed",
};

/** YYYY-MM-DD → ISO at local noon (matches the detail popup; avoids TZ shift). */
function phaseDateToIso(date: string): string {
  return new Date(`${date}T12:00:00`).toISOString();
}
/** ISO/Date → local YYYY-MM-DD for a <input type="date">. */
function toDateInputLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

/* Channel-picker avatar tiles — each platform in its brand colour. */
const PLATFORM_TILE: Record<PlatformKey, string> = {
  instagram: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF] text-white",
  tiktok:    "bg-[#010101] text-white",
  youtube:   "bg-[#FF0000] text-white",
  snapchat:  "bg-[#FFFC00] text-ink-900",
  linkedin:  "bg-[#0A66C2] text-white",
  multiple:  "bg-ink-900 text-white",
  other:     "bg-ink-200 text-ink-600",
};

function PlatformTileGlyph({ platform }: { platform: PlatformKey }) {
  if (platform === "instagram") return <InstagramIcon size={18} />;
  if (platform === "tiktok") return <TiktokIcon size={17} />;
  if (platform === "youtube") return <YoutubeIcon size={18} />;
  if (platform === "snapchat") return <Ghost className="size-[18px]" strokeWidth={2} />;
  if (platform === "linkedin")
    return <span className="text-[14px] font-black leading-none">in</span>;
  return <Globe className="size-[17px]" strokeWidth={2} />;
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [intent, setIntent] = useState<"post" | "idea">("post");

  // "Add Post" first asks what you're adding: a post for a channel, or a
  // quick content idea. Both open the same form, tuned per intent.
  const openItem = (kind: "post" | "idea") => {
    setMenuOpen(false);
    setIntent(kind);
    setMode("item");
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() =>
            activePlanId ? setMenuOpen((v) => !v) : setMode("plan")
          }
          aria-haspopup={activePlanId ? "menu" : undefined}
          aria-expanded={activePlanId ? menuOpen : undefined}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          {activePlanId ? "Add Post" : "Create New Plan"}
          {activePlanId && (
            <ChevronDown
              className={cn(
                "-mr-1 size-3.5 opacity-80 transition-transform duration-150",
                menuOpen && "rotate-180",
              )}
              strokeWidth={2.5}
            />
          )}
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-[16px] border border-ink-100 bg-white p-2 shadow-card"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => openItem("post")}
                className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-cream-100"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-sky-100 text-sky-600">
                  <FileText className="size-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-semibold text-ink-900">
                    Post
                  </span>
                  <span className="block text-[12.5px] text-ink-500">
                    Publish content to a channel
                  </span>
                </span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => openItem("idea")}
                className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-cream-100"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-emerald-100 text-emerald-600">
                  <Lightbulb className="size-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-semibold text-ink-900">
                    Idea
                  </span>
                  <span className="block text-[12.5px] text-ink-500">
                    Capture a content idea
                  </span>
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {mode === "plan" && (
        <NewPlanForm onClose={() => setMode("closed")} />
      )}
      {mode === "item" && activePlanId && (
        <NewItemForm
          planId={activePlanId}
          intent={intent}
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
  intent = "post",
}: {
  planId: string;
  onClose: () => void;
  /** Pre-select a calendar day (YYYY-MM-DD) — used by the per-column "Add post". */
  initialDate?: string;
  /** "idea" opens the form in capture-an-idea mode (idea-first save CTA). */
  intent?: "post" | "idea";
}) {
  const isIdea = intent === "idea";
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

  /* Reference-composer UI state ---------------------------------------- */
  const [showPreview, setShowPreview] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [schedOpen, setSchedOpen] = useState(false);
  const [aiGen, setAiGen] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);

  // Production schedule: single day (uses the date above) vs phases spread
  // across days. phaseDates holds a YYYY-MM-DD per stage (absent = skipped).
  const [phased, setPhased] = useState(false);
  const [phaseDates, setPhaseDates] = useState<
    Partial<Record<ContentStatus, string>>
  >({});
  // Remember the created row id so a retry (e.g. after a phase-save hiccup)
  // re-uses it instead of inserting a duplicate post.
  const createdId = useRef<string | null>(null);

  // Spread the phases over consecutive days, "Posted" on the chosen date.
  function autoSpacePhases() {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    const postedIdx = PHASE_ORDER.indexOf("posted");
    const next: Partial<Record<ContentStatus, string>> = {};
    PHASE_ORDER.forEach((s, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + (i - postedIdx));
      next[s] = toDateInputLocal(d);
    });
    setPhaseDates(next);
  }

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
    // The AI-Generated toggle records the disclosure with the post's notes.
    const finalNotes = [
      notes.trim(),
      aiGen ? "Disclose: content generated or edited with AI." : "",
    ]
      .filter(Boolean)
      .join("\n");
    startTransition(async () => {
      // Create the post once; reuse its id on retry so we never duplicate.
      let id = createdId.current;
      if (!id) {
        const res = await createPostingItem({
          plan_id: planId,
          platform,
          content_type: contentType,
          topic: topic.trim() || undefined,
          goal: goal || undefined,
          notes: finalNotes || undefined,
          scheduled_for: scheduledFor,
          status,
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        id = res.id ?? null;
        createdId.current = id;
      }

      // If the user chose to spread the work, save the per-phase dates. The
      // post's primary date is re-anchored to its "Posted" phase server-side.
      if (phased && id) {
        const phases = (
          Object.entries(phaseDates) as [ContentStatus, string][]
        )
          .filter(([, d]) => d)
          .map(([stage, d]) => ({
            stage,
            scheduled_for: phaseDateToIso(d),
          }));
        const pres = await savePostingItemPhases(id, {
          isPhased: true,
          phases,
        });
        if (!pres.ok) {
          setErr(pres.error);
          return; // keep the modal open; createdId avoids a duplicate on retry
        }
      }

      router.refresh();
      if (createAnother) {
        // Keep the composer open for the next entry; platform, type and
        // schedule stay as helpful context, the content fields reset.
        createdId.current = null;
        setTopic("");
        setNotes("");
        setGoal("");
        setAiGen(false);
        setPhased(false);
        setPhaseDates({});
        return;
      }
      onClose();
    });
  }

  const fieldCls =
    "w-full px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white rounded-[20px] shadow-xl border border-ink-100 w-full my-6 overflow-hidden transition-[max-width] duration-200",
          expanded ? "max-w-[1280px]" : "max-w-[1040px]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <header className="flex items-center gap-2.5 px-5 sm:px-6 py-3.5 border-b border-ink-100">
          <h3 className="text-[19px] font-bold text-ink-900 tracking-[-0.01em] shrink-0">
            {isIdea ? "Capture Idea" : "Create Post"}
          </h3>
          {/* content type — the reference's Tags-style pill */}
          <div className="relative shrink-0">
            <Clapperboard
              className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-500 pointer-events-none"
              strokeWidth={2}
            />
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              aria-label="Content type"
              className="h-9 pl-8 pr-8 rounded-full border border-ink-200 bg-white text-[13px] font-medium text-ink-700 appearance-none cursor-pointer hover:bg-cream-100 focus:outline-none focus:border-rose-300 transition-colors"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
              strokeWidth={2}
            />
          </div>

          <span className="flex-1" />

          <button
            type="button"
            disabled
            title="Templates — coming soon"
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-medium text-ink-300 cursor-not-allowed"
          >
            <FileText className="size-4" strokeWidth={2} />
            Templates
          </button>
          <button
            type="button"
            disabled
            title="AI Assistant — coming soon"
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13px] font-medium text-ink-300 cursor-not-allowed"
          >
            <Sparkles className="size-4" strokeWidth={2} />
            AI Assistant
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            aria-pressed={showPreview}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors",
              showPreview
                ? "bg-rose-100 text-rose-700"
                : "text-ink-600 hover:bg-cream-100",
            )}
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-pressed={expanded}
            aria-label={expanded ? "Shrink window" : "Expand window"}
            title={expanded ? "Shrink" : "Expand"}
            className="hidden lg:inline-flex size-9 rounded-[10px] items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
          >
            <Maximize2 className="size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-9 rounded-[10px] hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        {/* ── Body: composer · live preview ───────────────────────────── */}
        <div
          className={cn(
            "grid grid-cols-1",
            showPreview && "lg:grid-cols-[minmax(0,1fr)_350px]",
          )}
        >
          {/* LEFT — composer */}
          <div className="px-5 sm:px-6 py-5">
            {/* channel picker — the reference's avatar row, one per platform */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {PLATFORMS.map((p) => {
                const active = platform === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlatform(p.value)}
                    aria-pressed={active}
                    title={p.label}
                    className={cn(
                      "relative size-11 rounded-[13px] inline-flex items-center justify-center transition-all",
                      PLATFORM_TILE[p.value],
                      active
                        ? "ring-2 ring-rose-500 ring-offset-2"
                        : "opacity-40 saturate-50 hover:opacity-80",
                    )}
                  >
                    <PlatformTileGlyph platform={p.value} />
                  </button>
                );
              })}
            </div>

            {/* composer box */}
            <div className="rounded-[16px] border border-ink-200 bg-white focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-shadow">
              <div className="flex items-start gap-3 p-4 pb-0">
                <span className="size-9 rounded-[10px] bg-cream-100 inline-flex items-center justify-center shrink-0">
                  <PlatformGlyph platform={platform} size={16} />
                </span>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value.slice(0, 160))}
                  maxLength={160}
                  rows={4}
                  placeholder="Start writing your hook or topic…"
                  className="flex-1 min-w-0 resize-none border-0 bg-transparent text-[15px] leading-relaxed text-ink-900 placeholder:text-ink-400 focus:outline-none min-h-[110px]"
                />
              </div>

              {/* media dropzone — visual per the reference; uploads land later */}
              <div className="px-4 pt-2 pb-4">
                <div
                  title="Media upload — coming soon"
                  className="w-[210px] rounded-[12px] border-2 border-dashed border-ink-200 px-4 py-5 text-center select-none cursor-not-allowed"
                >
                  <ImagePlus
                    className="mx-auto mb-1.5 size-5 text-ink-400"
                    strokeWidth={1.8}
                  />
                  <p className="text-[12.5px] leading-snug text-ink-500">
                    Drag &amp; drop or{" "}
                    <span className="font-medium text-rose-600">select a file</span>
                  </p>
                  <p className="text-[10.5px] text-ink-400 mt-0.5">Coming soon</p>
                </div>
              </div>

              {/* toolbar */}
              <div className="flex items-center gap-0.5 px-3 py-2 border-t border-ink-100">
                <span
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-300 cursor-not-allowed"
                  title="Coming soon"
                >
                  <Plus className="size-4" strokeWidth={2} />
                </span>
                <span
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-300 cursor-not-allowed"
                  title="Coming soon"
                >
                  <ChevronDown className="size-4" strokeWidth={2} />
                </span>
                <span aria-hidden className="w-px h-4 bg-ink-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setTopic((t) => (t + "🙂").slice(0, 160))}
                  title="Add emoji"
                  aria-label="Add emoji"
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                >
                  <Smile className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setTopic((t) => (t + "#").slice(0, 160))}
                  title="Add hashtag"
                  aria-label="Add hashtag"
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                >
                  <Hash className="size-4" strokeWidth={2} />
                </button>
                <span className="flex-1" />
                <span
                  className="rounded-[8px] border border-ink-200 px-2 py-0.5 text-[11.5px] tabular-nums text-ink-500"
                  title="Characters left"
                >
                  {160 - topic.length}
                </span>
              </div>
            </div>

            {/* goal — the reference's quiet right-aligned control row */}
            <div className="mt-3 flex justify-end">
              <div className="relative">
                <Target
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
                  strokeWidth={2}
                />
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  aria-label="Goal / objective"
                  className="h-9 pl-8 pr-8 rounded-[10px] border border-transparent bg-transparent text-[13.5px] font-medium text-ink-700 appearance-none cursor-pointer hover:border-ink-200 hover:bg-cream-50 focus:outline-none focus:border-rose-300 transition-colors"
                >
                  {GOALS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* AI-Generated disclosure — saved alongside the post's notes */}
            <div className="mt-2 flex items-center gap-3 border-t border-ink-100 pt-3.5">
              <span className="text-[13.5px] font-semibold text-ink-900 shrink-0">
                AI-Generated
              </span>
              <span className="flex-1 min-w-0 text-[13px] text-ink-500 truncate">
                Tell viewers your content was generated or edited with AI.
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={aiGen}
                aria-label="AI-Generated disclosure"
                onClick={() => setAiGen((v) => !v)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  aiGen ? "bg-rose-600" : "bg-ink-200",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]",
                    aiGen ? "left-[22px]" : "left-0.5",
                  )}
                />
              </button>
            </div>

            {/* notes — quick capture, kept from the original form */}
            <div className="relative mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={2}
                maxLength={500}
                placeholder="Notes / caption direction (optional)"
                className={cn(fieldCls, "py-2.5 pr-16 resize-none text-[13.5px]")}
              />
              <span className="absolute bottom-2 right-3 text-[11px] text-ink-400 tabular-nums pointer-events-none">
                {notes.length} / 500
              </span>
            </div>

            {err && (
              <div className="mt-3 text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
                {err}
              </div>
            )}
          </div>

          {/* RIGHT — live preview (reference panel) */}
          {showPreview && (
            <aside className="border-t lg:border-t-0 lg:border-l border-ink-100 bg-cream-50/70 px-5 sm:px-6 py-5">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-[15px] font-bold text-ink-900">
                  {platformLabel} Preview
                </span>
                <Info
                  className="size-3.5 text-ink-400"
                  strokeWidth={2}
                  aria-label="A quick look at how this post is shaping up"
                />
              </div>

              {/* mock post — fills in as you type */}
              <div className="rounded-[14px] bg-white border border-ink-100 shadow-sm p-3.5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="size-8 rounded-full bg-cream-100 inline-flex items-center justify-center shrink-0">
                    <PlatformGlyph platform={platform} size={14} />
                  </span>
                  <div className="space-y-1" aria-hidden>
                    <div className="h-2 w-24 rounded-full bg-cream-200" />
                    <div className="h-2 w-14 rounded-full bg-cream-100" />
                  </div>
                </div>
                {topic ? (
                  <p className="text-[13px] leading-snug text-ink-800 mb-3 whitespace-pre-wrap break-words">
                    {topic}
                  </p>
                ) : (
                  <div className="space-y-1.5 mb-3" aria-hidden>
                    <div className="h-2 rounded-full bg-cream-200 w-full" />
                    <div className="h-2 rounded-full bg-cream-200 w-3/4" />
                  </div>
                )}
                <div className="aspect-[4/3] rounded-[10px] bg-cream-100 border border-ink-100 flex items-center justify-center text-ink-300">
                  <ImagePlus className="size-6" strokeWidth={1.5} />
                </div>
              </div>

              {!topic && (
                <p className="mt-3 text-center text-[12.5px] text-ink-400">
                  See your post&apos;s preview here
                </p>
              )}

              <ul className="mt-4 space-y-2.5 text-[12.5px]">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink-500">Content type</span>
                  <span className="font-semibold text-ink-900">{contentLabel}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink-500">Goal</span>
                  <span
                    className={cn(
                      "font-semibold",
                      goalLabel ? "text-ink-900" : "text-ink-400",
                    )}
                  >
                    {goalLabel ?? "—"}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink-500">Schedule</span>
                  <span
                    className={cn(
                      "font-semibold text-right",
                      scheduleLabel ? "text-ink-900" : "text-ink-400",
                    )}
                  >
                    {scheduleLabel ?? "Unscheduled"}
                  </span>
                </li>
                {phased && (
                  <li className="flex items-center justify-between gap-3">
                    <span className="text-ink-500">Production</span>
                    <span className="font-semibold text-ink-900">
                      Spread over phases
                    </span>
                  </li>
                )}
              </ul>
            </aside>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-ink-100">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-[13.5px] font-medium text-ink-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="size-4 rounded border-ink-300 accent-rose-600"
              />
              Create Another
            </label>
            {!isIdea && (
              <>
                <span aria-hidden className="w-px h-4 bg-ink-200" />
                <button
                  type="button"
                  onClick={() => save("idea")}
                  disabled={pending}
                  className="text-[13.5px] font-semibold text-ink-600 hover:text-ink-900 disabled:opacity-50 transition-colors"
                >
                  Save Draft
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* schedule — the reference's "Next Available" control */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSchedOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={schedOpen}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
              >
                <CalendarDays className="size-4 text-ink-500" strokeWidth={2} />
                {scheduleLabel ?? "No schedule"}
                <ChevronDown
                  className={cn(
                    "size-3.5 text-ink-400 transition-transform",
                    schedOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>

              {schedOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setSchedOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    role="dialog"
                    aria-label="Schedule"
                    className="absolute right-0 bottom-[calc(100%+8px)] z-50 w-[340px] max-h-[58vh] overflow-y-auto rounded-[16px] border border-ink-100 bg-white shadow-card p-4 text-left"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="relative">
                        <CalendarDays
                          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
                          strokeWidth={2}
                        />
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
                        <Clock
                          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
                          strokeWidth={2}
                        />
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

                    {/* Production schedule — single day vs spread across phases */}
                    <div className="mt-3 rounded-[12px] border border-ink-200 bg-cream-50/40 p-3.5">
                      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-700">
                          <CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} />
                          Production schedule
                        </span>
                        <div className="inline-flex items-center rounded-[9px] border border-ink-200 bg-white p-0.5">
                          {[
                            { k: false, l: "Single day" },
                            { k: true, l: "Spread over phases" },
                          ].map((o) => (
                            <button
                              key={String(o.k)}
                              type="button"
                              onClick={() => {
                                setPhased(o.k);
                                if (o.k && Object.keys(phaseDates).length === 0)
                                  autoSpacePhases();
                              }}
                              aria-pressed={phased === o.k}
                              className={cn(
                                "h-7 px-2.5 rounded-[7px] text-[11.5px] font-semibold transition-colors",
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
                        <p className="text-[12px] text-ink-500 leading-snug">
                          The whole post happens on the date above. Switch to{" "}
                          <span className="font-medium text-ink-700">
                            Spread over phases
                          </span>{" "}
                          to plan the work (film, edit, post…) across several days.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[11.5px] text-ink-500 leading-snug">
                              Give each phase the day you&apos;ll do it. Leave a phase
                              blank to skip it.
                            </p>
                            <button
                              type="button"
                              onClick={autoSpacePhases}
                              className="shrink-0 text-[11.5px] font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Auto-space
                            </button>
                          </div>
                          <ul className="space-y-1.5">
                            {PHASE_ORDER.map((s) => {
                              const val = phaseDates[s] ?? "";
                              return (
                                <li key={s} className="flex items-center gap-2.5">
                                  <span className="w-[74px] shrink-0 text-[12px] font-medium text-ink-700">
                                    {PHASE_LABEL[s]}
                                  </span>
                                  <input
                                    type="date"
                                    value={val}
                                    onChange={(e) =>
                                      setPhaseDates((p) => ({
                                        ...p,
                                        [s]: e.target.value,
                                      }))
                                    }
                                    aria-label={`${PHASE_LABEL[s]} date`}
                                    className="flex-1 min-w-0 h-9 rounded-[9px] border border-ink-200 bg-white px-2.5 text-[13px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Clear ${PHASE_LABEL[s]}`}
                                    onClick={() =>
                                      setPhaseDates((p) => {
                                        const n = { ...p };
                                        delete n[s];
                                        return n;
                                      })
                                    }
                                    disabled={!val}
                                    className="size-7 shrink-0 inline-flex items-center justify-center rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                  >
                                    <X className="size-3.5" strokeWidth={2} />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSchedOpen(false)}
                        className="h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[12.5px] font-semibold transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => save(isIdea ? "idea" : "planned")}
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] text-white text-[14px] font-semibold transition-colors shadow-sm",
                isIdea
                  ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300"
                  : "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300",
              )}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : isIdea ? (
                <Lightbulb className="size-4" strokeWidth={2} />
              ) : (
                <CalendarCheck className="size-4" strokeWidth={2} />
              )}
              {isIdea ? "Save Idea" : "Schedule Post"}
            </button>
          </div>
        </footer>
      </div>
    </div>
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
