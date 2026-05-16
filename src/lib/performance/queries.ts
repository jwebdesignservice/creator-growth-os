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

export async function getEntryForWeek(weekStart: string): Promise<PerformanceEntry> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: null, week_start: weekStart, ...EMPTY_ENTRY };

  const { data } = await supabase
    .from("performance_entries")
    .select(
      "id, week_start, followers, reach, views, posts_published, engagement_rate, profile_visits, clicks, revenue, best_post, lesson_learned",
    )
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  return (
    data ?? {
      id: null,
      week_start: weekStart,
      ...EMPTY_ENTRY,
    }
  );
}

/** Returns the last `weeks` performance entries (newest first). */
export async function getRecentEntries(
  weeks = 12,
): Promise<PerformanceEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("performance_entries")
    .select(
      "id, week_start, followers, reach, views, posts_published, engagement_rate, profile_visits, clicks, revenue, best_post, lesson_learned",
    )
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(weeks);

  return (data ?? []) as PerformanceEntry[];
}

/**
 * KPI tiles for the header — current week vs prior week deltas plus
 * an 8-week series for the sparkline.
 */
export function computeKpiTiles(entries: PerformanceEntry[]): DeltaTile[] {
  if (entries.length === 0) {
    return [
      placeholderTile("Followers", "—", [10, 12, 11, 14, 18, 22, 25, 28]),
      placeholderTile("Total Reach", "—", [20, 24, 22, 28, 30, 36, 42, 48]),
      placeholderTile("Engagement", "—", [3, 3.5, 3.2, 4, 4.2, 4.8, 5.1, 6.7]),
      placeholderTile("Revenue", "—", [0, 0, 0, 0, 0, 0, 0, 0]),
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
