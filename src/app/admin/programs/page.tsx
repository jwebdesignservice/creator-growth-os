import Link from "next/link";
import {
  Plus,
  Sparkles,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { ProgramRow, type ProgramRowData } from "./program-row";
import { ProgramGridCard } from "./program-grid-card";
import { ProgramsToolbar } from "./toolbar";
import { cn } from "@/lib/cn";

export const metadata = { title: "Programs · Admin · Profluencer" };

type SearchParams = Promise<{
  search?: string;
  sort?: string;
  status?: string;
  plan?: string;
  view?: string;
  per?: string;
  page?: string;
}>;

const PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PER_PAGE = 10;

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  const ownerName = ctx?.name ?? "Admin";

  const { search, sort, status, plan, view, per, page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const perPage = (PER_PAGE_OPTIONS as readonly number[]).includes(
    Number(per),
  )
    ? Number(per)
    : DEFAULT_PER_PAGE;
  const viewMode: "table" | "grid" = view === "grid" ? "grid" : "table";

  const supabase = createServiceClient();

  // ── Listing query (filtered + paginated) ─────────────────────────────
  //
  // The `archived` column lives in migration 0029. If that migration
  // hasn't been applied to the live database yet, including `archived`
  // in the SELECT (or filtering on it) will fail and the listing returns
  // zero rows — which is exactly the "5 in stats / 0 in table" bug.
  //
  // We try the modern query first, then fall back to a degraded query
  // without `archived` so existing programs still render. Once 0029 is
  // applied the fallback simply never fires.

  const sortAsc = sort === "oldest" || sort === "name";
  const sortColumn = sort === "name" ? "title" : "created_at";
  const from = (pageNum - 1) * perPage;
  const to = from + perPage - 1;

  type ProgramListRow = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    plan_access: string;
    cover_image_url: string | null;
    total_lessons: number;
    published: boolean;
    archived?: boolean | null;
    created_at: string;
  };

  let programs: ProgramListRow[] | null = null;
  let filteredCount: number | null = 0;
  let hasArchivedColumn = true;

  {
    let q = supabase
      .from("programs")
      .select(
        "id, slug, title, description, plan_access, cover_image_url, total_lessons, published, archived, created_at",
        { count: "exact" },
      );
    if (search) q = q.ilike("title", `%${search}%`);
    if (status === "published") {
      q = q.eq("published", true).eq("archived", false);
    } else if (status === "draft") {
      q = q.eq("published", false).eq("archived", false);
    } else if (status === "archived") {
      q = q.eq("archived", true);
    } else {
      q = q.eq("archived", false);
    }
    if (plan === "free" || plan === "basic" || plan === "pro") {
      q = q.eq("plan_access", plan);
    }
    q = q.order(sortColumn, { ascending: sortAsc }).range(from, to);

    const result = await q;
    if (result.error) {
      // 42703 = undefined_column. Treat "archived" missing as a known
      // pending-migration state and degrade rather than crash.
      if (result.error.code === "42703") {
        hasArchivedColumn = false;
      } else {
        console.error("[admin/programs] Listing query failed:", result.error);
      }
    } else {
      programs = (result.data ?? []) as ProgramListRow[];
      filteredCount = result.count;
    }
  }

  if (!hasArchivedColumn && programs === null) {
    let q = supabase
      .from("programs")
      .select(
        "id, slug, title, description, plan_access, cover_image_url, total_lessons, published, created_at",
        { count: "exact" },
      );
    if (search) q = q.ilike("title", `%${search}%`);
    if (status === "published") {
      q = q.eq("published", true);
    } else if (status === "draft") {
      q = q.eq("published", false);
    }
    // status === "archived" returns nothing without the column; leave q
    // unfiltered so we still surface the rest of the rows for filtering.
    if (plan === "free" || plan === "basic" || plan === "pro") {
      q = q.eq("plan_access", plan);
    }
    q = q.order(sortColumn, { ascending: sortAsc }).range(from, to);

    const fallback = await q;
    if (fallback.error) {
      console.error("[admin/programs] Fallback listing failed:", fallback.error);
    } else {
      programs = (fallback.data ?? []) as ProgramListRow[];
      filteredCount = fallback.count;
    }
  }

  // ── Per-program member counts (shown on each program card / row) ─────
  const { data: progressRows } = await supabase
    .from("program_progress")
    .select("program_id");
  const membersByProgram = new Map<string, number>();
  for (const row of progressRows ?? []) {
    if (row.program_id) {
      membersByProgram.set(
        row.program_id,
        (membersByProgram.get(row.program_id) ?? 0) + 1,
      );
    }
  }

  const rows: ProgramRowData[] = (programs ?? []).map(
    (p): ProgramRowData => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      plan_access: p.plan_access as ProgramRowData["plan_access"],
      cover_image_url: p.cover_image_url,
      total_lessons: p.total_lessons,
      published: p.published,
      archived: !!p.archived,
      created_at: p.created_at,
      members: membersByProgram.get(p.id) ?? 0,
    }),
  );

  // Pagination math
  const totalCount = filteredCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const rangeFrom = totalCount ? from + 1 : 0;
  const rangeTo = Math.min(to + 1, totalCount);

  // Has any filter applied? (used by the empty state copy)
  const hasActiveFilters = Boolean(search || status || plan);

  // Helper that re-builds the page URL while overriding specific params.
  const buildLink = (overrides: Record<string, string | null>) =>
    buildHref({ search, sort, status, plan, view, per: String(perPage), page: String(pageNum) }, overrides);

  return (
    <div className="flex flex-col -mx-6 lg:-mx-8 -my-6 lg:-my-8 h-[calc(100vh_-_69px)]">
      {/* ── One cohesive full-bleed band: title + toolbar + action, then results + footer ──── */}
      <section className="bg-white flex flex-col flex-1 min-h-0">
        {/* Title, toolbar (filter / sort / status / view) and the primary action — all on one row */}
        <div className="px-6 lg:px-8 py-3 border-b border-ink-100 shrink-0 flex items-center gap-x-4 gap-y-3 flex-wrap">
          <h1 className="text-page-title text-ink-900 shrink-0">Programs</h1>
          <div className="flex-1 min-w-0">
            <ProgramsToolbar />
          </div>
          <Link
            href="/create-new"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors shadow-sm shrink-0"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            New program
          </Link>
        </div>

        {/* ── Results: table OR grid — fills the height; scrolls if needed ── */}
        <div
          className={cn(
            "flex-1 min-h-0 overflow-auto",
            viewMode === "grid" && "px-6 lg:px-8 py-4 bg-cream-50",
          )}
        >
          {viewMode === "grid" ? (
            rows.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rows.map((p) => (
                  <ProgramGridCard
                    key={p.id}
                    program={p}
                    ownerName={ownerName}
                  />
                ))}
              </div>
            )
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 bg-cream-100/60 border-b border-ink-100">
                  <th className="py-3 pl-6 lg:pl-8 pr-3">Thumbnail</th>
                  <SortHeader
                    label="Program name"
                    sortKey="name"
                    currentSort={sort ?? "newest"}
                    href={(next) =>
                      buildLink({
                        sort: next,
                        page: null,
                      })
                    }
                  />
                  <th className="py-3 pr-3">Owner</th>
                  <SortHeader
                    label="Created"
                    sortKey="created"
                    currentSort={sort ?? "newest"}
                    href={(next) =>
                      buildLink({
                        sort: next,
                        page: null,
                      })
                    }
                  />
                  <th className="py-3 pr-3">Members</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">Access</th>
                  <th className="py-3 pr-6 lg:pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState hasFilters={hasActiveFilters} inline />
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <ProgramRow
                      key={p.id}
                      program={p}
                      ownerName={ownerName}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer: tip + pagination — pinned at the bottom ─────────── */}
        <div className="border-t border-ink-100 px-6 lg:px-8 py-2 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="inline-flex items-center gap-2 text-[12px] text-ink-500">
            <span className="size-6 rounded-full bg-rose-100 text-rose-500 inline-flex items-center justify-center shrink-0">
              <Sparkles
                className="size-3"
                strokeWidth={2}
                fill="currentColor"
              />
            </span>
            <span>
              <span className="font-semibold text-ink-700">Tip:</span>{" "}
              Published programs with thumbnails convert better.
            </span>
          </div>

          <PaginationControls
            pageNum={pageNum}
            totalPages={totalPages}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            totalCount={totalCount}
            perPage={perPage}
            params={{ search, sort, status, plan, view, per }}
          />
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function SortHeader({
  label,
  sortKey,
  currentSort,
  href,
}: {
  label: string;
  sortKey: "name" | "created";
  currentSort: string;
  href: (nextSort: string) => string;
}) {
  // Map currentSort string to which column is active + which order.
  let active: "name" | "created" | null = null;
  let dir: "asc" | "desc" = "desc";
  if (currentSort === "name") {
    active = "name";
    dir = "asc";
  } else if (currentSort === "oldest") {
    active = "created";
    dir = "asc";
  } else {
    active = "created";
    dir = "desc"; // newest default
  }

  // Pick the next sort value when this header is clicked.
  let nextSort: string;
  if (sortKey === "name") {
    nextSort = "name"; // always sort name A→Z (single state)
  } else {
    // Toggle created: newest ↔ oldest
    nextSort = active === "created" && dir === "desc" ? "oldest" : "";
  }

  const isActive = active === sortKey;
  const Arrow = isActive
    ? dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th className="py-3 pr-3">
      <Link
        href={href(nextSort)}
        className={cn(
          "inline-flex items-center gap-1.5 cursor-pointer rounded-[6px] -mx-1 px-1 transition-colors",
          isActive
            ? "text-rose-600 hover:text-rose-700"
            : "hover:text-ink-700",
        )}
      >
        {label}
        <Arrow
          className={cn(
            "size-3",
            isActive ? "text-rose-500" : "text-ink-400",
          )}
          strokeWidth={2.5}
        />
      </Link>
    </th>
  );
}

