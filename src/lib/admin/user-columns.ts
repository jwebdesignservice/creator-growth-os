import type { AdminUserRow } from "@/lib/admin/queries";

/**
 * Column registry for the admin users table.
 *
 * Each column is a stable id + label + (optional) sort key. The table reads
 * this registry once on mount and then drives ORDER, VISIBILITY, and SORT
 * from localStorage so admin-side preferences persist across visits.
 *
 * `pinned: "right"` columns (e.g. Contact) stay glued to the right edge and
 * are excluded from drag-reordering.
 */

export type UserColumnId =
  | "user"
  | "email"
  | "plan"
  | "status"
  | "category"
  | "streak"
  | "last_accessed"
  | "joined"
  | "contact";

export type UserColumn = {
  id: UserColumnId;
  label: string;
  /** When true, clicking the header cycles sort. */
  sortable?: boolean;
  /** Field used to compare rows when sorting. */
  sortKey?: keyof AdminUserRow;
  /** Visible on first load if the admin has no saved prefs. */
  defaultVisible: boolean;
  /** Right-pinned columns aren't draggable. */
  pinned?: "right";
};

export const USER_COLUMNS: readonly UserColumn[] = [
  { id: "user",          label: "User",          defaultVisible: true },
  { id: "email",         label: "Email",         defaultVisible: true },
  { id: "plan",          label: "Plan",          defaultVisible: true },
  { id: "status",        label: "Status",        defaultVisible: true },
  { id: "category",      label: "Category",      defaultVisible: true },
  { id: "streak",        label: "Streak",        sortable: true, sortKey: "daily_streak",     defaultVisible: true },
  { id: "last_accessed", label: "Last accessed", sortable: true, sortKey: "last_active_date", defaultVisible: true },
  { id: "joined",        label: "Joined",        sortable: true, sortKey: "created_at",       defaultVisible: true },
  { id: "contact",       label: "Contact",       defaultVisible: true, pinned: "right" },
];

export const COLUMN_BY_ID: Record<UserColumnId, UserColumn> = Object.fromEntries(
  USER_COLUMNS.map((c) => [c.id, c]),
) as Record<UserColumnId, UserColumn>;

export const DEFAULT_COLUMN_ORDER: UserColumnId[] = USER_COLUMNS.map((c) => c.id);
export const DEFAULT_VISIBLE: Record<UserColumnId, boolean> = Object.fromEntries(
  USER_COLUMNS.map((c) => [c.id, c.defaultVisible]),
) as Record<UserColumnId, boolean>;

/** localStorage keys — namespaced per page so they don't collide with anything else. */
export const STORAGE_KEYS = {
  ORDER:      "cgos.admin.users.columns.order.v1",
  VISIBILITY: "cgos.admin.users.columns.visibility.v1",
  SORT:       "cgos.admin.users.columns.sort.v1",
} as const;

export type SortSpec =
  | { columnId: UserColumnId; direction: "asc" | "desc" }
  | null;
