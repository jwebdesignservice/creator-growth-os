import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Admin performance — platform-wide aggregation for /admin/performance.

   Creator performance is stored per (user, week, platform) in
   performance_entries. For the admin overview we roll every creator's
   weekly submissions into one aligned 16-week calendar so the dashboard
   charts share an x-axis and render zero/empty states honestly when a
   week (or the whole platform) has no data yet. No values are fabricated.
   ───────────────────────────────────────────────────────────────────────── */

const WEEKS = 16;

export type AdminPerfWeek = {
  weekStart: string; // YYYY-MM-DD (Monday, UTC)
  revenue: number;
  views: number;
  reach: number;
  followers: number;
  posts: number;
  entries: number; // submitted rows that week
  creators: number; // distinct creators that week
  engagement: number | null; // follower-weighted avg %, null when none
};

export type PlatformBreakdownRow = {
  platform: string;
  label: string;
  entries: number;
  pct: number; // 0–100 share of entries in the window
};

export type AdminPerfRecentRow = {
  user_id: string;
  creator: string;
  week_start: string;
  platform: string;
  followers: number | null;
  reach: number | null;
  views: number | null;
  posts_published: number | null;
  engagement_rate: number | null;
  revenue: number | null;
};

export type AdminPerformanceData = {
  weeks: AdminPerfWeek[]; // ascending, length === WEEKS
  weeksCount: number;
  platformBreakdown: PlatformBreakdownRow[];
  recent: AdminPerfRecentRow[];
  totals: {
    revenue: number;
    views: number;
    reach: number;
    followers: number;
    posts: number;
    entries: number;
    activeCreators: number; // distinct across the whole window
  };
  latestWeekStart: string | null; // most recent week that has entries
  generatedAt: string; // ISO
};

const PLATFORM_LABELS: Record<string, string> = {
  manual: "Manual",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  twitter: "X / Twitter",
  x: "X / Twitter",
};

function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return 0;
}