function EmptyState({
  hasFilters,
  inline,
}: {
  hasFilters: boolean;
  inline?: boolean;
}) {
  return (
    <div
      className={cn(
        "text-center text-[13px] text-ink-500",
        inline ? "py-12" : "card py-16 px-6",
      )}
    >
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
        <Briefcase className="size-5" strokeWidth={1.8} />
      </div>
      <div className="text-[14px] font-semibold text-ink-900 mb-1">
        {hasFilters ? "No programs match your filters" : "No programs yet"}
      </div>
      <p className="max-w-md mx-auto leading-snug">
        {hasFilters ? (
          <>
            Try clearing your filters, or{" "}
            <Link
              href="?"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              reset to all programs
            </Link>
            .
          </>
        ) : (
          <>
            Create your first program to start building learning paths for
            creators.
          </>
        )}
      </p>
    </div>
  );
}

function PaginationControls({
  pageNum,
  totalPages,
  rangeFrom,
  rangeTo,
  totalCount,
  perPage,
  params,
}: {
  pageNum: number;
  totalPages: number;
  rangeFrom: number;
  rangeTo: number;
  totalCount: number;
  perPage: number;
  params: {
    search?: string;
    sort?: string;
    status?: string;
    plan?: string;
    view?: string;
    per?: string;
  };
}) {
  // Show up to 3 page numbers around the current one.
  const visible: number[] = [];
  const max = Math.min(3, totalPages);
  let start = Math.max(1, pageNum - 1);
  if (start + max - 1 > totalPages) start = Math.max(1, totalPages - max + 1);
  for (let i = 0; i < max; i++) visible.push(start + i);

  const href = (p: number) =>
    buildHref({ ...params, per: String(perPage), page: String(pageNum) }, { page: String(p) });

  return (
    <div className="flex items-center gap-3 text-[12.5px] text-ink-500">
      <PerPageSelect
        current={perPage}
        params={params}
      />
      <span className="tabular-nums">
        {rangeFrom}–{rangeTo} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <PageButton
          href={pageNum > 1 ? href(pageNum - 1) : undefined}
          ariaLabel="Previous page"
        >
          <ChevronLeft className="size-3.5" strokeWidth={2} />
        </PageButton>
        {visible.map((p) => (
          <PageButton
            key={p}
            href={p === pageNum ? undefined : href(p)}
            active={p === pageNum}
          >
            {p}
          </PageButton>
        ))}
        <PageButton
          href={pageNum < totalPages ? href(pageNum + 1) : undefined}
          ariaLabel="Next page"
        >
          <ChevronRight className="size-3.5" strokeWidth={2} />
        </PageButton>
      </div>
    </div>
  );
}

