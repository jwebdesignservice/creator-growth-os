"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Target,
  Puzzle,
  FileText,
  Pencil,
  BarChart3,
  Tag,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  Plus,
  X,
  Check,
  Route as RouteIcon,
  GraduationCap,
  Folder,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Local types — the Overview tab renders entirely from real lesson data
   passed down by the editor (description, difficulty, category, runtime)
   plus live counts for the connected components (chapters, drill,
   resources). No mock data.
   ───────────────────────────────────────────────────────────────────────── */

type ComponentStatus = "Ready" | "Draft" | "Empty";
type LessonComponentKey = "lesson-path" | "creator-drill" | "resources";

type LessonComponentRow = {
  key:    LessonComponentKey;
  label:  string;
  hint:   string;
  status: ComponentStatus;
  tab:    "lesson-path" | "creator-drill" | "resources";
};

type AtAGlanceStat = {
  key:   "creator-drill" | "resources" | "runtime";
  value: string;
  label: string;
};

/* Slug → display label for the metadata category select. Kept in sync with
   the options in <MetadataTab> (tutorial-editor.tsx). */
const CATEGORY_LABEL: Record<string, string> = {
  "":       "Uncategorized",
  growth:   "Growth",
  monetize: "Monetization",
  brand:    "Brand",
  content:  "Content",
  dance:    "Dance",
  fitness:  "Fitness",
};

