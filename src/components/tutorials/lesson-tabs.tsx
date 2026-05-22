"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  CalendarDays,
  Play,
  Target,
  Clock,
  FileText,
  FileSpreadsheet,
  Files,
  ChevronRight,
  Lightbulb,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { cn } from "@/lib/cn";

/**
 * Tabbed detail panel for the lesson player (Loom-inspired).
 *
 * Replaces the old 6-card grid below the video with a single organized
 * panel: a horizontal tab bar (underline indicator) over five sections —
 * Overview, Lesson Path, Creator Drill, Resources, and Notes. Keeps the
 * page calmer and gives the user one clear place to look for each thing.
 */

type ModuleLesson = {
  slug: string;
  title: string;
  duration: string;
  isCurrent: boolean;
  completed: boolean;
};

type Props = {
  description: string | null;
  moduleNumber: number;
  moduleTitle: string;
  moduleLessons: ModuleLesson[];
  lessonTitle: string;
};

type TabKey = "overview" | "path" | "drill" | "resources" | "notes";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "overview",  label: "Overview",     icon: BookOpen     },
  { key: "path",      label: "Lesson Path",  icon: CalendarDays },
  { key: "drill",     label: "Creator Drill", icon: Target      },
  { key: "resources", label: "Resources",    icon: Files        },
  { key: "notes",     label: "Notes",        icon: Pencil       },
];

const TAKEAWAYS = [
  "Why hooks are critical for reach and retention",
  "4 high-performing hook angles that work every time",
  "The hook formula and how to use it",
  "Real hook examples that drive views",
  "How to test and refine your hooks",
];

export function LessonTabs({
  description,
  moduleNumber,
  moduleTitle,
  moduleLessons,
  lessonTitle,
}: Props) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <section className="card overflow-hidden">
      {/* Tab bar */}
      <div
        role="tablist"
        className="flex items-center gap-1 px-2 sm:px-4 border-b border-ink-100 overflow-x-auto"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-3 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                active ? "text-rose-700" : "text-ink-500 hover:text-ink-900",
              )}
            >
              <t.icon className="size-4" strokeWidth={1.9} aria-hidden />
              {t.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-rose-600"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="p-5 sm:p-6">
        {tab === "overview" && <OverviewPanel description={description} />}
        {tab === "path" && (
          <PathPanel
            moduleNumber={moduleNumber}
            moduleTitle={moduleTitle}
            lessons={moduleLessons}
          />
        )}
        {tab === "drill" && <DrillPanel lessonTitle={lessonTitle} />}
        {tab === "resources" && <ResourcesPanel />}
        {tab === "notes" && <NotesPanel />}
      </div>
    </section>
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

/* ─── Lesson path (module lessons) ─────────────────────────────────────── */

function PathPanel({
  moduleNumber,
  moduleTitle,
  lessons,
}: {
  moduleNumber: number;
  moduleTitle: string;
  lessons: ModuleLesson[];
}) {
  const totalDuration = lessons.reduce(
    (sum, l) => sum + parseMinutes(l.duration),
    0,
  );
  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <div className="text-[14px] font-semibold text-ink-900">
            Module {moduleNumber}
          </div>
          <div className="text-[12px] text-ink-500">{moduleTitle}</div>
        </div>
        <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
          {lessons.length} lessons · ~{totalDuration} min
        </span>
      </div>
      <ul className="space-y-1">
        {lessons.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/tutorials/${l.slug}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-[10px] transition-colors",
                l.isCurrent
                  ? "bg-rose-50 border border-rose-200"
                  : "hover:bg-cream-100",
              )}
            >
              <span
                className={cn(
                  "size-5 rounded-full inline-flex items-center justify-center shrink-0",
                  l.completed
                    ? "bg-rose-100 text-rose-600"
                    : l.isCurrent
                      ? "bg-rose-500 text-white"
                      : "border border-ink-300",
                )}
              >
                {l.completed ? (
                  <CheckCircle2 className="size-3" strokeWidth={3} />
                ) : l.isCurrent ? (
                  <Play className="size-2.5 ml-0.5" fill="currentColor" />
                ) : null}
              </span>
              <span
                className={cn(
                  "flex-1 text-[12.5px] truncate",
                  l.isCurrent ? "font-semibold text-ink-900" : "text-ink-700",
                )}
              >
                {l.title}
              </span>
              <span className="text-[11px] text-ink-500 tabular-nums">
                {l.duration}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Creator drill ────────────────────────────────────────────────────── */

function DrillPanel({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-[13.5px] text-ink-700 leading-relaxed mb-4">
        Write 10 variations applying what you learned in{" "}
        <span className="font-semibold">{lessonTitle}</span>. Use different
        angles and test the strongest one this week.
      </p>
      <ul className="space-y-2 text-[13px] text-ink-700 mb-5">
        <li className="flex items-center gap-2">
          <Clock className="size-3.5 text-rose-500" strokeWidth={2} aria-hidden />
          Estimated time: <span className="font-semibold">30 min</span>
        </li>
        <li className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} aria-hidden />
          Due date: <span className="font-semibold">In 2 days</span>
        </li>
        <li className="flex items-center gap-2">
          <FileText className="size-3.5 text-rose-500" strokeWidth={2} aria-hidden />
          Format: <span className="font-semibold">Written submission</span>
        </li>
      </ul>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors cursor-pointer"
      >
        Start drill
      </button>
    </div>
  );
}

/* ─── Resources & templates ────────────────────────────────────────────── */

function ResourcesPanel() {
  const items = [
    { title: "Hook Formula PDF", type: "PDF Guide", icon: FileText },
    { title: "Caption Starter Sheet", type: "Google Sheet", icon: FileSpreadsheet },
    { title: "Hook Swipe File", type: "Swipe File Library", icon: Files, pro: true },
    { title: "Creator Checklist", type: "PDF Guide", icon: FileText },
  ];
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-ink-900">
          Resources &amp; templates
        </h3>
        <Link
          href="/tutorials"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          View all
        </Link>
      </div>
      <ul className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.title}>
              <button
                type="button"
                className="flex items-center gap-3 w-full p-2 -mx-1 rounded-[10px] hover:bg-cream-100 transition-colors cursor-pointer text-left"
              >
                <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                  <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink-900 truncate flex items-center gap-1.5">
                    {it.title}
                    {it.pro && (
                      <span className="chip chip-rose text-[9px]">PRO</span>
                    )}
                  </div>
                </div>
                <span className="text-[11.5px] text-ink-500 hidden sm:inline">
                  {it.type}
                </span>
                <ChevronRight className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Quick notes ──────────────────────────────────────────────────────── */

function NotesPanel() {
  return (
    <div className="max-w-2xl">
      <textarea
        className="w-full min-h-[180px] rounded-[10px] border border-ink-200 bg-white px-3.5 py-3 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-y"
        placeholder="Write your key takeaways, ideas, and insights from this lesson…"
        maxLength={1000}
      />
      <div className="flex items-center justify-between mt-2 text-[11px] text-ink-500">
        <div className="inline-flex items-center gap-2.5">
          <button type="button" className="hover:text-ink-900 cursor-pointer font-bold">B</button>
          <button type="button" className="hover:text-ink-900 cursor-pointer italic">I</button>
          <button type="button" className="hover:text-ink-900 cursor-pointer">•</button>
          <button type="button" className="hover:text-ink-900 cursor-pointer">1.</button>
        </div>
        <span className="tabular-nums">0 / 1000</span>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function parseMinutes(duration: string): number {
  const [m] = duration.split(":");
  const n = parseInt(m ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}
