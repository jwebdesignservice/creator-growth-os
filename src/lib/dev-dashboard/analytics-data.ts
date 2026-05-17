/* ─────────────────────────────────────────────────────────────────────────
   Centralized mock data for the Analytics page (/dev/analytics).
   Replace the exports below with real data sources (Supabase queries,
   product analytics provider, log aggregator, etc.) when wiring up the
   backend. Keep the shapes the same — components depend on them.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Local types ─────────────────────────────────────────────────────────── */

/** A pre-formatted metric tile in the top strip. */
export type AnalyticsMetric = {
  key: string;
  label: string;
  value: string;            // display-ready, e.g. "524,891" or "12m 42s"
  delta: string;            // display-ready, e.g. "+8.4%" or "+1m 08s"
  /** Drives the delta-text color independent of the sign — Bounce Rate uses
   *  "warning" even when negative, because lower-bounce is good. */
  deltaTone: "success" | "warning" | "danger" | "neutral";
  deltaBaseline: string;    // "vs yesterday" / "vs last week"
  series: number[];
  /** Maps to one of the --dev-chart-* tokens. */
  seriesColor: "blue" | "green" | "amber" | "purple";
};

/** A series on the multi-line Traffic & Usage Trends chart. */
export type TrendSeries = {
  key: string;
  label: string;
  /** CSS color expression — pass directly to stroke/fill. */
  color: string;
  points: number[];
};

export type TrafficTrendsChart = {
  xLabels: string[];        // e.g. ["Apr 21", "Apr 26", "May 1", …]
  series: TrendSeries[];
  yLabels: string[];        // bottom→top, e.g. ["0", "10K", "20K", "30K", "40K"]
};

/** Donut slice for Traffic Sources. */
export type TrafficSourceSlice = {
  label: string;
  percent: number;
  color: string;
};

/** Row in Device Breakdown. */
export type DeviceRow = {
  device: "Desktop" | "Mobile" | "Tablet";
  percent: number;
  delta: string;            // "+4.1%" / "-1.3%" — sign drives color
};

/** Row in Top Performing Pages. */
export type TopPageRow = {
  rank: number;
  route: string;
  views: number;
  avgTime: string;          // "8m 21s"
  conversion: string;       // "5.4%"
};

/** Stage in User Funnel. */
export type FunnelStage = {
  label: string;
  count: number;
  /** Drop-off from the previous stage, shown on the right. */
  dropOffPercent?: string;  // "19.7%"
};

/** Row in Feature Usage. */
export type FeatureUsageRow = {
  label: string;
  percent: number;
};

/** Row in Regional Usage. */
export type RegionRow = {
  region: string;
  percent: number;
  count: number;
};

/** Stat in Retention & Engagement. */
export type RetentionStat = {
  label: string;
  /** Display-ready (e.g. "72%", "4.7"). */
  value: string;
};

/** Row in Recent Analytics Events. */
export type AnalyticsEventRow = {
  id: string;
  time: string;
  event: string;
  source: string;
  user: string;
  route: string;
  device: "Desktop" | "Mobile" | "Tablet";
};

/* ── Top metric strip — 6 tiles ──────────────────────────────────────────── */

