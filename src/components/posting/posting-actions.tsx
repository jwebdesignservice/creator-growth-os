"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Loader2,
  Sparkles,
  Maximize2,
  Smile,
  Hash,
  ImagePlus,
  Ghost,
  Globe,
  Bell,
  Check,
  Star,
  Link2,
  Search,
  Tag,
  Pin,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Palette,
  HardDrive,
  Images,
  Cloud,
  Aperture,
  Package,
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
  rescheduleItem,
} from "@/app/(app)/posting/actions";
import {
  savePostingItemPhases,
  updatePostingItemDetail,
  getPostingItemDetail,
  getPostingItemPhases,
} from "@/app/(app)/posting/detail-actions";
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

/* Media sources offered by the composer's "+" menu (reference). The
   integrations themselves ship later — the menu is the design contract. */
const MEDIA_SOURCES: { label: string; icon: LucideIconType; more?: boolean }[] = [
  { label: "Canva", icon: Palette, more: true },
  { label: "Dropbox", icon: Package },
  { label: "Google Drive", icon: HardDrive },
  { label: "Google Photos", icon: Images },
  { label: "OneDrive", icon: Cloud },
  { label: "Unsplash", icon: Aperture },
];
type LucideIconType = typeof Palette;

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

/** Tiny glyph for the avatar's corner badge (reference's channel badge). */
function PlatformBadgeGlyph({ platform }: { platform: PlatformKey }) {
  if (platform === "instagram") return <InstagramIcon size={10} />;
  if (platform === "tiktok") return <TiktokIcon size={10} />;
  if (platform === "youtube") return <YoutubeIcon size={10} />;
  if (platform === "snapchat") return <Ghost className="size-[10px]" strokeWidth={2.5} />;
  if (platform === "linkedin")
    return <span className="text-[8px] font-black leading-none">in</span>;
  return <Globe className="size-[10px]" strokeWidth={2.5} />;
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
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-rose-100 text-rose-600">
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
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-gold-400/20 text-gold-500">
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
  initialPlatform,
  intent = "post",
  editItem,
}: {
  planId?: string;
  onClose: () => void;
  /** Pre-select a calendar day (YYYY-MM-DD) — used by the per-column "Add post". */
  initialDate?: string;
  /** Pre-select a channel — used by the My Plans platform cards. */
  initialPlatform?: PlatformKey;
  /** "idea" opens the form in capture-an-idea mode (idea-first save CTA). */
  intent?: "post" | "idea";
  /** When set, the composer edits this existing post instead of creating one. */
  editItem?: {
    id: string;
    platform: PlatformKey | null;
    content_type: string | null;
    topic: string | null;
    scheduled_for: string | null;
    status: ContentStatus;
  };
}) {
  const isEdit = !!editItem;
  const isIdea = intent === "idea" && !isEdit;
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformKey>(
    editItem?.platform ?? initialPlatform ?? "instagram",
  );
  const [contentType, setContentType] = useState(
    editItem?.content_type ?? "reel",
  );
  const [topic, setTopic] = useState(editItem?.topic ?? "");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  // Default to the user's current local date + time (their timezone), unless a
  // specific calendar day was passed in (per-column "Add post") or the post
  // being edited already has a schedule.
  const [date, setDate] = useState(() => {
    if (editItem?.scheduled_for)
      return toDateInput(new Date(editItem.scheduled_for));
    return initialDate ?? toDateInput(new Date());
  });
  const [time, setTime] = useState(() => {
    if (editItem?.scheduled_for) {
      const d = new Date(editItem.scheduled_for);
      return `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes(),
      ).padStart(2, "0")}`;
    }
    return nowTimeHHMM();
  });
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /* Reference-composer UI state ---------------------------------------- */
  const [showPreview, setShowPreview] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [schedOpen, setSchedOpen] = useState(false);
  const [aiGen, setAiGen] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  // Posting mode for the footer's split button: queue slot, bump, right now,
  // or an explicit date/time (the only mode that uses the date inputs).
  const [schedMode, setSchedMode] = useState<
    "next" | "prioritize" | "now" | "custom"
  >(editItem?.scheduled_for || initialDate ? "custom" : "next");
  // Automatic vs Notify-Me publishing preference (composer's quiet menu).
  const [autoMode, setAutoMode] = useState<"automatic" | "notify">("automatic");
  const [autoOpen, setAutoOpen] = useState(false);
  // "+" media-source menu.
  const [plusOpen, setPlusOpen] = useState(false);
  // Idea layout's channel + tags (content type) menus.
  const [chanOpen, setChanOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  // Locally attached media — previewed in the composer + platform mock.
  // Persisting uploads needs a storage bucket + column, so the file stays
  // client-side for now and is not written on save.
  const [media, setMedia] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function attachFile(f: File | null | undefined) {
    if (!f) return;
    setMedia((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { url: URL.createObjectURL(f), name: f.name };
    });
  }


  // Production schedule: single day (uses the date above) vs phases spread
  // across days. phaseDates holds a YYYY-MM-DD per stage (absent = skipped).
  const [phased, setPhased] = useState(false);
  const [phaseDates, setPhaseDates] = useState<
    Partial<Record<ContentStatus, string>>
  >({});
  // Remember the created row id so a retry (e.g. after a phase-save hiccup)
  // re-uses it instead of inserting a duplicate post.
  const createdId = useRef<string | null>(null);

  // Edit mode: pull the fields the list rows don't carry (goal, notes,
  // phased flag) plus any production-phase dates, and prefill the form.
  useEffect(() => {
    if (!editItem) return;
    let cancelled = false;
    void (async () => {
      const [detail, phases] = await Promise.all([
        getPostingItemDetail(editItem.id),
        getPostingItemPhases(editItem.id),
      ]);
      if (cancelled) return;
      if (detail) {
        setGoal(detail.goal ?? "");
        setNotes(detail.notes ?? "");
        if (detail.is_phased) setPhased(true);
      }
      if (phases.length > 0) {
        setPhased(true);
        setPhaseDates(() => {
          const next: Partial<Record<ContentStatus, string>> = {};
          for (const p of phases) {
            if (p.scheduled_for)
              next[p.stage] = toDateInputLocal(new Date(p.scheduled_for));
          }
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editItem]);

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
        // Edit mode mirrors the reference chip ("Jun 11, 9:42 PM" — no weekday).
        ...(isEdit ? {} : { weekday: "short" as const }),
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  /** Resolve the posting moment from the split-button mode. */
  function resolveWhen(): Date | null {
    if (schedMode === "now") return new Date();
    if (schedMode === "prioritize") {
      // Bump to the top of the queue — the next full hour.
      const d = new Date();
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + 1);
      return d;
    }
    if (schedMode === "next") {
      // Next available slot in the queue — tomorrow morning, 10:00.
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d;
    }
    return date ? new Date(`${date}T${time || nowTimeHHMM()}`) : null;
  }

  const SCHED_MODE_LABEL: Record<typeof schedMode, string> = {
    next: "Next Available",
    prioritize: "Prioritize",
    now: "Now",
    custom: scheduleLabel ?? "Set Date and Time",
  };

  // Edit mode: park the post back in the idea/draft stage (reference's
  // "Move to Drafts") and close.
  function moveToDrafts() {
    if (!editItem) return;
    setErr(null);
    startTransition(async () => {
      const res = await updatePostingItemDetail(editItem.id, { status: "idea" });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function save(status: "idea" | "planned") {
    setErr(null);
    const when = resolveWhen();
    const scheduledFor = when ? when.toISOString() : undefined;
    // The AI-Generated toggle records the disclosure with the post's notes.
    const finalNotes = [
      notes.trim(),
      aiGen ? "Disclose: content generated or edited with AI." : "",
    ]
      .filter(Boolean)
      .join("\n");
    startTransition(async () => {
      // Editing an existing post → update in place (status/pipeline stage is
      // left untouched), reschedule if a moment was picked, save phases.
      if (editItem) {
        const res = await updatePostingItemDetail(editItem.id, {
          topic: topic.trim(),
          goal,
          notes: finalNotes,
          platform,
          content_type: contentType,
        });
        if (!res.ok) {
          setErr(res.error);
          return;
        }
        if (scheduledFor) {
          const r2 = await rescheduleItem(editItem.id, scheduledFor);
          if (!r2.ok) {
            setErr(r2.error);
            return;
          }
        }
        if (phased) {
          const phases = (
            Object.entries(phaseDates) as [ContentStatus, string][]
          )
            .filter(([, d]) => d)
            .map(([stage, d]) => ({ stage, scheduled_for: phaseDateToIso(d) }));
          const pres = await savePostingItemPhases(editItem.id, {
            isPhased: true,
            phases,
          });
          if (!pres.ok) {
            setErr(pres.error);
            return;
          }
        }
        router.refresh();
        onClose();
        return;
      }

      // Create the post once; reuse its id on retry so we never duplicate.
      let id = createdId.current;
      if (!id) {
        if (!planId) {
          setErr("No active plan to add this post to.");
          return;
        }
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

  const canSaveIdea = !!(topic.trim() || notes.trim());

  /* ── Idea variant — the reference's "New Idea" sheet ─────────────────── */
  if (isIdea) {
    return (
      <div
        className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-[20px] shadow-xl border border-ink-100 w-full max-w-[760px] my-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* top bar */}
          <header className="flex items-center gap-2 px-5 sm:px-6 py-4">
            <h3 className="text-[22px] font-bold text-ink-900 tracking-[-0.01em]">
              New Idea
            </h3>
            <span className="flex-1" />
            {/* channel assignment */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setChanOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={chanOpen}
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
              >
                <PlatformGlyph platform={platform} size={14} />
                {platformLabel}
                <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
              </button>
              {chanOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setChanOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+6px)] z-50 w-[210px] rounded-[14px] border border-ink-100 bg-white py-1.5 shadow-card"
                  >
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={platform === p.value}
                        onClick={() => {
                          setPlatform(p.value);
                          setChanOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
                      >
                        <span
                          className={cn(
                            "size-6 rounded-[7px] inline-flex items-center justify-center",
                            PLATFORM_TILE[p.value],
                          )}
                        >
                          <PlatformBadgeGlyph platform={p.value} />
                        </span>
                        {p.label}
                        {platform === p.value && (
                          <Check className="ml-auto size-4" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* tags = content type */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTagsOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={tagsOpen}
                className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
              >
                <Tag className="size-4 text-ink-500" strokeWidth={2} />
                {contentLabel}
                <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
              </button>
              {tagsOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setTagsOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+6px)] z-50 w-[200px] rounded-[14px] border border-ink-100 bg-white py-1.5 shadow-card"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={contentType === t.value}
                        onClick={() => {
                          setContentType(t.value);
                          setTagsOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
                      >
                        {t.label}
                        {contentType === t.value && (
                          <Check className="ml-auto size-4" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="size-9 rounded-[10px] hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 transition-colors"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </header>

          {/* body */}
          <div className="px-5 sm:px-6 pb-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 160))}
              maxLength={160}
              placeholder="Give your idea a title"
              className="w-full border-0 bg-transparent text-[24px] sm:text-[26px] font-bold tracking-[-0.01em] text-ink-900 placeholder:text-ink-900 focus:outline-none"
            />

            {/* free-flow body with the reference's inline AI hint */}
            <div className="relative mt-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 4000))}
                maxLength={4000}
                rows={10}
                spellCheck
                className="w-full min-h-[300px] resize-none border-0 bg-transparent text-[15px] leading-relaxed text-ink-900 focus:outline-none"
              />
              {!notes && (
                <div className="pointer-events-none absolute left-0 top-1 flex flex-wrap items-center gap-2 text-[17px] text-ink-400">
                  Let it flow... or
                  <span className="pointer-events-auto">
                    <button
                      type="button"
                      disabled
                      title="AI Assistant — coming soon"
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[15px] font-medium text-ink-400 cursor-not-allowed"
                    >
                      <Sparkles className="size-4" strokeWidth={2} />
                      Use the AI Assistant
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* media thumb + dropzone */}
            <div className="flex items-end gap-3">
              {media && (
                <div className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img
                    src={media.url}
                    alt={media.name}
                    className="h-[110px] w-[88px] rounded-[10px] border border-ink-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(media.url);
                      setMedia(null);
                    }}
                    aria-label="Remove media"
                    title="Remove media"
                    className="absolute -right-2 -top-2 size-6 rounded-full bg-ink-900 text-white inline-flex items-center justify-center shadow hover:bg-ink-700 transition-colors"
                  >
                    <X className="size-3" strokeWidth={2.5} />
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  attachFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  attachFile(e.dataTransfer.files?.[0]);
                }}
                className="w-[170px] rounded-[12px] border-2 border-dashed border-ink-200 px-5 py-6 text-center transition-colors hover:border-rose-300 hover:bg-rose-50/40"
              >
                <ImagePlus
                  className="mx-auto mb-2 size-6 text-ink-500"
                  strokeWidth={1.8}
                />
                <p className="text-[14px] leading-snug text-ink-600">
                  Drag &amp; drop or{" "}
                  <span className="font-medium text-rose-600">
                    select a file
                  </span>
                </p>
              </button>
            </div>

            {/* toolbar */}
            <div className="mt-4 flex items-center gap-0.5 border-t border-ink-100 pt-2.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPlusOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={plusOpen}
                  aria-label="Add media from…"
                  className="inline-flex items-center gap-0.5 h-9 px-1.5 rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                >
                  <Plus className="size-[18px]" strokeWidth={2} />
                  <ChevronDown className="size-4" strokeWidth={2} />
                </button>
                {plusOpen && (
                  <>
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
                      onClick={() => setPlusOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />
                    <div
                      role="menu"
                      className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-[220px] rounded-[14px] border border-ink-100 bg-white py-1.5 shadow-card"
                    >
                      {MEDIA_SOURCES.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          role="menuitem"
                          title="Integration coming soon"
                          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-medium text-ink-400 cursor-not-allowed"
                        >
                          <s.icon className="size-4" strokeWidth={2} />
                          {s.label}
                          {s.more && (
                            <ChevronRight
                              className="ml-auto size-3.5"
                              strokeWidth={2}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <span aria-hidden className="w-px h-5 bg-ink-200 mx-1.5" />
              <button
                type="button"
                onClick={() => setNotes((t) => (t + "🙂").slice(0, 4000))}
                title="Add emoji"
                aria-label="Add emoji"
                className="inline-flex size-9 items-center justify-center rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
              >
                <Smile className="size-[18px]" strokeWidth={2} />
              </button>
              <span aria-hidden className="w-px h-5 bg-ink-200 mx-1.5" />
              <span
                title="AI Assistant — coming soon"
                className="inline-flex items-center gap-1.5 h-9 px-2 rounded-[8px] text-[15px] font-medium text-ink-300 cursor-not-allowed"
              >
                <Sparkles className="size-[18px]" strokeWidth={2} />
                AI Assistant
              </span>
            </div>

            {err && (
              <div className="mt-3 text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
                {err}
              </div>
            )}
          </div>

          {/* footer */}
          <footer className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-4 border-t border-ink-100">
            <button
              type="button"
              onClick={() => save("planned")}
              disabled={pending || !canSaveIdea}
              className={cn(
                "h-11 px-5 rounded-[12px] text-[14.5px] font-semibold transition-colors",
                canSaveIdea
                  ? "border border-ink-200 bg-white text-ink-900 hover:bg-cream-100"
                  : "bg-ink-100 text-ink-400 cursor-not-allowed",
              )}
            >
              Create Post
            </button>
            <button
              type="button"
              onClick={() => save("idea")}
              disabled={pending || !canSaveIdea}
              className={cn(
                "inline-flex items-center gap-1.5 h-11 px-5 rounded-[12px] text-[14.5px] font-semibold transition-colors",
                canSaveIdea
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-ink-100 text-ink-400 cursor-not-allowed",
              )}
            >
              {pending && (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              )}
              Save Idea
            </button>
          </footer>
        </div>
      </div>
    );
  }

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
            {isEdit ? "Edit Post" : isIdea ? "Capture Idea" : "Create Post"}
          </h3>
          {/* content type — the reference's Tags pill (labeled "Tags" while
              editing, exactly like the reference's Edit Post header) */}
          {isEdit ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setTagsOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={tagsOpen}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-200 bg-white pl-3 pr-2.5 text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors focus:outline-none focus:border-rose-300"
              >
                <Tag className="size-3.5 text-ink-500" strokeWidth={2} />
                Tags
                <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
              </button>
              {tagsOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setTagsOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute left-0 top-[calc(100%+8px)] z-50 w-[210px] rounded-[14px] border border-ink-100 bg-white py-1.5 shadow-card"
                  >
                    <div className="px-3.5 py-1 text-[10px] uppercase tracking-wide text-ink-400 font-semibold">
                      Content type
                    </div>
                    {CONTENT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={contentType === t.value}
                        onClick={() => {
                          setContentType(t.value);
                          setTagsOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] hover:bg-cream-100 transition-colors",
                          contentType === t.value
                            ? "font-semibold text-ink-900"
                            : "text-ink-700",
                        )}
                      >
                        {t.label}
                        {contentType === t.value && (
                          <Check className="size-3.5 ml-auto" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
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
          )}

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
            {/* channel row — a picker when creating; read-only when editing
                (the post's channel is fixed once it exists, like the
                reference's Edit Post) */}
            {isEdit ? (
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={cn(
                    "relative size-12 rounded-[14px] inline-flex items-center justify-center",
                    PLATFORM_TILE[platform],
                  )}
                  title={PLATFORMS.find((p) => p.value === platform)?.label ?? platform}
                >
                  <PlatformTileGlyph platform={platform} />
                  <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-ink-900 text-white ring-2 ring-white inline-flex items-center justify-center">
                    <PlatformBadgeGlyph platform={platform} />
                  </span>
                </span>
              </div>
            ) : (
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
                        "relative size-12 rounded-[14px] inline-flex items-center justify-center transition-all",
                        PLATFORM_TILE[p.value],
                        active
                          ? "ring-2 ring-ink-900 ring-offset-2"
                          : "opacity-40 saturate-50 hover:opacity-80",
                      )}
                    >
                      <PlatformTileGlyph platform={p.value} />
                      {/* corner channel badge, like the reference avatar */}
                      <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-ink-900 text-white ring-2 ring-white inline-flex items-center justify-center">
                        <PlatformBadgeGlyph platform={p.value} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* composer card — caption · media · toolbar · publish mode · title */}
            <div className="rounded-[16px] border border-ink-200 bg-white focus-within:border-ink-300 transition-shadow">
              <div className="flex items-start gap-3 p-4 pb-0">
                <span className="size-9 rounded-[10px] bg-cream-100 inline-flex items-center justify-center shrink-0">
                  <PlatformGlyph platform={platform} size={16} />
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 4000))}
                  maxLength={4000}
                  rows={5}
                  spellCheck
                  placeholder="Start writing or get inspired with Templates"
                  className="flex-1 min-w-0 resize-none border-0 bg-transparent text-[15px] leading-relaxed text-ink-900 placeholder:text-ink-400 focus:outline-none min-h-[150px]"
                />
              </div>

              {/* media row — attached preview + drag & drop / file picker */}
              <div className="flex items-end gap-3 px-4 pt-2 pb-3">
                {media && (
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                    <img
                      src={media.url}
                      alt={media.name}
                      className="h-[110px] w-[88px] rounded-[10px] border border-ink-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(media.url);
                        setMedia(null);
                      }}
                      aria-label="Remove media"
                      title="Remove media"
                      className="absolute -right-2 -top-2 size-6 rounded-full bg-ink-900 text-white inline-flex items-center justify-center shadow hover:bg-ink-700 transition-colors"
                    >
                      <X className="size-3" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    attachFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    attachFile(e.dataTransfer.files?.[0]);
                  }}
                  className="w-[210px] rounded-[12px] border-2 border-dashed border-ink-200 px-4 py-5 text-center transition-colors hover:border-rose-300 hover:bg-rose-50/40"
                >
                  <ImagePlus
                    className="mx-auto mb-1.5 size-5 text-ink-400"
                    strokeWidth={1.8}
                  />
                  <p className="text-[12.5px] leading-snug text-ink-500">
                    Drag &amp; drop or{" "}
                    <span className="font-medium text-rose-600">
                      select a file
                    </span>
                  </p>
                </button>
              </div>

              {/* toolbar */}
              <div className="flex items-center gap-0.5 px-3 py-2 border-t border-ink-100">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPlusOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={plusOpen}
                    aria-label="Add media from…"
                    className="inline-flex items-center gap-0.5 h-8 px-1.5 rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                  >
                    <Plus className="size-4" strokeWidth={2} />
                    <ChevronDown className="size-3.5" strokeWidth={2} />
                  </button>
                  {plusOpen && (
                    <>
                      <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        onClick={() => setPlusOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <div
                        role="menu"
                        className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-[220px] rounded-[14px] border border-ink-100 bg-white py-1.5 shadow-card"
                      >
                        {MEDIA_SOURCES.map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            role="menuitem"
                            title="Integration coming soon"
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] font-medium text-ink-400 cursor-not-allowed"
                          >
                            <s.icon className="size-4" strokeWidth={2} />
                            {s.label}
                            {s.more && (
                              <ChevronRight
                                className="ml-auto size-3.5"
                                strokeWidth={2}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <span aria-hidden className="w-px h-4 bg-ink-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setNotes((t) => (t + "🙂").slice(0, 4000))}
                  title="Add emoji"
                  aria-label="Add emoji"
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                >
                  <Smile className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setNotes((t) => (t + "#").slice(0, 4000))}
                  title="Add hashtag"
                  aria-label="Add hashtag"
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
                >
                  <Hash className="size-4" strokeWidth={2} />
                </button>
                <span
                  className="inline-flex size-8 items-center justify-center rounded-[8px] text-ink-300 cursor-not-allowed"
                  title="Link shortening — coming soon"
                >
                  <Link2 className="size-4" strokeWidth={2} />
                </span>
                <span className="flex-1" />
                <span
                  className="rounded-[8px] border border-ink-200 px-2 py-0.5 text-[11.5px] tabular-nums text-ink-500"
                  title="Characters left"
                >
                  {4000 - notes.length}
                </span>
              </div>

              {/* publish mode — goal (left) · Automatic/Notify Me (right) */}
              <div className="flex items-center justify-between gap-3 px-3 py-2 border-t border-ink-100">
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

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAutoOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={autoOpen}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[13.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
                  >
                    {autoMode === "automatic" ? (
                      <Sparkles className="size-4 text-ink-500" strokeWidth={2} />
                    ) : (
                      <Bell className="size-4 text-ink-500" strokeWidth={2} />
                    )}
                    {autoMode === "automatic" ? "Automatic" : "Notify Me"}
                    <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
                  </button>
                  {autoOpen && (
                    <>
                      <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        onClick={() => setAutoOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <div
                        role="menu"
                        className="absolute right-0 bottom-[calc(100%+8px)] z-50 w-[320px] rounded-[16px] border border-ink-100 bg-white p-2 shadow-card"
                      >
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={autoMode === "automatic"}
                          onClick={() => {
                            setAutoMode("automatic");
                            setAutoOpen(false);
                          }}
                          className="flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-cream-100 transition-colors"
                        >
                          <Sparkles className="size-4 mt-0.5 text-ink-600 shrink-0" strokeWidth={2} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-semibold text-ink-900">
                              Automatic
                            </span>
                            <span className="block text-[12.5px] text-ink-500">
                              Profluencer will post automatically for you
                            </span>
                          </span>
                          {autoMode === "automatic" && (
                            <Check className="size-4 mt-1 text-ink-900 shrink-0" strokeWidth={2.5} />
                          )}
                        </button>
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={autoMode === "notify"}
                          onClick={() => {
                            setAutoMode("notify");
                            setAutoOpen(false);
                          }}
                          className="flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-cream-100 transition-colors"
                        >
                          <Bell className="size-4 mt-0.5 text-amber-600 shrink-0" strokeWidth={2} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-semibold text-ink-900">
                              Notify Me
                            </span>
                            <span className="block text-[12.5px] text-ink-500">
                              You&apos;ll receive a mobile notification to post yourself.
                            </span>
                          </span>
                          {autoMode === "notify" && (
                            <Check className="size-4 mt-1 text-ink-900 shrink-0" strokeWidth={2.5} />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* title — the post's hook/topic */}
              <div className="flex items-center gap-3 px-4 py-3 border-t border-ink-100">
                <span className="w-[44px] shrink-0 text-[14px] text-ink-600">
                  Title
                </span>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value.slice(0, 160))}
                  maxLength={160}
                  placeholder="Add a title…"
                  className={cn(fieldCls, "h-11")}
                />
              </div>
            </div>

            {/* AI-Generated disclosure — saved alongside the post's notes */}
            <div className="mt-3 flex items-center gap-3 pt-1">
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

              {platform === "tiktok" ? (
                /* TikTok mock — 1:1 with the reference preview */
                <div className="rounded-[16px] overflow-hidden bg-black text-white shadow-sm">
                  <div className="relative flex items-center justify-center gap-5 px-3 pt-3 pb-2.5">
                    <span className="text-[13px] font-medium text-white/60">
                      Following
                    </span>
                    <span className="relative text-[13px] font-bold">
                      For You
                      <span
                        aria-hidden
                        className="absolute -bottom-1.5 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-white"
                      />
                    </span>
                    <Search
                      className="absolute right-3 top-3 size-4 text-white"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                  <div className="relative aspect-[3/4] bg-ink-900">
                    {media ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */
                      <img
                        src={media.url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/35">
                        <ImagePlus className="size-7" strokeWidth={1.5} />
                        <span className="text-[12px]">
                          See your post&apos;s preview here
                        </span>
                      </div>
                    )}
                    {/* action rail */}
                    <div className="absolute bottom-3 right-2 flex flex-col items-center gap-3.5">
                      <span className="relative">
                        <span className="size-9 rounded-full bg-cream-100 ring-2 ring-white inline-flex items-center justify-center">
                          <PlatformGlyph platform={platform} size={15} />
                        </span>
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-4 rounded-full bg-rose-500 text-white text-[11px] font-bold leading-none inline-flex items-center justify-center">
                          +
                        </span>
                      </span>
                      <Heart className="size-6" fill="currentColor" strokeWidth={0} aria-hidden />
                      <MessageCircle className="size-6" fill="currentColor" strokeWidth={0} aria-hidden />
                      <Bookmark className="size-6" fill="currentColor" strokeWidth={0} aria-hidden />
                      <Share2 className="size-6" fill="currentColor" strokeWidth={0} aria-hidden />
                    </div>
                  </div>
                  <div className="space-y-1 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold">@you</span>
                      <span className="inline-flex items-center gap-1 rounded-[6px] bg-white/20 px-1.5 py-0.5 text-[10.5px] font-semibold">
                        <ImagePlus className="size-3" strokeWidth={2} />
                        {media ? "Photo" : "Post"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[12.5px] text-white/90 whitespace-pre-wrap break-words">
                      {notes || "Your caption will appear here"}
                    </p>
                  </div>
                </div>
              ) : (
                /* generic mock for the other platforms */
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
                  {notes ? (
                    <p className="text-[13px] leading-snug text-ink-800 mb-3 whitespace-pre-wrap break-words line-clamp-4">
                      {notes}
                    </p>
                  ) : (
                    <div className="space-y-1.5 mb-3" aria-hidden>
                      <div className="h-2 rounded-full bg-cream-200 w-full" />
                      <div className="h-2 rounded-full bg-cream-200 w-3/4" />
                    </div>
                  )}
                  <div className="relative aspect-[4/3] rounded-[10px] bg-cream-100 border border-ink-100 flex items-center justify-center overflow-hidden text-ink-300">
                    {media ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */
                      <img
                        src={media.url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="size-6" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              )}

              {!notes && platform !== "tiktok" && (
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
            {isEdit && (
              <button
                type="button"
                onClick={moveToDrafts}
                disabled={pending}
                className="text-[14px] font-medium text-ink-800 hover:text-ink-900 disabled:opacity-50 transition-colors"
              >
                Move to Drafts
              </button>
            )}
            {!isEdit && (
              <label className="inline-flex items-center gap-2 text-[13.5px] font-medium text-ink-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createAnother}
                  onChange={(e) => setCreateAnother(e.target.checked)}
                  className="size-4 rounded border-ink-300 accent-rose-600"
                />
                Create Another
              </label>
            )}
            {!isIdea && !isEdit && (
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

          <div className="flex items-stretch justify-end">
            {/* schedule — the reference's "Next Available" split control */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSchedOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={schedOpen}
                className="inline-flex h-11 items-center gap-1.5 rounded-l-[12px] border border-ink-200 bg-white px-4 text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
              >
                {isEdit ? (
                  <Pin className="size-4 text-ink-500" strokeWidth={2} />
                ) : (
                  <CalendarDays className="size-4 text-ink-500" strokeWidth={2} />
                )}
                {SCHED_MODE_LABEL[schedMode]}
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
                    role="menu"
                    aria-label="When to post"
                    className="absolute right-0 bottom-[calc(100%+8px)] z-50 w-[360px] max-h-[62vh] overflow-y-auto rounded-[16px] border border-ink-100 bg-white p-2 shadow-card text-left"
                  >
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={schedMode === "next"}
                      onClick={() => {
                        setSchedMode("next");
                        setSchedOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-[12px] px-3.5 py-3 text-left transition-colors",
                        schedMode === "next"
                          ? "bg-rose-50"
                          : "hover:bg-cream-100",
                      )}
                    >
                      <span className="mt-0.5 w-4 shrink-0">
                        {schedMode === "next" && (
                          <Check className="size-4 text-rose-700" strokeWidth={2.5} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-[14.5px] font-semibold",
                            schedMode === "next"
                              ? "text-rose-700"
                              : "text-ink-900",
                          )}
                        >
                          Next Available
                        </span>
                        <span
                          className={cn(
                            "block text-[12.5px]",
                            schedMode === "next"
                              ? "text-rose-700/80"
                              : "text-ink-500",
                          )}
                        >
                          Use the next available posting slot in your queue.
                        </span>
                      </span>
                      <Star
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          schedMode === "next"
                            ? "text-rose-700"
                            : "text-ink-300",
                        )}
                        fill={schedMode === "next" ? "currentColor" : "none"}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>

                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={schedMode === "prioritize"}
                      onClick={() => {
                        setSchedMode("prioritize");
                        setSchedOpen(false);
                      }}
                      className="flex w-full items-start gap-2.5 rounded-[12px] px-3.5 py-3 text-left hover:bg-cream-100 transition-colors"
                    >
                      <span className="mt-0.5 w-4 shrink-0">
                        {schedMode === "prioritize" && (
                          <Check className="size-4 text-ink-900" strokeWidth={2.5} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-ink-900">
                          Prioritize
                        </span>
                        <span className="block text-[12.5px] text-ink-500">
                          Bump your post to the top of the queue.
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={schedMode === "now"}
                      onClick={() => {
                        setSchedMode("now");
                        setSchedOpen(false);
                      }}
                      className="flex w-full items-start gap-2.5 rounded-[12px] px-3.5 py-3 text-left hover:bg-cream-100 transition-colors"
                    >
                      <span className="mt-0.5 w-4 shrink-0">
                        {schedMode === "now" && (
                          <Check className="size-4 text-ink-900" strokeWidth={2.5} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-ink-900">
                          Now
                        </span>
                        <span className="block text-[12.5px] text-ink-500">
                          Publish your post right away.
                        </span>
                      </span>
                      <Star
                        className="mt-0.5 size-4 shrink-0 text-ink-300"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>

                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={schedMode === "custom"}
                      onClick={() => setSchedMode("custom")}
                      className="flex w-full items-start gap-2.5 rounded-[12px] px-3.5 py-3 text-left hover:bg-cream-100 transition-colors"
                    >
                      <span className="mt-0.5 w-4 shrink-0">
                        {schedMode === "custom" && (
                          <Check className="size-4 text-ink-900" strokeWidth={2.5} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-ink-900">
                          Set Date and Time
                        </span>
                        <span className="block text-[12.5px] text-ink-500">
                          Choose a specific time to post, or use our recommendation.
                        </span>
                      </span>
                    </button>

                    {schedMode === "custom" && (
                      <div className="mt-1 border-t border-ink-100 px-1.5 pt-3 pb-1">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="relative">
                            <CalendarDays
                              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
                              strokeWidth={2}
                            />
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
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
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => save(isIdea ? "idea" : "planned")}
              disabled={pending}
              className={cn(
                "-ml-px inline-flex h-11 items-center gap-1.5 rounded-r-[12px] px-5 text-[14px] font-semibold text-white shadow-sm transition-colors",
                isEdit
                  ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300"
                  : "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300",
              )}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : isEdit ? null : isIdea ? (
                <Lightbulb className="size-4" strokeWidth={2} />
              ) : (
                <CalendarCheck className="size-4" strokeWidth={2} />
              )}
              {isEdit ? "Save" : isIdea ? "Save Idea" : "Schedule Post"}
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
