"use client";

import {
  CheckCircle2,
  CalendarDays,
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
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
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
};


const TAKEAWAYS = [
  "Why hooks are critical for reach and retention",
  "4 high-performing hook angles that work every time",
  "The hook formula and how to use it",
  "Real hook examples that drive views",
  "How to test and refine your hooks",
];

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
}: Props & { active: LessonTabKey }) {
  if (active === "overview") return <OverviewPanel description={description} />;
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

/* ─── Overview (lesson summary + takeaways + coach insight) ─────────────── */

function OverviewPanel({ description }: { description: string | null }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13.5px] text-ink-600 leading-relaxed mb-4 max-w-2xl">
          {description ??
            "A focused lesson packed with what actually moves the needle for creators at your stage — clear, practical, and built to apply this week."}
        </p>
        <div className="text-[13px] font-semibold text-ink-900 mb-2.5">
          Key takeaways
        </div>
        <ul className="space-y-2">
          {TAKEAWAYS.map((t) => (
            <li
              key={t}
              className="flex items-start gap-2 text-[13px] text-ink-700"
            >
              <span className="size-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="size-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[14px] bg-cream-100 border border-cream-300 p-5 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-600 mb-2">
          <Lightbulb className="size-3.5" strokeWidth={2} aria-hidden />
          Key insight
        </div>
        <blockquote className="border-l-2 border-rose-300 pl-4 italic text-[14px] text-ink-700 leading-relaxed mb-4">
          &ldquo;The best hooks create curiosity, promise value, or challenge
          the viewer&apos;s current belief. Make them want to stay.&rdquo;
        </blockquote>
        <div className="flex items-center gap-2.5">
          <Avatar name="Sophie Carter" size={36} />
          <div>
            <div className="text-[12.5px] font-semibold text-ink-900 leading-tight">
              Your Coach, Sophie
            </div>
            <div className="text-[11px] text-ink-500">
              Growth &amp; Content Strategist
            </div>
          </div>
        </div>
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
};

const CHAPTER_TYPE_LABEL: Record<string, string> = {
  intro:      "Intro",
  lesson:     "Lesson",
  activity:   "Activity",
  closing:    "Closing",
  checkpoint: "Checkpoint",
};

function PathPanel({ chapters }: { chapters: Chapter[] }) {
  if (chapters.length === 0) {
    return (
      <div className="max-w-2xl text-center py-8 px-4 rounded-[12px] bg-cream-50 border border-dashed border-ink-200">
        <CalendarDays
          className="size-6 text-ink-400 mx-auto mb-2"
          strokeWidth={1.8}
          aria-hidden
        />
        <div className="text-[13px] font-semibold text-ink-900">
          No lesson path yet
        </div>
        <p className="text-[12px] text-ink-500 mt-0.5">
          This tutorial hasn&apos;t been broken into chapters yet.
        </p>
      </div>
    );
  }

  const totalDuration = chapters.reduce(
    (sum, c) => sum + (c.durationMinutes || 0),
    0,
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div className="text-[14px] font-semibold text-ink-900">
          Lesson path
        </div>
        <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
          {chapters.length} chapter{chapters.length === 1 ? "" : "s"} · ~
          {totalDuration} min
        </span>
      </div>
      <ul className="space-y-1.5">
        {chapters.map((c, i) => {
          const Icon = CHAPTER_ICONS[c.iconKey] ?? Square;
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
    <section className="card overflow-hidden flex flex-col">
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
        <div className="border-t border-ink-100 flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-10 text-center">
          <span className="size-11 rounded-full bg-cream-100 text-ink-400 inline-flex items-center justify-center mb-3">
            <Files className="size-5" strokeWidth={1.8} aria-hidden />
          </span>
          <h4 className="text-[14px] font-semibold text-ink-900 mb-1">
            No resources yet
          </h4>
          <p className="text-[12.5px] text-ink-500 max-w-sm mx-auto leading-snug">
            This lesson doesn&apos;t have any resources attached.
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
                  className="flex items-center gap-3.5 w-full px-5 sm:px-6 py-3.5 hover:bg-cream-50 transition-colors cursor-pointer text-left"
                >
                  <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
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
                      className="size-4 text-ink-400 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight
                      className="size-4 text-ink-400 shrink-0"
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

