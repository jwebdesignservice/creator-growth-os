import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PerformanceEntry = {
  id: string | null;
  week_start: string;
  followers: number | null;
  reach: number | null;
  views: number | null;
  posts_published: number | null;
  engagement_rate: number | null;
  profile_visits: number | null;
  clicks: number | null;
  revenue: number | null;
  best_post: string | null;
  lesson_learned: string | null;
};

export type DeltaTile = {
  label: string;
  primary: string;
  delta: number; // percentage vs last week (-/+)
  series: number[]; // last 8 weeks
};

const EMPTY_ENTRY: Omit<PerformanceEntry, "id" | "week_start"> = {
  followers: null,
  reach: null,
  views: null,
  posts_published: null,
  engagement_rate: null,
  profile_visits: null,
  clicks: null,
  revenue: null,
  best_post: null,
  lesson_learned: null,
};

/**
 * Returns YYYY-MM-DD for the Monday of the week containing `d`.
 */
export function mondayOfWeek(d: Date = new Date()): string {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString().slice(0, 10);
}

export function addWeeks(monday: string, weeks: number): string {
  const d = new Date(monday + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

// performance_entries are scoped per (user, week, platform). For
// dashboard/KPI display we want one row per week:
//   - prefer SUM across currently-connected platforms (so disconnecting
//     IG immediately drops it from the totals)
//   - fall back to the manual entry when no platforms are connected
//   - notes (best_post / lesson_learned) always come from the manual row

const ENTRY_COLS =
  "id, week_start, platform, followers, reach, views, posts_published, engagement_rate, profile_visits, clicks, revenue, best_post, lesson_learned";

type RawEntry = PerformanceEntry & { platform: string };

/** Look up which social platforms the user has a live access_token for. */
async function getConnectedPlatformKeys(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("social_accounts")
    .select("platform")
    .eq("user_id", user.id)
    .not("access_token", "is", null);
  return (data ?? []).map((r) => r.platform as string);
}

/**
 * Aggregate a per-platform row group for one week into a single
 * PerformanceEntry shape. Numeric fields sum; engagement_rate is
 * follower-weighted; notes pull from the manual row.
 */
function aggregateWeek(group: RawEntry[]): PerformanceEntry {
  if (group.length === 0) {
    return { id: null, week_start: "", ...EMPTY_ENTRY };
  }
  const week = group[0].week_start;
  const manual = group.find((g) => g.platform === "manual");

  const sumOrNull = (key: keyof PerformanceEntry): number | null => {
    let total = 0;
    let any = false;
    for (const g of group) {
      const v = g[key];
      if (typeof v === "number") {
        total += v;
        any = true;
      } else if (typeof v === "string" && v !== "" && !isNaN(Number(v))) {
        total += Number(v);
        any = true;
      }
    }
    return any ? total : null;
  };

  // Engagement rate: follower-weighted average. If no follower counts,
  // fall back to a plain mean of non-null values.
  let engagement: number | null = null;
  const withEngagement = group.filter((g) => g.engagement_rate != null);
  if (withEngagement.length > 0) {
    const totalFollowers = withEngagement.reduce(
      (acc, g) => acc + (g.followers ?? 0),
      0,
    );
    if (totalFollowers > 0) {
      engagement =
        withEngagement.reduce(
          (acc, g) =>
            acc + (Number(g.engagement_rate) ?? 0) * (g.followers ?? 0),
          0,
        ) / totalFollowers;
    } else {
      engagement =
        withEngagement.reduce(
          (acc, g) => acc + (Number(g.engagement_rate) ?? 0),
          0,
        ) / withEngagement.length;
    }
  }

  return {
    // Surface the manual row's id when present (legacy rows from the
    // removed weekly entry form), otherwise null.
    id: manual?.id ?? null,
    week_start: week,
    followers: sumOrNull("followers"),
    reach: sumOrNull("reach"),
    views: sumOrNull("views"),
    posts_published: sumOrNull("posts_published"),
    engagement_rate: engagement,
    profile_visits: sumOrNull("profile_visits"),
    clicks: sumOrNull("clicks"),
    revenue: sumOrNull("revenue"),
    // Free-text notes are user-authored — only manual rows have them.
    best_post: manual?.best_post ?? null,
    lesson_learned: manual?.lesson_learned ?? null,
  };
}

/**
 * Returns the last `weeks` performance entries (newest first), aggregated
 * across currently-connected platforms + manual rows.
 */
export async function getRecentEntries(
  weeks = 12,
): Promise<PerformanceEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const connectedPlatforms = await getConnectedPlatformKeys();

  // If no platforms are currently connected, the KPI tiles must read as
  // empty — disconnecting an account should zero out the numbers
  // immediately. We DO NOT fall back to platform='manual' here: the
  // weekly entry form was removed, and any existing 'manual' rows in
  // the DB are legacy garbage written by buggy Instagram syncs before
  // migration 0038. They MUST NOT bleed into the post-disconnect view.
  if (connectedPlatforms.length === 0) return [];

  // Grab up to ~3x rows since we'll collapse N platforms into 1 per week.
  const { data } = await supabase
    .from("performance_entries")
    .select(ENTRY_COLS)
    .eq("user_id", user.id)
    .in("platform", connectedPlatforms)
    .order("week_start", { ascending: false })
    .limit(weeks * 4);

  const rows = (data ?? []) as RawEntry[];
  const byWeek = new Map<string, RawEntry[]>();
  for (const r of rows) {
    const group = byWeek.get(r.week_start) ?? [];
    group.push(r);
    byWeek.set(r.week_start, group);
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .slice(0, weeks)
    .map(([, group]) => aggregateWeek(group));
}

/**
 * KPI tiles for the header — current week vs prior week deltas plus
 * an 8-week series for the sparkline.
 */
export function computeKpiTiles(entries: PerformanceEntry[]): DeltaTile[] {
  if (entries.length === 0) {
    // No connected platform and no real data → all tiles read 0 with a
    // flat-line sparkline. Previously these were dash placeholders with
    // a fake ramp-up series; that looked deceptively like real data,
    // especially right after a disconnect. A flat 0 makes the empty
    // state unambiguous.
    const flat = [0, 0, 0, 0, 0, 0, 0, 0];
    return [
      placeholderTile("Followers", "0", flat),
      placeholderTile("Total Reach", "0", flat),
      placeholderTile("Engagement", "0%", flat),
      placeholderTile("Revenue", "0", flat),
    ];
  }

  // Latest entry first
  const latest = entries[0];
  const prev = entries[1] ?? null;

  return [
    deltaTile(
      "Followers",
      latest.followers,
      prev?.followers,
      entries.slice(0, 8).reverse().map((e) => e.followers ?? 0),
      formatCompact,
    ),
    deltaTile(
      "Total Reach",
      latest.reach,
      prev?.reach,
      entries.slice(0, 8).reverse().map((e) => e.reach ?? 0),
      formatCompact,
    ),
    deltaTile(
      "Engagement",
      latest.engagement_rate,
      prev?.engagement_rate,
      entries.slice(0, 8).reverse().map((e) => e.engagement_rate ?? 0),
      (n) => `${n.toFixed(1)}%`,
    ),
    deltaTile(
      "Revenue",
      latest.revenue,
      prev?.revenue,
      entries.slice(0, 8).reverse().map((e) => Number(e.revenue ?? 0)),
      (n) => `${formatCompact(n)} kr`,
    ),
  ];
}

function deltaTile(
  label: string,
  current: number | null | undefined,
  previous: number | null | undefined,
  series: number[],
  format: (n: number) => string,
): DeltaTile {
  const curr = current ?? 0;
  const prev = previous ?? 0;
  const delta = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);
  return {
    label,
    primary: current == null ? "—" : format(curr),
    delta,
    series: series.length > 0 ? series : [0],
  };
}

function placeholderTile(label: string, primary: string, series: number[]): DeltaTile {
  return { label, primary, delta: 0, series };
}

export function getLoggingStreak(entries: PerformanceEntry[]): {
  current: number;
  last8: boolean[];
} {
  // Build a set of weeks logged
  const logged = new Set(entries.map((e) => e.week_start));
  let current = 0;
  let cursor = mondayOfWeek();
  while (logged.has(cursor)) {
    current++;
    cursor = addWeeks(cursor, -1);
  }
  const last8: boolean[] = [];
  let w = mondayOfWeek();
  for (let i = 0; i < 8; i++) {
    last8.unshift(logged.has(w));
    w = addWeeks(w, -1);
  }
  return { current, last8 };
}

function formatCompact(n: number) {
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000)
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}
