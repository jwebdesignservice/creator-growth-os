"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Eye,
  Save,
  Send,
  MoreHorizontal,
  Sparkles,
  Info,
  ChevronDown,
  X,
  Image as ImageIcon,
  Route as RouteIcon,
  GraduationCap,
  Folder,
  SlidersHorizontal,
  Lock,
  CalendarDays,
  Monitor,
  Clock,
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize2,
  ListChecks,
  Plus,
  CircleDashed,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Donut } from "@/components/dashboard/donut";
import { updateLesson } from "@/app/admin/lessons/actions";
import { cn } from "@/lib/cn";
import { ThumbnailTab } from "./thumbnail-tab";

/* ─────────────────────────────────────────────────────────────────────────
   Public types — what the server page hands down.
   ───────────────────────────────────────────────────────────────────────── */

export type TutorialEditorData = {
  id:              string;
  slug:            string;
  title:           string;
  description:     string;
  programId:       string;
  planAccess:      "free" | "basic" | "pro";
  coverImageUrl:   string | null;
  videoUrl:        string | null;
  durationSeconds: number;
  moduleTitle:     string | null;
  published:       boolean;
  createdAt:       string;
  views:           number;
};

export type ProgramOption = { id: string; title: string };

/* Editor section keys. Source of truth for `?tab=…` values; the middle
   admin sidebar renders the corresponding nav items (see
   `app/admin/tutorials/tutorials-sidebar.tsx`). */
type TabKey =
  | "overview"
  | "metadata"
  | "thumbnail"
  | "lesson-path"
  | "creator-drill"
  | "resources"
  | "controls"
  | "access";

type Tab = { key: TabKey; label: string; icon: LucideIcon };
const TABS: Tab[] = [
  { key: "overview",      label: "Overview",      icon: Info             },
  { key: "metadata",      label: "Metadata",      icon: Sparkles         },
  { key: "thumbnail",     label: "Thumbnail",     icon: ImageIcon        },
  { key: "lesson-path",   label: "Lesson path",   icon: RouteIcon        },
  { key: "creator-drill", label: "Creator drill", icon: GraduationCap    },
  { key: "resources",     label: "Resources",     icon: Folder           },
  { key: "controls",      label: "Controls",      icon: SlidersHorizontal },
  { key: "access",        label: "Access",        icon: Lock             },
];

const TAB_KEYS = new Set<TabKey>(TABS.map((t) => t.key));
const DEFAULT_TAB: TabKey = "metadata";

/* Access-tier display map. */
const ACCESS_LABELS: Record<TutorialEditorData["planAccess"], string> = {
  free:  "All Access",
  basic: "Basic & Pro",
  pro:   "Pro only",
};

const ACCESS_HELP: Record<TutorialEditorData["planAccess"], string> = {
  free:  "Included in all plans and packages.",
  basic: "Available to Basic and Pro subscribers.",
  pro:   "Pro tier only — premium content.",
};

/* ─────────────────────────────────────────────────────────────────────────
   Root editor component
   ───────────────────────────────────────────────────────────────────────── */

