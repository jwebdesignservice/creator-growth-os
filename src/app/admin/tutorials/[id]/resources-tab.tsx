"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Folder,
  FolderPlus,
  Plus,
  Upload,
  Link as LinkIcon,
  Link2,
  Filter,
  ArrowUpDown,
  Cloud,
  Eye,
  Copy,
  Pencil,
  MoreHorizontal,
  Check,
  X,
  ExternalLink,
  Info,
  Lightbulb,
  FileText,
  FileSpreadsheet,
  FileArchive,
  LayoutGrid,
  Trash2,
  ChevronDown,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Resources tab — fully interactive frontend surface for the tutorial
   editor's Resources section. No backend yet; everything lives in local
   state so the UX feels real and we can swap in a server-action layer
   later without restructuring the component.
   ───────────────────────────────────────────────────────────────────────── */

export type ResourceType =
  | "pdf"
  | "docx"
  | "pptx"
  | "xlsx"
  | "template"
  | "link"
  | "zip";

export type ResourcePlacement =
  | "lesson-overview"
  | "what-youll-learn"
  | "creator-drill"
  | "whole-tutorial";

export type Resource = {
  id: string;
  title: string;
  subtitle: string;
  type: ResourceType;
  /** Pretty size label (e.g. "2.4 MB"). Null for links. */
  size: string | null;
  /** Raw bytes — used for the "Total size" footer + sorting. 0 for links. */
  bytes: number;
  placement: ResourcePlacement;
  /** Set on links and external assets; lets the per-row preview open it. */
  url?: string;
};

/* ── Placement tab config ───────────────────────────────────────────── */

const PLACEMENT_TABS: { key: ResourcePlacement; label: string }[] = [
  { key: "lesson-overview", label: "Lesson overview" },
  { key: "what-youll-learn", label: "What you'll learn" },
  { key: "creator-drill",  label: "Creator drill"  },
  { key: "whole-tutorial", label: "Whole tutorial" },
];

const PLACEMENT_LABEL: Record<ResourcePlacement, string> = {
  "lesson-overview":  "Lesson overview",
  "what-youll-learn": "What you'll learn",
  "creator-drill":    "Creator drill",
  "whole-tutorial":   "Whole tutorial",
};

const PLACEMENT_PILL: Record<ResourcePlacement, string> = {
  "lesson-overview":  "bg-rose-100   text-rose-700   border border-rose-200",
  "what-youll-learn": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "creator-drill":    "bg-amber-100  text-amber-700  border border-amber-200",
  "whole-tutorial":   "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

/* ── Type config — icon, pill color, accent color ───────────────────── */

const TYPE_META: Record<
  ResourceType,
  { label: string; icon: LucideIcon; pill: string; tile: string }
> = {
  pdf: {
    label: "PDF",
    icon: FileText,
    pill: "bg-rose-100   text-rose-700   border border-rose-200",
    tile: "bg-rose-100   text-rose-600",
  },
  docx: {
    label: "DOCX",
    icon: FileText,
    pill: "bg-blue-100   text-blue-700   border border-blue-200",
    tile: "bg-blue-100   text-blue-600",
  },
  pptx: {
    label: "PPTX",
    icon: FileText,
    pill: "bg-orange-100 text-orange-700 border border-orange-200",
    tile: "bg-orange-100 text-orange-600",
  },
  xlsx: {
    label: "XLSX",
    icon: FileSpreadsheet,
    pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    tile: "bg-emerald-100 text-emerald-600",
  },
  template: {
    label: "Template",
    icon: LayoutGrid,
    pill: "bg-green-100  text-green-700  border border-green-200",
    tile: "bg-green-100  text-green-600",
  },
  link: {
    label: "Link",
    icon: Link2,
    pill: "bg-violet-100 text-violet-700 border border-violet-200",
    tile: "bg-violet-100 text-violet-600",
  },
  zip: {
    label: "ZIP",
    icon: FileArchive,
    pill: "bg-amber-100  text-amber-700  border border-amber-200",
    tile: "bg-amber-100  text-amber-600",
  },
};

/* ── Initial seed mirrors the design mockup exactly ────────────────── */

const INITIAL_RESOURCES: Resource[] = [
  {
    id: "r1",
    title: "Hook Library Starter Pack",
    subtitle: "50 proven hooks across niches to spark ideas",
    type: "pdf",
    size: "2.4 MB",
    bytes: 2_400_000,
    placement: "lesson-overview",
  },
  {
    id: "r2",
    title: "Creator Brief Worksheet",
    subtitle: "Plan your creator brief with this fillable worksheet",
    type: "docx",
    size: "138 KB",
    bytes: 138_000,
    placement: "creator-drill",
  },
  {
    id: "r3",
    title: "Content Pillars Template",
    subtitle: "Reusable template to map your core content pillars",
    type: "template",
    size: "92 KB",
    bytes: 92_000,
    placement: "what-youll-learn",
  },
  {
    id: "r4",
    title: "Example Brand Outreach Script",
    subtitle: "Cold outreach script that converts",
    type: "link",
    size: null,
    bytes: 0,
    placement: "creator-drill",
    url: "https://example.com/outreach-script",
  },
  {
    id: "r5",
    title: "Lesson Slide Deck",
    subtitle: "Slide deck used in the video walkthrough",
    type: "pptx",
    size: "5.7 MB",
    bytes: 5_700_000,
    placement: "lesson-overview",
  },
  {
    id: "r6",
    title: "Canva Planning Board",
    subtitle: "Editable board to plan your content calendar",
    type: "link",
    size: null,
    bytes: 0,
    placement: "whole-tutorial",
    url: "https://canva.com/board/example",
  },
];

/* ── Sort + filter options ──────────────────────────────────────────── */

type SortKey = "recent" | "title-asc" | "title-desc" | "size-desc" | "size-asc";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent",     label: "Recent first"     },
  { key: "title-asc",  label: "Title A → Z"      },
  { key: "title-desc", label: "Title Z → A"      },
  { key: "size-desc",  label: "Size: largest"    },
  { key: "size-asc",   label: "Size: smallest"   },
];