export const ANALYTICS_METRICS: AnalyticsMetric[] = [
  {
    key: "total-events",
    label: "Total Events (24h)",
    value: "524,891",
    delta: "+8.4%",
    deltaTone: "success",
    deltaBaseline: "vs yesterday",
    series: [42, 48, 46, 52, 50, 58, 56, 64, 62, 70, 68, 74],
    seriesColor: "blue",
  },
  {
    key: "active-users",
    label: "Active Users (24h)",
    value: "18,420",
    delta: "+5.2%",
    deltaTone: "success",
    deltaBaseline: "vs yesterday",
    series: [120, 128, 124, 132, 130, 138, 136, 144, 140, 150, 148, 156],
    seriesColor: "green",
  },
  {
    key: "avg-session",
    label: "Avg. Session Duration",
    value: "12m 42s",
    delta: "+1m 08s",
    deltaTone: "success",
    deltaBaseline: "vs yesterday",
    series: [620, 640, 650, 660, 680, 690, 700, 720, 740, 750, 760, 762],
    seriesColor: "blue",
  },
  {
    key: "page-views",
    label: "Page Views",
    value: "148,220",
    delta: "+6.9%",
    deltaTone: "success",
    deltaBaseline: "vs yesterday",
    series: [80, 86, 82, 90, 88, 96, 94, 102, 100, 108, 106, 112],
    seriesColor: "blue",
  },
  {
    key: "conversion-rate",
    label: "Conversion Rate",
    value: "4.8%",
    delta: "+0.7%",
    deltaTone: "success",
    deltaBaseline: "vs last week",
    series: [3.6, 3.8, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.8],
    seriesColor: "green",
  },
  {
    key: "bounce-rate",
    label: "Bounce Rate",
    value: "28.4%",
    delta: "-2.1%",
    deltaTone: "warning",
    deltaBaseline: "vs last week",
    series: [33, 33, 32.5, 32, 31, 30.5, 30, 29.5, 29, 28.8, 28.6, 28.4],
    seriesColor: "amber",
  },
];

/* ── Traffic & Usage Trends — multi-line chart (last 30 days, daily) ─────── */

export const TRAFFIC_TRENDS: TrafficTrendsChart = {
  xLabels: ["Apr 21", "Apr 26", "May 1", "May 6", "May 11", "May 16", "May 21"],
  yLabels: ["0", "10K", "20K", "30K", "40K"],
  series: [
    {
      key: "page-views",
      label: "Page Views",
      color: "var(--dev-chart-blue)",
      points: [
        12000, 14500, 16000, 18200, 17500, 19800, 22000, 24500, 26000, 25500,
        28500, 30000, 28000, 31000, 32500, 30500, 33000, 34800, 32000, 34500,
        36000, 33500, 35500, 37000, 34500, 36500, 38000, 35500, 37500, 36000,
      ],
    },
    {
      key: "sessions",
      label: "Sessions",
      color: "var(--dev-chart-green)",
      points: [
        7800, 9000, 10200, 11500, 11000, 12500, 14000, 15500, 16500, 16200,
        18000, 19000, 17800, 19500, 20500, 19500, 21000, 22000, 20500, 21800,
        22800, 21500, 22500, 23500, 22000, 23000, 24000, 22500, 23500, 22800,
      ],
    },
    {
      key: "active-users",
      label: "Active Users",
      color: "var(--dev-chart-violet)",
      points: [
        2800, 3400, 3800, 4400, 4200, 4800, 5400, 6000, 6500, 6300,
        7100, 7500, 7000, 7700, 8100, 7700, 8300, 8700, 8100, 8600,
        9000, 8500, 8900, 9300, 8700, 9100, 9500, 8900, 9300, 9000,
      ],
    },
  ],
};

/* ── Traffic Sources — donut ─────────────────────────────────────────────── */

export const TRAFFIC_SOURCES: TrafficSourceSlice[] = [
  { label: "Direct",         percent: 42, color: "var(--dev-chart-blue)"   },
  { label: "Organic Search", percent: 24, color: "var(--dev-chart-green)"  },
  { label: "Social",         percent: 16, color: "var(--dev-chart-violet)" },
  { label: "Referral",       percent: 10, color: "var(--dev-chart-amber)"  },
  { label: "Paid",           percent:  8, color: "var(--dev-chart-rose)"   },
];

/* ── Device Breakdown ────────────────────────────────────────────────────── */

export const DEVICE_BREAKDOWN: DeviceRow[] = [
  { device: "Desktop", percent: 58, delta: "+4.1%" },
  { device: "Mobile",  percent: 31, delta: "-1.3%" },
  { device: "Tablet",  percent: 11, delta: "+0.6%" },
];

/* ── Top Performing Pages ────────────────────────────────────────────────── */