export function TutorialEditor({
  lesson,
  programs,
}: {
  lesson: TutorialEditorData;
  programs: ProgramOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [saving, setSaving]   = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* The active section is URL-driven (`?tab=…`) so the middle admin
     sidebar can both navigate the editor and highlight the active row
     without lifting state across the layout boundary. */
  const tabParam = searchParams?.get("tab") as TabKey | null;
  const activeTab: TabKey =
    tabParam && TAB_KEYS.has(tabParam) ? tabParam : DEFAULT_TAB;

  /* ── Form state — seeded from DB row ─────────────────────────────── */
  const [title,        setTitle]        = useState(lesson.title);
  const [description,  setDescription]  = useState(lesson.description);
  const [programId,    setProgramId]    = useState(lesson.programId);
  const [planAccess,   setPlanAccess]   = useState<TutorialEditorData["planAccess"]>(lesson.planAccess);

  /* Frontend-only fields (no DB columns yet) — keep them in state so the
     UI is fully functional and they persist across tab switches. */
  const [tags,          setTags]         = useState<string[]>(["Mansa", "Dance", "Routine", "Intermediate"]);
  const [tagDraft,      setTagDraft]     = useState("");
  const [visibility,    setVisibility]   = useState<"public" | "private" | "unlisted">("public");
  const [internalNotes, setInternalNotes]= useState("");
  const [ctaLink,       setCtaLink]      = useState("");
  const [category,      setCategory]     = useState("");
  const [hasChapters,   setHasChapters]  = useState(false);

  const TITLE_MAX = 100;
  const DESC_MAX  = 5000;
  const NOTE_MAX  = 2000;

  /* ── Derived values ──────────────────────────────────────────────── */

  const stats = useMemo(() => ({
    views:      lesson.views,
    duration:   formatDuration(lesson.durationSeconds),
    resolution: "—", // not stored yet; matches the screenshot's slot
    uploaded:   formatUploadedDate(lesson.createdAt),
  }), [lesson.views, lesson.durationSeconds, lesson.createdAt]);

  /* Publishing readiness — derived from the form state so it updates live. */
  const readiness = useMemo(() => {
    const checks = [
      { key: "thumbnail",   label: "Thumbnail added",     done: !!lesson.coverImageUrl },
      { key: "description", label: "Description complete", done: description.trim().length >= 24 },
      { key: "captions",    label: "Captions uploaded",    done: !!lesson.videoUrl }, // proxy: any video implies captions step done
      { key: "chapters",    label: "Chapters added",       done: hasChapters },
      { key: "cta",         label: "CTA added",            done: ctaLink.trim().length > 0 || lesson.published },
    ];
    const done = checks.filter((c) => c.done).length;
    return {
      checks,
      done,
      total:   checks.length,
      percent: Math.round((done / checks.length) * 100),
    };
  }, [lesson.coverImageUrl, lesson.videoUrl, lesson.published, description, hasChapters, ctaLink]);

  /* ── Handlers ─────────────────────────────────────────────────────── */

  function addTag() {
    const v = tagDraft.trim();
    if (!v) return;
    if (tags.includes(v)) {
      setTagDraft("");
      return;
    }
    setTags([...tags, v]);
    setTagDraft("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function onSave() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateLesson(lesson.id, {
        title:       title.trim(),
        description: description.trim(),
        plan_access: planAccess,
      });
      if (!result.ok) {
        setSaveError(result.error);
      } else {
        setSavedAt(new Date());
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function onPublish() {
    // For now, "Publish tutorial" is a soft alias — surface a confirm flash
    // and route back to the list. Full publish flow wires next.
    if (typeof window !== "undefined") {
      window.alert(
        lesson.published
          ? "This tutorial is already published."
          : "Publish flow will run validation and then go live. Coming next.",
      );
    }
  }

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 max-w-[1480px] mx-auto">
      {/* Breadcrumb */}
      <nav className="text-[12.5px]" aria-label="Breadcrumb">
        <Link href="/admin" className="text-ink-400 hover:text-ink-700 transition-colors">
          Admin
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link href="/admin/tutorials" className="text-ink-400 hover:text-ink-700 transition-colors">
          Tutorials
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-700 font-medium">{lesson.title || "Untitled"}</span>
      </nav>

      {/* ── Hero header ───────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink-900 leading-[1.05] tracking-tight">
            {lesson.title || "Untitled tutorial"}
          </h1>
          <div className="mt-4 flex items-center gap-5 sm:gap-7 flex-wrap text-[12.5px]">
            <Stat icon={Eye}          value={stats.views.toLocaleString()} label="Views" />
            <Stat icon={Clock}        value={stats.duration}               label="Duration" />
            <Stat icon={Monitor}      value={stats.resolution}             label="Resolution" />
            <Stat icon={CalendarDays} value={stats.uploaded}               label="Uploaded" />
            <StatusPill published={lesson.published} />
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => window.open(`/tutorials/${lesson.slug}`, "_blank")}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[13.5px] font-medium hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-rose-50 border border-rose-100 text-rose-700 text-[13.5px] font-semibold hover:bg-rose-100 disabled:opacity-60 transition-colors"
          >
            <Save className="size-4" strokeWidth={2} />
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold shadow-sm transition-colors"
          >
            <Send className="size-4" strokeWidth={2} />
            {lesson.published ? "Republish tutorial" : "Publish tutorial"}
          </button>
          <button
            type="button"
            aria-label="More actions"
            className="inline-flex items-center justify-center size-11 rounded-[12px] bg-white border border-ink-200 text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
          >
            <MoreHorizontal className="size-4" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Save status line — quiet under the actions */}
      {(savedAt || saveError) && (
        <div className="text-[12px] -mt-2 text-right">
          {saveError ? (
            <span className="text-rose-600">{saveError}</span>
          ) : (
            <span className="text-success">
              Saved {formatJustNow(savedAt!)}
            </span>
          )}
        </div>
      )}

      {/* ── Body grid ────────────────────────────────────────────────── */}
      {/* Tab navigation lives in the middle admin sidebar — see
          `app/admin/tutorials/tutorials-sidebar.tsx`. This grid is just
          (content · video + readiness rail). */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-5 items-start">
        {/* ── LEFT: tab content ────────────────────────────────────── */}
        <section className="min-w-0 space-y-5">
          {activeTab === "metadata" ? (
            <MetadataTab
              title={title}                  setTitle={setTitle}
              description={description}      setDescription={setDescription}
              tags={tags}                    tagDraft={tagDraft}
              setTagDraft={setTagDraft}      addTag={addTag} removeTag={removeTag}
              visibility={visibility}        setVisibility={setVisibility}
              internalNotes={internalNotes}  setInternalNotes={setInternalNotes}
              planAccess={planAccess}        setPlanAccess={setPlanAccess}
              ctaLink={ctaLink}              setCtaLink={setCtaLink}
              category={category}            setCategory={setCategory}
              programId={programId}          setProgramId={setProgramId}
              programs={programs}
              TITLE_MAX={TITLE_MAX} DESC_MAX={DESC_MAX} NOTE_MAX={NOTE_MAX}
            />
          ) : activeTab === "thumbnail" ? (
            <ThumbnailTab
              coverImageUrl={lesson.coverImageUrl}
              videoUrl={lesson.videoUrl}
              durationSeconds={lesson.durationSeconds}
              durationLabel={stats.duration}
            />
          ) : (
            <PlaceholderTab tab={TABS.find((t) => t.key === activeTab)!} />
          )}
        </section>

        {/* ── RIGHT: video player + publishing readiness ───────────── */}
        <aside className="space-y-4 min-w-0">
          <VideoPreviewCard
            videoUrl={lesson.videoUrl}
            coverImageUrl={lesson.coverImageUrl}
            durationLabel={stats.duration}
          />
          <PublishingReadinessCard
            percent={readiness.percent}
            checks={readiness.checks}
            onAddChapters={() => setHasChapters(true)}
          />
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Small head-of-page stat (icon · value · label).
   ───────────────────────────────────────────────────────────────────────── */

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 min-w-0">
      <Icon className="size-4 text-ink-400 shrink-0" strokeWidth={1.9} />
      <span className="leading-tight">
        <span className="block text-ink-900 font-semibold tabular-nums truncate">
          {value}
        </span>
        <span className="block text-[11px] text-ink-500">{label}</span>
      </span>
    </span>
  );
}

function StatusPill({ published }: { published: boolean }) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-bg text-success border border-success/20 text-[12px] font-semibold">
        <span className="size-1.5 rounded-full bg-success" aria-hidden />
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[12px] font-semibold">
      <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
      Draft
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Metadata tab — the visible content in the screenshot.
   ───────────────────────────────────────────────────────────────────────── */

function MetadataTab(props: {
  title: string;                setTitle: (v: string) => void;
  description: string;          setDescription: (v: string) => void;
  tags: string[];               tagDraft: string;
  setTagDraft: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
  visibility: "public" | "private" | "unlisted";
  setVisibility: (v: "public" | "private" | "unlisted") => void;
  internalNotes: string;        setInternalNotes: (v: string) => void;
  planAccess: TutorialEditorData["planAccess"];
  setPlanAccess: (v: TutorialEditorData["planAccess"]) => void;
  ctaLink: string;              setCtaLink: (v: string) => void;
  category: string;             setCategory: (v: string) => void;
  programId: string;            setProgramId: (v: string) => void;
  programs: ProgramOption[];
  TITLE_MAX: number; DESC_MAX: number; NOTE_MAX: number;
}) {
  const {
    title, setTitle,
    description, setDescription,
    tags, tagDraft, setTagDraft, addTag, removeTag,
    visibility, setVisibility,
    internalNotes, setInternalNotes,
    planAccess, setPlanAccess,
    ctaLink, setCtaLink,
    category, setCategory,
    programId, setProgramId,
    programs,
    TITLE_MAX, DESC_MAX, NOTE_MAX,
  } = props;

  return (
    <>
      {/* Optimize for engagement tip */}
      <section className="card p-4 flex items-start gap-3 bg-rose-50/40 border-rose-100">
        <span
          className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0"
          aria-hidden
        >
          <Sparkles className="size-[18px]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-900">
            Optimize for engagement
          </div>
          <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
            Add chapters, a clear description, and a custom thumbnail to
            increase views and completion.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 inline-flex items-center justify-center h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-medium hover:bg-cream-100 transition-colors"
        >
          View tips
        </button>
      </section>

      {/* Main form card — fields stacked one per row inside grouped sections
          so the rhythm is predictable: each group has a small uppercase
          header, a hairline beneath, and a single column of fields. */}
      <section className="card p-5 sm:p-6">
        {/* ── Group 1 · Basics ────────────────────────────────────── */}
        <FormGroup title="Basics">
          <Field label="Title" required>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                maxLength={TITLE_MAX}
                placeholder="Mansa dance 2"
                className="w-full h-11 px-3.5 pr-16 rounded-[10px] bg-white border border-ink-200 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-ink-400 select-none">
                {title.length} / {TITLE_MAX}
              </span>
            </div>
          </Field>

          <Field label="Description" required>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                rows={5}
                maxLength={DESC_MAX}
                placeholder="A step-by-step breakdown of the routine, focusing on footwork, rhythm, and style…"
                className="w-full px-3.5 py-3 rounded-[10px] bg-white border border-ink-200 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors resize-y leading-relaxed"
              />
              <span className="absolute right-3 bottom-3 text-[11px] tabular-nums text-ink-400 select-none">
                {description.length} / {DESC_MAX}
              </span>
            </div>
          </Field>
        </FormGroup>

        {/* ── Group 2 · Discovery ─────────────────────────────────── */}
        <FormGroup title="Discovery">
          <Field label="Tags">
            <TagsInput
              tags={tags}
              draft={tagDraft}
              setDraft={setTagDraft}
              onAdd={addTag}
              onRemove={removeTag}
            />
            <HelpText>Press Enter or comma to add a tag.</HelpText>
          </Field>

          <Field label="Category">
            <SelectInput
              value={category}
              onChange={setCategory}
              options={[
                { value: "",         label: "Uncategorized" },
                { value: "growth",   label: "Growth"        },
                { value: "monetize", label: "Monetization"  },
                { value: "brand",    label: "Brand"         },
                { value: "content",  label: "Content"       },
                { value: "dance",    label: "Dance"         },
                { value: "fitness",  label: "Fitness"       },
              ]}
            />
          </Field>

          <Field label="Program">
            <SelectInput
              value={programId}
              onChange={setProgramId}
              options={[
                { value: "", label: "Standalone (no program)" },
                ...programs.map((p) => ({ value: p.id, label: p.title })),
              ]}
            />
            <HelpText>
              Attach this tutorial to a program so it appears in that
              program&apos;s curriculum.
            </HelpText>
          </Field>
        </FormGroup>

        {/* ── Group 3 · Visibility & access ───────────────────────── */}
        <FormGroup title="Visibility & access">
          <Field label="Visibility">
            <SelectInput
              value={visibility}
              onChange={(v) => setVisibility(v as "public" | "private" | "unlisted")}
              options={[
                { value: "public",    label: "Public" },
                { value: "unlisted",  label: "Unlisted" },
                { value: "private",   label: "Private" },
              ]}
            />
            <HelpText>
              {visibility === "public"
                ? "Visible to all users on the platform."
                : visibility === "unlisted"
                  ? "Reachable via direct link only — not listed."
                  : "Only members of the assigned program can view."}
            </HelpText>
          </Field>

          <Field label="Access tier">
            <SelectInput
              value={planAccess}
              onChange={(v) => setPlanAccess(v as TutorialEditorData["planAccess"])}
              options={[
                { value: "free",  label: ACCESS_LABELS.free  },
                { value: "basic", label: ACCESS_LABELS.basic },
                { value: "pro",   label: ACCESS_LABELS.pro   },
              ]}
            />
            <HelpText>{ACCESS_HELP[planAccess]}</HelpText>
          </Field>

          <Field label="CTA link">
            <input
              type="url"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="https://example.com/learn-more"
              className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
            />
            <HelpText>Optional: link to external resource or signup page.</HelpText>
          </Field>
        </FormGroup>

        {/* ── Group 4 · Internal ──────────────────────────────────── */}
        <FormGroup title="Internal" last>
          <Field label="Internal notes">
            <div className="relative">
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value.slice(0, NOTE_MAX))}
                rows={4}
                maxLength={NOTE_MAX}
                placeholder="Notes visible only to admins and collaborators…"
                className="w-full px-3.5 py-3 rounded-[10px] bg-white border border-ink-200 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors resize-y leading-relaxed"
              />
              <span className="absolute right-3 bottom-3 text-[11px] tabular-nums text-ink-400 select-none">
                {internalNotes.length} / {NOTE_MAX}
              </span>
            </div>
          </Field>
        </FormGroup>
      </section>
    </>
  );
}

