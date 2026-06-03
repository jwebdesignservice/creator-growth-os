"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  ChevronRight,
  BookOpen,
  MoreVertical,
  Play,
  Pencil,
  Eye,
  Plus,
  Rocket,
  EyeOff,
  Copy,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "@/components/ui/toast";
import {
  setModulePublished,
  duplicateModule,
  deleteModule,
} from "./module-actions";

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
   Each module's kebab now carries the full action set — Edit, Add lesson,
   Publish/Unpublish, Duplicate, Preview, and Delete — wired to the
   module-actions server actions. Drag handles are visual; actual reorder
   lands when we wire DnD.
   ───────────────────────────────────────────────────────────────────────── */

export function CurriculumOutline({
  modules,
  programId,
  programSlug,
  publishedByModule = {},
  publishedBySlug = {},
  idBySlug = {},
}: {
  modules: ModuleItem[];
  programId: string;
  programSlug: string;
  /* Per-module published state: true only when every lesson in the module
     is published. Drives the Publish/Unpublish menu item. */
  publishedByModule?: Record<number, boolean>;
  /* Per-lesson published state keyed by slug — drives each lesson row's
     real Draft/Published pill. */
  publishedBySlug?: Record<string, boolean>;
  /* Per-lesson id keyed by slug — lets "Edit video" deep-link to the
     dedicated lesson editor at /curriculum/[lessonId]. */
  idBySlug?: Record<string, string>;
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
                moduleTitle={m.title}
                lessonCount={m.lessons.length}
                published={publishedByModule[m.number] ?? false}
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
                    <span
                      className={cn(
                        "inline-flex items-center h-5 px-1.5 rounded-[5px] text-[10.5px] font-semibold shrink-0",
                        publishedBySlug[l.slug]
                          ? "bg-success-bg text-success"
                          : "bg-ink-100 text-ink-600",
                      )}
                    >
                      {publishedBySlug[l.slug] ? "Published" : "Draft"}
                    </span>
                    <LessonActionsMenu
                      programId={programId}
                      programSlug={programSlug}
                      lessonSlug={l.slug}
                      lessonId={idBySlug[l.slug]}
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
   Module-level actions kebab. Navigation items (Edit, Add lesson, Preview)
   are links; the mutating items (Publish/Unpublish, Duplicate, Delete) call
   server actions and refresh. Delete is gated behind a confirm dialog that
   names the module and shows how many lessons will be removed.
   ───────────────────────────────────────────────────────────────────────── */

function ModuleActionsMenu({
  programId,
  programSlug,
  moduleNumber,
  moduleTitle,
  lessonCount,
  published,
}: {
  programId: string;
  programSlug: string;
  moduleNumber: number;
  moduleTitle: string;
  lessonCount: number;
  published: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
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

  function runPublishToggle() {
    setOpen(false);
    startTransition(async () => {
      const res = await setModulePublished(programId, moduleNumber, !published);
      if (!res.ok) {
        toast(res.error, "error");
        return;
      }
      router.refresh();
    });
  }

  function runDuplicate() {
    setOpen(false);
    startTransition(async () => {
      const res = await duplicateModule(programId, moduleNumber);
      if (!res.ok) {
        toast(res.error, "error");
        return;
      }
      router.refresh();
    });
  }

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
        disabled={pending}
        className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <MoreVertical className="size-4" strokeWidth={2} />
        )}
      </button>
      {open && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-56 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuLink href={editHref} icon={<Pencil className="size-3.5" strokeWidth={2} />}>
            Edit module
          </MenuLink>
          <MenuLink href={addLessonHref} icon={<Plus className="size-3.5" strokeWidth={2} />}>
            Add lesson
          </MenuLink>

          <div aria-hidden className="h-px my-1 bg-ink-100" />

          <MenuButton
            onClick={runPublishToggle}
            icon={
              published ? (
                <EyeOff className="size-3.5" strokeWidth={2} />
              ) : (
                <Rocket className="size-3.5" strokeWidth={2} />
              )
            }
          >
            {published ? "Unpublish module" : "Publish module"}
          </MenuButton>
          <MenuButton
            onClick={runDuplicate}
            icon={<Copy className="size-3.5" strokeWidth={2} />}
          >
            Duplicate module
          </MenuButton>
          <MenuLink
            href={`/programs/${programSlug}`}
            icon={<Eye className="size-3.5" strokeWidth={2} />}
            external
          >
            Preview as student
          </MenuLink>

          <div aria-hidden className="h-px my-1 bg-ink-100" />

          <MenuButton
            onClick={() => {
              setOpen(false);
              setConfirmDelete(true);
            }}
            icon={<Trash2 className="size-3.5" strokeWidth={2} />}
            tone="danger"
          >
            Delete module
          </MenuButton>
        </div>
      )}

      <DeleteModuleDialog
        open={confirmDelete}
        moduleLabel={`Module ${moduleNumber}: ${moduleTitle}`}
        lessonCount={lessonCount}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          startTransition(async () => {
            const res = await deleteModule(programId, moduleNumber);
            if (!res.ok) {
              toast(res.error, "error");
              return;
            }
            setConfirmDelete(false);
            router.refresh();
          })
        }
        pending={pending}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Confirm dialog for the destructive "Delete module" action. Mirrors the
   program-level delete modal so the two read consistently.
   ───────────────────────────────────────────────────────────────────────── */

function DeleteModuleDialog({
  open,
  moduleLabel,
  lessonCount,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  moduleLabel: string;
  lessonCount: number;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, pending, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[12vh]"
      onClick={() => !pending && onClose()}
    >
      <div aria-hidden className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete module"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[18px] bg-white shadow-card border border-ink-100 p-6"
      >
        <header className="flex items-start gap-3 mb-4">
          <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-bold text-ink-900 leading-tight">
              Delete this module?
            </h3>
            <p className="mt-1 text-[12.5px] text-ink-500 leading-snug">
              This permanently deletes <strong>{moduleLabel}</strong> and its{" "}
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"}. This can&apos;t
              be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 shrink-0 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 disabled:opacity-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 disabled:cursor-wait cursor-pointer transition-colors"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            Delete module
          </button>
        </div>
      </div>
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
  lessonId,
}: {
  programId: string;
  programSlug: string;
  lessonSlug: string;
  lessonId?: string;
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

  // "Edit video" opens the dedicated lesson editor — the same destination as
  // the Curriculum tab's "Edit lesson". Falls back to the curriculum list if
  // the lesson id is unknown.
  const editHref = lessonId
    ? `/admin/programs/${programId}/curriculum/${lessonId}`
    : `/admin/programs/${programId}/curriculum`;
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
   Shared menu primitives. `MenuLink` for navigation, `MenuButton` for
   actions (supports a danger tone for destructive items).
   ───────────────────────────────────────────────────────────────────────── */

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

function MenuButton({
  onClick,
  icon,
  children,
  tone = "default",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer",
        tone === "danger"
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-cream-100",
      )}
    >
      {icon}
      {children}
    </button>
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