export const TOP_PERFORMING_PAGES: TopPageRow[] = [
  { rank: 1, route: "/dashboard",     views: 24812, avgTime: "8m 21s",  conversion: "5.4%" },
  { rank: 2, route: "/programs",      views: 18441, avgTime: "10m 12s", conversion: "6.1%" },
  { rank: 3, route: "/tutorials",     views: 15204, avgTime: "9m 08s",  conversion: "4.9%" },
  { rank: 4, route: "/posting-plans", views: 12880, avgTime: "7m 32s",  conversion: "4.2%" },
  { rank: 5, route: "/billing",       views:  6420, avgTime: "4m 11s",  conversion: "8.3%" },
];

/* ── User Funnel ─────────────────────────────────────────────────────────── */

export const USER_FUNNEL: FunnelStage[] = [
  { label: "Visitors",             count: 48120 },
  { label: "Sign Ups",             count:  9480, dropOffPercent: "19.7%" },
  { label: "Onboarding Completed", count:  6930, dropOffPercent: "73.1%" },
  { label: "Trial Started",        count:  4150, dropOffPercent: "59.8%" },
  { label: "Paid Users",           count:  1860, dropOffPercent: "44.8%" },
];

/* ── Feature Usage ───────────────────────────────────────────────────────── */

export const FEATURE_USAGE: FeatureUsageRow[] = [
  { label: "Dashboard Visits",     percent: 82 },
  { label: "Programs Opened",      percent: 68 },
  { label: "Tutorials Watched",    percent: 61 },
  { label: "Posting Plans Used",   percent: 54 },
  { label: "Notifications Clicked", percent: 39 },
  { label: "Billing Opened",       percent: 17 },
];

/* ── Regional Usage ──────────────────────────────────────────────────────── */

export const REGIONAL_USAGE: RegionRow[] = [
  { region: "Europe",        percent: 42, count: 34120 },
  { region: "North America", percent: 27, count: 21890 },
  { region: "Asia",          percent: 18, count: 14560 },
  { region: "South America", percent:  7, count:  5680 },
  { region: "Other",         percent:  6, count:  4870 },
];

/* ── Retention & Engagement ──────────────────────────────────────────────── */

export const RETENTION_STATS: RetentionStat[] = [
  { label: "1-day retention",       value: "72%" },
  { label: "7-day retention",       value: "48%" },
  { label: "30-day retention",      value: "26%" },
  { label: "Avg. sessions per user", value: "4.7" },
  { label: "Returning users",       value: "63%" },
];

/* ── Recent Analytics Events table ───────────────────────────────────────── */

export const RECENT_ANALYTICS_EVENTS: AnalyticsEventRow[] = [
  { id: "ev-1", time: "10:41:58", event: "program_started",         source: "Dashboard",     user: "user_8f3e2a", route: "/programs/the-influencer-blueprint", device: "Desktop" },
  { id: "ev-2", time: "10:41:32", event: "tutorial_completed",      source: "Tutorials",     user: "user_2a7b9c", route: "/tutorials/hooks-that-convert",      device: "Mobile"  },
  { id: "ev-3", time: "10:40:11", event: "billing_upgrade_clicked", source: "Billing",       user: "user_5ea91d", route: "/billing",                            device: "Desktop" },
  { id: "ev-4", time: "10:39:47", event: "onboarding_completed",    source: "Onboarding",    user: "user_6bb29f", route: "/onboarding/complete",                device: "Mobile"  },
  { id: "ev-5", time: "10:38:10", event: "notification_opened",     source: "Notifications", user: "user_4ce77a", route: "/notifications",                      device: "Desktop" },
  { id: "ev-6", time: "10:36:54", event: "posting_plan_created",    source: "Posting Plans", user: "user_1fd20b", route: "/posting-plans",                      device: "Tablet"  },
];

/** Pagination state for the events table footer. */
export const RECENT_EVENTS_PAGINATION = {
  showingFrom: 1,
  showingTo: 6,
  total: 1248,
  currentPage: 1,
  lastPage: 208,
};