/**
 * Section wrapper used inside the metadata form. Each group renders:
 *   - A small uppercase header with a hairline divider beneath.
 *   - Stacked children with consistent gap.
 *   - Bottom margin so adjacent groups breathe apart (suppressed for the
 *     final group with `last`).
 */
function FormGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("space-y-4", !last && "pb-6 mb-6 border-b border-ink-100")}>
      <header>
        <h3 className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-ink-500">
          {title}
        </h3>
      </header>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function PlaceholderTab({ tab }: { tab: Tab }) {
  const Icon = tab.icon;
  return (
    <section className="card p-10 text-center">
      <div className="mx-auto size-14 rounded-[14px] bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4">
        <Icon className="size-6" strokeWidth={1.8} />
      </div>
      <h2 className="text-h3 text-ink-900">{tab.label}</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
        This section is part of the tutorial workflow. Detailed editor coming
        next — for now the Metadata tab is fully wired.
      </p>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Form primitives
   ───────────────────────────────────────────────────────────────────────── */

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
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-semibold text-ink-900">
        {label}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] text-ink-500 leading-snug">{children}</p>;
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-11 pl-3.5 pr-9 rounded-[10px] bg-white border border-ink-200 text-[13.5px] text-ink-900 font-medium cursor-pointer focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
        strokeWidth={2}
      />
    </div>
  );
}