/** Monday (UTC) of the week containing `d`, as YYYY-MM-DD. */
function mondayUTC(d: Date): string {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = x.getUTCDay(); // 0 = Sun … 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diff);
  return x.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type RawRow = {
  user_id: string;
  week_start: string;
  platform: string | null;
  followers: number | string | null;
  reach: number | string | null;
  views: number | string | null;
  posts_published: number | string | null;
  engagement_rate: number | string | null;
  revenue: number | string | null;
};

export async function getAdminPerformanceData(): Promise<AdminPerformanceData> {
  const supabase = createServiceClient();

  const currentMonday = mondayUTC(new Date());
  const firstMonday = addDaysIso(currentMonday, -7 * (WEEKS - 1));

  // Aligned calendar — every week present even with no entries.
  const calendar: string[] = [];
  for (let i = 0; i < WEEKS; i++) {
    calendar.push(addDaysIso(firstMonday, i * 7));
  }

  const [{ data: rowData }, { data: profileData }] = await Promise.all([
    supabase
      .from("performance_entries")
      .select(
        "user_id, week_start, platform, followers, reach, views, posts_published, engagement_rate, revenue",
      )
      .gte("week_start", firstMonday)
      .order("week_start", { ascending: false })
      .limit(2000),
    supabase.from("profiles").select("id, display_name, full_name, email"),
  ]);

  const rows = (rowData ?? []) as RawRow[];
  const nameOf = new Map(
    (profileData ?? []).map((p) => [
      p.id,
      (p.display_name as string | null) ??
        (p.full_name as string | null) ??
        (p.email as string | null) ??
        "Creator",
    ]),
  );

  // Per-week accumulators.
  type Acc = {
    revenue: number;
    views: number;
    reach: number;
    followers: number;
    posts: number;
    entries: number;
    creators: Set<string>;
    engNumer: number; // Σ engagement·followers
    engDenom: number; // Σ followers (rows that have engagement)
    engFlat: number; // Σ engagement (fallback mean)
    engFlatN: number;
  };
  const blank = (): Acc => ({
    revenue: 0,
    views: 0,
    reach: 0,
    followers: 0,
    posts: 0,
    entries: 0,
    creators: new Set(),
    engNumer: 0,
    engDenom: 0,
    engFlat: 0,
    engFlatN: 0,
  });

  const byWeek = new Map<string, Acc>();
  for (const w of calendar) byWeek.set(w, blank());

  const platformCounts = new Map<string, number>();
  const allCreators = new Set<string>();
  const totals = {
    revenue: 0,
    views: 0,
    reach: 0,
    followers: 0,
    posts: 0,
    entries: 0,
    activeCreators: 0,
  };

  for (const r of rows) {
    const acc = byWeek.get(r.week_start);
    if (!acc) continue; // outside the aligned window

    const followers = num(r.followers);
    const reach = num(r.reach);
    const views = num(r.views);
    const posts = num(r.posts_published);
    const revenue = num(r.revenue);

    acc.revenue += revenue;
    acc.views += views;
    acc.reach += reach;
    acc.followers += followers;
    acc.posts += posts;
    acc.entries += 1;
    acc.creators.add(r.user_id);

    if (r.engagement_rate != null && r.engagement_rate !== "") {
      const eng = num(r.engagement_rate);
      acc.engFlat += eng;
      acc.engFlatN += 1;
      if (followers > 0) {
        acc.engNumer += eng * followers;
        acc.engDenom += followers;
      }
    }

    totals.revenue += revenue;
    totals.views += views;
    totals.reach += reach;
    totals.followers += followers;
    totals.posts += posts;
    totals.entries += 1;
    allCreators.add(r.user_id);

    const key = (r.platform ?? "manual").toLowerCase();
    platformCounts.set(key, (platformCounts.get(key) ?? 0) + 1);
  }
  totals.activeCreators = allCreators.size;

  const weeks: AdminPerfWeek[] = calendar.map((weekStart) => {
    const a = byWeek.get(weekStart)!;
    let engagement: number | null = null;
    if (a.engDenom > 0) engagement = a.engNumer / a.engDenom;
    else if (a.engFlatN > 0) engagement = a.engFlat / a.engFlatN;
    return {
      weekStart,
      revenue: a.revenue,
      views: a.views,
      reach: a.reach,
      followers: a.followers,
      posts: a.posts,
      entries: a.entries,
      creators: a.creators.size,
      engagement,
    };
  });

  const latestWeekStart =
    [...weeks].reverse().find((w) => w.entries > 0)?.weekStart ?? null;

  const platformBreakdown: PlatformBreakdownRow[] = [...platformCounts.entries()]
    .map(([platform, entries]) => ({
      platform,
      label: PLATFORM_LABELS[platform] ?? capitalize(platform),
      entries,
      pct: totals.entries > 0 ? (entries / totals.entries) * 100 : 0,
    }))
    .sort((a, b) => b.entries - a.entries);

  const recent: AdminPerfRecentRow[] = rows.slice(0, 8).map((r) => ({
    user_id: r.user_id,
    creator: nameOf.get(r.user_id) ?? r.user_id.slice(0, 8),
    week_start: r.week_start,
    platform: (r.platform ?? "manual").toLowerCase(),
    followers: r.followers == null ? null : num(r.followers),
    reach: r.reach == null ? null : num(r.reach),
    views: r.views == null ? null : num(r.views),
    posts_published: r.posts_published == null ? null : num(r.posts_published),
    engagement_rate:
      r.engagement_rate == null ? null : num(r.engagement_rate),
    revenue: r.revenue == null ? null : num(r.revenue),
  }));

  return {
    weeks,
    weeksCount: WEEKS,
    platformBreakdown,
    recent,
    totals,
    latestWeekStart,
    generatedAt: new Date().toISOString(),
  };
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
