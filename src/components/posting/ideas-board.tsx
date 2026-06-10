"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  Ellipsis,
  ImagePlus,
  Kanban,
  LayoutGrid,
  Loader2,
  Network,
  Pencil,
  Plus,
  Search,
  Settings,
  Tag as TagIcon,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Ideas board — a Trello-style planning surface for raw content ideas
   before they become scheduled posts. Board + Gallery views, tag filtering,
   drag & drop between columns, column reordering and renaming.

   Persistence: localStorage (this device) behind the small store API below —
   designed so a Supabase `posting_ideas` table can replace it without
   touching the UI.
   ───────────────────────────────────────────────────────────────────────── */

type IdeaTag = { id: string; label: string; color: string };
type Idea = {
  id: string;
  title: string;
  desc: string;
  imageUrl: string | null;
  tagIds: string[];
  columnId: string;
  createdAt: number;
};
type Column = { id: string; title: string };
type Store = { columns: Column[]; ideas: Idea[]; tags: IdeaTag[] };

const LS_KEY = "cgos-ideas-board-v1";

const DEFAULT_COLUMNS: Column[] = [
  { id: "unassigned", title: "Unassigned" },
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

/** First-run starter card so the board explains itself. */
const SEED_IDEA: Idea = {
  id: "seed-welcome",
  title: "This is a place to plan ✍️ your content",
  desc: "Save your ideas before converting them into posts. Brainstorm, plan ahead, and drag cards through the stages as they mature.",
  imageUrl: null,
  tagIds: [],
  columnId: "unassigned",
  createdAt: 0,
};

const TAG_COLORS = [
  "bg-rose-500 text-white",
  "bg-gold-500 text-white",
  "bg-success text-white",
  "bg-sky-500 text-white",
  "bg-violet-500 text-white",
  "bg-ink-700 text-white",
];

/** Curated prompts used by "Generate Ideas" — honest templates, not AI. */
const IDEA_PROMPTS = [
  "Behind the scenes of how a post gets made",
  "3 mistakes I made when I started — and what I'd do differently",
  "Answer the question my audience asks the most",
  "A before/after transformation from my niche",
  "My exact tools & setup, in 30 seconds",
  "React to a trend in my niche with my own take",
  "One tip I'd give a beginner, in under 20 seconds",
  "A day in the life — compressed into 5 shots",
  "Bust a common myth in my niche",
  "Show the result first, then how I got there",
  "Share a fail and the lesson it taught me",
  "Turn my best comment reply into a full post",
];

const emptySubscribe = () => () => {};

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function loadStore(): Store {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // corrupted/blocked storage → start fresh
  }
  return { columns: DEFAULT_COLUMNS, ideas: [SEED_IDEA], tags: [] };
}

/* ─── Root ──────────────────────────────────────────────────────────────── */

