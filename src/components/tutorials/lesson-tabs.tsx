"use client";

import Link from "next/link";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  FileText,
  FileSpreadsheet,
  Files,
  Library,
  ChevronRight,
  Lightbulb,
  Pencil,
  Hand,
  Monitor,
  Target,
  Flag,
  Square,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  Play,
  type LucideIcon,
} from "lucide-react";
import { LessonNotes } from "@/components/notes/lesson-notes";
import type { ProgramNote } from "@/lib/programs/queries";
import type { LessonTabKey } from "./lesson-tab-defs";

/**
 * Tabbed detail panel for the lesson player (Loom-inspired).
 *
 * Replaces the old 6-card grid below the video with a single organized
 * panel: a horizontal tab bar (underline indicator) over four sections —
 * Overview, Lesson Path, Resources, and Notes. Keeps the page calmer and
 * gives the user one clear place to look for each thing.
 */

type Chapter = {
  id: string;
  title: string;
  type: string;
  durationMinutes: number;
  iconKey: string;
  /** Set on "video" steps that point at another tutorial. */
  linkedLessonId?: string | null;
  /** Resolved navigation target (published videos only) — null/absent when
   *  the target is unpublished, deleted, or this isn't a video step. */
  linked?: { id: string; slug: string; title: string } | null;
  /** True when the learner already completed the linked video. */
  linkedCompleted?: boolean;
};

/** A real uploaded file / external link attached to this lesson. */
export type LessonResourceItem = {
  id: string;
  kind: "file" | "link";
  title: string;
  url: string;
  ext: string;
  sizeBytes: number | null;
};

type Props = {
  description: string | null;
  chapters: Chapter[];
  resources: LessonResourceItem[];
  notes: ProgramNote[];
  lessonSlug: string;
  lessonTitle: string;
  /** Humanized lesson length, e.g. "4 min". */
  durationLabel: string;
  difficulty: string;
  /** The lesson the learner should continue to (authored path first). */
  upNext: { slug: string; title: string } | null;
};

/**
 * Renders the active lesson section. The tab navigation itself lives in the
 * page's left rail (WorkspaceShell); this just shows the chosen panel.
 */
export function LessonContent({
  active,
  description,
  chapters,
  resources,
  notes,
  lessonSlug,
  lessonTitle,
  durationLabel,
  difficulty,
  upNext,
}: Props & { active: LessonTabKey }) {
  if (active === "overview")
    return (
      <OverviewPanel
        description={description}
        chapters={chapters}
        resources={resources}
        durationLabel={durationLabel}
        difficulty={difficulty}
        upNext={upNext}
        lessonSlug={lessonSlug}
      />
    );
  if (active === "path") return <PathPanel chapters={chapters} />;
  if (active === "resources") return <ResourcesPanel resources={resources} />;
  return (
    <LessonNotes
      notes={notes}
      lessonSlug={lessonSlug}
      lessonTitle={lessonTitle}
    />
  );
}

/* ─── Overview (summary + what's covered + up next + resources preview) ── */

