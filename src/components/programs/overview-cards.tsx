import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckSquare,
  FolderClosed,
  ListTree,
  Lock,
  NotebookPen,
  Pencil,
  Play,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

// Same symmetric ease as the dashboard launcher tiles so hover-out is as
// smooth as hover-in.
const EASE = "ease-[cubic-bezier(0.45,0,0.55,1)]";

type LessonPeek = {
  title: string;
  status: "completed" | "current" | "todo" | "locked";
};
type TaskPeek = { title: string; done: boolean };

/**
 * Program overview — one premium nav card per sub-page (Curriculum,
 * Resources, Notes, Tasks). Same anatomy as the dashboard launcher tiles:
 * icon tile · bold title · one-line message · rose meta pill · "Open →"
 * footer, with an animated mini-graphic on the right (rises in on mount,
 * comes alive on hover; reduced-motion safe).
 */
export function ProgramSectionCards({
  slug,
  lessonCount,
  moduleCount,
  lessons,
  noteCount,
  tasks,
  taskOpen,
  taskDone,
}: {
  slug: string;
  lessonCount: number;
  moduleCount: number;
  lessons: LessonPeek[];
  noteCount: number;
  tasks: TaskPeek[];
  taskOpen: number;
  taskDone: number;
}) {
  const base = `/programs/${slug}`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CurriculumCard
        href={`${base}?tab=curriculum`}
        lessonCount={lessonCount}
        moduleCount={moduleCount}
        lessons={lessons}
      />
      <ResourcesCard href={`${base}?tab=resources`} />
      <NotesCard href={`${base}?tab=notes`} count={noteCount} />
      <TasksCard
        href={`${base}?tab=tasks`}
        tasks={tasks}
        open={taskOpen}
        done={taskDone}
      />
    </div>
  );
}

/* ── Shared tile shell (dashboard launcher-tile anatomy) ──────────────── */

function SectionTile({
  href,
  icon: Icon,
  title,
  desc,
  meta,
  children,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate flex min-h-[188px] overflow-hidden rounded-[18px] border border-ink-100 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition duration-[380ms] hover:-translate-y-[3px] hover:border-ink-200 hover:shadow-[0_22px_44px_-26px_rgba(26,24,22,0.45)]",
        EASE,
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-4">
        <span
          className={cn(
            "flex size-[42px] items-center justify-center rounded-[13px] bg-rose-50 text-rose-600 transition-transform duration-[380ms] group-hover:-rotate-[4deg] group-hover:scale-105",
            EASE,
          )}
        >
          <Icon className="size-[22px]" strokeWidth={2} />
        </span>
        <h3 className="mt-3 text-[19px] font-bold tracking-[-0.01em] text-ink-900">
          {title}
        </h3>
        <p className="mt-1 max-w-[230px] text-[12.5px] leading-snug text-ink-500">
          {desc}
        </p>
        <span className="mt-2.5 self-start whitespace-nowrap rounded-full bg-rose-50 px-[11px] py-[5px] text-[11px] font-semibold text-rose-700">
          {meta}
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-semibold text-rose-700">
          Open
          <ArrowRight
            className={cn(
              "size-[15px] transition-transform duration-[380ms] group-hover:translate-x-1",
              EASE,
            )}
            strokeWidth={2}
          />
        </span>
      </div>
      <div className="relative h-[140px] w-[150px] sm:w-[200px] shrink-0 self-center">
        {children}
      </div>
    </Link>
  );
}

/* ── Curriculum — lesson path: connector line + rising lesson rows ────── */

const DEMO_LESSONS: LessonPeek[] = [
  { title: "Identify your audience", status: "completed" },
  { title: "Define your content pillars", status: "current" },
  { title: "Hook-driven scripting", status: "locked" },
];

/** Milestone positions along the dotted SVG trail (200×140 viewBox). */
const NODE_POS = [
  { left: "15%", top: "80%" },
  { left: "50%", top: "50%" },
  { left: "85%", top: "20%" },
];

