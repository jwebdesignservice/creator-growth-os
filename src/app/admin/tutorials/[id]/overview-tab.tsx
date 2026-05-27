"use client";

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
  Route as RouteIcon,
  GraduationCap,
  Folder,
  type LucideIcon,
} from "lucide-react";
import {
  LESSON_OVERVIEW,
  LEARNING_OUTCOMES,
  LESSON_COMPONENTS,
  PUBLISHING_NOTE,
  AT_A_GLANCE,
  type AtAGlanceStat,
  type ComponentStatus,
  type LessonComponentRow,
} from "./overview-mock";
import { cn } from "@/lib/cn";

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
   ───────────────────────────────────────────────────────────────────────── */

export function OverviewTab({ tutorialId }: { tutorialId: string }) {
  return (
    <>
      <LessonOverviewCard />
      <LearningOutcomesCard outcomes={LEARNING_OUTCOMES} />
      <ConnectedComponentsCard
        components={LESSON_COMPONENTS}
        tutorialId={tutorialId}
      />
      <PublishingNotesCard note={PUBLISHING_NOTE} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Card 1 · Lesson overview
   ───────────────────────────────────────────────────────────────────────── */

function LessonOverviewCard() {
  const ov = LESSON_OVERVIEW;
  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        icon={BookOpen}
        title="Lesson overview"
        action={<CardActionButton icon={Pencil} label="Edit overview" />}
      />
      <p className="text-[13.5px] text-ink-700 leading-relaxed">
        {ov.description}
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile icon={BarChart3} label="Skill level"     value={ov.skillLevel}    />
        <StatTile icon={Tag}       label="Category"        value={ov.category}      />
        <StatTile icon={Clock}     label="Est. completion" value={ov.estCompletion} />
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
   ───────────────────────────────────────────────────────────────────────── */

function LearningOutcomesCard({ outcomes }: { outcomes: string[] }) {
  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader icon={Target} title="What learners will get" />
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
      <div className="mt-4 flex justify-end">
        <span className="inline-flex items-center px-2.5 h-[24px] rounded-full bg-cream-200 text-ink-700 text-[11.5px] font-semibold whitespace-nowrap">
          {outcomes.length} learning outcome{outcomes.length === 1 ? "" : "s"}
        </span>
      </div>
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
   ───────────────────────────────────────────────────────────────────────── */

function PublishingNotesCard({ note }: { note: string }) {
  return (
    <section className="card p-5 sm:p-6">
      <SectionHeader
        icon={FileText}
        title="Publishing notes (internal)"
        action={<CardActionButton icon={Pencil} label="Edit notes" />}
      />
      <p className="text-[13.5px] text-ink-700 leading-relaxed">
        {note}
      </p>
      <footer className="mt-4 pt-3 border-t border-ink-100 inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
        <Lock className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
        Internal notes are visible to admins only.
      </footer>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right rail — At a glance (3 count tiles + practice tip).
   Exported so the editor's right rail can render it next to the existing
   video + publishing readiness cards when the Overview tab is active.
   ───────────────────────────────────────────────────────────────────────── */

export function AtAGlanceCard() {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900">At a glance</h3>
      </header>
      <ul className="grid grid-cols-3 gap-3 mb-4">
        {AT_A_GLANCE.map((s) => {
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
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[12.5px] font-medium hover:bg-cream-100 transition-colors shrink-0"
    >
      <Icon className="size-3.5 text-ink-500" strokeWidth={2} />
      {label}
    </button>
  );
}
