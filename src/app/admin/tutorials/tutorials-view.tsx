"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  FolderPlus,
  Upload,
  Plus,
  Search,
  Briefcase,
  ChevronDown,
  LayoutGrid,
  List,
  MoreHorizontal,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Pencil,
  Paperclip,
  PieChart,
  PlayCircle,
  Link2,
  Check,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  toggleLessonPublished,
  deleteLesson,
  archiveLesson,
  duplicateTutorial,
} from "@/app/admin/lessons/actions";
import { useRouter } from "next/navigation";

export type TutorialCardData = {
  id: string;
  slug: string;
  title: string;
  programId: string | null;
  programTitle: string | null;
  moduleTitle: string | null;
  coverImageUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  published: boolean;
  readyToReview: boolean;
  updatedAt: string;
  views: number;
  completionPct: number | null;
  attachments: number;
};

type Program = { id: string; slug: string; title: string };

type Tab = "all" | "drafts" | "published" | "archived";
type Sort = "newest" | "oldest" | "alpha" | "views";
type View = "grid" | "list";

export function TutorialsView({
  tutorials,
  programs,
  counts,
}: {
  tutorials: TutorialCardData[];
  programs: Program[];
  counts: { all: number; drafts: number; published: number; archived: number };
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [programId, setProgramId] = useState<string>("");
  const [sort, setSort] = useState<Sort>("newest");
  const [view, setView] = useState<View>("grid");

  const filtered = useMemo(() => {
    let rows = tutorials.slice();

    // Tab
    if (tab === "drafts") rows = rows.filter((r) => !r.published);
    else if (tab === "published") rows = rows.filter((r) => r.published);
    else if (tab === "archived") rows = []; // no archived field yet

    // Program
    if (programId) rows = rows.filter((r) => r.programId === programId);

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.programTitle ?? "").toLowerCase().includes(q),
      );
    }

    // Sort
    rows.sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "views") return b.views - a.views;
      const ta = new Date(a.updatedAt).getTime();
      const tb = new Date(b.updatedAt).getTime();
      return sort === "oldest" ? ta - tb : tb - ta;
    });

    return rows;
  }, [tutorials, tab, programId, search, sort]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">
            Tutorials
          </h1>
          <p className="text-ink-500 text-[14px]">
            Create, organize, and manage lesson videos for your programs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Folders + bulk import need their own schema — out of this phase.
              Shown disabled so the surface reads complete without faking it. */}
          <HeaderButton
            disabled
            title="Folders are coming in a later phase"
            icon={<FolderPlus className="size-4" strokeWidth={2} />}
          >
            New folder
          </HeaderButton>
          <HeaderButton
            disabled
            title="Bulk import is coming in a later phase"
            icon={<Upload className="size-4" strokeWidth={2} />}
          >
            Import
          </HeaderButton>
          <Link
            href="/admin/tutorials/new"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors shadow-sm"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            New tutorial
          </Link>
        </div>
      </header>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-ink-100 flex items-center gap-1">
        <TabButton
          active={tab === "all"}
          onClick={() => setTab("all")}
          label="All tutorials"
        />
        <TabButton
          active={tab === "drafts"}
          onClick={() => setTab("drafts")}
          label="Drafts"
          badge={counts.drafts}
        />
        <TabButton
          active={tab === "published"}
          onClick={() => setTab("published")}
          label="Published"
          badge={counts.published}
        />
        <TabButton
          active={tab === "archived"}
          onClick={() => setTab("archived")}
          label="Archived"
          badge={counts.archived}
        />
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400"
            strokeWidth={2}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
          />
        </div>

        <FilterSelect
          icon={<Briefcase className="size-3.5 text-ink-500" strokeWidth={2} />}
          value={programId}
          onChange={setProgramId}
          options={[
            { value: "", label: "All programs" },
            ...programs.map((p) => ({ value: p.id, label: p.title })),
          ]}
        />

        <FilterSelect
          value={sort}
          onChange={(v) => setSort(v as Sort)}
          options={[
            { value: "newest", label: "Sort: Newest" },
            { value: "oldest", label: "Sort: Oldest" },
            { value: "alpha", label: "Sort: A → Z" },
            { value: "views", label: "Sort: Most viewed" },
          ]}
        />

        <div className="inline-flex items-center h-11 p-1 rounded-[12px] border border-ink-200 bg-white">
          <ViewToggle
            active={view === "grid"}
            onClick={() => setView("grid")}
            ariaLabel="Grid view"
          >
            <LayoutGrid className="size-3.5" strokeWidth={2} />
          </ViewToggle>
          <ViewToggle
            active={view === "list"}
            onClick={() => setView("list")}
            ariaLabel="List view"
          >
            <List className="size-3.5" strokeWidth={2} />
          </ViewToggle>
        </div>

        <span className="ml-auto text-[12.5px] text-ink-500 tabular-nums">
          {filtered.length} tutorial{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* ── Grid / List ──────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          tab={tab}
          hasFilters={Boolean(search || programId)}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((t) => (
            <TutorialCard key={t.id} t={t} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-ink-100">
            {filtered.map((t) => (
              <TutorialListRow key={t.id} t={t} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function HeaderButton({
  onClick,
  icon,
  children,
  disabled,
  title,
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-2 h-11 px-4 rounded-[14px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 px-4 inline-flex items-center gap-2 text-[13.5px] font-semibold border-b-2 -mb-px transition-colors",
        active
          ? "text-rose-600 border-rose-500"
          : "text-ink-500 hover:text-ink-900 border-transparent",
      )}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums",
            active
              ? "bg-rose-100 text-rose-700"
              : "bg-cream-200 text-ink-600",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function FilterSelect({
  icon,
  value,
  onChange,
  options,
}: {
  icon?: React.ReactNode;
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none h-11 pr-9 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-700 cursor-pointer hover:bg-cream-100 focus:outline-none focus:border-rose-400 transition-colors",
          icon ? "pl-9" : "pl-4",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center size-8 rounded-[8px] transition-colors cursor-pointer",
        active
          ? "bg-rose-100 text-rose-700"
          : "text-ink-500 hover:bg-cream-100",
      )}
    >
      {children}
    </button>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function TutorialCard({ t }: { t: TutorialCardData }) {
  const editHref = `/admin/tutorials/${t.id}`;
  const publicHref = `/tutorials/${t.slug}`;
  const [selected, setSelected] = useState(false);

  return (
    <article
      className={cn(
        "group relative card overflow-hidden flex flex-col transition-all",
        "hover:ring-2 hover:ring-rose-300/70 hover:border-rose-200",
        selected && "ring-2 ring-rose-400/80 border-rose-200",
      )}
    >
      {/* Thumbnail (clickable → edit) */}
      <Link
        href={editHref}
        aria-label={`Edit ${t.title}`}
        className="relative block aspect-video overflow-hidden bg-gradient-to-br from-rose-100/70 via-rose-50 to-cream-100"
      >
        {t.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          // Empty-state thumbnail: clean rose-cream gradient, no center play
          // icon — matches the Loom-style look the user asked for.
          <div className="w-full h-full" aria-hidden />
        )}

        {/* Dark hover overlay — only shows on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-ink-900/35 transition-opacity pointer-events-none",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          aria-hidden
        />

        {/* Duration badge — always visible */}
        {t.durationSeconds > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center px-2 py-1 rounded-[6px] bg-ink-900/80 text-white text-[11px] font-semibold tabular-nums">
            {formatDuration(t.durationSeconds)}
          </span>
        )}
      </Link>

      {/* Hover overlays — checkbox top-left + action stack top-right.
          Rendered as siblings of the Link so their clicks aren't swallowed
          by the navigation. Each handler also stops propagation. */}
      <HoverCheckbox
        selected={selected}
        onToggle={() => setSelected((v) => !v)}
      />
      <div
        className={cn(
          "absolute top-3 right-3 z-10 flex flex-col gap-1.5 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        )}
      >
        <CopyLinkButton href={publicHref} />
        <KebabMenu t={t} />
      </div>

      {/* Body (clickable → edit) */}
      <Link
        href={editHref}
        className="p-4 flex flex-col gap-2 flex-1"
      >
        <h3 className="text-[14.5px] font-bold text-ink-900 leading-snug line-clamp-2">
          {t.title}
        </h3>
        <div className="text-[12px] text-ink-500 truncate">
          {t.moduleTitle ?? t.programTitle ?? "Standalone tutorial"}
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <StatusPill t={t} />
          <span className="text-[11.5px] text-ink-500">
            · Updated {relativeTime(t.updatedAt)}
          </span>
        </div>
      </Link>
      <CardStats t={t} />
    </article>
  );
}

/* ── Hover-action primitives ─────────────────────────────────────────── */

function HoverCheckbox({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={selected}
      aria-label={selected ? "Deselect tutorial" : "Select tutorial"}
      className={cn(
        "absolute top-3 left-3 z-10 size-7 rounded-[6px] border-2 inline-flex items-center justify-center transition-all",
        selected
          ? "bg-rose-500 border-rose-500 text-white opacity-100"
          : "bg-white/90 border-white text-transparent opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white",
      )}
    >
      <Check className="size-4" strokeWidth={3} />
    </button>
  );
}

function CopyLinkButton({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const full =
        typeof window !== "undefined"
          ? `${window.location.origin}${href}`
          : href;
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable — silent fail.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Link copied" : "Copy share link"}
      aria-label={copied ? "Link copied" : "Copy share link"}
      className={cn(
        "size-8 rounded-[8px] inline-flex items-center justify-center bg-white text-ink-700 hover:bg-cream-50 hover:text-ink-900 shadow-sm transition-colors",
        copied && "text-success",
      )}
    >
      {copied ? (
        <Check className="size-4" strokeWidth={2.5} />
      ) : (
        <Link2 className="size-4" strokeWidth={2} />
      )}
    </button>
  );
}

function CardStats({ t }: { t: TutorialCardData }) {
  return (
    <div className="px-4 py-3 border-t border-ink-100 grid grid-cols-3 gap-2 text-[11.5px] text-ink-500">
      <StatCell icon={<Eye className="size-3.5" strokeWidth={2} />} value={formatCount(t.views)} />
      <StatCell
        icon={<PieChart className="size-3.5" strokeWidth={2} />}
        value={t.completionPct != null ? `${t.completionPct}%` : "—"}
      />
      <StatCell
        icon={<Paperclip className="size-3.5" strokeWidth={2} />}
        value={t.attachments.toString()}
      />
    </div>
  );
}

function StatCell({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <span className="text-ink-400">{icon}</span>
      {value}
    </span>
  );
}

function StatusPill({ t }: { t: TutorialCardData }) {
  if (t.published) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-success-bg text-success border border-success/20 text-[10.5px] font-semibold">
        Published
      </span>
    );
  }
  if (t.readyToReview) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-amber-100 text-amber-700 border border-amber-200 text-[10.5px] font-semibold">
        Ready to review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-ink-100 text-ink-600 border border-ink-200 text-[10.5px] font-semibold">
      Draft
    </span>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function KebabMenu({ t }: { t: TutorialCardData }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function togglePublish(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    startTransition(async () => {
      const res = await toggleLessonPublished(t.id, !t.published);
      if (res.ok) router.refresh();
    });
  }

  function toggleArchive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    startTransition(async () => {
      const res = await archiveLesson(t.id, true);
      if (res.ok) router.refresh();
    });
  }

  function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    if (
      !confirm(`Delete "${t.title}"? This can't be undone.`)
    )
      return;
    startTransition(async () => {
      const res = await deleteLesson(t.id);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        disabled={pending}
        aria-label="Open tutorial actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="size-8 rounded-[8px] inline-flex items-center justify-center bg-white text-ink-700 hover:bg-cream-50 hover:text-ink-900 shadow-sm cursor-pointer disabled:opacity-50"
      >
        <MoreHorizontal className="size-4" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
        >
          <MenuLink
            icon={<Pencil className="size-3.5" strokeWidth={2} />}
            label="Edit"
            href={`/admin/tutorials/${t.id}`}
          />
          <DuplicateMenuItem id={t.id} />
          {t.programId && (
            <MenuLink
              icon={<Pencil className="size-3.5" strokeWidth={2} />}
              label="Edit in curriculum"
              href={`/admin/programs/${t.programId}/curriculum`}
            />
          )}
          <MenuItem
            icon={
              t.published ? (
                <EyeOff className="size-3.5" strokeWidth={2} />
              ) : (
                <Eye className="size-3.5" strokeWidth={2} />
              )
            }
            label={t.published ? "Unpublish" : "Publish"}
            onClick={togglePublish}
          />
          <MenuItem
            icon={<EyeOff className="size-3.5" strokeWidth={2} />}
            label="Archive"
            onClick={toggleArchive}
          />
          <MenuLink
            icon={<ExternalLink className="size-3.5" strokeWidth={2} />}
            label="View public"
            href={`/tutorials/${t.slug}`}
          />
          <div aria-hidden className="h-px my-1 bg-ink-100" />
          <MenuItem
            icon={<Trash2 className="size-3.5" strokeWidth={2} />}
            label="Delete"
            onClick={remove}
            danger
          />
        </div>
      )}
    </div>
  );
}

function DuplicateMenuItem({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function duplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await duplicateTutorial(id);
      if (res.ok && res.id) router.push(`/admin/tutorials/${res.id}`);
      else if (!res.ok) window.alert(res.error);
    });
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={duplicate}
      disabled={pending}
      className="w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100 cursor-pointer disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
      ) : (
        <Copy className="size-3.5" strokeWidth={2} />
      )}
      Duplicate
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-cream-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MenuLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink-700 hover:bg-cream-100"
    >
      {icon}
      {label}
    </Link>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function TutorialListRow({ t }: { t: TutorialCardData }) {
  return (
    <li className="flex items-center gap-4 px-5 py-4 hover:bg-cream-50/60 transition-colors">
      <div className="relative w-[140px] aspect-video rounded-[10px] overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-cream-100 shrink-0">
        {t.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {t.durationSeconds > 0 && (
          <span className="absolute bottom-1 right-1 inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-ink-900/80 text-white text-[10px] font-semibold tabular-nums">
            {formatDuration(t.durationSeconds)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/tutorials/${t.id}`}
          className="text-[14px] font-bold text-ink-900 hover:text-rose-700 transition-colors truncate block"
        >
          {t.title}
        </Link>
        <div className="text-[12px] text-ink-500 truncate">
          {t.moduleTitle ?? t.programTitle ?? "Standalone tutorial"}
        </div>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <StatusPill t={t} />
          <span className="text-[11.5px] text-ink-500">
            Updated {relativeTime(t.updatedAt)}
          </span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-5 text-[12px] text-ink-500 tabular-nums shrink-0">
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3.5 text-ink-400" strokeWidth={2} />
          {formatCount(t.views)}
        </span>
        <span className="inline-flex items-center gap-1">
          <PieChart className="size-3.5 text-ink-400" strokeWidth={2} />
          {t.completionPct != null ? `${t.completionPct}%` : "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Paperclip className="size-3.5 text-ink-400" strokeWidth={2} />
          {t.attachments}
        </span>
      </div>
      <div className="relative shrink-0">
        <KebabMenu t={t} />
      </div>
    </li>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function EmptyState({
  tab,
  hasFilters,
}: {
  tab: Tab;
  hasFilters: boolean;
}) {
  const copy =
    tab === "archived"
      ? "No archived tutorials yet. When you archive a tutorial it'll show up here."
      : hasFilters
        ? "No tutorials match your filters. Try clearing search or program."
        : "No tutorials yet — start by creating one.";
  return (
    <div className="card p-12 text-center">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-3 mx-auto">
        <PlayCircle className="size-6" strokeWidth={1.8} />
      </div>
      <h2 className="text-h3 text-ink-900 mb-1">
        No tutorials to show
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-5">{copy}</p>
      {!hasFilters && tab !== "archived" && (
        <Link
          href="/admin/tutorials/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          New tutorial
        </Link>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Helpers                                                                */

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v < 10 ? v.toFixed(1) : Math.round(v)}K`;
  }
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMs = Date.now() - t;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${Math.floor(months / 12)}y ago`;
}
