"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Download,
  Settings2,
  Mail,
  MessageSquare,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AdminUserRow } from "@/lib/admin/queries";
import {
  USER_COLUMNS,
  COLUMN_BY_ID,
  DEFAULT_COLUMN_ORDER,
  DEFAULT_VISIBLE,
  STORAGE_KEYS,
  type UserColumnId,
  type SortSpec,
} from "@/lib/admin/user-columns";

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  monetization: "Monetization Creator",
  scale: "Scale Creator",
};

type Props = {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  /** Page title rendered at the start of the panel toolbar row. */
  title?: string;
  /** Filter controls rendered into the panel toolbar (left side). */
  children?: ReactNode;
};

/**
 * Whop-style admin users table: drag-to-reorder column headers, click-to-sort,
 * Edit-columns popover (show/hide + reset), CSV export. Column order,
 * visibility, and sort persist per-admin via localStorage.
 *
 * Server-side filtering/pagination stays driven by URL query params and is
 * owned by the parent page; this component only handles the interactive
 * polish + client-side row sort within the current page.
 */
export function UsersTable({ rows, total, page, pageSize, title, children }: Props) {
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (p: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (p > 0) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  };

  const [order, setOrder] = useState<UserColumnId[]>(DEFAULT_COLUMN_ORDER);
  const [visible, setVisible] =
    useState<Record<UserColumnId, boolean>>(DEFAULT_VISIBLE);
  const [sort, setSort] = useState<SortSpec>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<UserColumnId | null>(null);
  const [overId, setOverId] = useState<UserColumnId | null>(null);

  // Load persisted prefs on mount (avoids hydration mismatch — server renders
  // defaults, then this hydrates with the admin's saved layout).
  useEffect(() => {
    // One-time hydration from localStorage (an external store) on mount; the
    // synchronous-setState rule is a false positive for this pattern (a lazy
    // useState initializer would reintroduce the SSR hydration mismatch).
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const o = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER) ?? "null");
      const v = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISIBILITY) ?? "null");
      const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SORT) ?? "null");
      if (Array.isArray(o) && o.length === DEFAULT_COLUMN_ORDER.length) {
        // Guard: every id must be known.
        const valid = o.every((id) => id in COLUMN_BY_ID);
        if (valid) setOrder(o);
      }
      if (v && typeof v === "object") setVisible({ ...DEFAULT_VISIBLE, ...v });
      if (s && (s.direction === "asc" || s.direction === "desc")) setSort(s);
    } catch {
      // localStorage unavailable or corrupted — fall back to defaults silently.
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(order)); } catch {}
  }, [order]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.VISIBILITY, JSON.stringify(visible)); } catch {}
  }, [visible]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SORT, JSON.stringify(sort)); } catch {}
  }, [sort]);

  // Close edit popover on outside click + Escape.
  useEffect(() => {
    if (!editOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEditOpen(false);
    }
    function onDocClick(e: MouseEvent) {
      const t = e.target as Element | null;
      if (t?.closest("[data-edit-popover]")) return;
      if (t?.closest("[data-edit-trigger]")) return;
      setEditOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [editOpen]);

  // Pinned columns (e.g. Contact) always anchor to the right edge and are
  // excluded from drag-reordering. Hidden columns drop out entirely.
  const orderedIds = useMemo(() => {
    const pinned = order.filter(
      (id) => COLUMN_BY_ID[id].pinned === "right" && visible[id],
    );
    const free = order.filter(
      (id) => COLUMN_BY_ID[id].pinned !== "right" && visible[id],
    );
    return [...free, ...pinned];
  }, [order, visible]);

  // Sort current page client-side. The server already paginated; sorting just
  // reorders what's on-screen so admins can scan the visible window.
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = COLUMN_BY_ID[sort.columnId];
    const k = col.sortKey;
    if (!k) return rows;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[k];
      const bv = b[k];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [rows, sort]);

  function cycleSort(id: UserColumnId) {
    const col = COLUMN_BY_ID[id];
    if (!col.sortable) return;
    setSort((curr) => {
      if (!curr || curr.columnId !== id) return { columnId: id, direction: "asc" };
      if (curr.direction === "asc") return { columnId: id, direction: "desc" };
      return null; // third click clears
    });
  }

  function onDragStart(id: UserColumnId) {
    setDraggingId(id);
  }
  function onDragOverHeader(e: React.DragEvent, id: UserColumnId) {
    if (!draggingId) return;
    if (COLUMN_BY_ID[id].pinned === "right") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  }
  function onDrop(targetId: UserColumnId) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    setOrder((curr) => {
      const next = curr.filter((id) => id !== draggingId);
      const idx = next.indexOf(targetId);
      if (idx < 0) return curr;
      next.splice(idx, 0, draggingId);
      return next;
    });
    setDraggingId(null);
    setOverId(null);
  }
  function onDragEnd() {
    setDraggingId(null);
    setOverId(null);
  }

  function exportCsv() {
    const cols = orderedIds.map((id) => COLUMN_BY_ID[id]);
    const header = cols.map((c) => csvCell(c.label)).join(",");
    const lines = sortedRows.map((r) =>
      cols.map((c) => csvCell(textFor(c.id, r))).join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-page-${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bg-white flex flex-col flex-1 min-h-0">
      {/* Toolbar — the page title + filters on the left, table actions on the
          right, matching the "Data table · V2 dense" toolbar. */}
      <div className="flex items-center gap-3 px-6 lg:px-8 py-3 border-b border-ink-100 flex-wrap shrink-0">
        {title && (
          <h1 className="text-page-title text-ink-900 shrink-0">{title}</h1>
        )}
        {children}
        <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-100 text-[12.5px] font-medium text-ink-700 transition-colors"
        >
          <Download className="size-3.5" strokeWidth={2} />
          Export
        </button>
        <div className="relative">
          <button
            type="button"
            data-edit-trigger
            onClick={() => setEditOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={editOpen}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-100 text-[12.5px] font-medium text-ink-700 transition-colors"
          >
            <Settings2 className="size-3.5" strokeWidth={2} />
            Edit
          </button>
          {editOpen && (
            <EditPopover
              order={order}
              visible={visible}
              onToggle={(id) =>
                setVisible((v) => ({ ...v, [id]: !v[id] }))
              }
              onReorder={(next) => setOrder(next)}
              onReset={() => {
                setOrder(DEFAULT_COLUMN_ORDER);
                setVisible(DEFAULT_VISIBLE);
                setSort(null);
              }}
            />
          )}
          </div>
        </div>
      </div>

      {/* Dense table — grows to fill the panel height; scrolls if rows overflow */}
      <div className="flex-1 min-h-0 overflow-auto">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No users match these filters.
          </div>
        ) : (
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 bg-cream-100/60 border-b border-ink-100">
                  {orderedIds.map((id) => {
                    const col = COLUMN_BY_ID[id];
                    const isSorted = sort?.columnId === id;
                    const isOver = overId === id;
                    const draggable = col.pinned !== "right";
                    return (
                      <th
                        key={id}
                        scope="col"
                        draggable={draggable}
                        onDragStart={draggable ? () => onDragStart(id) : undefined}
                        onDragOver={
                          draggable ? (e) => onDragOverHeader(e, id) : undefined
                        }
                        onDragLeave={() =>
                          setOverId((curr) => (curr === id ? null : curr))
                        }
                        onDrop={draggable ? () => onDrop(id) : undefined}
                        onDragEnd={onDragEnd}
                        className={cn(
                          "font-semibold py-1.5 px-3 first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8 select-none transition-colors",
                          draggable && "cursor-grab active:cursor-grabbing",
                          isOver && "bg-rose-50",
                          draggingId === id && "opacity-50",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => cycleSort(id)}
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            col.sortable && "hover:text-ink-700",
                          )}
                        >
                          {draggable && (
                            <GripVertical
                              className="size-3 text-ink-300 -ml-0.5"
                              strokeWidth={2}
                              aria-hidden
                            />
                          )}
                          <span>{col.label}</span>
                          {col.sortable && isSorted ? (
                            sort!.direction === "asc" ? (
                              <ArrowUp className="size-3" strokeWidth={2.5} />
                            ) : (
                              <ArrowDown className="size-3" strokeWidth={2.5} />
                            )
                          ) : col.sortable ? (
                            <ArrowDown
                              className="size-3 opacity-25"
                              strokeWidth={2}
                            />
                          ) : null}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-ink-100 even:bg-cream-100/70 hover:bg-rose-50/60 transition-colors"
                  >
                    {orderedIds.map((id) => (
                      <td
                        key={id}
                        className={cn(
                          "py-1.5 px-3 first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8 align-middle whitespace-nowrap",
                          (id === "joined" ||
                            id === "streak" ||
                            id === "last_accessed") &&
                            "tabular-nums",
                        )}
                      >
                        <Cell columnId={id} row={row} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>

      {/* Footer — total count + pagination, matching the design's footer band. */}
      <div className="border-t border-ink-100 px-6 lg:px-8 py-2 flex items-center justify-between text-[12px] text-ink-500 shrink-0">
        <span>
          <span className="font-medium text-ink-700 tabular-nums">{total}</span>{" "}
          {total === 1 ? "member" : "members"} · Page{" "}
          <span className="tabular-nums">{page + 1}</span> of{" "}
          <span className="tabular-nums">{totalPages}</span>
        </span>
        <div className="flex items-center gap-1.5">
          {page > 0 && (
            <Link
              href={pageHref(page - 1)}
              className="px-2.5 h-7 rounded-[7px] border border-ink-200 text-ink-700 hover:bg-cream-100 inline-flex items-center"
            >
              Previous
            </Link>
          )}
          {page < totalPages - 1 && (
            <Link
              href={pageHref(page + 1)}
              className="px-2.5 h-7 rounded-[7px] border border-ink-200 text-ink-700 hover:bg-cream-100 inline-flex items-center"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Cell renderer ───────────────────────────────────────────────────── */

function Cell({ columnId, row }: { columnId: UserColumnId; row: AdminUserRow }) {
  switch (columnId) {
    case "user": {
      const name = row.full_name ?? row.email.split("@")[0];
      const initials = name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
      return (
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-5 rounded-full bg-cream-200 text-ink-700 inline-flex items-center justify-center text-[9px] font-semibold shrink-0">
            {initials || "?"}
          </span>
          <span className="font-medium text-ink-900 truncate">{name}</span>
        </div>
      );
    }
    case "email":
      return (
        <span className="text-ink-600 truncate inline-block max-w-[260px] align-middle">
          {row.email}
        </span>
      );
    case "plan":
      return (
        <span className={cn("chip capitalize", planChip(row.plan))}>
          {row.plan}
        </span>
      );
    case "status": {
      const meta = statusMeta(row);
      return (
        <span className="inline-flex items-center gap-1.5 text-ink-700">
          <span className={cn("size-1.5 rounded-full shrink-0", meta.dot)} />
          {meta.label}
        </span>
      );
    }
    case "category":
      return (
        <span className="text-ink-700">
          {CATEGORY_LABEL[row.category] ?? row.category}
        </span>
      );
    case "streak":
      return <span className="text-ink-700">{row.daily_streak}d</span>;
    case "last_accessed":
      return (
        <span className="text-ink-500">
          {relativeTime(row.last_active_date)}
        </span>
      );
    case "joined":
      return (
        <span className="text-ink-500">
          {new Date(row.created_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    case "contact":
      return (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={`mailto:${row.email}`}
            aria-label="Email user"
            className="size-6 rounded-[7px] border border-ink-200 bg-white hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-rose-600 transition-colors"
          >
            <Mail className="size-3.5" strokeWidth={2} />
          </a>
          <Link
            href={`/admin/users/${row.id}`}
            aria-label="Manage user"
            className="size-6 rounded-[7px] border border-ink-200 bg-white hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-rose-600 transition-colors"
          >
            <MessageSquare className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      );
  }
}

/* ─── Edit popover ────────────────────────────────────────────────────── */

function EditPopover({
  order,
  visible,
  onToggle,
  onReorder,
  onReset,
}: {
  order: UserColumnId[];
  visible: Record<UserColumnId, boolean>;
  onToggle: (id: UserColumnId) => void;
  onReorder: (nextOrder: UserColumnId[]) => void;
  onReset: () => void;
}) {
  // Show columns in the same visual order as the table: free columns in the
  // user's chosen order, then pinned columns at the end (where they live
  // in the table too). Hidden columns still appear here so the admin can
  // re-show them.
  const displayed = useMemo(() => {
    const pinned = order.filter((id) => COLUMN_BY_ID[id].pinned === "right");
    const free = order.filter((id) => COLUMN_BY_ID[id].pinned !== "right");
    return [...free, ...pinned];
  }, [order]);

  const [dragId, setDragId] = useState<UserColumnId | null>(null);
  const [overId, setOverId] = useState<UserColumnId | null>(null);

  function onDragStart(id: UserColumnId) {
    if (COLUMN_BY_ID[id].pinned === "right") return;
    setDragId(id);
  }
  function onDragOver(e: React.DragEvent, id: UserColumnId) {
    if (!dragId) return;
    if (COLUMN_BY_ID[id].pinned === "right") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  }
  function onDrop(targetId: UserColumnId) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    if (COLUMN_BY_ID[targetId].pinned === "right") {
      setDragId(null);
      setOverId(null);
      return;
    }
    const next = order.filter((x) => x !== dragId);
    const idx = next.indexOf(targetId);
    if (idx >= 0) {
      next.splice(idx, 0, dragId);
      onReorder(next);
    }
    setDragId(null);
    setOverId(null);
  }
  function onDragEnd() {
    setDragId(null);
    setOverId(null);
  }

  const visibleCount = displayed.filter((id) => visible[id]).length;

  return (
    <div
      data-edit-popover
      role="menu"
      className="absolute z-30 top-full right-0 mt-2 w-[280px] rounded-[14px] bg-white border border-ink-100 shadow-card p-3"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-ink-500">
          Columns ·{" "}
          <span className="text-ink-700 tabular-nums">
            {visibleCount}/{displayed.length}
          </span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[11.5px] text-rose-600 hover:text-rose-700 font-semibold"
        >
          Reset
        </button>
      </div>

      <ul className="space-y-0.5">
        {displayed.map((id) => {
          const col = COLUMN_BY_ID[id];
          const on = visible[id];
          const pinned = col.pinned === "right";
          const isDragging = dragId === id;
          const isOver = overId === id;
          return (
            <li
              key={id}
              draggable={!pinned}
              onDragStart={!pinned ? () => onDragStart(id) : undefined}
              onDragOver={(e) => onDragOver(e, id)}
              onDragLeave={() =>
                setOverId((curr) => (curr === id ? null : curr))
              }
              onDrop={!pinned ? () => onDrop(id) : undefined}
              onDragEnd={onDragEnd}
              className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded-[8px] transition-colors",
                isOver && !pinned && "bg-rose-50",
                isDragging && "opacity-50",
                pinned ? "cursor-default" : "hover:bg-cream-100",
              )}
            >
              {/* Toggle visibility — click the check + label area */}
              <button
                type="button"
                onClick={() => onToggle(id)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <span
                  className={cn(
                    "size-4 rounded-[5px] inline-flex items-center justify-center shrink-0 border transition-colors",
                    on
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "border-ink-300 bg-white",
                  )}
                  aria-hidden
                >
                  {on && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="text-[13px] text-ink-900 truncate">
                  {col.label}
                </span>
              </button>

              {/* Right side: pinned badge or drag grip */}
              {pinned ? (
                <span className="text-[10px] uppercase tracking-wide text-ink-400 shrink-0">
                  pinned
                </span>
              ) : (
                <span
                  aria-hidden
                  className="text-ink-300 group-hover:text-ink-500 cursor-grab active:cursor-grabbing shrink-0 p-1 -m-1"
                  title="Drag to reorder"
                >
                  <GripVertical className="size-3.5" strokeWidth={2} />
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-2 px-1 text-[11px] text-ink-400 leading-snug">
        Drag the grip on a row to reorder. Click a row to show/hide. You can
        also drag column headers in the table to reorder.
      </p>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

void USER_COLUMNS; // re-exported via COLUMN_BY_ID; keep import live.

function planChip(plan: string) {
  if (plan === "pro") return "chip-success";
  if (plan === "basic") return "chip-rose";
  return "bg-cream-100 text-ink-700";
}

function statusMeta(row: AdminUserRow): { label: string; dot: string } {
  if (!row.onboarded) return { label: "Onboarding", dot: "bg-amber-400" };
  if (row.last_active_date) {
    const days = daysSince(row.last_active_date);
    if (days != null && days <= 7) return { label: "Active", dot: "bg-emerald-400" };
  }
  return { label: "Joined", dot: "bg-ink-300" };
}

function daysSince(iso: string): number | null {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const mins = Math.round((Date.now() - d.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function csvCell(value: string): string {
  const needs = /[",\n]/.test(value);
  const v = value.replace(/"/g, '""');
  return needs ? `"${v}"` : v;
}

function textFor(columnId: UserColumnId, row: AdminUserRow): string {
  switch (columnId) {
    case "user":
      return row.full_name ?? row.email.split("@")[0];
    case "email":
      return row.email;
    case "plan":
      return row.plan;
    case "status":
      return statusMeta(row).label;
    case "category":
      return CATEGORY_LABEL[row.category] ?? row.category;
    case "streak":
      return `${row.daily_streak}d`;
    case "last_accessed":
      return row.last_active_date ?? "";
    case "joined":
      return row.created_at;
    case "contact":
      return "";
  }
}