function titleCase(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/* Build the three "connected components" rows from live counts so each
   card reflects the tutorial's real state (Ready when it has content,
   Empty otherwise). */
function buildComponents(
  chapterCount: number,
  hasDrill: boolean,
  resourceCount: number,
): LessonComponentRow[] {
  return [
    {
      key:    "lesson-path",
      label:  "Lesson path",
      hint:   chapterCount > 0
        ? `${chapterCount} connected step${chapterCount === 1 ? "" : "s"}`
        : "No steps yet",
      status: chapterCount > 0 ? "Ready" : "Empty",
      tab:    "lesson-path",
    },
    {
      key:    "creator-drill",
      label:  "Creator drill",
      hint:   hasDrill ? "1 practical task" : "No drill yet",
      status: hasDrill ? "Ready" : "Empty",
      tab:    "creator-drill",
    },
    {
      key:    "resources",
      label:  "Resources",
      hint:   resourceCount > 0
        ? `${resourceCount} file${resourceCount === 1 ? "" : "s"} attached`
        : "No resources yet",
      status: resourceCount > 0 ? "Ready" : "Empty",
      tab:    "resources",
    },
  ];
}

/* ─────────────────────────────────────────────────────────────────────────
   Visual maps — keep per-status pill colors + per-component icons in one
   place so the table-of-three card and the connected components card
   stay in sync if the data shape grows.
   ───────────────────────────────────────────────────────────────────────── */

const STATUS_PILL: Record<ComponentStatus, string> = {
  Ready: "bg-success-bg text-success border border-success/20",
  Draft: "bg-amber-100 text-amber-700 border border-amber-200",
  Empty: "bg-ink-100 text-ink-600 border border-ink-200",
};

const COMPONENT_ICON: Record<LessonComponentRow["key"], LucideIcon> = {
  "lesson-path":   RouteIcon,
  "creator-drill": GraduationCap,
  "resources":     Folder,
};

const AT_A_GLANCE_ICON: Record<AtAGlanceStat["key"], LucideIcon> = {
  "creator-drill": GraduationCap,
  "resources":     Folder,
  "runtime":       Clock,
};

/* ─────────────────────────────────────────────────────────────────────────
   Root — 4 cards stacked top-to-bottom, exactly matching the mockup.
   Outcomes + publishing notes are now controlled by the editor parent
   so a single "Save changes" persists them via `updateLesson`.
   ───────────────────────────────────────────────────────────────────────── */

export function OverviewTab({
  tutorialId,
  description,
  skillLevel,
  category,
  runtimeLabel,
  chapterCount,
  hasDrill,
  resourceCount,
  learningOutcomes,
  setLearningOutcomes,
  publishingNotes,
  setPublishingNotes,
}: {
  tutorialId: string;
  description: string;
  skillLevel: string;
  category: string;
  runtimeLabel: string;
  chapterCount: number;
  hasDrill: boolean;
  resourceCount: number;
  learningOutcomes: string[];
  setLearningOutcomes: (v: string[]) => void;
  publishingNotes: string;
  setPublishingNotes: (v: string) => void;
}) {
  const components = buildComponents(chapterCount, hasDrill, resourceCount);
  return (
    <>
      <LessonOverviewCard
        description={description}
        skillLevel={skillLevel}
        category={category}
        runtimeLabel={runtimeLabel}
      />
      <LearningOutcomesCard
        outcomes={learningOutcomes}
        onChange={setLearningOutcomes}
      />
      <ConnectedComponentsCard
        components={components}
        tutorialId={tutorialId}
      />
      <PublishingNotesCard
        note={publishingNotes}
        onChange={setPublishingNotes}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Card 1 · Lesson overview
   ───────────────────────────────────────────────────────────────────────── */

function LessonOverviewCard({
  description,
  skillLevel,
  category,
  runtimeLabel,
}: {
  description: string;
  skillLevel: string;
  category: string;
  runtimeLabel: string;
}) {
  const categoryLabel = CATEGORY_LABEL[category] ?? titleCase(category) ?? "Uncategorized";
  const skill = skillLevel ? titleCase(skillLevel) : "Not set";
  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        icon={BookOpen}
        title="Lesson overview"
        action={
          <CardLinkButton
            icon={Pencil}
            label="Edit overview"
            href="?tab=metadata"
          />
        }
      />
      {description.trim().length > 0 ? (
        <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      ) : (
        <EmptyState
          title="No description yet"
          body="Add a description in Metadata so learners know what this lesson covers."
        />
      )}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile icon={BarChart3} label="Skill level"     value={skill}         />
        <StatTile icon={Tag}       label="Category"        value={categoryLabel} />
        <StatTile icon={Clock}     label="Est. completion" value={runtimeLabel}  />
      </div>
    </section>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[12px] border border-ink-100 bg-cream-100/60 px-3.5 py-3 flex items-center gap-3 min-w-0">
      <span
        aria-hidden
        className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0"
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-ink-500 truncate">
          {label}
        </div>
        <div className="text-[14px] font-bold text-ink-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Card 2 · What learners will get
   Editable in-place. Outcomes live in editor state, so Done lifts the
   cleaned array up — the editor's Save button persists it.
   ───────────────────────────────────────────────────────────────────────── */

function LearningOutcomesCard({
  outcomes,
  onChange,
}: {
  outcomes: string[];
  onChange: (v: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(outcomes);

  function startEdit() {
    setDraft(outcomes.length > 0 ? outcomes : [""]);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
  }
  function saveEdit() {
    const cleaned = draft.map((s) => s.trim()).filter((s) => s.length > 0);
    onChange(cleaned);
    setEditing(false);
  }
  function updateRow(i: number, v: string) {
    setDraft(draft.map((s, idx) => (idx === i ? v : s)));
  }
  function removeRow(i: number) {
    setDraft(draft.filter((_, idx) => idx !== i));
  }
  function addRow() {
    setDraft([...draft, ""]);
  }

  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        icon={Target}
        title="What learners will get"
        action={
          editing ? (
            <span className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[12.5px] font-medium hover:bg-cream-100 transition-colors shrink-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-100 transition-colors shrink-0"
              >
                <Check className="size-3.5" strokeWidth={2.4} />
                Done
              </button>
            </span>
          ) : (
            <CardActionButton
              icon={Pencil}
              label={outcomes.length > 0 ? "Edit outcomes" : "Add outcomes"}
              onClick={startEdit}
            />
          )
        }
      />

      {editing ? (
        <div className="space-y-2">
          {draft.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-[18px] rounded-full bg-success-bg text-success inline-flex items-center justify-center shrink-0"
              >
                <CheckCircle2 className="size-[14px]" strokeWidth={2.4} />
              </span>
              <input
                type="text"
                value={row}
                onChange={(e) => updateRow(i, e.target.value)}
                placeholder="What will the learner walk away with?"
                maxLength={200}
                className="flex-1 min-w-0 h-9 px-3 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove outcome"
                className="inline-flex items-center justify-center size-9 rounded-[10px] bg-white border border-ink-200 text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors shrink-0"
              >
                <X className="size-3.5" strokeWidth={2.2} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            disabled={draft.length >= 20}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="size-3.5" strokeWidth={2.4} />
            Add outcome
          </button>
          <p className="text-[11px] text-ink-500 pt-1">
            Keep each line short, action-led, and learner-focused.
          </p>
        </div>
      ) : outcomes.length > 0 ? (
        <ul className="space-y-2.5">
          {outcomes.map((o, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[13.5px] text-ink-800"
            >
              <CheckCircle2
                className="size-[18px] text-success shrink-0 mt-px"
                strokeWidth={2.2}
                aria-hidden
              />
              <span className="leading-snug">{o}</span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No outcomes yet"
          body="Add 3–5 outcomes so learners know exactly what they'll walk away with."
        />
      )}

      {!editing && outcomes.length > 0 && (
        <div className="mt-4 flex justify-end">
          <span className="inline-flex items-center px-2.5 h-[24px] rounded-full bg-cream-200 text-ink-700 text-[11.5px] font-semibold whitespace-nowrap">
            {outcomes.length} learning outcome{outcomes.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Card 3 · Connected lesson components
   ───────────────────────────────────────────────────────────────────────── */

function ConnectedComponentsCard({
  components,
  tutorialId,
}: {
  components: LessonComponentRow[];
  tutorialId: string;
}) {
  const sp = useSearchParams();

  function hrefForTab(tab: LessonComponentRow["tab"]): string {
    const params = new URLSearchParams(sp?.toString());
    params.set("tab", tab);
    return `/admin/tutorials/${tutorialId}?${params.toString()}`;
  }

  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader icon={Puzzle} title="Connected lesson components" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {components.map((c) => {
          const Icon = COMPONENT_ICON[c.key];
          return (
            <div
              key={c.key}
              className="rounded-[12px] border border-ink-100 bg-cream-100/60 p-3.5 flex flex-col min-w-0"
            >
              <div className="flex items-start gap-3 mb-3 min-w-0">
                <span
                  aria-hidden
                  className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0"
                >
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-ink-500">
                    {c.label}
                  </div>
                  <div className="text-[13px] font-semibold text-ink-900 truncate">
                    {c.hint}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center px-2 h-[22px] rounded-[6px] text-[11px] font-semibold whitespace-nowrap shrink-0",
                    STATUS_PILL[c.status],
                  )}
                >
                  {c.status}
                </span>
              </div>
              <Link
                href={hrefForTab(c.tab)}
                className="mt-auto inline-flex items-center justify-between gap-1.5 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-semibold hover:bg-cream-100 transition-colors"
              >
                Open
                <ChevronRight
                  className="size-3.5 text-ink-500"
                  strokeWidth={2.2}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Card 4 · Publishing notes (internal)
   Editable in-place — click "Edit notes" → textarea → Done lifts up to
   parent state so the editor's Save persists it.
   ───────────────────────────────────────────────────────────────────────── */

function PublishingNotesCard({
  note,
  onChange,
}: {
  note: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  function startEdit() {
    setDraft(note);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
  }
  function saveEdit() {
    onChange(draft.trim());
    setEditing(false);
  }

  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        icon={FileText}
        title="Publishing notes (internal)"
        action={
          editing ? (
            <span className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[12.5px] font-medium hover:bg-cream-100 transition-colors shrink-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-100 transition-colors shrink-0"
              >
                <Check className="size-3.5" strokeWidth={2.4} />
                Done
              </button>
            </span>
          ) : (
            <CardActionButton
              icon={Pencil}
              label={note.length > 0 ? "Edit notes" : "Add notes"}
              onClick={startEdit}
            />
          )
        }
      />

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="Add any context the team should know before this lesson goes live…"
            className="w-full min-h-[120px] p-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-colors resize-y"
          />
          <div className="flex items-center justify-between text-[11.5px] text-ink-500">
            <span>Internal notes are visible to admins only.</span>
            <span className="tabular-nums">{draft.length}/4000</span>
          </div>
        </div>
      ) : note.length > 0 ? (
        <>
          <p className="text-[13.5px] text-ink-700 leading-relaxed whitespace-pre-wrap">
            {note}
          </p>
          <footer className="mt-4 pt-3 border-t border-ink-100 inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
            <Lock className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
            Internal notes are visible to admins only.
          </footer>
        </>
      ) : (
        <EmptyState
          title="No internal notes yet"
          body="Add context the team should know before this lesson goes live."
        />
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right rail — At a glance (3 count tiles + practice tip).
   Exported so the editor's right rail can render it next to the existing
   video + publishing readiness cards when the Overview tab is active.
   ───────────────────────────────────────────────────────────────────────── */

export function AtAGlanceCard({
  hasDrill,
  resourceCount,
  runtimeLabel,
}: {
  hasDrill: boolean;
  resourceCount: number;
  runtimeLabel: string;
}) {
  const stats: AtAGlanceStat[] = [
    { key: "creator-drill", value: hasDrill ? "1" : "0",     label: "Creator drill" },
    { key: "resources",     value: String(resourceCount),    label: "Resources"     },
    { key: "runtime",       value: runtimeLabel,             label: "Runtime"       },
  ];
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900">At a glance</h3>
      </header>
      <ul className="grid grid-cols-3 gap-3 mb-4">
        {stats.map((s) => {
          const Icon = AT_A_GLANCE_ICON[s.key];
          return (
            <li
              key={s.key}
              className="rounded-[12px] border border-ink-100 bg-cream-100/60 px-2 py-3 text-center min-w-0"
            >
              <div className="mx-auto mb-1.5 inline-flex items-center justify-center size-9 rounded-[10px] bg-rose-50 text-rose-600">
                <Icon className="size-4" strokeWidth={2} />
              </div>
              <div className="text-[16px] font-bold text-ink-900 leading-none tabular-nums truncate">
                {s.value}
              </div>
              <div className="mt-1 text-[10.5px] text-ink-500 leading-snug truncate">
                {s.label}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-start gap-2 pt-3 border-t border-ink-100">
        <LightbulbDot />
        <p className="text-[12px] text-ink-700 leading-snug">
          <span className="font-semibold text-ink-900">Tip:</span> Short
          lessons with a clear action step get the highest completion rates.
        </p>
      </div>
    </section>
  );
}

function LightbulbDot() {
  return (
    <span
      aria-hidden
      className="size-5 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center shrink-0 mt-px"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.6V17h8v-2.4A7 7 0 0 0 12 2Z" />
      </svg>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Shared primitives
   ───────────────────────────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden
          className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0"
        >
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
        <h2 className="font-display text-[20px] sm:text-[22px] text-ink-900 leading-tight truncate">
          {title}
        </h2>
      </div>
      {action}
    </header>
  );
}

function CardActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-medium hover:bg-cream-100 transition-colors shrink-0"
    >
      <Icon className="size-3.5 text-ink-500" strokeWidth={2} />
      {label}
    </button>
  );
}

function CardLinkButton({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-medium hover:bg-cream-100 transition-colors shrink-0"
    >
      <Icon className="size-3.5 text-ink-500" strokeWidth={2} />
      {label}
    </Link>
  );
}

function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[12px] border border-dashed border-ink-200 bg-cream-100/40 p-5 text-center">
      <div className="text-[13.5px] font-semibold text-ink-900">{title}</div>
      <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">{body}</p>
    </div>
  );
}
