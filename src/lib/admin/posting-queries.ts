import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Admin Posting — Content Operations overview.

   Read-only oversight layer over every creator's posting plans. All metrics
   are DERIVED from the existing posting_plans / posting_plan_items tables —
   no new columns, no fake data. Where a feature needs a column that doesn't
   exist yet (review state, admin notes), the value is a clearly-marked
   placeholder and the UI exposes it as "not wired" rather than pretending.

   Schema in play (see 0001_init.sql + 0042_posting_item_fields.sql):
     posting_plans:      id, user_id, category, title, week_start, status,
                         created_at        (no updated_at, no review columns)
     posting_plan_items: id, plan_id, user_id, scheduled_for, platform,
                         content_type, topic, status, created_at
   ───────────────────────────────────────────────────────────────────────── */

export type AdminPlanHealth =
  | "on_track"
  | "needs_review"
  | "missing_content"
  | "inactive"
  | "draft_only";

/** Placeholder until a review_status column exists (see TODO in queries). */
export type AdminReviewState = "not_reviewed" | "reviewed" | "needs_changes";

export type AdminPostingItem = {
  id: string;
  scheduled_for: string | null;
  platform: string | null;
  content_type: string | null;
  topic: string | null;
  status: string;
};

export type AdminPlanRow = {
  id: string;
  userId: string | null;
  creatorName: string;
  creatorEmail: string | null;
  creatorAvatar: string | null;
  title: string;
  category: string | null;
  status: string; // draft | active | archived
  weekStart: string; // date (YYYY-MM-DD)
  /** ISO — most recent of plan.created_at and any item.created_at. */
  lastActivity: string;
  totalPosts: number;
  scheduledPosts: number; // status planned, or any item with a scheduled_for
  draftPosts: number; // status idea
  readyPosts: number; // scripted | filmed | edited | posted | reviewed
  completion: number; // 0–100 (ready / total)
  missingDays: number; // 0–7 days of the plan week with no scheduled post
  health: AdminPlanHealth;
  /** Real review state from posting_plans.review_status (migration 0044). */
  reviewState: AdminReviewState;
  /** Internal admin-only note (posting_plans.admin_note, migration 0044). */
  adminNote: string;
  items: AdminPostingItem[];
};

export type AdminPostingKpis = {
  activePlans: number;
  needingReview: number;
  postsThisWeek: number;
  creatorsMissingContent: number;
  inactiveCreators: number;
  avgCompletion: number; // 0–100 across active plans
};

export type AdminPostingOverview = {
  plans: AdminPlanRow[];
  kpis: AdminPostingKpis;
  /** True when the data was fetched successfully (even if empty). */
  ok: boolean;
};

const READY = new Set(["scripted", "filmed", "edited", "posted", "reviewed"]);
const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * DAY_MS;
/** A plan is "missing content" when it has fewer scheduled posts than this. */
const MIN_SCHEDULED = 3;
/** Completion at/above this on an active plan flags it for a review pass. */
const REVIEW_COMPLETION = 80;

type PlanRowDb = {
  id: string;
  user_id: string | null;
  title: string;
  status: string;
  category: string | null;
  week_start: string;
  created_at: string;
  // Present once migration 0044 has run; optional so pre-migration still works.
  review_status?: string | null;
  admin_note?: string | null;
};

type ItemRowDb = {
  id: string;
  plan_id: string;
  scheduled_for: string | null;
  platform: string | null;
  content_type: string | null;
  topic: string | null;
  status: string;
  created_at: string;
};

