import Link from "next/link";
import {
  Plus,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { ProgramRow, type ProgramRowData } from "./program-row";
import { ProgramGridCard } from "./program-grid-card";
import { ProgramsToolbar } from "./toolbar";
import { cn } from "@/lib/cn";

export const metadata = { title: "Programs · Admin · Creator Growth OS" };

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
  let query = supabase
    .from("programs")
    .select(
      "id, slug, title, description, plan_access, cover_image_url, total_lessons, published, created_at",
      { count: "exact" },
    );

  if (search) query = query.ilike("title", `%${search}%`);
  if (status === "published") query = query.eq("published", true);
  if (status === "draft") query = query.eq("published", false);
  if (plan === "free" || plan === "basic" || plan === "pro") {
    query = query.eq("plan_access", plan);
  }

  const sortAsc = sort === "oldest" || sort === "name";
  const sortColumn = sort === "name" ? "title" : "created_at";
  query = query.order(sortColumn, { ascending: sortAsc });

  const from = (pageNum - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data: programs, count: filteredCount } = await query;

  // ── Stats (always reflect totals, never the filtered subset) ─────────
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoIso = monthAgo.toISOString();

  const [
    { count: totalPrograms },
    { count: publishedPrograms },
    { count: newProgramsThisMonth },
    { data: progressRows },
  ] = await Promise.all([
    supabase.from("programs").select("id", { count: "exact", head: true }),
    supabase
      .from("programs")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("programs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthAgoIso),
    supabase
      .from("program_progress")
      .select("user_id, program_id, started_at"),
  ]);

  // Per-program member counts + global distinct + this-month delta
  const membersByProgram = new Map<string, number>();
  const distinctUsers = new Set<string>();
  let newMembersThisMonth = 0;
  for (const row of progressRows ?? []) {
    if (row.program_id) {
      membersByProgram.set(
        row.program_id,
        (membersByProgram.get(row.program_id) ?? 0) + 1,
      );
    }
    if (row.user_id) distinctUsers.add(row.user_id);
    if (row.started_at && row.started_at >= monthAgoIso) newMembersThisMonth++;
  }
  const totalMembers = distinctUsers.size;

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
      created_at: p.created_at,
      members: membersByProgram.get(p.id) ?? 0,
    }),
  );

  const pubPct =
    totalPrograms && totalPrograms > 0
      ? Math.round(((publishedPrograms ?? 0) / totalPrograms) * 1000) / 10
      : 0;

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
    <div className="space-y-6 max-w-[1280px] mx-auto">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-1">
            Programs
          </h1>
          <p className="text-ink-500 text-[14px]">
            Create and manage structured creator programs.
          </p>
        </div>
        <Link
          href="/create-new"
          className="inline-flex items-center gap-2 h-12 px-5 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors shadow-sm"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          New program
        </Link>
      </header>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <ProgramsToolbar />

      {/* ── Stats (clickable as filter shortcuts) ────────────────────── */}
      <div className="card p-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-ink-100">
          <StatCard
            href="?"
            icon={Briefcase}
            label="Total Programs"
            value={totalPrograms ?? 0}
            delta={`+${newProgramsThisMonth ?? 0} this month`}
            tone="accent"
          />
          <StatCard
            href="?status=published"
            icon={CheckCircle2}
            label="Published"
            value={publishedPrograms ?? 0}
            delta={`${pubPct}% of total`}
            tone="muted"
          />
          <StatCard
            icon={Users}
            label="Total Members"
            value={totalMembers}
            delta={`+${newMembersThisMonth} this month`}
            tone="accent"
          />
        </div>
      </div>

      {/* ── Results: table OR grid ───────────────────────────────────── */}
      {viewMode === "grid" ? (
        rows.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 bg-cream-50/40">
                  <th className="py-3 pl-5 pr-3">Thumbnail</th>
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
                  <th className="py-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <EmptyState
                        hasFilters={hasActiveFilters}
                        inline
                      />
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
          </div>
        </div>
      )}

      {/* ── Footer: tip + pagination ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="inline-flex items-center gap-2 text-[12.5px] text-ink-500">
          <span className="size-7 rounded-full bg-rose-100 text-rose-500 inline-flex items-center justify-center shrink-0">
            <Sparkles
              className="size-3.5"
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
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  href?: string;
  icon: LucideIcon;
  label: string;
  value: number;
  delta: string;
  tone: "accent" | "muted";
}) {
  const body = (
    <div className="flex items-center gap-4 p-4 sm:p-5">
      <span className="size-12 rounded-[14px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[22px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] text-ink-500 leading-tight">{label}</div>
        <div className="text-[28px] font-bold text-ink-900 leading-tight tabular-nums">
          {value.toLocaleString()}
        </div>
        <div
          className={cn(
            "text-[11.5px] mt-0.5",
            tone === "accent"
              ? "text-rose-600 font-semibold"
              : "text-ink-500",
          )}
        >
          {delta}
        </div>
      </div>
    </div>
  );
  if (!href) return body;
  return (
    <Link
      href={href}
      className="block hover:bg-cream-50/60 rounded-[10px] transition-colors"
    >
      {body}
    </Link>
  );
}

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