export function IdeasBoard() {
  const [store, setStore] = useState<Store | null>(null);
  const [view, setView] = useState<"board" | "gallery">("board");
  const [groupBy, setGroupBy] = useState<"none" | "status">("none");
  const [tagFilter, setTagFilter] = useState<string[]>([]); // tag ids
  const [untaggedOnly, setUntaggedOnly] = useState(false);
  const [modal, setModal] = useState<
    | { mode: "new"; columnId: string }
    | { mode: "edit"; idea: Idea }
    | null
  >(null);

  // SSR renders a loader; once hydrated on the client we adopt the stored
  // board during render (React's sanctioned adjust-state-during-render
  // pattern — no effect, no hydration mismatch).
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  if (hydrated && store === null) {
    setStore(loadStore());
  }
  // Persist on every change.
  useEffect(() => {
    if (store) {
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(store));
      } catch {
        // storage full/blocked — board still works for the session
      }
    }
  }, [store]);

  const update = useCallback((fn: (s: Store) => Store) => {
    setStore((prev) => (prev ? fn(prev) : prev));
  }, []);

  /* ── mutations ── */
  const addIdea = (
    data: Omit<Idea, "id" | "createdAt">,
  ) =>
    update((s) => ({
      ...s,
      ideas: [...s.ideas, { ...data, id: uid(), createdAt: Date.now() }],
    }));
  const saveIdea = (idea: Idea) =>
    update((s) => ({
      ...s,
      ideas: s.ideas.map((i) => (i.id === idea.id ? idea : i)),
    }));
  const deleteIdea = (id: string) =>
    update((s) => ({ ...s, ideas: s.ideas.filter((i) => i.id !== id) }));
  const moveIdea = (id: string, columnId: string, beforeId?: string) =>
    update((s) => {
      const moving = s.ideas.find((i) => i.id === id);
      if (!moving) return s;
      const rest = s.ideas.filter((i) => i.id !== id);
      const moved = { ...moving, columnId };
      if (!beforeId) return { ...s, ideas: [...rest, moved] };
      const at = rest.findIndex((i) => i.id === beforeId);
      if (at === -1) return { ...s, ideas: [...rest, moved] };
      return {
        ...s,
        ideas: [...rest.slice(0, at), moved, ...rest.slice(at)],
      };
    });
  const moveColumn = (id: string, beforeId: string) =>
    update((s) => {
      if (id === beforeId) return s;
      const cols = s.columns.filter((c) => c.id !== id);
      const moving = s.columns.find((c) => c.id === id);
      if (!moving) return s;
      const at = cols.findIndex((c) => c.id === beforeId);
      return {
        ...s,
        columns: [...cols.slice(0, at), moving, ...cols.slice(at)],
      };
    });
  const renameColumn = (id: string, title: string) =>
    update((s) => ({
      ...s,
      columns: s.columns.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  const clearColumn = (id: string) =>
    update((s) => ({
      ...s,
      ideas: s.ideas.filter((i) => i.columnId !== id),
    }));
  const addTag = (label: string): IdeaTag => {
    const tag: IdeaTag = {
      id: uid(),
      label,
      color: TAG_COLORS[(store?.tags.length ?? 0) % TAG_COLORS.length],
    };
    update((s) => ({ ...s, tags: [...s.tags, tag] }));
    return tag;
  };
  const deleteTag = (id: string) =>
    update((s) => ({
      ...s,
      tags: s.tags.filter((t) => t.id !== id),
      ideas: s.ideas.map((i) => ({
        ...i,
        tagIds: i.tagIds.filter((t) => t !== id),
      })),
    }));

  const generateIdeas = () => {
    if (!store) return;
    const existing = new Set(store.ideas.map((i) => i.title));
    const fresh = IDEA_PROMPTS.filter((p) => !existing.has(p));
    // 3 picks per click, cycling through the prompt list.
    const picks = fresh.sort(() => Math.random() - 0.5).slice(0, 3);
    update((s) => ({
      ...s,
      ideas: [
        ...s.ideas,
        ...picks.map((title, n) => ({
          id: uid(),
          title,
          desc: "",
          imageUrl: null,
          tagIds: [],
          columnId: "unassigned",
          createdAt: Date.now() + n,
        })),
      ],
    }));
  };

  /* ── filtering ── */
  const visible = (idea: Idea): boolean => {
    if (untaggedOnly && idea.tagIds.length > 0) return false;
    if (tagFilter.length > 0 && !idea.tagIds.some((t) => tagFilter.includes(t)))
      return false;
    return true;
  };

  if (!store) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-400">
        <Loader2 className="size-5 animate-spin" strokeWidth={2} />
      </div>
    );
  }

  const firstColumnId = store.columns[0]?.id ?? "unassigned";

  return (
    <div className="flex flex-col lg:h-full">
      {/* ── Toolbar (header band) ─────────────────────────────────── */}
      <WorkspaceHeader
        left={
          <button
            type="button"
            onClick={generateIdeas}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/70 text-[13.5px] font-semibold transition-all duration-150 hover:from-rose-100 hover:to-rose-100 hover:ring-rose-300/70 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 cursor-pointer"
          >
            <Wand2 className="size-4 text-rose-600" strokeWidth={2} />
            Generate Ideas
          </button>
        }
      >
        <div className="flex items-center gap-2 flex-wrap py-2.5">
          {view === "gallery" && (
            <GroupsDropdown groupBy={groupBy} onChange={setGroupBy} />
          )}
          <TagsDropdown
            tags={store.tags}
            selected={tagFilter}
            untagged={untaggedOnly}
            onToggleTag={(id) =>
              setTagFilter((prev) =>
                prev.includes(id)
                  ? prev.filter((t) => t !== id)
                  : [...prev, id],
              )
            }
            onToggleUntagged={() => setUntaggedOnly((v) => !v)}
            onClear={() => {
              setTagFilter([]);
              setUntaggedOnly(false);
            }}
            onDeleteTag={deleteTag}
          />

          {/* Board / Gallery toggle */}
          <div className="inline-flex items-center rounded-[12px] border border-ink-200 bg-white p-1">
            <ViewToggleBtn
              active={view === "board"}
              onClick={() => setView("board")}
              icon={<Kanban className="size-4" strokeWidth={2} />}
              label="Board"
            />
            <ViewToggleBtn
              active={view === "gallery"}
              onClick={() => setView("gallery")}
              icon={<LayoutGrid className="size-4" strokeWidth={2} />}
              label="Gallery"
            />
          </div>

          <button
            type="button"
            onClick={() => setModal({ mode: "new", columnId: firstColumnId })}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] border border-ink-200 bg-white text-ink-900 text-[13.5px] font-semibold transition-all duration-150 hover:bg-cream-100 hover:border-ink-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 cursor-pointer"
          >
            <Plus className="size-4" strokeWidth={2.2} />
            New Idea
          </button>
        </div>
      </WorkspaceHeader>

      {/* ── Content — fills the remaining panel height ────────────── */}
      <div
        className={cn(
          "flex-1 min-h-0 pt-4",
          view === "gallery" && "overflow-y-auto",
        )}
      >
        {view === "board" ? (
          <BoardView
            store={store}
            visible={visible}
            onNewIdea={(columnId) => setModal({ mode: "new", columnId })}
            onEditIdea={(idea) => setModal({ mode: "edit", idea })}
            onMoveIdea={moveIdea}
            onMoveColumn={moveColumn}
            onRenameColumn={renameColumn}
            onClearColumn={clearColumn}
          />
        ) : (
          <GalleryView
            store={store}
            visible={visible}
            groupBy={groupBy}
            onEditIdea={(idea) => setModal({ mode: "edit", idea })}
            onNewIdea={() => setModal({ mode: "new", columnId: firstColumnId })}
          />
        )}
      </div>

      {modal && (
        <IdeaModal
          key={modal.mode === "edit" ? modal.idea.id : `new-${modal.columnId}`}
          columns={store.columns}
          tags={store.tags}
          initial={modal.mode === "edit" ? modal.idea : null}
          defaultColumnId={
            modal.mode === "new" ? modal.columnId : modal.idea.columnId
          }
          onCreateTag={addTag}
          onClose={() => setModal(null)}
          onDelete={
            modal.mode === "edit"
              ? () => {
                  deleteIdea(modal.idea.id);
                  setModal(null);
                }
              : undefined
          }
          onSave={(data) => {
            if (modal.mode === "edit") saveIdea({ ...modal.idea, ...data });
            else addIdea(data);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

/* ─── Toolbar bits ─────────────────────────────────────────────────────── */

function ViewToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-[9px] text-[13px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200",
        active
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "text-ink-500 hover:text-ink-900 hover:bg-cream-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Shared dropdown shell with click-outside dismissal. */
function Dropdown({
  trigger,
  open,
  setOpen,
  children,
  width = "w-[280px]",
}: {
  trigger: ReactNode;
  open: boolean;
  setOpen: (v: boolean) => void;
  children: ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div
          className={cn(
            "anim-modal-in absolute right-0 top-[calc(100%+6px)] z-40 rounded-[14px] bg-white p-3 shadow-[0_24px_60px_-20px_rgba(26,24,22,0.35)] ring-1 ring-ink-100",
            width,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function GroupsDropdown({
  groupBy,
  onChange,
}: {
  groupBy: "none" | "status";
  onChange: (g: "none" | "status") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown
      open={open}
      setOpen={setOpen}
      width="w-[200px]"
      trigger={
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[12px] text-[13.5px] font-medium text-ink-700 transition-colors hover:bg-cream-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <Network className="size-4 text-ink-500" strokeWidth={2} />
          Groups
          <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
        </button>
      }
    >
      {(
        [
          { key: "none", label: "No grouping" },
          { key: "status", label: "Group by status" },
        ] as const
      ).map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => {
            onChange(o.key);
            setOpen(false);
          }}
          className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-2 text-[13px] text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
        >
          {o.label}
          {groupBy === o.key && (
            <Check className="size-3.5 text-rose-600" strokeWidth={2.5} />
          )}
        </button>
      ))}
    </Dropdown>
  );
}

function TagsDropdown({
  tags,
  selected,
  untagged,
  onToggleTag,
  onToggleUntagged,
  onClear,
  onDeleteTag,
}: {
  tags: IdeaTag[];
  selected: string[];
  untagged: boolean;
  onToggleTag: (id: string) => void;
  onToggleUntagged: () => void;
  onClear: () => void;
  onDeleteTag: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [manage, setManage] = useState(false);
  const activeCount = selected.length + (untagged ? 1 : 0);
  const shown = tags.filter((t) =>
    t.label.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <Dropdown
      open={open}
      setOpen={setOpen}
      trigger={
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[12px] text-[13.5px] font-medium text-ink-700 transition-colors hover:bg-cream-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <TagIcon className="size-4 text-ink-500" strokeWidth={2} />
          Tags
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10.5px] font-bold tabular-nums">
              {activeCount}
            </span>
          )}
          <ChevronDown className="size-3.5 text-ink-400" strokeWidth={2} />
        </button>
      }
    >
      {/* search */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tags"
          className="w-full h-10 pl-9 pr-3 rounded-[10px] border border-ink-200 bg-white text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {/* untagged */}
      <label className="flex items-center gap-2.5 rounded-[10px] bg-cream-100/70 px-3 py-2.5 mb-1 cursor-pointer">
        <input
          type="checkbox"
          checked={untagged}
          onChange={onToggleUntagged}
          className="size-4 accent-rose-600"
        />
        <span className="text-[13px] font-medium text-ink-700">Untagged</span>
      </label>

      {/* tag rows */}
      <div className="max-h-[200px] overflow-y-auto">
        {shown.length === 0 ? (
          <p className="px-3 py-3 text-[12.5px] text-ink-400">
            {tags.length === 0
              ? "No tags yet — add them on an idea."
              : "No tags match your search."}
          </p>
        ) : (
          shown.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 hover:bg-cream-100/70 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => onToggleTag(t.id)}
                className="size-4 accent-rose-600 cursor-pointer"
              />
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none",
                  t.color,
                )}
              >
                {t.label}
              </span>
              {manage && (
                <button
                  type="button"
                  onClick={() => onDeleteTag(t.id)}
                  aria-label={`Delete tag ${t.label}`}
                  className="ml-auto inline-flex size-6 items-center justify-center rounded-full text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* footer */}
      <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2.5 px-1">
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] font-medium text-ink-700 hover:text-ink-900 transition-colors cursor-pointer"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => setManage((v) => !v)}
          aria-pressed={manage}
          aria-label="Manage tags"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-[8px] transition-colors cursor-pointer",
            manage
              ? "bg-rose-50 text-rose-600"
              : "text-ink-400 hover:text-ink-700 hover:bg-cream-100",
          )}
        >
          <Settings className="size-4" strokeWidth={2} />
        </button>
      </div>
    </Dropdown>
  );
}

/* ─── Board view ───────────────────────────────────────────────────────── */

function BoardView({
  store,
  visible,
  onNewIdea,
  onEditIdea,
  onMoveIdea,
  onMoveColumn,
  onRenameColumn,
  onClearColumn,
}: {
  store: Store;
  visible: (i: Idea) => boolean;
  onNewIdea: (columnId: string) => void;
  onEditIdea: (idea: Idea) => void;
  onMoveIdea: (id: string, columnId: string, beforeId?: string) => void;
  onMoveColumn: (id: string, beforeId: string) => void;
  onRenameColumn: (id: string, title: string) => void;
  onClearColumn: (id: string) => void;
}) {
  const [overColumn, setOverColumn] = useState<string | null>(null);

  return (
    <div className="flex h-full items-stretch gap-4 overflow-x-auto pb-4">
      {store.columns.map((col) => {
        const ideas = store.ideas.filter(
          (i) => i.columnId === col.id && visible(i),
        );
        return (
          <BoardColumn
            key={col.id}
            column={col}
            ideas={ideas}
            tags={store.tags}
            highlight={overColumn === col.id}
            setHighlight={(on) => setOverColumn(on ? col.id : null)}
            onNewIdea={() => onNewIdea(col.id)}
            onEditIdea={onEditIdea}
            onMoveIdea={onMoveIdea}
            onMoveColumn={onMoveColumn}
            onRename={(title) => onRenameColumn(col.id, title)}
            onClear={() => onClearColumn(col.id)}
          />
        );
      })}
    </div>
  );
}

function BoardColumn({
  column,
  ideas,
  tags,
  highlight,
  setHighlight,
  onNewIdea,
  onEditIdea,
  onMoveIdea,
  onMoveColumn,
  onRename,
  onClear,
}: {
  column: Column;
  ideas: Idea[];
  tags: IdeaTag[];
  highlight: boolean;
  setHighlight: (on: boolean) => void;
  onNewIdea: () => void;
  onEditIdea: (idea: Idea) => void;
  onMoveIdea: (id: string, columnId: string, beforeId?: string) => void;
  onMoveColumn: (id: string, beforeId: string) => void;
  onRename: (title: string) => void;
  onClear: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(column.title);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setHighlight(false);
    const ideaId = e.dataTransfer.getData("idea/id");
    const colId = e.dataTransfer.getData("column/id");
    if (ideaId) onMoveIdea(ideaId, column.id);
    else if (colId) onMoveColumn(colId, column.id);
  }

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setHighlight(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setHighlight(false);
      }}
      onDrop={onDrop}
      className={cn(
        "w-[290px] shrink-0 rounded-[16px] p-3 transition-colors duration-150 min-h-[420px] lg:min-h-0 lg:h-full flex flex-col ring-1 ring-inset",
        highlight
          ? "bg-rose-100/70 ring-rose-300"
          : "bg-cream-200/70 ring-ink-100/60",
      )}
    >
      {/* column header — draggable for reordering */}
      <header
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("column/id", column.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        className="flex items-center gap-2 px-1.5 pb-3 cursor-grab active:cursor-grabbing"
      >
        {renaming ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setRenaming(false);
              if (title.trim()) onRename(title.trim());
              else setTitle(column.title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setTitle(column.title);
                setRenaming(false);
              }
            }}
            className="h-7 w-[140px] rounded-[8px] border border-rose-300 bg-white px-2 text-[14.5px] font-bold text-ink-900 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        ) : (
          <h3 className="text-[15px] font-bold text-ink-900">{column.title}</h3>
        )}
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-white/90 ring-1 ring-ink-100 text-[12px] font-semibold tabular-nums text-ink-600">
          {ideas.length}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onNewIdea}
          aria-label={`Add idea to ${column.title}`}
          className="inline-flex size-7 items-center justify-center rounded-[8px] text-ink-500 hover:bg-white hover:text-ink-900 transition-colors cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.2} />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`${column.title} options`}
            className="inline-flex size-7 items-center justify-center rounded-[8px] text-ink-500 hover:bg-white hover:text-ink-900 transition-colors cursor-pointer"
          >
            <Ellipsis className="size-4" strokeWidth={2} />
          </button>
          {menuOpen && (
            <ColumnMenu
              onClose={() => setMenuOpen(false)}
              onRename={() => {
                setMenuOpen(false);
                setRenaming(true);
              }}
              onClear={() => {
                setMenuOpen(false);
                onClear();
              }}
              clearDisabled={ideas.length === 0}
            />
          )}
        </div>
      </header>

      {/* cards — the column body scrolls when it overflows the full-height board */}
      <div
        className={cn(
          "flex-1 min-h-0 space-y-3 overflow-y-auto",
          ideas.length === 0 && "flex flex-col justify-center",
        )}
      >
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            tags={tags}
            onClick={() => onEditIdea(idea)}
            onDropBefore={(droppedId) =>
              onMoveIdea(droppedId, column.id, idea.id)
            }
          />
        ))}

        {/* + New Idea — centered when empty (like the reference), inline after cards otherwise */}
        <button
          type="button"
          onClick={onNewIdea}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] py-3 text-[14px] font-medium text-ink-500 transition-colors hover:bg-white hover:text-rose-700 cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          New Idea
        </button>
      </div>
    </section>
  );
}