function TagsInput({
  tags,
  draft,
  setDraft,
  onAdd,
  onRemove,
}: {
  tags: string[];
  draft: string;
  setDraft: (v: string) => void;
  onAdd: () => void;
  onRemove: (t: string) => void;
}) {
  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAdd();
    }
    if (e.key === "Backspace" && !draft && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] px-2 py-1.5 rounded-[10px] bg-white border border-ink-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-colors">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 text-[12px] font-medium"
        >
          {t}
          <button
            type="button"
            onClick={() => onRemove(t)}
            aria-label={`Remove ${t}`}
            className="size-5 inline-flex items-center justify-center rounded-full hover:bg-rose-100 transition-colors"
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="flex-1 min-w-[80px] h-7 px-1 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
      <ChevronDown
        className="size-4 text-ink-400 mr-1 shrink-0"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right rail — video player (frontend-only controls)
   ───────────────────────────────────────────────────────────────────────── */

function VideoPreviewCard({
  videoUrl,
  coverImageUrl,
  durationLabel,
}: {
  videoUrl: string | null;
  coverImageUrl: string | null;
  durationLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => undefined);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  }

  function onLoadedMetadata() {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
  }

  return (
    <section className="card overflow-hidden">
      {/* Video / poster surface */}
      <div className="relative aspect-video bg-ink-900 group">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={coverImageUrl ?? undefined}
            preload="metadata"
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt="Tutorial cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-cream-100/60 text-[12px]">
            No video uploaded yet
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="size-8 rounded-full bg-white/90 hover:bg-white inline-flex items-center justify-center text-ink-900 transition-colors"
            >
              {playing ? (
                <Pause className="size-3.5" strokeWidth={2.5} fill="currentColor" />
              ) : (
                <Play className="size-3.5 ml-0.5" strokeWidth={2.5} fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              aria-label="Volume"
              className="size-8 rounded-full hover:bg-white/15 inline-flex items-center justify-center text-white transition-colors"
            >
              <Volume2 className="size-4" strokeWidth={2} />
            </button>
            <span className="text-[11px] tabular-nums text-white/90 font-medium">
              {formatVideoTime(currentTime)} / {duration ? formatVideoTime(duration) : durationLabel}
            </span>
            <div
              className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div className="h-full bg-rose-500" style={{ width: `${progress}%` }} />
            </div>
            <button
              type="button"
              aria-label="Mute"
              className="size-8 rounded-full hover:bg-white/15 inline-flex items-center justify-center text-white transition-colors"
            >
              <Volume2 className="size-4" strokeWidth={2} />
            </button>
            <span className="px-1.5 h-6 inline-flex items-center text-[11px] font-semibold text-white/90 rounded-full bg-white/15">
              1x
            </span>
            <button
              type="button"
              aria-label="Settings"
              className="size-8 rounded-full hover:bg-white/15 inline-flex items-center justify-center text-white transition-colors"
            >
              <Settings className="size-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Fullscreen"
              className="size-8 rounded-full hover:bg-white/15 inline-flex items-center justify-center text-white transition-colors"
            >
              <Maximize2 className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right rail — publishing readiness (donut + checklist + CTA)
   ───────────────────────────────────────────────────────────────────────── */

function PublishingReadinessCard({
  percent,
  checks,
  onAddChapters,
}: {
  percent: number;
  checks: { key: string; label: string; done: boolean }[];
  onAddChapters: () => void;
}) {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900">Publishing readiness</h3>
        <ListChecks className="size-4 text-rose-500" strokeWidth={2} aria-hidden />
      </header>

      <div className="flex items-center gap-5">
        <div className="shrink-0">
          <Donut percent={percent} size={112} strokeWidth={10}>
            <span className="block text-[20px] font-bold text-ink-900 leading-none tabular-nums">
              {percent}%
            </span>
            <span className="block text-[11px] text-ink-500 mt-1">Complete</span>
          </Donut>
        </div>

        <ul className="flex-1 min-w-0 space-y-2">
          {checks.map((c) => (
            <li key={c.key} className="flex items-center gap-2 text-[12.5px]">
              {c.done ? (
                <CheckCircle2
                  className="size-4 text-success shrink-0"
                  strokeWidth={2}
                />
              ) : (
                <CircleDashed
                  className="size-4 text-amber-500 shrink-0"
                  strokeWidth={2}
                />
              )}
              <span className={cn(
                "truncate",
                c.done ? "text-ink-900" : "text-ink-700",
              )}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {!checks.find((c) => c.key === "chapters")?.done && (
        <div className="mt-5 pt-4 border-t border-ink-100 flex items-start gap-3 flex-wrap">
          <p className="text-[12.5px] text-ink-500 leading-snug flex-1 min-w-0">
            Add chapters to boost completion and discoverability.
          </p>
          <button
            type="button"
            onClick={onAddChapters}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-100 transition-colors shrink-0"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Add chapters
          </button>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatVideoTime(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) return "00:00";
  return formatDuration(seconds);
}

function formatUploadedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year:  "numeric",
      month: "short",
      day:   "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatJustNow(d: Date): string {
  const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (diff < 5)   return "just now";
  if (diff < 60)  return `${Math.round(diff)}s ago`;
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