function PerPageSelect({
  current,
  params,
}: {
  current: number;
  params: {
    search?: string;
    sort?: string;
    status?: string;
    plan?: string;
    view?: string;
    per?: string;
  };
}) {
  // Each option is a Link so the server re-renders with the new ?per=.
  return (
    <span className="inline-flex items-center gap-2">
      <span>Results per page</span>
      <span className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white">
        {PER_PAGE_OPTIONS.map((n, i) => {
          const isActive = current === n;
          return (
            <Link
              key={n}
              href={buildHref(params, {
                per: n === DEFAULT_PER_PAGE ? null : String(n),
                page: null,
              })}
              className={cn(
                "inline-flex items-center h-9 px-2.5 text-[12.5px] font-semibold tabular-nums transition-colors",
                isActive
                  ? "bg-rose-100 text-rose-700"
                  : "text-ink-700 hover:bg-cream-100",
                i > 0 && "border-l border-ink-200",
              )}
            >
              {n}
            </Link>
          );
        })}
      </span>
    </span>
  );
}

function PageButton({
  href,
  active,
  ariaLabel,
  children,
}: {
  href?: string;
  active?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "size-9 inline-flex items-center justify-center rounded-[10px] text-[12.5px] font-semibold tabular-nums transition-colors",
    active
      ? "bg-rose-100 text-rose-700"
      : href
        ? "text-ink-700 hover:bg-cream-100 cursor-pointer"
        : "text-ink-300 cursor-not-allowed",
  );
  if (!href) {
    return (
      <span aria-label={ariaLabel} aria-disabled className={cls}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={cls}>
      {children}
    </Link>
  );
}

/**
 * Build a `?` URL from the current params, applying overrides. A value of
 * `null` deletes the param entirely; an empty string also deletes it.
 */
function buildHref(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | null>,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (v && !(k in overrides)) sp.set(k, v);
  }
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== null && v !== "") sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "?";
}