export async function getAdminPostingOverview(): Promise<AdminPostingOverview> {
  const supabase = createServiceClient();

  const [plansRes, profilesRes] = await Promise.all([
    fetchPlans(supabase),
    supabase
      .from("profiles")
      .select("id, display_name, full_name, email, avatar_url"),
  ]);

  if (plansRes.error) {
    return { plans: [], kpis: emptyKpis(), ok: false };
  }

  const planList = plansRes.rows;
  const planIds = planList.map((p) => p.id);

  const itemsRes = planIds.length
    ? await supabase
        .from("posting_plan_items")
        .select(
          "id, plan_id, scheduled_for, platform, content_type, topic, status, created_at",
        )
        .in("plan_id", planIds)
    : { data: [] as ItemRowDb[], error: null };

  const itemList = (itemsRes.data ?? []) as ItemRowDb[];

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  const itemsByPlan = new Map<string, ItemRowDb[]>();
  for (const it of itemList) {
    const arr = itemsByPlan.get(it.plan_id);
    if (arr) arr.push(it);
    else itemsByPlan.set(it.plan_id, [it]);
  }

  const now = Date.now();
  const { start: weekStart, end: weekEnd } = currentWeekRange();
  let postsThisWeek = 0;

  const rows: AdminPlanRow[] = planList.map((p) => {
    const its = itemsByPlan.get(p.id) ?? [];
    const total = its.length;
    const draftPosts = its.filter((i) => i.status === "idea").length;
    const scheduledPosts = its.filter(
      (i) => i.status === "planned" || Boolean(i.scheduled_for),
    ).length;
    const readyPosts = its.filter((i) => READY.has(i.status)).length;
    const completion = total === 0 ? 0 : Math.round((readyPosts / total) * 100);

    // Missing days within this plan's own Mon→Sun week window.
    const planWeekStartMs = new Date(`${p.week_start}T00:00:00`).getTime();
    const daysWithPost = new Set<number>();
    for (const i of its) {
      if (!i.scheduled_for) continue;
      const offset = Math.floor(
        (new Date(i.scheduled_for).getTime() - planWeekStartMs) / DAY_MS,
      );
      if (offset >= 0 && offset < 7) daysWithPost.add(offset);
      // Accumulate the global "scheduled this calendar week" KPI.
      const t = new Date(i.scheduled_for).getTime();
      if (t >= weekStart && t <= weekEnd) postsThisWeek++;
    }
    const missingDays = Math.max(0, 7 - daysWithPost.size);

    const itemTimes = its.map((i) => new Date(i.created_at).getTime());
    const lastActivityMs = Math.max(
      new Date(p.created_at).getTime(),
      ...(itemTimes.length ? itemTimes : [0]),
    );
    const isInactive =
      now - lastActivityMs > SEVEN_DAYS_MS && p.status !== "archived";

    let health: AdminPlanHealth;
    if (p.status === "draft") health = "draft_only";
    else if (isInactive) health = "inactive";
    else if (p.status === "active" && scheduledPosts < MIN_SCHEDULED)
      health = "missing_content";
    else if (p.status === "active" && completion >= REVIEW_COMPLETION)
      health = "needs_review";
    else health = "on_track";

    const prof = p.user_id ? profileMap.get(p.user_id) : undefined;
    const creatorName =
      prof?.display_name ??
      prof?.full_name ??
      prof?.email ??
      (p.user_id ? `${p.user_id.slice(0, 8)}…` : "Template");

    return {
      id: p.id,
      userId: p.user_id,
      creatorName,
      creatorEmail: prof?.email ?? null,
      creatorAvatar: prof?.avatar_url ?? null,
      title: p.title,
      category: p.category,
      status: p.status,
      weekStart: p.week_start,
      lastActivity: new Date(lastActivityMs).toISOString(),
      totalPosts: total,
      scheduledPosts,
      draftPosts,
      readyPosts,
      completion,
      missingDays,
      health,
      reviewState: normalizeReview(p.review_status),
      adminNote: p.admin_note ?? "",
      items: its
        .slice()
        .sort((a, b) => itemSortKey(a) - itemSortKey(b))
        .map((i) => ({
          id: i.id,
          scheduled_for: i.scheduled_for,
          platform: i.platform,
          content_type: i.content_type,
          topic: i.topic,
          status: i.status,
        })),
    };
  });

  const activeRows = rows.filter((r) => r.status === "active");
  const kpis: AdminPostingKpis = {
    activePlans: activeRows.length,
    needingReview: rows.filter((r) => r.health === "needs_review").length,
    postsThisWeek,
    creatorsMissingContent: countDistinctCreators(
      rows.filter((r) => r.health === "missing_content"),
    ),
    inactiveCreators: countDistinctCreators(
      rows.filter((r) => r.health === "inactive"),
    ),
    avgCompletion:
      activeRows.length === 0
        ? 0
        : Math.round(
            activeRows.reduce((s, r) => s + r.completion, 0) / activeRows.length,
          ),
  };

  return { plans: rows, kpis, ok: true };
}

/**
 * Fetch plans, preferring the migration-0044 columns. If they don't exist yet
 * (error 42703) fall back to the base columns so the page keeps working —
 * review state then defaults to "not_reviewed" and notes to "".
 */
async function fetchPlans(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<{ rows: PlanRowDb[]; error: unknown }> {
  const full = await supabase
    .from("posting_plans")
    .select(
      "id, user_id, title, status, category, week_start, created_at, review_status, admin_note",
    )
    .order("created_at", { ascending: false })
    .limit(150);

  if (!full.error) return { rows: (full.data ?? []) as PlanRowDb[], error: null };

  if ((full.error as { code?: string }).code === "42703") {
    const base = await supabase
      .from("posting_plans")
      .select("id, user_id, title, status, category, week_start, created_at")
      .order("created_at", { ascending: false })
      .limit(150);
    return { rows: (base.data ?? []) as PlanRowDb[], error: base.error };
  }

  return { rows: [], error: full.error };
}

function normalizeReview(v: string | null | undefined): AdminReviewState {
  return v === "reviewed" || v === "needs_changes" ? v : "not_reviewed";
}

function itemSortKey(i: ItemRowDb): number {
  return i.scheduled_for
    ? new Date(i.scheduled_for).getTime()
    : Number.MAX_SAFE_INTEGER;
}

function countDistinctCreators(rows: AdminPlanRow[]): number {
  return new Set(rows.map((r) => r.userId).filter(Boolean)).size;
}

function currentWeekRange(): { start: number; end: number } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const sinceMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - sinceMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.getTime(), end: sunday.getTime() };
}

function emptyKpis(): AdminPostingKpis {
  return {
    activePlans: 0,
    needingReview: 0,
    postsThisWeek: 0,
    creatorsMissingContent: 0,
    inactiveCreators: 0,
    avgCompletion: 0,
  };
}