function OverviewPanel({
  description,
  chapters,
  resources,
  durationLabel,
  difficulty,
  upNext,
  lessonSlug,
}: {
  description: string | null;
  chapters: Chapter[];
  resources: LessonResourceItem[];
  durationLabel: string;
  difficulty: string;
  upNext: { slug: string; title: string } | null;
  lessonSlug: string;
}) {
  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Play, label: "Format", value: "Video lesson" },
    { icon: Target, label: "Level", value: difficulty },
    { icon: Clock, label: "Length", value: durationLabel },
    ...(chapters.length > 0
      ? [
          {
            icon: CalendarDays,
            label: "Path",
            value: `${chapters.length} step${chapters.length === 1 ? "" : "s"}`,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
      {/* Main column — about + what's covered */}
      <div className="space-y-5">
        <section className="card rounded-[16px] p-5 sm:p-6">
          <h3 className="text-[14px] font-semibold text-ink-900 mb-2">
            About this lesson
          </h3>
          <p className="text-[13.5px] text-ink-600 leading-relaxed max-w-2xl">
            {description ??
              "A short, focused lesson. Watch the video, then use the actions below the player to take a note or continue to the next step."}
          </p>

          {/* At-a-glance facts — quiet divider row, no chip noise */}
          <dl className="mt-5 pt-4 border-t border-ink-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 min-w-0">
                <span className="size-8 rounded-[9px] bg-gradient-to-br from-cream-100 to-cream-200 text-ink-500 ring-1 ring-ink-100/80 inline-flex items-center justify-center shrink-0">
                  <f.icon className="size-4" strokeWidth={1.9} aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                    {f.label}
                  </dt>
                  <dd className="text-[12.5px] font-semibold text-ink-900 truncate">
                    {f.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* What's covered — the REAL authored path, previewed (no fabricated
            takeaways; lessons without a path simply skip this section). */}
        {chapters.length > 0 && (
          <section className="card rounded-[16px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-[14px] font-semibold text-ink-900">
                What&apos;s covered
              </h3>
              <Link
                href={`/tutorials/${lessonSlug}?tab=path`}
                className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-rose-600 hover:text-rose-700 transition-colors shrink-0"
              >
                View lesson path
                <ChevronRight className="size-3.5" strokeWidth={2.5} aria-hidden />
              </Link>
            </div>
            <ul className="space-y-2">
              {chapters.slice(0, 5).map((c, i) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2.5 text-[13px] text-ink-700"
                >
                  <span className="size-5 rounded-full bg-rose-50 text-rose-600 inline-flex items-center justify-center text-[10.5px] font-bold tabular-nums shrink-0">
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate">{c.title}</span>
                  {c.linkedCompleted && (
                    <CheckCircle2
                      className="size-3.5 text-success shrink-0"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                </li>
              ))}
              {chapters.length > 5 && (
                <li className="text-[12px] text-ink-400 pl-[30px]">
                  +{chapters.length - 5} more step
                  {chapters.length - 5 === 1 ? "" : "s"}
                </li>
              )}
            </ul>
          </section>
        )}
      </div>

      {/* Side column — continue + resources shortcuts */}
      <div className="space-y-4 min-w-0">
        {upNext && (
          <Link
            href={`/tutorials/${upNext.slug}`}
            className="group block card rounded-[16px] p-4 transition-all duration-200 hover:border-rose-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-20px_rgba(26,24,22,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2"
          >
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-rose-600 mb-1.5">
              Up next
            </div>
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-[10px] bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_6px_14px_-6px_rgba(185,72,92,0.6)] inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Play className="size-3.5 ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden />
              </span>
              <span className="flex-1 min-w-0 text-[13px] font-semibold text-ink-900 leading-snug line-clamp-2 group-hover:text-rose-700 transition-colors">
                {upNext.title}
              </span>
              <ChevronRight
                className="size-4 text-ink-300 shrink-0 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </Link>
        )}

        {resources.length > 0 && (
          <div className="card rounded-[16px] p-4">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="text-[12.5px] font-semibold text-ink-900">
                Resources
              </div>
              <span className="text-[11px] text-ink-400 tabular-nums">
                {resources.length}
              </span>
            </div>
            <ul className="space-y-1">
              {resources.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-[9px] px-2 py-1.5 -mx-2 hover:bg-cream-100 transition-colors"
                  >
                    <span className="size-7 rounded-[8px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                      <FileText className="size-3.5" strokeWidth={1.9} aria-hidden />
                    </span>
                    <span className="flex-1 min-w-0 text-[12.5px] font-medium text-ink-700 truncate group-hover:text-ink-900 transition-colors">
                      {r.title}
                    </span>
                    {r.kind === "link" && (
                      <ExternalLink className="size-3 text-ink-300 shrink-0" strokeWidth={2} aria-hidden />
                    )}
                  </a>
                </li>
              ))}
            </ul>
            {resources.length > 3 && (
              <Link
                href={`/tutorials/${lessonSlug}?tab=resources`}
                className="mt-1.5 inline-flex items-center gap-0.5 text-[12px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                All resources
                <ChevronRight className="size-3.5" strokeWidth={2.5} aria-hidden />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Lesson path (admin-authored chapters) ────────────────────────────── */

const CHAPTER_ICONS: Record<string, LucideIcon> = {
  hand:      Hand,
  lightbulb: Lightbulb,
  monitor:   Monitor,
  pencil:    Pencil,
  target:    Target,
  flag:      Flag,
  square:    Square,
  play:      Play,
};

const CHAPTER_TYPE_LABEL: Record<string, string> = {
  intro:      "Intro",
  lesson:     "Lesson",
  activity:   "Activity",
  closing:    "Closing",
  checkpoint: "Checkpoint",
  video:      "Video",
};

function PathPanel({ chapters }: { chapters: Chapter[] }) {
  if (chapters.length === 0) {
    return (
      <div className="card rounded-[16px] px-5 py-12 flex flex-col items-center justify-center text-center">
        <span className="size-11 rounded-full bg-cream-100 text-ink-400 inline-flex items-center justify-center mb-3">
          <CalendarDays className="size-5" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="text-[13.5px] font-semibold text-ink-900">
          No lesson path yet
        </div>
        <p className="text-[12.5px] text-ink-500 mt-0.5 max-w-sm">
          This tutorial hasn&apos;t been broken into steps yet — just watch the
          video above and continue when you&apos;re ready.
        </p>
      </div>
    );
  }

  const totalDuration = chapters.reduce(
    (sum, c) => sum + (c.durationMinutes || 0),
    0,
  );
  // Real progress over the navigable (linked video) steps.
  const linkedSteps = chapters.filter((c) => c.type === "video" && c.linked);
  const watched = linkedSteps.filter((c) => c.linkedCompleted).length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between gap-3 mb-2">
        <div className="text-[14px] font-semibold text-ink-900">
          Lesson path
        </div>
        <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
          {chapters.length} step{chapters.length === 1 ? "" : "s"} · ~
          {totalDuration} min
        </span>
      </div>

      {/* Progress — only meaningful when the path links real videos */}
      {linkedSteps.length > 0 && (
        <div className="mb-4">
          <div
            className="h-1.5 rounded-full bg-cream-200 ring-1 ring-inset ring-ink-900/[0.04] overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={linkedSteps.length}
            aria-valuenow={watched}
            aria-label="Lesson path progress"
          >
            <div
              className="anim-bar-sweep h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
              style={{ width: `${Math.round((watched / linkedSteps.length) * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-ink-500 tabular-nums">
            <span>
              {watched} of {linkedSteps.length} video
              {linkedSteps.length === 1 ? "" : "s"} watched
            </span>
            <span className="font-semibold text-ink-700">
              {Math.round((watched / linkedSteps.length) * 100)}%
            </span>
          </div>
        </div>
      )}
      <ul className="space-y-1.5">
        {chapters.map((c, i) => {
          const Icon = CHAPTER_ICONS[c.iconKey] ?? Square;
          const linked = c.type === "video" ? (c.linked ?? null) : null;
          const done = !!linked && !!c.linkedCompleted;
          // "Up next" = the first linked video the learner hasn't seen yet;
          // when everything is watched no step claims the badge.
          const isUpNext =
            !!linked &&
            chapters.findIndex(
              (x) => x.type === "video" && x.linked && !x.linkedCompleted,
            ) === i;

          // Linked video step → a navigable card that sends the learner to
          // the next tutorial in the authored path.
          if (linked) {
            return (
              <li key={c.id}>
                <Link
                  href={`/tutorials/${linked.slug}?tab=path`}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-rose-200 bg-rose-50/40 transition-all duration-150 hover:bg-rose-50 hover:border-rose-300 hover:-translate-y-px hover:shadow-[0_8px_18px_-12px_rgba(185,72,92,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1"
                >
                  <span className="size-6 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0">
                    {i + 1}
                  </span>
                  <span
                    className={
                      done
                        ? "size-8 rounded-[9px] bg-success/15 text-success inline-flex items-center justify-center shrink-0"
                        : "size-8 rounded-[9px] bg-rose-600 text-white inline-flex items-center justify-center shrink-0"
                    }
                  >
                    {done ? (
                      <CheckCircle2 className="size-4" strokeWidth={2.2} aria-hidden />
                    ) : (
                      <Play
                        className="size-3.5"
                        fill="currentColor"
                        strokeWidth={0}
                        aria-hidden
                      />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900 truncate transition-colors group-hover:text-rose-700">
                      {c.title}
                    </div>
                    <div className="text-[11px] text-ink-500 tabular-nums">
                      Video · ~{c.durationMinutes} min
                      {done ? " · Completed" : ""}
                    </div>
                  </div>
                  {isUpNext && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white bg-rose-600 rounded-full px-2 py-0.5 shrink-0">
                      Up next
                    </span>
                  )}
                  <span
                    className={
                      done
                        ? "inline-flex items-center gap-0.5 text-[12px] font-semibold text-ink-500 shrink-0"
                        : "inline-flex items-center gap-0.5 text-[12px] font-semibold text-rose-600 shrink-0"
                    }
                  >
                    {done ? "Rewatch" : "Watch"}
                    <ChevronRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li
              key={c.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-ink-100 bg-white"
            >
              <span className="size-6 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0">
                {i + 1}
              </span>
              <span className="size-8 rounded-[9px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Icon className="size-4" strokeWidth={1.9} aria-hidden />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-ink-900 truncate">
                  {c.title}
                </div>
                <div className="text-[11px] text-ink-500">
                  {CHAPTER_TYPE_LABEL[c.type] ?? c.type}
                </div>
              </div>
              <span className="text-[11px] text-ink-500 tabular-nums shrink-0">
                ~{c.durationMinutes} min
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Resources & templates ────────────────────────────────────────────── */

const RESOURCE_EXT_META: Record<string, { label: string; icon: LucideIcon }> = {
  pdf:  { label: "PDF",         icon: FileText        },
  docx: { label: "Document",    icon: FileText        },
  xlsx: { label: "Spreadsheet", icon: FileSpreadsheet },
  png:  { label: "Image",       icon: ImageIcon       },
  jpg:  { label: "Image",       icon: ImageIcon       },
  zip:  { label: "Archive",     icon: Files           },
  link: { label: "Link",        icon: Link2           },
  file: { label: "File",        icon: FileText        },
};

function formatBytes(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${i === 0 || v >= 10 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

function ResourcesPanel({ resources }: { resources: LessonResourceItem[] }) {
  return (
    <section className="card rounded-[16px] overflow-hidden max-w-2xl">
      {/* Header — matches the program "Templates & Downloads" card chrome */}
      <div className="p-5 sm:p-6 flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Library className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            Resources &amp; templates
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            Files and links attached to this lesson
          </p>
        </div>
        {resources.length > 0 && (
          <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-cream-100 text-ink-600 text-[11.5px] font-semibold shrink-0 tabular-nums">
            {resources.length} {resources.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="border-t border-ink-100 flex flex-col items-center justify-center px-5 sm:px-6 py-12 text-center">
          <span className="size-11 rounded-full bg-cream-100 text-ink-400 inline-flex items-center justify-center mb-3">
            <Files className="size-5" strokeWidth={1.8} aria-hidden />
          </span>
          <h4 className="text-[14px] font-semibold text-ink-900 mb-1">
            No resources yet
          </h4>
          <p className="text-[12.5px] text-ink-500 max-w-sm mx-auto leading-snug">
            This lesson doesn&apos;t have any files or links attached. Anything
            the coach adds later will show up here.
          </p>
        </div>
      ) : (
        <ul>
          {resources.map((r) => {
            const meta =
              RESOURCE_EXT_META[r.ext] ??
              RESOURCE_EXT_META[r.kind === "link" ? "link" : "file"];
            const Icon = meta.icon;
            const size = r.kind === "file" ? formatBytes(r.sizeBytes) : null;
            return (
              <li key={r.id} className="border-t border-ink-100">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 w-full px-5 sm:px-6 py-3.5 transition-colors hover:bg-cream-50 focus-visible:outline-none focus-visible:bg-cream-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200 cursor-pointer text-left"
                >
                  <span className="size-11 rounded-[12px] bg-gradient-to-br from-rose-100 to-rose-200/70 text-rose-600 ring-1 ring-rose-200/60 inline-flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-[1.04]">
                    <Icon className="size-[20px]" strokeWidth={1.9} aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-ink-900 leading-snug truncate">
                      {r.title}
                    </div>
                    <div className="text-[12px] text-ink-500 leading-snug mt-0.5">
                      {meta.label}
                      {size ? ` · ${size}` : ""}
                    </div>
                  </div>
                  {r.kind === "link" ? (
                    <ExternalLink
                      className="size-4 text-ink-400 shrink-0 transition-colors group-hover:text-ink-600"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight
                      className="size-4 text-ink-400 shrink-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-ink-600"
                      strokeWidth={2}
                      aria-hidden
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