function ColumnMenu({
  onClose,
  onRename,
  onClear,
  clearDisabled,
}: {
  onClose: () => void;
  onRename: () => void;
  onClear: () => void;
  clearDisabled: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="anim-modal-in absolute right-0 top-[calc(100%+4px)] z-30 w-[190px] rounded-[12px] bg-white p-1.5 shadow-[0_18px_44px_-16px_rgba(26,24,22,0.35)] ring-1 ring-ink-100"
    >
      <button
        type="button"
        onClick={onRename}
        className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[13px] text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
      >
        <Pencil className="size-3.5 text-ink-400" strokeWidth={2} />
        Rename column
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={clearDisabled}
        className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-[13px] text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 className="size-3.5" strokeWidth={2} />
        Delete all ideas
      </button>
    </div>
  );
}

/* ─── Card ─────────────────────────────────────────────────────────────── */

function IdeaCard({
  idea,
  tags,
  onClick,
  onDropBefore,
  galleryStyle = false,
}: {
  idea: Idea;
  tags: IdeaTag[];
  onClick: () => void;
  onDropBefore?: (droppedIdeaId: string) => void;
  galleryStyle?: boolean;
}) {
  return (
    <div
      draggable={!galleryStyle}
      onDragStart={(e) => {
        e.dataTransfer.setData("idea/id", idea.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        if (onDropBefore) e.preventDefault();
      }}
      onDrop={(e) => {
        if (!onDropBefore) return;
        const droppedId = e.dataTransfer.getData("idea/id");
        if (droppedId && droppedId !== idea.id) {
          e.preventDefault();
          e.stopPropagation();
          onDropBefore(droppedId);
        }
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group/card overflow-hidden rounded-[14px] bg-white ring-1 ring-ink-100 shadow-[0_1px_2px_rgba(26,24,22,0.05)] transition-all duration-150 cursor-pointer",
        "hover:-translate-y-px hover:shadow-[0_12px_28px_-16px_rgba(26,24,22,0.3)] hover:ring-ink-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
        !galleryStyle && "active:cursor-grabbing",
      )}
    >
      {idea.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={idea.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-[150px] w-full object-cover"
        />
      )}
      <div className="p-4">
        <div className="text-[14.5px] font-bold leading-snug text-ink-900">
          {idea.title}
        </div>
        {idea.desc && (
          <p className="mt-1.5 text-[13px] leading-snug text-ink-500 line-clamp-3">
            {idea.desc}
          </p>
        )}
        {idea.tagIds.length > 0 && (
          <TagPills tagIds={idea.tagIds} tags={tags} className="mt-2.5" />
        )}
      </div>
    </div>
  );
}

/** Resolves tag ids → colored pills. */
function TagPills({
  tagIds,
  tags,
  className,
}: {
  tagIds: string[];
  tags: IdeaTag[];
  className?: string;
}) {
  const resolved = tagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is IdeaTag => Boolean(t));
  if (resolved.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {resolved.map((t) => (
        <span
          key={t.id}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
            t.color,
          )}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}

/* ─── Gallery view ─────────────────────────────────────────────────────── */

function GalleryView({
  store,
  visible,
  groupBy,
  onEditIdea,
  onNewIdea,
}: {
  store: Store;
  visible: (i: Idea) => boolean;
  groupBy: "none" | "status";
  onEditIdea: (idea: Idea) => void;
  onNewIdea: () => void;
}) {
  const ideas = store.ideas.filter(visible);

  if (ideas.length === 0) {
    return (
      <div className="card rounded-[16px] px-5 py-16 text-center">
        <p className="text-[14px] font-medium text-ink-700 mb-1">
          No ideas to show
        </p>
        <p className="text-[12.5px] text-ink-500 mb-5">
          Clear your filters, or capture a new idea.
        </p>
        <button
          type="button"
          onClick={onNewIdea}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          New Idea
        </button>
      </div>
    );
  }

  if (groupBy === "status") {
    return (
      <div className="space-y-8 pb-6">
        {store.columns.map((col) => {
          const group = ideas.filter((i) => i.columnId === col.id);
          if (group.length === 0) return null;
          return (
            <section key={col.id}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-ink-900">
                  {col.title}
                </h3>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-cream-200 text-[12px] font-semibold tabular-nums text-ink-600">
                  {group.length}
                </span>
              </div>
              <GalleryGrid ideas={group} tags={store.tags} onEditIdea={onEditIdea} />
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pb-6">
      <GalleryGrid ideas={ideas} tags={store.tags} onEditIdea={onEditIdea} />
    </div>
  );
}

function GalleryGrid({
  ideas,
  tags,
  onEditIdea,
}: {
  ideas: Idea[];
  tags: IdeaTag[];
  onEditIdea: (i: Idea) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {ideas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          tags={tags}
          galleryStyle
          onClick={() => onEditIdea(idea)}
        />
      ))}
    </div>
  );
}

/* ─── New / edit idea modal ────────────────────────────────────────────── */

function IdeaModal({
  columns,
  tags,
  initial,
  defaultColumnId,
  onCreateTag,
  onSave,
  onDelete,
  onClose,
}: {
  columns: Column[];
  tags: IdeaTag[];
  initial: Idea | null;
  defaultColumnId: string;
  onCreateTag: (label: string) => IdeaTag;
  onSave: (data: Omit<Idea, "id" | "createdAt">) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.desc ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    initial?.imageUrl ?? null,
  );
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [columnId, setColumnId] = useState(defaultColumnId);
  const [newTag, setNewTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSave = title.trim().length > 0;

  async function onPickImage(file: File) {
    setUploadErr(null);
    if (!file.type.startsWith("image/")) {
      setUploadErr("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUploadErr("You're not signed in.");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/idea-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("community-media")
        .upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) {
        setUploadErr(error.message);
        return;
      }
      const { data } = supabase.storage
        .from("community-media")
        .getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  function addNewTag() {
    const label = newTag.trim();
    if (!label) return;
    const existing = tags.find(
      (t) => t.label.toLowerCase() === label.toLowerCase(),
    );
    const tag = existing ?? onCreateTag(label);
    setTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
    setNewTag("");
  }

  return (
    <div
      className="anim-overlay-in fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? "Edit idea" : "New idea"}
    >
      <div
        className="anim-modal-in relative w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-[0_32px_80px_-24px_rgba(26,24,22,0.45)] ring-1 ring-ink-900/[0.06] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-h4 text-ink-900">
            {initial ? "Edit idea" : "New idea"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-full text-ink-500 transition-all duration-150 hover:bg-cream-100 hover:text-ink-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>

        {/* image */}
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative overflow-hidden rounded-[12px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-[160px] w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                aria-label="Remove image"
                className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75 transition-colors cursor-pointer"
              >
                <X className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-[88px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-ink-200 text-[13px] font-medium text-ink-500 transition-colors hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/40 cursor-pointer disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              ) : (
                <ImagePlus className="size-4" strokeWidth={2} />
              )}
              {uploading ? "Uploading…" : "Add a cover image"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void onPickImage(f);
            }}
          />
          {uploadErr && (
            <p className="mt-1.5 text-[12px] text-rose-600">{uploadErr}</p>
          )}
        </div>

        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Idea title"
          className="mb-3 h-11 w-full rounded-[12px] border border-ink-200 bg-white px-3.5 text-[15px] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={600}
          placeholder="What's the idea? Hook, angle, format…"
          className="mb-4 w-full resize-none rounded-[12px] border border-ink-200 bg-white px-3.5 py-3 text-[13.5px] leading-relaxed text-ink-900 placeholder:text-ink-400 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />

        {/* column + tags */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink-700">
              Status
            </label>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="h-10 w-full rounded-[10px] border border-ink-200 bg-white px-3 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-ink-700">
              Add tag
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewTag();
                  }
                }}
                placeholder="e.g. Reels"
                className="h-10 min-w-0 flex-1 rounded-[10px] border border-ink-200 bg-white px-3 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="button"
                onClick={addNewTag}
                disabled={!newTag.trim()}
                aria-label="Add tag"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-cream-100 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="size-4" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>

        {/* tag picker */}
        {tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const on = tagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setTagIds((prev) =>
                      on ? prev.filter((x) => x !== t.id) : [...prev, t.id],
                    )
                  }
                  aria-pressed={on}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold leading-none transition-all duration-150 cursor-pointer",
                    on
                      ? t.color
                      : "bg-cream-100 text-ink-500 hover:bg-cream-200",
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={3} />}
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-ink-100 pt-4">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-700 hover:text-rose-800 transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-[10px] border border-ink-200 px-4 text-[13px] font-semibold text-ink-700 transition-all duration-150 hover:bg-cream-100 hover:border-ink-300 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                onSave({
                  title: title.trim(),
                  desc: desc.trim(),
                  imageUrl,
                  tagIds,
                  columnId,
                })
              }
              disabled={!canSave}
              className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-rose-600 px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(185,72,92,0.6)] transition-all duration-150 hover:bg-rose-700 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:bg-rose-300 disabled:shadow-none disabled:hover:translate-y-0 cursor-pointer"
            >
              {initial ? "Save idea" : "Add idea"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