type FilterKey = "all" | ResourceType;
const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All types" },
  { key: "pdf",      label: "PDFs"      },
  { key: "docx",     label: "Documents" },
  { key: "pptx",     label: "Slides"    },
  { key: "xlsx",     label: "Sheets"    },
  { key: "template", label: "Templates" },
  { key: "link",     label: "Links"     },
  { key: "zip",      label: "Archives"  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Public component
   ───────────────────────────────────────────────────────────────────────── */

export function ResourcesTab() {
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [defaultPlacement, setDefaultPlacement] =
    useState<ResourcePlacement>("lesson-overview");
  const [sortKey, setSortKey]     = useState<SortKey>("recent");
  const [filterKey, setFilterKey] = useState<FilterKey>("all");
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [addMenuOpen,  setAddMenuOpen]  = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef   = useRef<HTMLDivElement>(null);

  /* Auto-dismiss the toast. */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* Close add-menu on outside click. */
  useEffect(() => {
    if (!addMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (!addMenuRef.current?.contains(e.target as Node)) setAddMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [addMenuOpen]);

  /* ── Derived list (filter → sort) ─────────────────────────────────── */
  const visibleResources = useMemo(() => {
    let list = resources.slice();
    if (filterKey !== "all") list = list.filter((r) => r.type === filterKey);
    switch (sortKey) {
      case "title-asc":  list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "title-desc": list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "size-desc":  list.sort((a, b) => b.bytes - a.bytes); break;
      case "size-asc":   list.sort((a, b) => a.bytes - b.bytes); break;
      case "recent":     /* preserve insertion order */ break;
    }
    return list;
  }, [resources, filterKey, sortKey]);

  /* ── Stats for the bottom footer ──────────────────────────────────── */
  const totalSize = useMemo(() => {
    const bytes = resources.reduce((sum, r) => sum + r.bytes, 0);
    return formatBytes(bytes);
  }, [resources]);

  /* ── Mutations ────────────────────────────────────────────────────── */

  function addFromFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next: Resource[] = [];
    for (const f of Array.from(files)) {
      next.push({
        id:        makeId(),
        title:     f.name.replace(/\.[^.]+$/, ""),
        subtitle:  "Uploaded just now",
        type:      typeFromFilename(f.name),
        size:      formatBytes(f.size),
        bytes:     f.size,
        placement: defaultPlacement,
      });
    }
    setResources((prev) => [...next, ...prev]);
    setToast(`${next.length} file${next.length === 1 ? "" : "s"} added`);
  }

  function addLink(url: string, title: string) {
    const cleaned = url.trim();
    if (!cleaned) return;
    setResources((prev) => [
      {
        id:        makeId(),
        title:     title.trim() || hostnameOf(cleaned),
        subtitle:  cleaned,
        type:      "link",
        size:      null,
        bytes:     0,
        placement: defaultPlacement,
        url:       cleaned,
      },
      ...prev,
    ]);
    setLinkFormOpen(false);
    setToast("Link added");
  }

  function removeResource(id: string) {
    setResources((prev) => prev.filter((r) => r.id !== id));
    setToast("Resource removed");
  }

  function setResourcePlacement(id: string, placement: ResourcePlacement) {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, placement } : r)),
    );
  }

  function renameResource(id: string, title: string) {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title } : r)),
    );
  }

  /* ── Drag & drop ─────────────────────────────────────────────────── */
  const [dragging, setDragging] = useState(false);

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }
  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFromFiles(e.dataTransfer.files);
  }

  /* ───────────────────────────────────────────────────────────────── */

  return (
    <section className="space-y-5">
      {/* ── Header card: title + Attach-to-lesson tabs ───────────────── */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-start lg:justify-between">
          {/* Left: folder icon + title + subtitle */}
          <div className="flex items-start gap-4 min-w-0">
            <span
              className="size-14 rounded-[14px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0"
              aria-hidden
            >
              <Folder className="size-7" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[24px] sm:text-[28px] text-ink-900 leading-tight">
                Resources
              </h2>
              <p className="mt-1 text-[13.5px] text-ink-500 leading-relaxed max-w-md">
                Attach worksheets, templates, links, and files that help learners
                apply the lesson.
              </p>
            </div>
          </div>

          {/* Right: Attach-to-lesson placement tabs */}
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 mb-2 text-[12px] text-ink-500 font-medium">
              <span>Attach to lesson</span>
              <Info className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
            </div>
            <div
              role="tablist"
              aria-label="Default placement for new resources"
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-[12px] bg-cream-100 border border-ink-100"
            >
              {PLACEMENT_TABS.map((t) => {
                const active = defaultPlacement === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setDefaultPlacement(t.key)}
                    className={cn(
                      "h-8 px-3 rounded-[10px] text-[12.5px] font-medium transition-colors",
                      active
                        ? "bg-rose-600 text-white shadow-sm"
                        : "text-ink-700 hover:bg-cream-200/70 hover:text-ink-900",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11.5px] text-ink-500 max-w-[320px]">
              Choose where new resources will appear by default.
            </p>
          </div>
        </div>
      </div>

      {/* ── Toolbar + drop zone + table ──────────────────────────────── */}
      <div className="card p-4 sm:p-5 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary: Add resource (menu) */}
          <div ref={addMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setAddMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={addMenuOpen}
              className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
            >
              <Plus className="size-4" strokeWidth={2.5} aria-hidden />
              Add resource
              <ChevronDown className="size-3.5 -mr-0.5" strokeWidth={2.2} aria-hidden />
            </button>
            {addMenuOpen && (
              <div
                role="menu"
                className="absolute left-0 top-[calc(100%+6px)] z-20 w-[200px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
              >
                <MenuItem
                  icon={Upload}
                  label="Upload file"
                  onClick={() => {
                    setAddMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                />
                <MenuItem
                  icon={LinkIcon}
                  label="Add link"
                  onClick={() => {
                    setAddMenuOpen(false);
                    setLinkFormOpen(true);
                  }}
                />
                <MenuItem
                  icon={FolderPlus}
                  label="Create folder"
                  onClick={() => {
                    setAddMenuOpen(false);
                    setToast("Folders coming soon");
                  }}
                />
              </div>
            )}
          </div>

          {/* Secondary actions */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors"
          >
            <Upload className="size-3.5 text-ink-500" strokeWidth={2} aria-hidden />
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setLinkFormOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors"
          >
            <LinkIcon className="size-3.5 text-ink-500" strokeWidth={2} aria-hidden />
            Add link
          </button>
          <button
            type="button"
            onClick={() => setToast("Folders coming soon")}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors"
          >
            <FolderPlus className="size-3.5 text-ink-500" strokeWidth={2} aria-hidden />
            Create folder
          </button>

          <div className="flex-1" />

          {/* Filter */}
          <FilterSelect
            value={filterKey}
            onChange={(v) => setFilterKey(v)}
            label="Filter"
            icon={Filter}
            options={FILTER_OPTIONS}
          />
          {/* Sort */}
          <FilterSelect
            value={sortKey}
            onChange={(v) => setSortKey(v)}
            label="Sort"
            icon={ArrowUpDown}
            options={SORT_OPTIONS}
          />
        </div>

        {/* Hidden file input shared by Upload buttons */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.csv,.txt,.png,.jpg,.jpeg"
          className="sr-only"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            addFromFiles(e.target.files);
            // Reset so picking the same file twice in a row still fires onChange.
            e.target.value = "";
          }}
        />

        {/* Add-link inline form */}
        {linkFormOpen && (
          <LinkForm
            onCancel={() => setLinkFormOpen(false)}
            onSubmit={(url, title) => addLink(url, title)}
          />
        )}

        {/* Drag & drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload files by clicking or dragging here"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            "rounded-[14px] border-2 border-dashed px-5 py-7 text-center transition-colors cursor-pointer",
            dragging
              ? "border-rose-400 bg-rose-50"
              : "border-rose-200 bg-rose-50/40 hover:border-rose-300 hover:bg-rose-50",
          )}
        >
          <div className="mx-auto inline-flex items-center justify-center size-10 rounded-full bg-rose-100 text-rose-600 mb-2">
            <Cloud className="size-5" strokeWidth={1.9} aria-hidden />
          </div>
          <div className="text-[13.5px] text-ink-700">
            <span className="font-semibold">Drag &amp; drop files here</span>{" "}
            or{" "}
            <span className="font-semibold text-rose-700">browse</span>
          </div>
          <p className="mt-1 text-[11.5px] text-ink-500">
            PDF, DOCX, PPTX, XLSX, ZIP up to 100MB
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-[0.16em] text-ink-500 font-bold">
                <Th>Resource</Th>
                <Th>Type</Th>
                <Th className="text-right">Size</Th>
                <Th>Placement</Th>
                <Th className="text-right pr-2">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visibleResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-ink-500">
                    No resources match the current filter.
                  </td>
                </tr>
              ) : (
                visibleResources.map((r) => (
                  <ResourceRow
                    key={r.id}
                    resource={r}
                    onRemove={() => removeResource(r.id)}
                    onPlacement={(p) => setResourcePlacement(r.id, p)}
                    onRename={(t) => renameResource(r.id, t)}
                    onCopy={(text) => {
                      void navigator.clipboard.writeText(text).then(
                        () => setToast("Copied to clipboard"),
                        () => setToast("Could not copy"),
                      );
                    }}
                    onToast={(msg) => setToast(msg)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-ink-100 text-[12.5px] text-ink-500 tabular-nums">
          <span>
            {resources.length} resource{resources.length === 1 ? "" : "s"}
          </span>
          <span>Total size: {totalSize}</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-ink-900 text-white text-[12.5px] shadow-card"
        >
          <CheckCircle2 className="size-3.5 text-emerald-300" strokeWidth={2.5} aria-hidden />
          {toast}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right-rail companion cards (exported for tutorial-editor to render
   alongside the existing VideoPreview + PublishingReadiness pair).
   ───────────────────────────────────────────────────────────────────────── */

export function ResourceHealthCard({
  total,
  external,
  missing,
}: {
  total: number;
  external: number;
  missing: number;
}) {
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-ink-900 flex items-center gap-1.5">
          Resource health
          <Info className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
        </h3>
      </header>
      <div className="grid grid-cols-3 gap-3">
        <HealthStat
          icon={Folder}
          tile="bg-blue-100   text-blue-600"
          value={total}
          label="Total resources"
        />
        <HealthStat
          icon={Link2}
          tile="bg-violet-100 text-violet-600"
          value={external}
          label="External links"
        />
        <HealthStat
          icon={CheckCircle2}
          tile="bg-emerald-100 text-emerald-600"
          value={missing}
          label="Missing files"
        />
      </div>
    </section>
  );
}

export function BestPracticesCard() {
  const tips = [
    "Use clear, descriptive titles for every resource.",
    "Keep files under 100MB for the best experience.",
    "Link to editable templates whenever possible.",
    "Ensure external links are up-to-date and accessible.",
  ];
  return (
    <section className="card p-5">
      <header className="flex items-center gap-2 mb-3">
        <span className="size-7 rounded-[8px] bg-amber-100 text-amber-600 inline-flex items-center justify-center" aria-hidden>
          <Lightbulb className="size-4" strokeWidth={2} />
        </span>
        <h3 className="text-[14px] font-bold text-ink-900">Best practices</h3>
      </header>
      <ul className="space-y-2">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-[12.5px] text-ink-700 leading-snug">
            <span
              className="mt-1.5 size-1.5 rounded-full bg-rose-500 shrink-0"
              aria-hidden
            />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Helper for the dev-editor wiring: counts the right metrics for a
   given resource list so the editor's right rail stays in sync. */
export function summarizeResources(resources: Resource[]) {
  return {
    total:    resources.length,
    external: resources.filter((r) => r.type === "link").length,
    missing:  0, // wire up once we have a real storage backend
    bytes:    resources.reduce((sum, r) => sum + r.bytes, 0),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Internal building blocks
   ───────────────────────────────────────────────────────────────────────── */

function ResourceRow({
  resource,
  onRemove,
  onPlacement,
  onRename,
  onCopy,
  onToast,
}: {
  resource: Resource;
  onRemove: () => void;
  onPlacement: (p: ResourcePlacement) => void;
  onRename: (title: string) => void;
  onCopy: (text: string) => void;
  onToast: (msg: string) => void;
}) {
  const meta = TYPE_META[resource.type];
  const Icon = meta.icon;
  const isLink = resource.type === "link";

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  function openPreview() {
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    } else {
      onToast(`Preview for ${resource.title} (UI demo)`);
    }
  }

  return (
    <tr className="border-t border-ink-100 hover:bg-cream-50/60 transition-colors">
      {/* Resource cell — icon + title + subtitle */}
      <Td>
        <div className="flex items-start gap-3 min-w-0 py-1">
          <span
            className={cn(
              "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
              meta.tile,
            )}
            aria-hidden
          >
            <Icon className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            {editing ? (
              <input
                autoFocus
                type="text"
                defaultValue={resource.title}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v) onRename(v);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") setEditing(false);
                }}
                className="block w-full text-[13.5px] font-semibold text-ink-900 leading-tight bg-transparent border-b-2 border-rose-400 outline-none pb-0.5"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="block text-left text-[13.5px] font-semibold text-ink-900 leading-tight hover:text-rose-700 transition-colors truncate w-full"
              >
                {resource.title}
              </button>
            )}
            <p className="mt-0.5 text-[11.5px] text-ink-500 leading-snug truncate">
              {resource.subtitle}
            </p>
          </div>
        </div>
      </Td>

      {/* Type pill */}
      <Td>
        <span
          className={cn(
            "inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap",
            meta.pill,
          )}
        >
          {meta.label}
        </span>
      </Td>

      {/* Size */}
      <Td className="text-right text-[12.5px] text-ink-700 tabular-nums whitespace-nowrap">
        {resource.size ?? "—"}
      </Td>

      {/* Placement pill */}
      <Td>
        <span
          className={cn(
            "inline-flex items-center px-2 h-[22px] rounded-md text-[11px] font-semibold whitespace-nowrap",
            PLACEMENT_PILL[resource.placement],
          )}
        >
          {PLACEMENT_LABEL[resource.placement]}
        </span>
      </Td>

      {/* Actions */}
      <Td className="text-right pr-2">
        <div className="inline-flex items-center gap-1 shrink-0">
          <RowIconButton
            icon={isLink ? ExternalLink : Eye}
            label={isLink ? "Open link" : "Preview"}
            onClick={openPreview}
          />
          {isLink ? (
            <RowIconButton
              icon={Pencil}
              label="Edit resource title"
              onClick={() => setEditing(true)}
            />
          ) : (
            <RowIconButton
              icon={Copy}
              label="Copy title"
              onClick={() => onCopy(resource.title)}
            />
          )}
          <div ref={menuRef} className="relative">
            <RowIconButton
              icon={MoreHorizontal}
              label="More actions"
              onClick={() => setMenuOpen((v) => !v)}
              active={menuOpen}
            />
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+4px)] z-20 w-[200px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
              >
                <MenuItem
                  icon={Pencil}
                  label="Rename"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditing(true);
                  }}
                />
                <MenuItem
                  icon={Copy}
                  label={resource.url ? "Copy URL" : "Copy title"}
                  onClick={() => {
                    setMenuOpen(false);
                    onCopy(resource.url ?? resource.title);
                  }}
                />
                <div aria-hidden className="my-1 mx-2 border-t border-ink-100" />
                <div className="px-2 pt-1 pb-1 text-[10.5px] uppercase tracking-[0.14em] font-bold text-ink-400">
                  Move to
                </div>
                {PLACEMENT_TABS.map((t) => (
                  <MenuItem
                    key={t.key}
                    icon={t.key === resource.placement ? Check : Folder}
                    label={t.label}
                    active={t.key === resource.placement}
                    onClick={() => {
                      setMenuOpen(false);
                      onPlacement(t.key);
                    }}
                  />
                ))}
                <div aria-hidden className="my-1 mx-2 border-t border-ink-100" />
                <MenuItem
                  icon={Trash2}
                  label="Remove"
                  danger
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Td>
    </tr>
  );
}

function LinkForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (url: string, title: string) => void;
}) {
  const [url,   setUrl]   = useState("");
  const [title, setTitle] = useState("");
  const valid = /^https?:\/\/\S+\.\S+/.test(url.trim());

  return (
    <div className="rounded-[12px] border border-rose-200 bg-rose-50/40 p-3 sm:p-4">
      <div className="flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-[0.14em] font-bold text-rose-600">
        <LinkIcon className="size-3.5" strokeWidth={2.5} aria-hidden />
        Add link
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
        <input
          autoFocus
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Link URL"
          className="h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
        />
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Link title"
          className="h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSubmit(url, title)}
            disabled={!valid}
            className={cn(
              "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] text-[13px] font-semibold transition-colors",
              valid
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-rose-200 text-white cursor-not-allowed",
            )}
          >
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-ink-700 text-[13px] font-medium hover:bg-cream-100"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  label,
  icon: Icon,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  label: string;
  icon: LucideIcon;
  options: { key: T; label: string }[];
}) {
  const current = options.find((o) => o.key === value);
  return (
    <label className="relative inline-flex items-center h-10 rounded-[10px] bg-white border border-ink-200 hover:border-rose-200 text-[12.5px] font-medium text-ink-700 transition-colors cursor-pointer">
      <span className="pl-3 pr-1.5 inline-flex items-center gap-1.5">
        <Icon className="size-3.5 text-ink-500" strokeWidth={2} aria-hidden />
        <span className="text-ink-500">{label}</span>
      </span>
      <span className="pr-2 inline-flex items-center gap-1 text-ink-900">
        {current?.label ?? options[0].label}
        <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2.2} aria-hidden />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 opacity-0 cursor-pointer"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function HealthStat({
  icon: Icon,
  tile,
  value,
  label,
}: {
  icon: LucideIcon;
  tile: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[12px] border border-ink-100 bg-cream-50/60 p-3">
      <div className="flex items-center gap-2">
        <span
          className={cn("size-7 rounded-[8px] inline-flex items-center justify-center", tile)}
          aria-hidden
        >
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
        <span className="text-[20px] font-bold text-ink-900 tabular-nums leading-none">
          {value}
        </span>
      </div>
      <span className="text-[11.5px] text-ink-500 leading-snug">{label}</span>
    </div>
  );
}

function RowIconButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
      className={cn(
        "size-8 rounded-[8px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors",
        active && "bg-cream-100 text-ink-900",
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] transition-colors",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : active
            ? "text-rose-700 bg-rose-50/60 hover:bg-rose-50"
            : "text-ink-700 hover:bg-cream-100",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      {label}
    </button>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("font-bold py-2 px-2.5 align-middle whitespace-nowrap", className)}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 px-2.5 align-middle", className)}>{children}</td>;
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────── */

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Math.random().toString(36).slice(2, 9)}`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function typeFromFilename(name: string): ResourceType {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext === "pdf")  return "pdf";
  if (ext === "doc" || ext === "docx") return "docx";
  if (ext === "ppt" || ext === "pptx") return "pptx";
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return "xlsx";
  if (ext === "zip") return "zip";
  return "template";
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