function CurriculumCard({
  href,
  lessonCount,
  moduleCount,
  lessons,
}: {
  href: string;
  lessonCount: number;
  moduleCount: number;
  lessons: LessonPeek[];
}) {
  const rows = lessons.length > 0 ? lessons.slice(0, 3) : DEMO_LESSONS;
  return (
    <SectionTile
      href={href}
      icon={ListTree}
      title="Curriculum"
      desc="Follow the step-by-step lesson path, module by module."
      meta={`${lessonCount} lesson${lessonCount === 1 ? "" : "s"} · ${moduleCount} module${moduleCount === 1 ? "" : "s"}`}
    >
      {/* Learning path — a dotted trail draws itself across the card with a
          milestone node per lesson: done → current (pulsing) → locked. */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 200 140"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <path
            d="M 30 112 C 78 116 64 72 100 70 C 136 68 124 26 170 28"
            fill="none"
            stroke="var(--rose-200)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 9"
            className="spark-fade"
          />
        </svg>
        {NODE_POS.map((pos, i) => {
          const status = rows[i]?.status ?? "locked";
          const isCurrent = status === "current";
          return (
            <span
              key={i}
              className={cn(
                "ob-rise absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-[420ms] group-hover:scale-110",
                EASE,
              )}
              style={{
                left: pos.left,
                top: pos.top,
                animationDelay: `${0.12 + i * 0.16}s`,
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {/* pulsing halo around the lesson you're on */}
              {isCurrent && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-rose-400/50 motion-safe:animate-ping"
                />
              )}
              <span
                className={cn(
                  "relative flex items-center justify-center rounded-full",
                  status === "completed" &&
                    "size-9 bg-rose-500 text-white shadow-[0_6px_14px_-6px_rgba(185,72,92,0.8)]",
                  isCurrent &&
                    "size-11 border-2 border-rose-400 bg-white text-rose-600 shadow-[0_8px_18px_-8px_rgba(185,72,92,0.7)]",
                  status !== "completed" &&
                    !isCurrent &&
                    "size-9 border-2 border-ink-200 bg-white text-ink-400 shadow-[0_4px_10px_-6px_rgba(26,24,22,0.35)]",
                )}
              >
                {status === "completed" ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : isCurrent ? (
                  <Play
                    className="size-4 translate-x-[1px]"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ) : (
                  <Lock className="size-3.5" strokeWidth={2.5} />
                )}
              </span>
            </span>
          );
        })}
      </div>
    </SectionTile>
  );
}

/* ── Resources — folder with file sheets that pop out on hover ────────── */

const SHEETS = [
  { label: "PDF", chip: "bg-rose-100 text-rose-700", rot: "-rotate-[9deg]", x: "-ml-[74px]", hover: "group-hover:-translate-y-3 group-hover:-rotate-[13deg]", delay: 0.1 },
  { label: "XLS", chip: "bg-emerald-100 text-emerald-700", rot: "rotate-[7deg]", x: "ml-[14px]", hover: "group-hover:-translate-y-3 group-hover:rotate-[11deg]", delay: 0.22 },
  { label: "DOC", chip: "bg-amber-100 text-amber-700", rot: "-rotate-[1deg]", x: "-ml-[32px]", hover: "group-hover:-translate-y-4", delay: 0.16 },
];

function ResourcesCard({ href }: { href: string }) {
  return (
    <SectionTile
      href={href}
      icon={FolderClosed}
      title="Resources"
      desc="Worksheets, templates and downloads that pair with your lessons."
      meta="Templates & downloads"
    >
      <div className="absolute inset-0 flex items-end justify-center pb-3">
        {/* file sheets — tucked behind the folder, rise out on hover */}
        {SHEETS.map((s, i) => (
          <div
            key={i}
            className={cn(
              "ob-rise absolute bottom-[40px] left-1/2 flex h-[76px] w-[60px] flex-col rounded-[8px] border border-ink-100 bg-white p-2 shadow-[0_4px_10px_-6px_rgba(26,24,22,0.4)] transition-transform duration-[460ms]",
              s.rot,
              s.x,
              s.hover,
              EASE,
              i === 2 && "z-[5]",
            )}
            style={{
              animationDelay: `${s.delay}s`,
              transitionDelay: `${i * 40}ms`,
            }}
          >
            <span
              className={cn(
                "self-start rounded-[5px] px-1 py-px text-[7.5px] font-bold",
                s.chip,
              )}
            >
              {s.label}
            </span>
            <span className="mt-1.5 block h-[3.5px] w-full rounded-full bg-cream-300" />
            <span className="mt-1 block h-[3.5px] w-4/5 rounded-full bg-cream-200" />
            <span className="mt-1 block h-[3.5px] w-3/5 rounded-full bg-cream-200" />
          </div>
        ))}
        {/* folder front */}
        <div className="relative z-10 h-[52px] w-[148px]">
          <span
            aria-hidden
            className="absolute -top-[9px] left-3 h-[14px] w-[52px] rounded-t-[7px] bg-rose-400"
          />
          <span className="absolute inset-0 rounded-[10px] rounded-tl-[4px] bg-gradient-to-br from-rose-300 to-rose-500 shadow-[0_10px_20px_-12px_rgba(185,72,92,0.7)]" />
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[14px] rounded-t-[10px] bg-white/15"
          />
        </div>
      </div>
    </SectionTile>
  );
}

/* ── Notes — a note card whose lines write themselves in ──────────────── */

const NOTE_LINES = ["w-11/12", "w-4/5", "w-full", "w-3/5"];

function NotesCard({ href, count }: { href: string; count: number }) {
  return (
    <SectionTile
      href={href}
      icon={NotebookPen}
      title="Notes"
      desc="Everything you've jotted down while learning, in one place."
      meta={count > 0 ? `${count} note${count === 1 ? "" : "s"}` : "Start your first note"}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="ob-rise relative h-[118px] w-[164px] -rotate-2 rounded-[12px] border border-ink-100 bg-white p-3.5 shadow-[0_10px_22px_-14px_rgba(26,24,22,0.5)]">
          <span className="font-script text-[16px] leading-none text-ink-700 underline decoration-rose-300/70 underline-offset-4">
            My notes
          </span>
          <div className="mt-2.5 space-y-[7px]">
            {NOTE_LINES.map((w, i) => (
              <span
                key={i}
                className={cn(
                  "pcard-grow-x block h-[5px] rounded-full",
                  w,
                  i === 0 ? "bg-rose-200" : "bg-cream-300",
                )}
                style={{ animationDelay: `${0.25 + i * 0.14}s` }}
              />
            ))}
          </div>
          {/* pen — floats gently, tips on hover as if about to write */}
          <span
            className={cn(
              "ob-float absolute -right-3.5 bottom-4 flex size-9 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_6px_14px_-6px_rgba(185,72,92,0.8)] transition-transform duration-[380ms] group-hover:-rotate-[14deg] group-hover:scale-105",
              EASE,
            )}
          >
            <Pencil className="size-4" strokeWidth={2} />
          </span>
        </div>
      </div>
    </SectionTile>
  );
}

/* ── Tasks — checklist where the next box ticks itself on hover ───────── */

const DEMO_TASKS: TaskPeek[] = [
  { title: "Write your positioning statement", done: true },
  { title: "Draft 3 content pillars", done: false },
  { title: "Outline your first hook", done: false },
];

function TasksCard({
  href,
  tasks,
  open,
  done,
}: {
  href: string;
  tasks: TaskPeek[];
  open: number;
  done: number;
}) {
  const rows = tasks.length > 0 ? tasks.slice(0, 3) : DEMO_TASKS;
  const firstUndone = rows.findIndex((r) => !r.done);
  const total = open + done;
  return (
    <SectionTile
      href={href}
      icon={CheckSquare}
      title="Tasks"
      desc="Action items generated from your lessons — tick them off as you go."
      meta={total > 0 ? `${open} open · ${done} done` : "No tasks yet"}
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full space-y-2">
          {rows.map((t, i) => (
            <div
              key={i}
              className={cn(
                "ob-rise flex items-center gap-2.5 rounded-[11px] border border-ink-100 bg-white px-2.5 py-2 shadow-[0_3px_8px_-5px_rgba(26,24,22,0.3)] transition-transform duration-[460ms] group-hover:translate-x-[2px]",
                EASE,
              )}
              style={{
                animationDelay: `${0.08 + i * 0.1}s`,
                transitionDelay: `${i * 45}ms`,
              }}
            >
              <span
                className={cn(
                  "flex size-[17px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors duration-[360ms]",
                  t.done
                    ? "border-rose-500 bg-rose-500"
                    : i === firstUndone
                      ? "border-rose-300 group-hover:border-rose-500 group-hover:bg-rose-500"
                      : "border-ink-200",
                )}
              >
                <Check
                  className={cn(
                    "size-2.5 text-white transition-opacity duration-[360ms]",
                    t.done
                      ? "opacity-100"
                      : i === firstUndone
                        ? "opacity-0 group-hover:opacity-100"
                        : "opacity-0",
                  )}
                  strokeWidth={3.5}
                />
              </span>
              <span
                className={cn(
                  "truncate text-[11.5px]",
                  t.done ? "text-ink-400 line-through" : "text-ink-700",
                )}
              >
                {t.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionTile>
  );
}
