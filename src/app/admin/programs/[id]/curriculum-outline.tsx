"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  GripVertical,
  ChevronRight,
  BookOpen,
  MoreVertical,
  Play,
  Pencil,
  Eye,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";

type LessonItem = {
  slug: string;
  title: string;
  duration: string;
  status?: string;
};
type ModuleItem = {
  number: number;
  title: string;
  lessons: LessonItem[];
};

/* ─────────────────────────────────────────────────────────────────────────
   Expandable module/lesson outline shown in the admin program setup page.
   Each row's kebab opens a real dropdown — Edit jumps into the curriculum
   editor anchored to that exact module / lesson, Preview opens the public
   page. Drag handles are visual; actual reorder lands when we wire DnD.
   ───────────────────────────────────────────────────────────────────────── */

export function CurriculumOutline({
  modules,
  programId,
  programSlug,
}: {
  modules: ModuleItem[];
  programId: string;
  programSlug: string;
}) {
  // Default-expand the first module so admins land on something useful.
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(modules[0] ? [modules[0].number] : []),
  );

  function toggle(num: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-[12px] bg-cream-100/60 border border-dashed border-ink-200 px-6 py-10 text-center">
        <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
          <BookOpen className="size-5" strokeWidth={1.9} />
        </span>
        <p className="text-[13.5px] font-semibold text-ink-900 mb-1">
          No modules yet
        </p>
        <p className="text-[12.5px] text-ink-500">
          Add lessons in the Lessons admin to build the curriculum.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {modules.map((m) => {
        const isOpen = expanded.has(m.number);
        const totalMinutes = m.lessons.reduce(
          (sum, l) => sum + parseMinutes(l.duration),
          0,
        );
        return (
          <li
            key={m.number}
            className={cn(
              "rounded-[12px] border transition-colors",
              isOpen
                ? "border-rose-200 bg-rose-50/40"
                : "border-ink-100 bg-white",
            )}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggle(m.number)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(m.number);
                }
              }}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-cream-100/50 transition-colors cursor-pointer rounded-[12px]"
            >
              <GripVertical
                className="size-4 text-ink-300 shrink-0 cursor-grab"
                strokeWidth={2}
                aria-hidden
              />
              <ChevronRight
                className={cn(
                  "size-4 text-ink-500 shrink-0 transition-transform",
                  isOpen && "rotate-90",
                )}
                strokeWidth={2}
                aria-hidden
              />
              <span className="size-7 rounded-[8px] bg-rose-100 text-rose-700 inline-flex items-center justify-center shrink-0">
                <BookOpen className="size-3.5" strokeWidth={2} />
              </span>
              <span className="flex-1 text-[13.5px] font-semibold text-ink-900 truncate">
                Module {m.number}: {m.title}
              </span>
              <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
                {m.lessons.length} lessons
              </span>
              <span className="inline-flex items-center h-6 px-2 rounded-[6px] bg-cream-100 text-ink-700 text-[11px] font-medium tabular-nums shrink-0">
                {totalMinutes} min
              </span>
              <ModuleActionsMenu
                programId={programId}
                programSlug={programSlug}
                moduleNumber={m.number}
              />
            </div>

            {isOpen && (
              <ul className="border-t border-rose-200/60 px-3 py-2 space-y-0.5">
                {m.lessons.map((l, j) => (
                  <li
                    key={l.slug}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] hover:bg-white transition-colors"
                  >
                    <GripVertical
                      className="size-3.5 text-ink-300 shrink-0 cursor-grab"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span className="size-5 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                      <Play
                        className="size-2.5 ml-0.5"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </span>
                    <span className="text-[12.5px] text-ink-500 tabular-nums w-10 shrink-0">
                      {m.number}.{j + 1}
                    </span>
                    <span className="flex-1 text-[13px] text-ink-900 truncate">
                      {l.title}
                    </span>
                    <span className="text-[11.5px] text-ink-500 tabular-nums shrink-0">
                      {l.duration}
                    </span>
                    <span className="inline-flex items-center h-5 px-1.5 rounded-[5px] bg-ink-100 text-ink-600 text-[10.5px] font-semibold shrink-0">
                      Draft
                    </span>
                    <LessonActionsMenu
                      programId={programId}
                      programSlug={programSlug}
                      lessonSlug={l.slug}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Module-level actions kebab. Edit → curriculum editor anchored to this
   module. Add lesson → curriculum editor with `?add-lesson=N` so the
   editor can open the matching modal on mount. Preview → public program
   landing page (lessons inside are public-route children of the program
   slug, so the program page already shows them grouped by module).
   ───────────────────────────────────────────────────────────────────────── */

function ModuleActionsMenu({
  programId,
  programSlug,
  moduleNumber,
}: {
  programId: string;
  programSlug: string;
  moduleNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const editHref =
    `/admin/programs/${programId}/curriculum?module=${moduleNumber}#module-${moduleNumber}`;
  const addLessonHref =
    `/admin/programs/${programId}/curriculum?add-lesson=${moduleNumber}#module-${moduleNumber}`;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Module actions"
        className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 cursor-pointer"
      >
        <MoreVertical className="size-4" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-52 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuLink href={editHref} icon={<Pencil className="size-3.5" strokeWidth={2} />}>
            Edit module
          </MenuLink>
          <MenuLink href={addLessonHref} icon={<Plus className="size-3.5" strokeWidth={2} />}>
            Add lesson
          </MenuLink>
          <div aria-hidden className="h-px my-1 bg-ink-100" />
          <MenuLink
            href={`/programs/${programSlug}`}
            icon={<Eye className="size-3.5" strokeWidth={2} />}
            external
          >
            Preview public page
          </MenuLink>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Lesson-level actions kebab. Edit → curriculum editor with the lesson
   modal pre-opened (via `?edit-lesson={slug}`). Preview → public lesson
   player route.
   ───────────────────────────────────────────────────────────────────────── */

function LessonActionsMenu({
  programId,
  programSlug,
  lessonSlug,
}: {
  programId: string;
  programSlug: string;
  lessonSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const editHref =
    `/admin/programs/${programId}/curriculum?edit-lesson=${lessonSlug}#lesson-${lessonSlug}`;
  const previewHref = `/programs/${programSlug}/${lessonSlug}`;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Lesson actions"
        className="size-6 rounded-[6px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 cursor-pointer"
      >
        <MoreVertical className="size-3.5" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuLink href={editHref} icon={<Pencil className="size-3.5" strokeWidth={2} />}>
            Edit video
          </MenuLink>
          <MenuLink
            href={previewHref}
            icon={<Eye className="size-3.5" strokeWidth={2} />}
            external
          >
            Preview video
          </MenuLink>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Shared menu link. `external` = new tab for preview routes. */

function MenuLink({
  href,
  icon,
  children,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100"
    >
      {icon}
      {children}
    </Link>
  );
}

function parseMinutes(d: string): number {
  // Supports "6 min", "12:45", or a bare number.
  const minMatch = d.match(/^(\d+)\s*min/i);
  if (minMatch) return parseInt(minMatch[1], 10);
  const colonMatch = d.split(":")[0];
  const n = parseInt(colonMatch, 10);
  return Number.isFinite(n) ? n : 0;
}
