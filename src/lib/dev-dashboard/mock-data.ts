import {
  Monitor,
  Server,
  Database,
  Lock,
  HardDrive,
  Bell,
  CreditCard,
  TriangleAlert,
  Target,
  Activity,
  UsersRound,
  Clock,
  GitBranch,
  Crown,
  Repeat2,
  RefreshCw,
  LogIn,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  FileWarning,
  Radio,
  Timer,
  Gauge,
  ShieldX,
  Webhook,
  TimerReset,
  MailX,
  Zap,
  AlertTriangle,
  Cpu,
  MemoryStick,
  ClipboardList,
  CircleCheck,
  Search as SearchIcon,
  CircleAlert,
  Inbox,
  MessageCircle,
  Star,
  ServerCog,
  HardDriveDownload,
  ShieldQuestion,
  ListTree,
} from "lucide-react";
import type {
  ActiveIncident,
  AffectedService,
  AttentionItem,
  AuthActivityChart,
  AuthEventRow,
  AuthMetricCard,
  AuthProviderBreakdown,
  AuthRouteRow,
  CriticalAlert,
  DatabaseHealth,
  DeploymentStatus,
  DevEnvironment,
  DevUser,
  ErrorBreakdown,
  ErrorTrendChart,
  ErrorsMetricCard,
  FailedLoginReason,
  GroupedErrorRow,
  HighestImpactError,
  HighestValueSegment,
  ApdexSummary,
  LiveLogRow,
  LogEntry,
  LogVolumeChart,
  LogsMetricCard,
  MetricCard,
  OnboardingFunnelStage,
  PerfDbQueryRow,
  PerfErrorRateChart,
  PerfLatencyChart,
  PerfMetricCard,
  PerfSlowestRouteRow,
  PerfThroughputChart,
  ResourceUsageRow,
  ServicePerfRow,
  PlanDistribution,
  QaReadiness,
  RegionalSignInRow,
  RegionalUsageRow,
  RetentionStat,
  SavedViewRow,
  SecuritySignal,
  SelectedLogDetail,
  ServiceLogVolumeRow,
  SessionHealthRow,
  SeverityBreakdown,
  SignupFunnelStage,
  StackTracePreview,
  SystemService,
  TraceGroupRow,
  UserActivityRow,
  UserGrowthChart,
  UserHealthRow,
  UserSegmentRow,
  UserStatusRow,
  UsersMetricCard,
  TopError,
  UsageChart,
  QaActivityRow,
  QaBlocker,
  QaFiltersState,
  QaGroupedArea,
  QaMetricCard,
  QaProgressByAreaRow,
  QaReleaseNote,
  QaReleaseReadiness,
  SupportClientProfile,
  SupportEscalationRow,
  SupportFiltersState,
  SupportMetricCard,
  SupportQueuePagination,
  SupportQueueRow,
  SupportSlaSummary,
  SupportTicketDetails,
  SupportTimelineEvent,
  SupportTicketDetailBundle,
  DatabaseMetricCard,
  DatabaseFiltersState,
  DbQueryPerfChart,
  DbTableActivityRow,
  DbSlowQueryRow,
  DbRlsPolicyRow,
  DbMigrationStatus,
  DbStorageBucketRow,
  DbRpcRow,
  DbIntegrityWarning,
  DbEventRow,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Centralized mock data for the Dev Dashboard.
   Replace the exports below with real data sources (Supabase queries,
   Stripe API, log aggregator, deployment provider, etc.) when wiring up
   the backend. Keep the shapes the same — components depend on them.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Topbar ──────────────────────────────────────────────────────────────── */
export const DEV_ENV: DevEnvironment = {
  environment: "Production",
  region: "EU West (Oslo)",
  version: "v1.4.2",
  branch: "main",
  commit: "a1b2c3d",
};

export const DEV_USER: DevUser = {
  name: "Deividas B.",
  initials: "DB",
  role: "Developer",
};

export const DEV_NOTIFICATION_COUNT = 12;

/* ── Overall + service health strip ──────────────────────────────────────── */
export const SYSTEM_OVERALL_STATUS: "operational" | "degraded" | "down" = "operational";

export const SYSTEM_SERVICES: SystemService[] = [
  { key: "frontend",      label: "Frontend",      status: "operational", tone: "blue",   icon: Monitor },
  { key: "backend",       label: "Backend (API)", status: "operational", tone: "purple", icon: Server },
  { key: "database",      label: "Database",      status: "operational", tone: "green",  icon: Database },
  { key: "auth",          label: "Auth System",   status: "operational", tone: "amber",  icon: Lock },
  { key: "storage",       label: "Storage",       status: "operational", tone: "cyan",   icon: HardDrive },
  { key: "notifications", label: "Notifications", status: "operational", tone: "rose",   icon: Bell },
  { key: "payments",      label: "Payments",      status: "operational", tone: "amber",  icon: CreditCard },
];

/* ── Key metric cards (six tiles) ────────────────────────────────────────── */
export const METRIC_CARDS: MetricCard[] = [
  {
    key: "active-users",
    label: "Active Users (Now)",
    value: "124",
    delta: 18.2,
    deltaUnit: "%",
    deltaBaseline: "vs last 30 min",
    series: [80, 92, 88, 102, 96, 110, 118, 124, 120, 124],
    tone: "blue",
  },
  {
    key: "requests-24h",
    label: "Requests (24h)",
    value: "52,389",
    delta: 12.5,
    deltaUnit: "%",
    deltaBaseline: "vs yesterday",
    series: [32, 40, 36, 48, 42, 55, 50, 62, 58, 70, 64, 60],
    tone: "blue",
  },
  {
    key: "error-rate",
    label: "Error Rate (24h)",
    value: "0.23%",
    delta: -0.08,
    deltaUnit: "%",
    deltaBaseline: "vs yesterday",
    series: [0.6, 0.55, 0.5, 0.48, 0.42, 0.4, 0.36, 0.32, 0.3, 0.27, 0.25, 0.23],
    tone: "red",
  },
  {
    key: "avg-response",
    label: "Avg. Response Time",
    value: "182",
    delta: -24,
    deltaUnit: "ms",
    deltaBaseline: "vs yesterday",
    series: [220, 210, 200, 215, 205, 195, 198, 190, 184, 180, 182],
    tone: "green",
  },
  {
    key: "sign-ups",
    label: "Sign Ups (24h)",
    value: "89",
    delta: 7.2,
    deltaUnit: "%",
    deltaBaseline: "vs yesterday",
    series: [40, 48, 52, 50, 58, 62, 68, 74, 78, 84, 89],
    tone: "blue",
  },
  {
    key: "revenue-mrr",
    label: "Revenue (MRR)",
    value: "€8,642",
    delta: 15.3,
    deltaUnit: "%",
    deltaBaseline: "vs last month",
    series: [4800, 5100, 5500, 5800, 6200, 6800, 7100, 7600, 8000, 8400, 8642],
    tone: "blue",
  },
];

/* ── Critical alerts ─────────────────────────────────────────────────────── */
export const CRITICAL_ALERTS: CriticalAlert[] = [
  {
    id: "alert-1",
    message: "High error rate on /api/notifications",
    severity: "high",
    timeLabel: "2m ago",
  },
  {
    id: "alert-2",
    message: "Failed payments webhook errors",
    severity: "high",
    timeLabel: "15m ago",
  },
  {
    id: "alert-3",
    message: "Database slow query detected",
    severity: "medium",
    timeLabel: "32m ago",
  },
];

/* ── Errors (24h) donut breakdown ────────────────────────────────────────── */
export const ERROR_BREAKDOWN: ErrorBreakdown = {
  total: 128,
  slices: [
    { label: "Frontend", value: 45, percent: 35, color: "var(--dev-chart-rose)" },
    { label: "Backend",  value: 32, percent: 25, color: "var(--dev-chart-amber)" },
    { label: "Database", value: 18, percent: 14, color: "var(--dev-chart-green)" },
    { label: "Auth",     value: 14, percent: 11, color: "var(--dev-chart-blue)" },
    { label: "Payments", value: 11, percent: 9,  color: "var(--dev-chart-pink)" },
    { label: "Other",    value: 8,  percent: 6,  color: "var(--dev-chart-violet)" },
  ],
};

/* ── Top error ───────────────────────────────────────────────────────────── */
export const TOP_ERROR: TopError = {
  id: "ERR-5042",
  type: "Server Error",
  statusCode: 500,
  message: "Failed to fetch /api/notifications",
  occurrences: 42,
  affectedUsers: 18,
  timeLabel: "2m ago",
};

/* ── Usage Overview (24h) ────────────────────────────────────────────────── */
export const USAGE_CHART: UsageChart = {
  series: [
    1600, 1450, 1380, 1300, 1250, 1280, 1500, 1700, 1900, 2100, 2400,
    2800, 3100, 3400, 3700, 4000, 4500, 5200, 5800, 5400, 5900, 4800, 4400, 4600,
  ],
  timeLabels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"],
  yMax: 6000,
  yLabels: ["0", "2K", "4K", "6K"],
};

/* ── Database health ─────────────────────────────────────────────────────── */
export const DATABASE_HEALTH: DatabaseHealth = {
  connection: "Healthy",
  activeConnections: 12,
  slowQueries: 2,
  failedQueries: 0,
  replicationLag: "≈0.2s",
};

/* ── Deployment status ───────────────────────────────────────────────────── */
export const DEPLOYMENT_STATUS: DeploymentStatus = {
  state: "Successful",
  deployedBy: "Deividas B.",
  timeLabel: "2h 14m ago",
  duration: "1m 42s",
  version: "v1.4.2",
  commit: "a1b2c3d",
};

/* ── QA readiness ────────────────────────────────────────────────────────── */
export const QA_READINESS: QaReadiness = {
  score: 92,
  checks: [
    { label: "No critical errors",      passing: true },
    { label: "All services operational", passing: true },
    { label: "Performance healthy",     passing: true },
    { label: "Data integrity clean",    passing: true },
    { label: "E2E tests passing",       passing: true },
  ],
};

/* ── Recent logs ─────────────────────────────────────────────────────────── */
export const RECENT_LOGS: LogEntry[] = [
  {
    id: "log-1",
    time: "10:41:58",
    level: "ERROR",
    source: "API",
    message: "Failed to fetch /api/notifications - 500 Internal Server Error",
    user: null,
    route: "/api/notifications",
  },
  {
    id: "log-2",
    time: "10:41:32",
    level: "WARN",
    source: "Database",
    message: "Slow query detected (1.2s) on public.missions",
    user: null,
    route: null,
  },
  {
    id: "log-3",
    time: "10:40:11",
    level: "INFO",
    source: "Auth",
    message: "User signed in successfully",
    user: "user_8f3e2a",
    route: "/auth/signin",
  },
  {
    id: "log-4",
    time: "10:39:47",
    level: "INFO",
    source: "Payments",
    message: "Stripe webhook received: invoice.payment_succeeded",
    user: "user_2a7b9c",
    route: "/api/webhooks/stripe",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   ERRORS PAGE (/dev/errors)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric cards (6 tiles) ──────────────────────────────────────────── */
export const ERRORS_METRIC_CARDS: ErrorsMetricCard[] = [
  {
    key: "critical-errors",
    label: "Critical Errors",
    value: "45",
    tone: "red",
    icon: TriangleAlert,
    delta: "+7.1%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs yesterday",
    series: [22, 26, 24, 28, 30, 34, 32, 36, 38, 42, 40, 45],
  },
  {
    key: "open-incidents",
    label: "Open Incidents",
    value: "8",
    tone: "red",
    icon: Target,
    delta: "+2",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs yesterday",
    badge: { label: "High", tone: "danger" },
    series: [3, 4, 4, 5, 6, 6, 7, 7, 6, 8, 8, 8],
  },
  {
    key: "error-rate",
    label: "Error Rate",
    value: "0.23%",
    tone: "green",
    icon: Activity,
    delta: "-0.08%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [0.45, 0.42, 0.4, 0.38, 0.35, 0.32, 0.3, 0.28, 0.27, 0.25, 0.24, 0.23],
  },
  {
    key: "affected-users",
    label: "Affected Users",
    value: "1,736",
    tone: "blue",
    icon: UsersRound,
    delta: "+12.4%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs last 24h",
    series: [1100, 1180, 1240, 1290, 1340, 1420, 1480, 1560, 1620, 1680, 1720, 1736],
  },
  {
    key: "ttr",
    label: "Avg. Time to Resolution",
    value: "24m 18s",
    tone: "green",
    icon: Clock,
    delta: "-8m 42s",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [42, 40, 38, 36, 34, 32, 30, 28, 27, 26, 25, 24],
  },
  {
    key: "errors-after-deploy",
    label: "Errors After Latest Deploy",
    value: "128",
    tone: "amber",
    icon: GitBranch,
    delta: "+45",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "since deploy",
    badge: { label: "v1.4.2", tone: "info" },
    series: [60, 64, 68, 72, 80, 88, 96, 104, 112, 118, 124, 128],
  },
];

/* ── Filter row defaults ─────────────────────────────────────────────────── */
export const ERRORS_FILTERS_DEFAULTS = {
  severity: "All",
  source: "All services",
  status: "Open",
  environment: "Production",
  timeframe: "Last 24 hours",
  groupedByFingerprint: true,
};

/* ── Error trends chart ──────────────────────────────────────────────────── */
export const ERROR_TRENDS_CHART: ErrorTrendChart = {
  // 24h hourly volume — quiet morning, then a sharp spike right after the
  // "Latest Deploy" marker around 8 PM.
  series: [
    { time: "12 AM", value: 180 },
    { time: "1 AM",  value: 220 },
    { time: "2 AM",  value: 200 },
    { time: "3 AM",  value: 240 },
    { time: "4 AM",  value: 230 },
    { time: "5 AM",  value: 260 },
    { time: "6 AM",  value: 250 },
    { time: "7 AM",  value: 280 },
    { time: "8 AM",  value: 300 },
    { time: "9 AM",  value: 340 },
    { time: "10 AM", value: 360 },
    { time: "11 AM", value: 380 },
    { time: "12 PM", value: 360 },
    { time: "1 PM",  value: 400 },
    { time: "2 PM",  value: 420 },
    { time: "3 PM",  value: 460 },
    { time: "4 PM",  value: 440 },
    { time: "5 PM",  value: 480 },
    { time: "6 PM",  value: 520 },
    { time: "7 PM",  value: 500 },
    { time: "8 PM",  value: 720 },
    { time: "9 PM",  value: 1100 },
    { time: "10 PM", value: 1620 },
    { time: "11 PM", value: 1840 },
    { time: "12 AM", value: 1620 },
  ],
  yLabels: ["0", "500", "1K", "1.5K", "2K"],
  yMax: 2000,
  deployMarkerAt: 20 / 24, // 8 PM on a 24-tick axis
};

/* ── Severity breakdown ──────────────────────────────────────────────────── */
export const SEVERITY_BREAKDOWN: SeverityBreakdown = {
  total: 1284,
  slices: [
    { severity: "critical", label: "Critical", value: 45,  percent: 3.5,  color: "var(--dev-danger)" },
    { severity: "high",     label: "High",     value: 387, percent: 30.1, color: "var(--dev-warning)" },
    { severity: "medium",   label: "Medium",   value: 612, percent: 47.7, color: "var(--dev-chart-amber)" },
    { severity: "low",      label: "Low",      value: 240, percent: 18.7, color: "var(--dev-chart-blue)" },
  ],
};

/* ── Top affected services ───────────────────────────────────────────────── */
export const TOP_AFFECTED_SERVICES: AffectedService[] = [
  { key: "frontend",      label: "Frontend",      errors24h: 512, status: "degraded",    icon: Monitor,    tone: "blue"   },
  { key: "backend",       label: "Backend API",   errors24h: 387, status: "degraded",    icon: Server,     tone: "purple" },
  { key: "database",      label: "Database",      errors24h: 224, status: "degraded",    icon: Database,   tone: "green"  },
  { key: "auth",          label: "Auth",          errors24h: 98,  status: "operational", icon: Lock,       tone: "amber"  },
  { key: "notifications", label: "Notifications", errors24h: 42,  status: "operational", icon: Bell,       tone: "rose"   },
  { key: "payments",      label: "Payments",      errors24h: 21,  status: "operational", icon: CreditCard, tone: "amber"  },
];

/* ── Highest impact error ────────────────────────────────────────────────── */
export const HIGHEST_IMPACT_ERROR: HighestImpactError = {
  id: "ERR-5042",
  title: "Failed to fetch /api/notifications",
  type: "Server Error",
  statusCode: 500,
  route: "/api/notifications",
  firstSeen: "20 May 2025, 09:18:32",
  lastSeen: "2m ago",
  occurrences: 512,
  affectedUsers: 842,
  environment: "Production",
  release: "v1.4.2",
  owner: "Deividas B.",
  impact: "High",
  suggestedNextAction: "Check notification API handler and Supabase query response.",
};

/* ── Grouped errors table ────────────────────────────────────────────────── */
export const GROUPED_ERRORS: GroupedErrorRow[] = [
  {
    id: "ERR-5042",
    message: "Failed to fetch /api/notifications",
    source: "Notifications",
    route: "/api/notifications",
    severity: "critical",
    status: "open",
    occurrences: 512,
    affectedUsers: 842,
    release: "v1.4.2",
    lastSeen: "2m ago",
    owner: "Deividas B.",
  },
  {
    id: "ERR-5031",
    message: "Failed payments webhook: timeout",
    source: "Payments",
    route: "/api/webhooks/stripe",
    severity: "high",
    status: "open",
    occurrences: 387,
    affectedUsers: 620,
    release: "v1.4.2",
    lastSeen: "5m ago",
    owner: "Unassigned",
  },
  {
    id: "ERR-5021",
    message: "Database query failed: connection timeout",
    source: "Database",
    route: "public.missions",
    severity: "high",
    status: "investigating",
    occurrences: 224,
    affectedUsers: 418,
    release: "v1.4.2",
    lastSeen: "7m ago",
    owner: "Backend",
  },
  {
    id: "ERR-4011",
    message: "Auth token refresh failed",
    source: "Auth",
    route: "/auth/callback",
    severity: "medium",
    status: "open",
    occurrences: 98,
    affectedUsers: 221,
    release: "v1.4.1",
    lastSeen: "12m ago",
    owner: "Auth",
  },
  {
    id: "ERR-4290",
    message: "Rate limit exceeded for /api/users",
    source: "Backend API",
    route: "/api/users",
    severity: "medium",
    status: "investigating",
    occurrences: 42,
    affectedUsers: 103,
    release: "v1.4.2",
    lastSeen: "18m ago",
    owner: "API",
  },
  {
    id: "ERR-5007",
    message: "Null pointer exception in user service",
    source: "Backend API",
    route: "/api/users/profile",
    severity: "low",
    status: "resolved",
    occurrences: 18,
    affectedUsers: 37,
    release: "v1.4.1",
    lastSeen: "1h ago",
    owner: "Backend",
  },
  {
    id: "ERR-5040",
    message: "S3 upload failed: network timeout",
    source: "Storage",
    route: "/api/storage/upload",
    severity: "low",
    status: "resolved",
    occurrences: 12,
    affectedUsers: 28,
    release: "v1.4.1",
    lastSeen: "2h ago",
    owner: "Storage",
  },
  {
    id: "ERR-4004",
    message: "Invalid request payload",
    source: "Frontend",
    route: "/settings",
    severity: "low",
    status: "resolved",
    occurrences: 8,
    affectedUsers: 16,
    release: "v1.4.0",
    lastSeen: "3h ago",
    owner: "Frontend",
  },
];

export const GROUPED_ERRORS_TOTAL = 1284;
export const GROUPED_ERRORS_TOTAL_PAGES = 161;

/* ── Active incidents ────────────────────────────────────────────────────── */
export const ACTIVE_INCIDENTS: ActiveIncident[] = [
  { id: "INC-1042", title: "Notifications service failing",   severity: "high"   },
  { id: "INC-1039", title: "Payments webhook timeouts",       severity: "high"   },
  { id: "INC-1036", title: "Database connection instability", severity: "medium" },
  { id: "INC-1028", title: "Auth refresh warnings",           severity: "medium" },
];

/* ── Latest stack trace ──────────────────────────────────────────────────── */
export const LATEST_STACK_TRACE: StackTracePreview = {
  filePath: "/api/notifications/route.ts:42",
  lines: [
    "NotificationService.fetchUnread",
    "/api/notifications/route.ts:42",
    "Supabase query returned timeout after 10s",
    "at async handler (route.ts:38:15)",
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   USERS PAGE (/dev/users)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (6 tiles) ──────────────────────────────────────────── */
export const USERS_METRIC_CARDS: UsersMetricCard[] = [
  {
    key: "total-users",
    label: "Total Users",
    value: "24,918",
    tone: "blue",
    delta: "+6.8%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last 30 days",
    series: [18200, 18900, 19400, 19800, 20300, 20800, 21200, 21700, 22100, 22600, 23000, 23400, 23800, 24200, 24500, 24918],
  },
  {
    key: "active-users-24h",
    label: "Active Users (24h)",
    value: "18,420",
    tone: "green",
    delta: "+5.2%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [14200, 14600, 15000, 15400, 15700, 16100, 16400, 16800, 17100, 17400, 17700, 18000, 18200, 18420],
  },
  {
    key: "new-signups",
    label: "New Sign Ups",
    value: "1,284",
    tone: "blue",
    delta: "+8.1%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last 7 days",
    series: [800, 850, 900, 950, 1000, 1040, 1080, 1120, 1160, 1200, 1240, 1284],
  },
  {
    key: "paid-users",
    label: "Paid Users",
    value: "1,860",
    tone: "green",
    delta: "+4.4%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last 30 days",
    series: [1500, 1550, 1600, 1640, 1680, 1700, 1730, 1760, 1790, 1820, 1840, 1860],
  },
  {
    key: "trial-users",
    label: "Trial Users",
    value: "4,150",
    tone: "blue",
    delta: "+2.7%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last 30 days",
    series: [3800, 3850, 3900, 3950, 3980, 4020, 4040, 4070, 4100, 4120, 4140, 4150],
  },
  {
    key: "churn-risk",
    label: "Churn Risk Users",
    value: "312",
    tone: "amber",
    delta: "-1.4%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs last week",
    series: [340, 336, 332, 328, 326, 322, 320, 318, 316, 314, 313, 312],
  },
];

/* ── Filter defaults ─────────────────────────────────────────────────────── */
export const USERS_FILTERS_DEFAULTS = {
  plan: "All plans",
  status: "All statuses",
  category: "All categories",
  region: "Global",
  timeframe: "Last 30 days",
  flaggedOnly: false,
};

/* ── User Growth & Activity Trends (30 daily points) ─────────────────────── */
function makeSeries(start: number, end: number, n: number, noise = 0.02): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (end - start) * t;
    const wobble = base * noise * Math.sin(i * 1.3);
    out.push(Math.round(base + wobble));
  }
  return out;
}

export const USER_GROWTH_CHART: UserGrowthChart = {
  xLabels: ["Apr 25", "Apr 29", "May 3", "May 7", "May 11", "May 15", "May 19", "May 23", "May 27", "May 30"],
  yLabels: ["0", "7.5K", "15K", "22.5K", "30K"],
  yMax: 30000,
  series: [
    {
      key: "total",
      label: "Total Users",
      color: "var(--dev-chart-blue)",
      values: makeSeries(22500, 24918, 30, 0.005),
    },
    {
      key: "active",
      label: "Active Users",
      color: "var(--dev-chart-green)",
      values: makeSeries(16800, 18420, 30, 0.008),
    },
    {
      key: "signups",
      label: "Sign Ups",
      color: "var(--dev-chart-cyan)",
      values: makeSeries(900, 1284, 30, 0.05),
    },
  ],
};

/* ── Plan Distribution ───────────────────────────────────────────────────── */
export const PLAN_DISTRIBUTION: PlanDistribution = {
  total: 24918,
  slices: [
    { key: "free",  label: "Free",      value: 16920, percent: 67, color: "var(--dev-chart-blue)"   },
    { key: "basic", label: "Basic",     value: 5988,  percent: 24, color: "var(--dev-chart-violet)" },
    { key: "pro",   label: "Pro",       value: 1860,  percent: 7,  color: "var(--dev-chart-green)"  },
    { key: "admin", label: "Admin/Dev", value: 150,   percent: 2,  color: "var(--dev-chart-amber)"  },
  ],
};

/* ── User Status Breakdown ───────────────────────────────────────────────── */
export const USER_STATUS_BREAKDOWN: UserStatusRow[] = [
  { key: "active",    label: "Active",    percent: 72, color: "var(--dev-chart-blue)"   },
  { key: "trialing",  label: "Trialing",  percent: 17, color: "var(--dev-chart-green)"  },
  { key: "inactive",  label: "Inactive",  percent: 8,  color: "var(--dev-chart-violet)" },
  { key: "suspended", label: "Suspended", percent: 2,  color: "var(--dev-chart-amber)"  },
  { key: "flagged",   label: "Flagged",   percent: 1,  color: "var(--dev-danger)"       },
];

/* ── Top User Segments ───────────────────────────────────────────────────── */
export const TOP_USER_SEGMENTS: UserSegmentRow[] = [
  { rank: 1, label: "Monetization Creator", count: 7420 },
  { rank: 2, label: "Growth Creator",       count: 5980 },
  { rank: 3, label: "Beginner Creator",     count: 4810 },
  { rank: 4, label: "Educator Creator",     count: 3240 },
  { rank: 5, label: "Agency / Team",        count: 1960 },
];

/* ── Onboarding Funnel ───────────────────────────────────────────────────── */
export const ONBOARDING_FUNNEL: OnboardingFunnelStage[] = [
  { key: "signup",    label: "Sign Ups",            count: 1284, dropOffPercent: null },
  { key: "verified",  label: "Email Verified",      count: 1104, dropOffPercent: 14.0 },
  { key: "profile",   label: "Profile Created",     count: 938,  dropOffPercent: 15.0 },
  { key: "category",  label: "Category Selected",   count: 812,  dropOffPercent: 13.4 },
  { key: "completed", label: "Onboarding Completed",count: 693,  dropOffPercent: 14.6 },
];

/* ── Regional Usage ──────────────────────────────────────────────────────── */
export const REGIONAL_USAGE: RegionalUsageRow[] = [
  { rank: 1, label: "Europe",        percent: 42, count: 10462 },
  { rank: 2, label: "North America", percent: 27, count: 6728  },
  { rank: 3, label: "Asia",          percent: 18, count: 4485  },
  { rank: 4, label: "South America", percent: 7,  count: 1744  },
  { rank: 5, label: "Other",         percent: 6,  count: 1499  },
];

/* ── Needs Attention ─────────────────────────────────────────────────────── */
export const NEEDS_ATTENTION: AttentionItem[] = [
  { id: "att-1", message: "42 users stuck on onboarding step 3",      tone: "warning" },
  { id: "att-2", message: "28 users with billing sync mismatch",      tone: "warning" },
  { id: "att-3", message: "15 suspended accounts appealed in last 24h", tone: "warning" },
  { id: "att-4", message: "9 Pro users missing subscription row",     tone: "warning" },
];

/* ── Retention & Engagement ──────────────────────────────────────────────── */
export const RETENTION_ENGAGEMENT: RetentionStat[] = [
  { key: "1d",       label: "1-day retention",      value: "74%",    icon: Clock    },
  { key: "7d",       label: "7-day retention",      value: "49%",    icon: Clock    },
  { key: "30d",      label: "30-day retention",     value: "28%",    icon: Clock    },
  { key: "sessions", label: "Avg. sessions per user", value: "4.9",  icon: Activity },
  { key: "returning",label: "Returning users",      value: "64%",    icon: Repeat2  },
];

/* ── Top User Health ─────────────────────────────────────────────────────── */
export const TOP_USER_HEALTH: UserHealthRow[] = [
  { key: "verified",   label: "Verified users",     percent: "89%",  tone: "success" },
  { key: "incomplete", label: "Incomplete profiles", percent: "11%", tone: "warning" },
  { key: "flagged",    label: "Flagged users",      percent: "1.2%", tone: "danger"  },
];

/* ── Highest Value Segment ───────────────────────────────────────────────── */
export const HIGHEST_VALUE_SEGMENT: HighestValueSegment = {
  label: "Pro users",
  icon: Crown,
  accounts: 1860,
  avgRetentionPercent: 68,
  avgSessionDuration: "14m 22s",
};

/* ── Recent User Activity table ──────────────────────────────────────────── */
export const RECENT_USER_ACTIVITY: UserActivityRow[] = [
  { id: "a-1", time: "10:41:58", event: "account_created",       user: "Emma Larsen",  email: "emma.larsen@example.com",  plan: "Trial", status: "Active",    source: "Sign Up",    region: "Europe"        },
  { id: "a-2", time: "10:41:32", event: "plan_upgraded",         user: "Jonas Berg",   email: "jonas.berg@example.com",   plan: "Pro",   status: "Active",    source: "Billing",    region: "North America" },
  { id: "a-3", time: "10:40:11", event: "onboarding_completed",  user: "Sophie Dahl",  email: "sophie.dahl@example.com",  plan: "Basic", status: "Active",    source: "Onboarding", region: "Europe"        },
  { id: "a-4", time: "10:39:47", event: "user_flagged",          user: "user_6bb29f",  email: "mia.nilsen@example.com",   plan: "Free",  status: "Flagged",   source: "System",     region: "Review"        },
  { id: "a-5", time: "10:38:10", event: "trial_started",         user: "Lucas Hansen", email: "lucas.hansen@example.com", plan: "Trial", status: "Active",    source: "Billing",    region: "Asia"          },
  { id: "a-6", time: "10:36:54", event: "account_suspended",     user: "Nora Aasen",   email: "nora.aasen@example.com",   plan: "Free",  status: "Suspended", source: "Admin",      region: "Review"        },
];

export const RECENT_USER_ACTIVITY_TOTAL = 2418;
export const RECENT_USER_ACTIVITY_TOTAL_PAGES = 403;

/* Re-export an icon constant that components may need to reference outside
 * the icon attached to each row above (kept here to avoid magic-import noise). */
export { RefreshCw };

/* ─────────────────────────────────────────────────────────────────────────
   AUTH PAGE (/dev/auth)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (6 tiles) ──────────────────────────────────────────── */
export const AUTH_METRIC_CARDS: AuthMetricCard[] = [
  {
    key: "sign-ins",
    label: "Sign Ins (24h)",
    value: "18,204",
    tone: "blue",
    icon: LogIn,
    delta: "+4.8%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [12800, 13400, 13900, 14400, 14900, 15300, 15700, 16100, 16500, 16900, 17300, 17600, 17900, 18204],
  },
  {
    key: "sign-ups",
    label: "Sign Ups (24h)",
    value: "1,284",
    tone: "green",
    icon: UserPlus,
    delta: "+8.1%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [820, 860, 900, 940, 980, 1020, 1060, 1100, 1140, 1180, 1220, 1260, 1284],
  },
  {
    key: "failed-logins",
    label: "Failed Logins",
    value: "482",
    tone: "amber",
    icon: AlertOctagon,
    delta: "+2.4%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs yesterday",
    series: [380, 390, 405, 410, 420, 428, 436, 442, 450, 458, 466, 472, 478, 482],
  },
  {
    key: "active-sessions",
    label: "Active Sessions",
    value: "9,612",
    tone: "blue",
    icon: Activity,
    delta: "+3.7%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last 24h",
    series: [8400, 8540, 8700, 8820, 8960, 9080, 9180, 9290, 9380, 9460, 9520, 9580, 9612],
  },
  {
    key: "mfa-adoption",
    label: "MFA Adoption",
    value: "38.6%",
    tone: "green",
    icon: ShieldCheck,
    delta: "+1.2%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last month",
    series: [34.2, 34.6, 35.0, 35.4, 35.9, 36.3, 36.7, 37.1, 37.5, 37.9, 38.2, 38.4, 38.6],
  },
  {
    key: "auth-error-rate",
    label: "Auth Error Rate",
    value: "0.41%",
    tone: "red",
    icon: ShieldAlert,
    delta: "-0.09%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [0.62, 0.58, 0.55, 0.52, 0.50, 0.49, 0.47, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41],
  },
];

/* ── Filter defaults ─────────────────────────────────────────────────────── */
export const AUTH_FILTERS_DEFAULTS = {
  provider: "All providers",
  status: "All statuses",
  environment: "Production",
  timeframe: "Last 24 hours",
  suspiciousOnly: false,
};

/* ── Auth Activity Trends — 24 hourly points × 3 series ──────────────────── */
export const AUTH_ACTIVITY_CHART: AuthActivityChart = {
  xLabels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "12 AM"],
  yLabels: ["0", "300", "600", "900", "1.2K"],
  yMax: 1200,
  series: [
    {
      key: "signIns",
      label: "Sign Ins",
      color: "var(--dev-chart-blue)",
      values: [
        420, 360, 320, 300, 340, 420, 560, 720, 880, 980, 1040, 1080, 1120, 1100, 1080,
        1060, 1020, 980, 940, 900, 820, 720, 620, 520, 460,
      ],
    },
    {
      key: "signUps",
      label: "Sign Ups",
      color: "var(--dev-chart-green)",
      values: [
        38, 32, 28, 26, 30, 42, 58, 74, 92, 104, 116, 124, 128, 124, 118, 112, 102, 92,
        82, 72, 62, 52, 46, 40, 38,
      ],
    },
    {
      key: "failed",
      label: "Failed Logins",
      color: "var(--dev-chart-amber)",
      values: [
        18, 16, 14, 12, 14, 18, 22, 28, 34, 42, 48, 54, 60, 56, 52, 48, 42, 38, 34, 30,
        26, 24, 22, 20, 18,
      ],
    },
  ],
};

/* ── Provider Breakdown donut ────────────────────────────────────────────── */
export const AUTH_PROVIDER_BREAKDOWN: AuthProviderBreakdown = {
  slices: [
    { key: "email",  label: "Email / Password", percent: 54, color: "var(--dev-chart-blue)"   },
    { key: "google", label: "Google",           percent: 24, color: "var(--dev-chart-violet)" },
    { key: "apple",  label: "Apple",            percent: 12, color: "var(--dev-chart-green)"  },
    { key: "magic",  label: "Magic Link",       percent: 7,  color: "var(--dev-chart-amber)"  },
    { key: "other",  label: "Other",            percent: 3,  color: "var(--dev-chart-cyan)"   },
  ],
};

/* ── Session Health ──────────────────────────────────────────────────────── */
export const SESSION_HEALTH: SessionHealthRow[] = [
  { key: "active",   label: "Active",   percent: 78, color: "var(--dev-chart-blue)"   },
  { key: "expired",  label: "Expired",  percent: 12, color: "var(--dev-chart-violet)" },
  { key: "revoked",  label: "Revoked",  percent: 4,  color: "var(--dev-chart-amber)"  },
  { key: "idle",     label: "Idle",     percent: 5,  color: "var(--dev-chart-cyan)"   },
  { key: "invalid",  label: "Invalid",  percent: 1,  color: "var(--dev-danger)"       },
];

/* ── Signup Funnel ───────────────────────────────────────────────────────── */
export const SIGNUP_FUNNEL: SignupFunnelStage[] = [
  { key: "started",   label: "Sign Up Started",   count: 2148, dropOffPercent: null },
  { key: "email",     label: "Email Submitted",   count: 1842, dropOffPercent: 14.2 },
  { key: "verified",  label: "Email Verified",    count: 1504, dropOffPercent: 18.3 },
  { key: "profile",   label: "Profile Created",   count: 1118, dropOffPercent: 25.7 },
  { key: "activated", label: "Account Activated", count: 1284, dropOffPercent: 14.9 },
];

/* ── Failed Login Reasons ────────────────────────────────────────────────── */
export const FAILED_LOGIN_REASONS: FailedLoginReason[] = [
  { key: "invalid-password", label: "Invalid password",   percent: 41 },
  { key: "user-not-found",   label: "User not found",     percent: 22 },
  { key: "expired-magic",    label: "Expired magic link", percent: 14 },
  { key: "rate-limited",     label: "Rate limited",       percent: 11 },
  { key: "mfa-failed",       label: "MFA failed",         percent: 7  },
  { key: "other",            label: "Other",              percent: 5  },
];

/* ── Security Signals ────────────────────────────────────────────────────── */
export const SECURITY_SIGNALS: SecuritySignal[] = [
  { id: "sec-1", message: "28 repeated failed logins from same IP range",   tone: "danger"  },
  { id: "sec-2", message: "11 suspicious geo-switch logins detected",       tone: "warning" },
  { id: "sec-3", message: "6 admin accounts without MFA enabled",           tone: "warning" },
  { id: "sec-4", message: "3 locked accounts pending review",               tone: "info"    },
];

/* ── Auth Route Health ───────────────────────────────────────────────────── */
export const AUTH_ROUTE_HEALTH: AuthRouteRow[] = [
  { route: "/auth/sign-in",        status: "Healthy", p95Ms: 182 },
  { route: "/auth/sign-up",        status: "Healthy", p95Ms: 204 },
  { route: "/auth/callback",       status: "Warning", p95Ms: 312 },
  { route: "/auth/reset-password", status: "Healthy", p95Ms: 196 },
  { route: "/auth/magic-link",     status: "Warning", p95Ms: 338 },
];

/* ── Regional Sign-In Activity ───────────────────────────────────────────── */
export const REGIONAL_SIGNIN_ACTIVITY: RegionalSignInRow[] = [
  { rank: 1, label: "Europe",        percent: 42, count: 7546 },
  { rank: 2, label: "North America", percent: 28, count: 5113 },
  { rank: 3, label: "Asia",          percent: 17, count: 3095 },
  { rank: 4, label: "South America", percent: 7,  count: 1274 },
  { rank: 5, label: "Other",         percent: 6,  count: 1176 },
];

/* ── Recent Auth Events table ────────────────────────────────────────────── */
export const RECENT_AUTH_EVENTS: AuthEventRow[] = [
  {
    id: "ae-1",
    time: "10:41:58",
    event: "login_success",
    user: "emma.larsen@example.com",
    provider: "Email / Password",
    route: "/auth/sign-in",
    device: "Desktop",
    statusLabel: "Success",
    statusKind: "success",
  },
  {
    id: "ae-2",
    time: "10:41:32",
    event: "signup_completed",
    user: "jonas.berg@example.com",
    provider: "Google",
    route: "/auth/sign-up",
    device: "Mobile",
    statusLabel: "Success",
    statusKind: "success",
  },
  {
    id: "ae-3",
    time: "10:40:11",
    event: "password_reset_requested",
    user: "sophie.dahl@example.com",
    provider: "Email / Password",
    route: "/auth/reset-password",
    device: "Desktop",
    statusLabel: "Tracked",
    statusKind: "tracked",
  },
  {
    id: "ae-4",
    time: "10:39:47",
    event: "login_failed",
    user: "user_6bb29f",
    provider: "Email / Password",
    route: "/auth/sign-in",
    device: "Mobile",
    statusLabel: "Invalid Password",
    statusKind: "danger",
  },
  {
    id: "ae-5",
    time: "10:38:10",
    event: "magic_link_sent",
    user: "lucas.hansen@example.com",
    provider: "Magic Link",
    route: "/auth/magic-link",
    device: "Tablet",
    statusLabel: "Sent",
    statusKind: "tracked",
  },
  {
    id: "ae-6",
    time: "10:36:54",
    event: "mfa_challenge_failed",
    user: "nora.aasen@example.com",
    provider: "Email / Password",
    route: "/auth/verify-mfa",
    device: "Desktop",
    statusLabel: "Failed",
    statusKind: "warning",
  },
];

export const RECENT_AUTH_EVENTS_TOTAL = 3842;
export const RECENT_AUTH_EVENTS_TOTAL_PAGES = 641;

/* ─────────────────────────────────────────────────────────────────────────
   LOGS PAGE (/dev/logs)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (5 tiles) ──────────────────────────────────────────── */
export const LOGS_METRIC_CARDS: LogsMetricCard[] = [
  {
    key: "total-logs-24h",
    label: "Total Logs (24h)",
    value: "8.4M",
    tone: "blue",
    icon: FileWarning,
    delta: "+12.4%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [6800, 7000, 7200, 7100, 7400, 7600, 7800, 7700, 7900, 8100, 8200, 8300, 8400],
  },
  {
    key: "error-logs",
    label: "Error Logs",
    value: "12,842",
    tone: "red",
    icon: TriangleAlert,
    delta: "+8.7%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs prev 24h",
    series: [9800, 10200, 10800, 10600, 11200, 11400, 11600, 11900, 12100, 12300, 12500, 12700, 12842],
  },
  {
    key: "warning-logs",
    label: "Warning Logs",
    value: "38,214",
    tone: "amber",
    icon: AlertOctagon,
    delta: "+5.3%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs prev 24h",
    series: [32100, 33200, 34000, 33600, 34800, 35400, 36000, 36400, 36900, 37300, 37700, 38000, 38214],
  },
  {
    key: "avg-ingest-delay",
    label: "Avg Ingest Delay",
    value: "1.8s",
    tone: "green",
    icon: Timer,
    delta: "-18.6%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [2.6, 2.5, 2.4, 2.3, 2.3, 2.2, 2.1, 2.1, 2.0, 1.95, 1.9, 1.85, 1.8],
  },
  {
    key: "active-streams",
    label: "Active Streams",
    value: "27",
    tone: "blue",
    icon: Radio,
    delta: "+3",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27],
  },
];

/* ── Filter defaults ─────────────────────────────────────────────────────── */
export const LOGS_FILTERS_DEFAULTS = {
  service: "All services",
  level: "All levels",
  source: "All sources",
  environment: "Production",
  timeframe: "Last 30 minutes",
  liveTailing: true,
};

/* ── Live log stream rows ────────────────────────────────────────────────── */
export const LIVE_LOG_ROWS: LiveLogRow[] = [
  {
    id: "log-row-1",
    time: "14:32:18.512",
    level: "INFO",
    service: "frontend",
    source: "web",
    message: "Webhook processed successfully",
    traceId: "d1f7c9e2",
    user: "user_1234",
    route: "POST /api/webhooks",
    duration: "342ms",
  },
  {
    id: "log-row-2",
    time: "14:32:17.891",
    level: "WARN",
    service: "database",
    source: "postgres",
    message: "Slow query detected on public.missions",
    traceId: "a3b8e7f1",
    user: null,
    route: "SELECT * FROM missions",
    duration: "1.24s",
  },
  {
    id: "log-row-3",
    time: "14:32:16.233",
    level: "ERROR",
    service: "notifications",
    source: "api",
    message: "Failed to fetch /api/notifications",
    traceId: "8f2a1d4b",
    user: "user_5678",
    route: "GET /api/notifications",
    duration: "2.31s",
  },
  {
    id: "log-row-4",
    time: "14:32:15.982",
    level: "INFO",
    service: "auth",
    source: "auth-service",
    message: "Session refresh completed",
    traceId: "b7c9d3a8",
    user: "user_5678",
    route: "POST /api/auth/refresh",
    duration: "184ms",
  },
  {
    id: "log-row-5",
    time: "14:32:15.102",
    level: "WARN",
    service: "backend-api",
    source: "api",
    message: "Rate limit threshold reached",
    traceId: "e6d4b2c1",
    user: "user_9012",
    route: "GET /api/data",
    duration: "923ms",
  },
  {
    id: "log-row-6",
    time: "14:32:14.672",
    level: "INFO",
    service: "storage",
    source: "s3",
    message: "File upload retry scheduled",
    traceId: "c4b2a9e6",
    user: "user_3456",
    route: "PUT /files/upload",
    duration: "512ms",
  },
  {
    id: "log-row-7",
    time: "14:32:14.123",
    level: "DEBUG",
    service: "payments",
    source: "stripe",
    message: "Payment intent confirmed",
    traceId: "f9e8d7c6",
    user: "user_7890",
    route: "POST /api/payments",
    duration: "263ms",
  },
  {
    id: "log-row-8",
    time: "14:32:13.555",
    level: "INFO",
    service: "backend-api",
    source: "worker",
    message: "Email queued for delivery",
    traceId: "d5c3b8a1",
    user: null,
    route: "POST /api/email/send",
    duration: "167ms",
  },
];

export const LIVE_LOG_TOTAL = 1248;
export const LIVE_LOG_TOTAL_PAGES = 157;
export const LIVE_LOG_SELECTED_ID = "log-row-3";

/* ── Log Volume by Level — stacked area over the last 30 minutes ─────────── */
export const LOG_VOLUME_BY_LEVEL: LogVolumeChart = {
  xLabels: ["14:02", "14:08", "14:14", "14:20", "14:26", "14:32"],
  yLabels: ["0", "10K", "20K", "30K"],
  yMax: 30000,
  series: [
    {
      key: "info",
      label: "INFO",
      color: "var(--dev-chart-blue)",
      values: [22000, 23500, 21800, 24800, 24000, 25600, 24200, 25400, 26800, 25200, 26400, 27200],
    },
    {
      key: "warn",
      label: "WARN",
      color: "var(--dev-chart-amber)",
      values: [9800, 10400, 9600, 11200, 10800, 11600, 11000, 11400, 12200, 11400, 11800, 12400],
    },
    {
      key: "error",
      label: "ERROR",
      color: "var(--dev-chart-red)",
      values: [3800, 4200, 3600, 4400, 4100, 4600, 4400, 4500, 4800, 4500, 4700, 5000],
    },
  ],
};

/* ── Services Generating Most Logs ───────────────────────────────────────── */
export const SERVICE_LOG_VOLUME: ServiceLogVolumeRow[] = [
  { key: "frontend",      label: "frontend",      countLabel: "2.1M (25%)", percent: 25 },
  { key: "backend-api",   label: "backend-api",   countLabel: "1.8M (21%)", percent: 21 },
  { key: "auth",          label: "auth",          countLabel: "1.2M (14%)", percent: 14 },
  { key: "notifications", label: "notifications", countLabel: "1.1M (13%)", percent: 13 },
  { key: "database",      label: "database",      countLabel: "1.0M (12%)", percent: 12 },
  { key: "payments",      label: "payments",      countLabel: "620K (7%)",  percent: 7  },
];

/* ── Saved Views / Quick Filters ─────────────────────────────────────────── */
export const SAVED_VIEWS: SavedViewRow[] = [
  { key: "errors-only",          label: "Errors only",          icon: TriangleAlert, tone: "danger"  },
  { key: "auth-events",          label: "Auth events",          icon: ShieldX,       tone: "info"    },
  { key: "payment-webhooks",     label: "Payment webhooks",     icon: Webhook,       tone: "success" },
  { key: "slow-queries",         label: "Slow queries",         icon: TimerReset,    tone: "warning" },
  { key: "notification-failures",label: "Notification failures",icon: MailX,         tone: "danger"  },
];

/* ── Selected log details — driven by LIVE_LOG_SELECTED_ID above ─────────── */
export const SELECTED_LOG_DETAIL: SelectedLogDetail = {
  id: "log-row-3",
  level: "ERROR",
  timestamp: "May 12, 2025 14:32:16.233",
  service: "notifications",
  environment: "Production",
  route: "GET /api/notifications",
  traceId: "8f2a1d4b6e7c4f9a",
  requestId: "req_a1b2c3d4e5f6g7h8",
  userId: "user_5678",
  statusCode: 503,
  duration: "2.31s",
  message: "Failed to fetch /api/notifications",
  stackTrace: [
    "Error: Upstream service unavailable",
    "  at NotificationsService.getNotifications (notifications.service.ts:142:13)",
    "  at processTicksAndRejections (node:internal/process/task_queues:95:5)",
    "  at async handleRequest (api/middleware/request.ts:78:21)",
  ],
};

/* ── Recent trace groups ─────────────────────────────────────────────────── */
export const RECENT_TRACE_GROUPS: TraceGroupRow[] = [
  { id: "tg-1", traceId: "8f2a1d4b6e7c4f9a", serviceCount: 5, status: "Error", duration: "2.31s", lastSeen: "Just now" },
  { id: "tg-2", traceId: "d1f7c9e2a3b8e7f1", serviceCount: 6, status: "OK",    duration: "842ms", lastSeen: "10s ago"  },
  { id: "tg-3", traceId: "a3b8e7f1c4b2a9e6", serviceCount: 4, status: "Warn",  duration: "1.24s", lastSeen: "18s ago"  },
  { id: "tg-4", traceId: "b7c9d3a8e6d4b2c1", serviceCount: 3, status: "OK",    duration: "184ms", lastSeen: "22s ago"  },
  { id: "tg-5", traceId: "f9e8d7c6d5c3b8a1", serviceCount: 5, status: "OK",    duration: "263ms", lastSeen: "30s ago"  },
];

/* Re-export the Gauge icon so future logs widgets can pick it up without
 * pulling another lucide import path. Tree-shaken when unused. */
export { Gauge };

/* ─────────────────────────────────────────────────────────────────────────
   PERFORMANCE PAGE (/dev/performance)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (6 tiles) ──────────────────────────────────────────── */
export const PERF_METRIC_CARDS: PerfMetricCard[] = [
  {
    key: "p95-response-time",
    label: "p95 Response Time",
    value: "212 ms",
    tone: "blue",
    icon: Clock,
    delta: "-18.7%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [280, 268, 256, 248, 240, 232, 226, 222, 218, 216, 214, 213, 212],
  },
  {
    key: "p99-response-time",
    label: "p99 Response Time",
    value: "412 ms",
    tone: "blue",
    icon: Clock,
    delta: "-15.3%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [520, 504, 488, 472, 456, 444, 432, 424, 420, 418, 415, 413, 412],
  },
  {
    key: "requests-per-min",
    label: "Requests / Min",
    value: "2,842",
    tone: "blue",
    icon: Zap,
    delta: "+12.4%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [2400, 2460, 2520, 2560, 2600, 2660, 2700, 2740, 2770, 2790, 2810, 2830, 2842],
  },
  {
    key: "error-rate",
    label: "Error Rate",
    value: "0.23%",
    tone: "red",
    icon: AlertTriangle,
    delta: "-31.2%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [0.42, 0.40, 0.38, 0.36, 0.33, 0.31, 0.29, 0.28, 0.26, 0.25, 0.24, 0.235, 0.23],
  },
  {
    key: "cpu-usage",
    label: "CPU Usage",
    value: "42%",
    tone: "blue",
    icon: Cpu,
    delta: "-8.6%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs prev 24h",
    series: [50, 48, 47, 46, 45, 45, 44, 44, 43, 43, 42, 42, 42],
  },
  {
    key: "memory-usage",
    label: "Memory Usage",
    value: "68%",
    tone: "blue",
    icon: MemoryStick,
    delta: "+4.2%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs prev 24h",
    series: [62, 63, 64, 64, 65, 66, 66, 67, 67, 68, 68, 68, 68],
  },
];

/* ── Filter defaults ─────────────────────────────────────────────────────── */
export const PERF_FILTERS_DEFAULTS = {
  service: "All services",
  route: "All routes",
  environment: "Production",
  timeRange: "Last 24 hours",
  granularity: "5m",
  compare: false,
};

/* ── Response Time Over Time (24 hourly points × 3 series) ───────────────── */
export const PERF_LATENCY_CHART: PerfLatencyChart = {
  xLabels: ["14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00"],
  yLabels: ["0 ms", "200 ms", "400 ms", "600 ms", "800 ms"],
  yMax: 800,
  series: [
    {
      key: "p50",
      label: "p50",
      color: "var(--dev-chart-blue)",
      values: [
        160, 158, 162, 160, 156, 154, 158, 162, 168, 172, 188, 220, 200, 184, 176, 170, 168, 166, 162, 160, 158, 156, 158, 162, 164,
      ],
    },
    {
      key: "p95",
      label: "p95",
      color: "var(--dev-chart-violet)",
      values: [
        420, 412, 424, 416, 410, 408, 416, 428, 444, 460, 524, 612, 540, 480, 460, 444, 432, 428, 424, 420, 416, 412, 414, 418, 422,
      ],
    },
    {
      key: "p99",
      label: "p99",
      color: "var(--dev-chart-red)",
      values: [
        540, 528, 552, 544, 536, 528, 540, 556, 580, 612, 720, 884, 740, 644, 612, 588, 568, 560, 552, 544, 536, 530, 532, 540, 544,
      ],
    },
  ],
};

/* ── Requests Throughput (24 hourly points, single line) ─────────────────── */
export const PERF_THROUGHPUT_CHART: PerfThroughputChart = {
  xLabels: ["14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00"],
  yLabels: ["0", "2K", "4K", "6K", "8K"],
  yMax: 8000,
  values: [
    4200, 4350, 4500, 4620, 4780, 4900, 5050, 5180, 5320, 5440, 5560, 5680, 5800, 5920, 6020, 6100, 6180, 6260, 6300, 6280, 6240, 6160, 6080, 6020, 5960,
  ],
};

/* ── Top Slowest Routes (p95) ────────────────────────────────────────────── */
export const PERF_SLOWEST_ROUTES: PerfSlowestRouteRow[] = [
  { key: "post-upload",      method: "POST", path: "/api/upload",        p95Ms: 812 },
  { key: "get-analytics",    method: "GET",  path: "/api/analytics",     p95Ms: 642 },
  { key: "get-notifications",method: "GET",  path: "/api/notifications", p95Ms: 512 },
  { key: "post-webhooks",    method: "POST", path: "/api/webhooks",      p95Ms: 421 },
  { key: "get-dashboard",    method: "GET",  path: "/api/dashboard",     p95Ms: 312 },
];

/* ── Apdex score summary ─────────────────────────────────────────────────── */
export const PERF_APDEX: ApdexSummary = {
  score: 0.87,
  band: "Good",
  delta: "-0.04",
  deltaDirection: "down",
  deltaIsGood: false,
  baseline: "vs prev 24h",
};

/* ── Resource Usage (horizontal progress bars) ───────────────────────────── */
export const PERF_RESOURCE_USAGE: ResourceUsageRow[] = [
  { key: "cpu",     label: "CPU Usage",    percent: 43, tone: "blue"  },
  { key: "memory",  label: "Memory Usage", percent: 68, tone: "amber" },
  { key: "disk",    label: "Disk I/O",     percent: 35, tone: "blue"  },
  { key: "network", label: "Network I/O",  percent: 58, tone: "blue"  },
];

/* ── Error Rate Over Time (small line chart) ─────────────────────────────── */
export const PERF_ERROR_RATE_CHART: PerfErrorRateChart = {
  xLabels: ["14:00", "20:00", "02:00", "08:00", "14:00"],
  yLabels: ["0%", "0.25%", "0.50%", "0.79%", "1.00%"],
  yMax: 1,
  // 25 evenly-spaced points across 24h. Low baseline with a couple of
  // small spikes — narratively "error rate dipped overnight, small ripple
  // around the morning peak".
  values: [
    0.18, 0.22, 0.16, 0.30, 0.78, 0.42, 0.36, 0.28, 0.22, 0.20,
    0.18, 0.16, 0.14, 0.16, 0.18, 0.34, 0.40, 0.28, 0.24, 0.22,
    0.20, 0.20, 0.22, 0.20, 0.18,
  ],
};

/* ── Largest DB Queries (p95) ────────────────────────────────────────────── */
export const PERF_DB_QUERIES: PerfDbQueryRow[] = [
  { key: "missions",  query: "SELECT * FROM missions …",  p95Ms: 1240 },
  { key: "users",     query: "SELECT * FROM users …",     p95Ms: 985  },
  { key: "events",    query: "SELECT * FROM events …",    p95Ms: 742  },
  { key: "analytics", query: "SELECT * FROM analytics …", p95Ms: 512  },
  { key: "payments",  query: "SELECT * FROM payments …",  p95Ms: 412  },
];

/* ── Service Performance Overview ────────────────────────────────────────── */
export const SERVICE_PERFORMANCE_ROWS: ServicePerfRow[] = [
  { key: "frontend",     service: "frontend",     requestsPerMin: 1245, p50Ms: 60,  p95Ms: 180, p99Ms: 320, errorRatePercent: 0.15, apdex: 0.92, cpuPercent: 38, memoryPercent: 62, status: "Healthy"  },
  { key: "backend-api",  service: "backend-api",  requestsPerMin: 842,  p50Ms: 85,  p95Ms: 210, p99Ms: 412, errorRatePercent: 0.28, apdex: 0.87, cpuPercent: 46, memoryPercent: 68, status: "Healthy"  },
  { key: "auth-service", service: "auth-service", requestsPerMin: 312,  p50Ms: 45,  p95Ms: 120, p99Ms: 210, errorRatePercent: 0.05, apdex: 0.95, cpuPercent: 22, memoryPercent: 48, status: "Healthy"  },
  { key: "notifications",service: "notifications",requestsPerMin: 156,  p50Ms: 120, p95Ms: 310, p99Ms: 512, errorRatePercent: 1.42, apdex: 0.65, cpuPercent: 34, memoryPercent: 58, status: "Degraded" },
  { key: "payments",     service: "payments",     requestsPerMin: 98,   p50Ms: 200, p95Ms: 420, p99Ms: 690, errorRatePercent: 0.23, apdex: 0.89, cpuPercent: 28, memoryPercent: 54, status: "Healthy"  },
  { key: "database",     service: "database",     requestsPerMin: null, p50Ms: 15,  p95Ms: 85,  p99Ms: 140, errorRatePercent: 0.02, apdex: 0.98, cpuPercent: 42, memoryPercent: 70, status: "Healthy"  },
];

/* ─────────────────────────────────────────────────────────────────────────
   QA CHECKLIST PAGE (/dev/qa-checklist)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (5 cards) ──────────────────────────────────────────── */
export const QA_METRIC_CARDS: QaMetricCard[] = [
  {
    key: "total-checks",
    label: "Total Checks",
    value: "86",
    tone: "blue",
    icon: ClipboardList,
    note: "—",
    noteTone: "neutral",
  },
  {
    key: "passed",
    label: "Passed",
    value: "61",
    tone: "green",
    icon: CircleCheck,
    note: "↑ 7 from last run",
    noteTone: "success",
  },
  {
    key: "needs-review",
    label: "Needs Review",
    value: "17",
    tone: "amber",
    icon: SearchIcon,
    note: "↓ 2 from last run",
    noteTone: "warning",
  },
  {
    key: "blockers",
    label: "Blockers",
    value: "3",
    tone: "red",
    icon: CircleAlert,
    note: "—",
    noteTone: "neutral",
  },
  {
    key: "release-readiness",
    label: "Release Readiness",
    value: "92%",
    tone: "blue",
    icon: ClipboardList, // unused — donutPercent takes precedence
    note: "↑ 5% from last run",
    noteTone: "success",
    donutPercent: 92,
  },
];

/* ── Filter defaults ─────────────────────────────────────────────────────── */
export const QA_FILTERS_DEFAULTS: QaFiltersState = {
  release: "v1.4.2",
  status: "All statuses",
  owner: "All teams",
  environment: "Production",
  view: "Grouped by area",
};

/* ── Grouped QA areas (left column) ──────────────────────────────────────── */
export const QA_GROUPED_AREAS: QaGroupedArea[] = [
  {
    key: "core",
    letter: "A",
    title: "Core App Experience",
    completed: 8,
    total: 10,
    counts: { passed: 6, needsReview: 2, blockers: 0, pending: 2 },
  },
  {
    key: "auth",
    letter: "B",
    title: "Auth & Access",
    completed: 6,
    total: 8,
    counts: { passed: 5, needsReview: 1, blockers: 1, pending: 1 },
  },
  {
    key: "billing",
    letter: "C",
    title: "Billing & Subscription",
    completed: 5,
    total: 7,
    counts: { passed: 4, needsReview: 1, blockers: 1, pending: 1 },
  },
  {
    key: "notifications",
    letter: "D",
    title: "Notifications & Messaging",
    completed: 4,
    total: 6,
    counts: { passed: 3, needsReview: 1, blockers: 1, pending: 1 },
  },
  {
    key: "performance",
    letter: "E",
    title: "Performance & Stability",
    completed: 6,
    total: 8,
    counts: { passed: 4, needsReview: 2, blockers: 0, pending: 2 },
  },
  {
    key: "responsive",
    letter: "F",
    title: "Responsive QA",
    completed: 5,
    total: 7,
    counts: { passed: 3, needsReview: 2, blockers: 0, pending: 2 },
  },
  {
    key: "a11y",
    letter: "G",
    title: "Accessibility & Content QA",
    completed: 4,
    total: 6,
    counts: { passed: 2, needsReview: 2, blockers: 0, pending: 2 },
  },
];

/* ── Release readiness card (right column) ───────────────────────────────── */
export const QA_RELEASE_READINESS: QaReleaseReadiness = {
  percent: 92,
  headline: "Ready for final review",
  body: "Great progress! Address remaining review items and blockers to achieve 100% release readiness.",
  lastRun: "28m ago",
  release: "v1.4.2",
};

/* ── Blockers card ───────────────────────────────────────────────────────── */
export const QA_BLOCKERS: QaBlocker[] = [
  { id: "blk-1", title: "OAuth callback handling edge cases",      severity: "high"   },
  { id: "blk-2", title: "Failed payment retry messaging verified", severity: "medium" },
  { id: "blk-3", title: "Real-time notification refresh tested",   severity: "medium" },
];

/* ── QA progress by area (right column mirror of the grouped list) ──────── */
export const QA_PROGRESS_BY_AREA: QaProgressByAreaRow[] = [
  { key: "core",          label: "Core App Experience",       percent: 80 },
  { key: "auth",          label: "Auth & Access",             percent: 75 },
  { key: "billing",       label: "Billing & Subscription",    percent: 71 },
  { key: "notifications", label: "Notifications & Messaging", percent: 67 },
  { key: "performance",   label: "Performance & Stability",   percent: 75 },
  { key: "responsive",    label: "Responsive QA",             percent: 71 },
  { key: "a11y",          label: "Accessibility & Content QA",percent: 67 },
];

/* ── Recent activity / sign-offs ─────────────────────────────────────────── */
export const QA_RECENT_ACTIVITY: QaActivityRow[] = [
  {
    id: "act-1",
    actorInitials: "EL",
    actorName: "Emma L.",
    message: 'marked "Invoice table renders correctly" as Passed',
    timeLabel: "12m ago",
    kind: "passed",
  },
  {
    id: "act-2",
    actorInitials: "JB",
    actorName: "Jonas B.",
    message: 'updated "Password reset email flow works" to Review',
    timeLabel: "26m ago",
    kind: "review",
  },
  {
    id: "act-3",
    actorInitials: "DB",
    actorName: "Deivid B.",
    message: "created QA run for v1.4.2",
    timeLabel: "43m ago",
    kind: "run-created",
  },
  {
    id: "act-4",
    actorInitials: "SM",
    actorName: "Sophie M.",
    message: "added blocker on real-time notification refresh",
    timeLabel: "1h ago",
    kind: "blocker-added",
  },
];

/* ── Release notes ───────────────────────────────────────────────────────── */
export const QA_RELEASE_NOTES: QaReleaseNote[] = [
  { label: "Target release",       value: "Today 18:00"                       },
  { label: "Environment",          value: "Production"                        },
  { label: "Open blockers allowed",value: "0"                                 },
  { label: "Final approvers",      value: "QA Lead, Product, Engineering"     },
];

/* ─────────────────────────────────────────────────────────────────────────
   SUPPORT PAGE (/dev/support)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (6 cards) ──────────────────────────────────────────── */
export const SUPPORT_METRIC_CARDS: SupportMetricCard[] = [
  {
    key: "open-tickets",
    label: "Open Tickets",
    value: "248",
    tone: "violet",
    icon: Inbox,
    delta: "+12.6%",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs yesterday",
    series: [180, 188, 196, 202, 208, 214, 222, 226, 232, 238, 244, 248],
  },
  {
    key: "urgent-tickets",
    label: "Urgent Tickets",
    value: "18",
    tone: "red",
    icon: TriangleAlert,
    delta: "-5.3%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [24, 23, 22, 22, 21, 21, 20, 20, 19, 19, 18, 18],
  },
  {
    key: "avg-first-response",
    label: "Avg. First Response",
    value: "18m 42s",
    tone: "green",
    icon: MessageCircle,
    delta: "-12.4%",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [26, 25, 24, 23, 22, 22, 21, 21, 20, 19, 19, 18],
  },
  {
    key: "resolved-today",
    label: "Resolved Today",
    value: "42",
    tone: "green",
    icon: CircleCheck,
    delta: "+16.7%",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs yesterday",
    series: [22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 41, 42],
  },
  {
    key: "sla-at-risk",
    label: "SLA At Risk",
    value: "9",
    tone: "amber",
    icon: Clock,
    delta: "+2",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs yesterday",
    series: [5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9],
  },
  {
    key: "csat-score",
    label: "CSAT Score",
    value: "4.6 / 5",
    tone: "green",
    icon: Star,
    delta: "+0.2",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs last 7 days",
    series: [4.2, 4.25, 4.3, 4.3, 4.35, 4.4, 4.4, 4.45, 4.5, 4.55, 4.55, 4.6],
  },
];

/* ── Filter row defaults (static UI for now) ─────────────────────────────── */
export const SUPPORT_FILTERS_DEFAULTS: SupportFiltersState = {
  priority:  "All",
  status:    "All",
  category:  "All",
  assignee:  "All",
  timeframe: "Last 7 days",
};

/* ── Ticket queue (10 rows on page 1 of 248) ─────────────────────────────── */
export const SUPPORT_QUEUE_ROWS: SupportQueueRow[] = [
  {
    id: "SUP-10482",
    client: "Acme Corp",
    subject: "API rate limits causing 429 errors",
    category: "API / Integrations",
    priority: "high",
    status: "open",
    assigneeInitials: "SM",
    assigneeName: "Sarah M.",
    assigneeTone: "blue",
    lastUpdate: "2m ago",
  },
  {
    id: "SUP-10483",
    client: "Globex Inc.",
    subject: "Webhook delivery delays",
    category: "Webhooks",
    priority: "medium",
    status: "open",
    assigneeInitials: "JT",
    assigneeName: "James T.",
    assigneeTone: "green",
    lastUpdate: "15m ago",
  },
  {
    id: "SUP-10484",
    client: "Initech",
    subject: "Login loop on SSO",
    category: "Auth",
    priority: "high",
    status: "in-progress",
    assigneeInitials: "MK",
    assigneeName: "Maya K.",
    assigneeTone: "violet",
    lastUpdate: "32m ago",
  },
  {
    id: "SUP-10485",
    client: "Soylent Corp",
    subject: "Billing invoice mismatch",
    category: "Billing",
    priority: "medium",
    status: "open",
    assigneeInitials: "AR",
    assigneeName: "Alex R.",
    assigneeTone: "amber",
    lastUpdate: "45m ago",
  },
  {
    id: "SUP-10486",
    client: "Umbrella Co.",
    subject: "Database slow queries",
    category: "Database",
    priority: "low",
    status: "investigating",
    assigneeInitials: "DS",
    assigneeName: "Daniel S.",
    assigneeTone: "cyan",
    lastUpdate: "1h ago",
  },
  {
    id: "SUP-10487",
    client: "Stark Industries",
    subject: "Feature flag not updating",
    category: "Feature Flags",
    priority: "medium",
    status: "waiting-client",
    assigneeInitials: "PS",
    assigneeName: "Priya S.",
    assigneeTone: "rose",
    lastUpdate: "1h ago",
  },
  {
    id: "SUP-10488",
    client: "Wayne Enterprises",
    subject: "Permission denied error",
    category: "Auth / Permissions",
    priority: "medium",
    status: "in-progress",
    assigneeInitials: "JT",
    assigneeName: "James T.",
    assigneeTone: "green",
    lastUpdate: "2h ago",
  },
  {
    id: "SUP-10489",
    client: "Wonka Industries",
    subject: "CSV export fails with 500",
    category: "Data / Export",
    priority: "high",
    status: "open",
    assigneeInitials: "SM",
    assigneeName: "Sarah M.",
    assigneeTone: "blue",
    lastUpdate: "2h ago",
  },
  {
    id: "SUP-10490",
    client: "Hooli",
    subject: "Outbound email delays",
    category: "Frontend",
    priority: "medium",
    status: "escalated",
    assigneeInitials: "MK",
    assigneeName: "Maya K.",
    assigneeTone: "violet",
    lastUpdate: "3h ago",
  },
  {
    id: "SUP-10491",
    client: "Cyberdyne Systems",
    subject: "Data sync inconsistency",
    category: "Data Sync",
    priority: "low",
    status: "resolved",
    assigneeInitials: "AR",
    assigneeName: "Alex R.",
    assigneeTone: "amber",
    lastUpdate: "4h ago",
  },
];

export const SUPPORT_QUEUE_PAGINATION: SupportQueuePagination = {
  showingFrom: 1,
  showingTo: 10,
  total: 248,
  currentPage: 1,
  totalPages: 25,
};

/* ── Center column: selected ticket details ──────────────────────────────── */
export const SUPPORT_TICKET_DETAILS: SupportTicketDetails = {
  id: "SUP-10482",
  title: "API rate limits causing 429 errors",
  client: "Acme Corp",
  clientSupportId: "ACME-8271",
  account: "acme-prod",
  workspace: "WS-88421",
  status: "open",
  source: "Web Portal",
  issueSummary:
    "Clients are receiving 429 responses from multiple API endpoints intermittently.",
  reproductionNotes: [
    "Send 100+ requests to /v1/orders within 10 seconds",
    "Observe 429 responses after ~60 requests",
    "Issue persists for ~60 seconds",
  ],
  priority: "high",
  slaDeadline: "20 May 2025, 14:00",
  slaTimeLeft: "3h 17m left",
  affectedArea: "API Gateway",
  internalNotes:
    "Likely related to new rate limiting config rolled out in v1.4.2. Monitoring and gathering additional logs.",
  assigneeUserId: null,
  assigneeName: "Sarah M.",
  csatRating: null,
};

/* ── Right column: client profile ────────────────────────────────────────── */
export const SUPPORT_CLIENT_PROFILE: SupportClientProfile = {
  client: "Acme Corp",
  supportId: "ACME-8271",
  plan: "Enterprise",
  accountHealth: "Healthy",
  company: "Acme Corporation",
  contactEmail: "support@acme.com",
  productArea: "API Platform",
  previousTicketsTotal: 14,
  previousTicketsOpen: 3,
  lastActivity: "2 minutes ago",
};

/* ── Communication timeline (4 events on the selected ticket) ────────────── */
export const SUPPORT_TIMELINE_EVENTS: SupportTimelineEvent[] = [
  {
    id: "evt-1",
    authorName: "Sarah M.",
    authorRole: "Support Engineer",
    authorInitials: "SM",
    authorTone: "blue",
    kind: "internal-note",
    message:
      "Investigating API Gateway logs. Not seeing any elevated error rates other than rate limit hits.",
    timeLabel: "2m ago",
  },
  {
    id: "evt-2",
    authorName: "System",
    authorRole: "Automated",
    authorInitials: "SYS",
    authorTone: "neutral",
    kind: "sla-update",
    message:
      "SLA deadline updated to 20 May 2025, 14:00 (High priority response time: 4h). Assigned to Priya S. (Team Lead).",
    timeLabel: "15m ago",
  },
  {
    id: "evt-3",
    authorName: "John D.",
    authorRole: "Acme Corp",
    authorInitials: "JD",
    authorTone: "amber",
    kind: "client-reply",
    message:
      "Thanks for the quick response! This is impacting our checkout flow.",
    timeLabel: "32m ago",
  },
  {
    id: "evt-4",
    authorName: "Sarah M.",
    authorRole: "Support Engineer",
    authorInitials: "SM",
    authorTone: "blue",
    kind: "reply",
    message:
      "We’re looking into this now and will update shortly.",
    timeLabel: "45m ago",
  },
];

/* ── Escalations & SLA risk (bottom-center card) ─────────────────────────── */
export const SUPPORT_ESCALATIONS: SupportEscalationRow[] = [
  {
    ticketId: "SUP-10490",
    subject: "Dashboard not loading",
    priority: "high",
    escalationState: "Escalated to Engineering",
    timeAtRisk: "1h ago",
  },
  {
    ticketId: "SUP-10483",
    subject: "Webhook delivery delays",
    priority: "medium",
    escalationState: "Awaiting Client Reply",
    timeAtRisk: "2h ago",
  },
  {
    ticketId: "SUP-10487",
    subject: "Feature flag not updating",
    priority: "medium",
    escalationState: "Awaiting Client Reply",
    timeAtRisk: "3h ago",
  },
];

/* ── SLA performance donut (Last 7 Days) ─────────────────────────────────── */
export const SUPPORT_SLA_SUMMARY: SupportSlaSummary = {
  totalTickets: 250,
  metPercent: 92,
  buckets: [
    {
      key: "met",
      label: "Met",
      count: 230,
      percent: 92,
      color: "var(--dev-chart-blue)",
    },
    {
      key: "breached",
      label: "Breached",
      count: 12,
      percent: 5,
      color: "var(--dev-danger)",
    },
    {
      key: "at-risk",
      label: "At Risk",
      count: 8,
      percent: 3,
      color: "var(--dev-warning)",
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   SUPPORT TICKET DETAIL PAGE (/dev/support/[ticketId])
   ───────────────────────────────────────────────────────────────────────── */

/** Single mock ticket — SUP-10482 from the queue. Real backend will load
 *  this by ticketId; the loader below mirrors that shape. */
export const SUPPORT_TICKET_DETAIL_SUP_10482: SupportTicketDetailBundle = {
  summary: {
    id: "SUP-10482",
    subject: "API rate limits causing 429 errors",
    client: "Acme Corp",
    clientSupportId: "ACME-8271",
    status: "open",
    priority: "high",
    category: "API / Integrations",
    assignee: { name: "Sarah M.", initials: "SM", tone: "violet" },
    createdAt: "20 May 2025, 10:14",
    lastUpdatedAt: "2m ago",
    slaDeadline: "20 May 2025, 14:00",
    slaRemaining: "3h 17m",
    accountPlan: "Enterprise",
  },
  submission: {
    submittedByName: "John D.",
    submittedByCompany: "Acme Corp",
    contactEmail: "support@acme.com",
    affectedProductArea: "API Platform",
    environment: "Production",
    issueSummary:
      "Client reports intermittent 429 responses from multiple API endpoints impacting checkout and webhook flows.",
    reproductionSteps: [
      "Send multiple requests to /api/v1/checkout within short interval.",
      "Observe 429 responses after ~60 requests.",
      "Issue persists for ~60 seconds.",
    ],
    expectedBehavior:
      "Requests should be rate limited consistently with clear retry headers.",
    actualBehavior:
      "Intermittent 429 errors without consistent headers; some requests succeed.",
    attachments: [
      { name: "screenshot_429.png", sizeLabel: "248 KB", kind: "image" },
      { name: "request_log.txt",    sizeLabel: "18 KB",  kind: "log"   },
    ],
    browser: "Chrome on macOS",
    submittedVia: "Web Portal",
  },
  investigation: {
    notes: [
      "Spike in 429 errors correlated with new rate limiting config deployed in v1.4.2.",
      "Thresholds for /checkout and /webhook endpoints may be too aggressive for burst traffic.",
      "Rolling back rate-limit policy for affected endpoints as temporary mitigation.",
    ],
    affectedService: "API Gateway",
    suspectedSeverity: "high",
    occurrences24h: 512,
    affectedAccounts: 14,
  },
  clientProfile: {
    company: "Acme Corporation",
    accountHealth: "Healthy",
    plan: "Enterprise",
    previousTicketsTotal: 14,
    previousTicketsOpen: 3,
    lastActivity: "2 minutes ago",
    quickLinks: [
      { id: "ql-account",     label: "View Client Account", href: "#", external: true },
      { id: "ql-tickets",     label: "View All Tickets",    href: "#", external: true },
      { id: "ql-impersonate", label: "Impersonate User",    href: "#", external: true },
      { id: "ql-contact",     label: "Contact Client",      href: "#", external: true },
    ],
  },
  metadata: {
    source: "Web Portal",
    productArea: "API Platform",
    region: "EU West",
    appVersion: "v1.4.2",
    browser: "Chrome",
    operatingSystem: "macOS",
  },
  conversation: [
    {
      id: "conv-1",
      kind: "client-reply",
      authorName: "John D.",
      authorContext: "Acme Corp",
      message:
        "Additional logs attached. Issue seems more frequent during checkout peaks.",
      timeLabel: "2m ago",
    },
    {
      id: "conv-2",
      kind: "support-reply",
      authorName: "Sarah M.",
      message:
        "Thanks for the update. We are investigating and will update you shortly.",
      timeLabel: "15m ago",
    },
    {
      id: "conv-3",
      kind: "internal-note",
      authorName: "Sarah M.",
      authorContext: "Internal",
      message:
        "Correlated with rate-limit policy change in v1.4.2. Escalated to Engineering.",
      timeLabel: "32m ago",
    },
    {
      id: "conv-4",
      kind: "system-update",
      authorName: "System",
      message: "Ticket Status changed to Open",
      timeLabel: "45m ago",
    },
  ],
  workflow: {
    escalationStatus: "Escalated to Engineering",
    escalationTone: "danger",
    ownerName: "Priya S.",
    ownerInitials: "PS",
    ownerTone: "violet",
    nextAction: "Review rate-limit thresholds",
    incidentLink: { id: "INC-1042", href: "#" },
    stages: [
      { key: "submitted",     label: "Submitted",     timestamp: "20 May, 10:14" },
      { key: "in-review",     label: "In Review",     timestamp: "20 May, 10:18" },
      { key: "investigating", label: "Investigating", timestamp: "20 May, 10:27" },
      { key: "awaiting-fix",  label: "Awaiting Fix"                              },
      { key: "resolved",      label: "Resolved"                                   },
    ],
    currentStageIndex: 2,
  },
  relatedIssues: [
    { id: "SUP-10421", subject: "Webhooks timing out",        status: "investigating", href: "/dev/support/sup-10421" },
    { id: "SUP-10311", subject: "Rate limit config rollover", status: "resolved",      href: "/dev/support/sup-10311" },
    { id: "SUP-10298", subject: "Checkout latency spikes",    status: "open",          href: "/dev/support/sup-10298" },
  ],
  slaRisk: {
    percent: 92,
    label: "Healthy",
    headline: "High priority ticket nearing deadline.",
    timeRemaining: "3h 17m",
  },
};

/** Loader the page calls — keyed by ticketId. Falls back to SUP-10482 so
 *  any non-seeded ticket still renders a complete page during the
 *  frontend-only phase. Replace this with a real Supabase query later. */
export function getSupportTicketDetail(ticketId: string): SupportTicketDetailBundle {
  const id = ticketId.toUpperCase();
  if (id === "SUP-10482") return SUPPORT_TICKET_DETAIL_SUP_10482;
  // Mirror the requested id onto the SUP-10482 shape so deep links from the
  // queue table land on a plausible page until a real loader is wired.
  return {
    ...SUPPORT_TICKET_DETAIL_SUP_10482,
    summary: { ...SUPPORT_TICKET_DETAIL_SUP_10482.summary, id },
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   DATABASE PAGE (/dev/database)
   ───────────────────────────────────────────────────────────────────────── */

/* ── Top metric strip (6 tiles) ──────────────────────────────────────────── */
export const DATABASE_METRIC_CARDS: DatabaseMetricCard[] = [
  {
    key: "db-status",
    label: "Database Status",
    value: "Healthy",
    tone: "green",
    icon: Database,
    statusLabel: "Operational",
    note: "All connections stable",
    series: [99.9, 99.9, 100, 99.8, 99.9, 100, 100, 99.9, 100, 100, 100, 100],
  },
  {
    key: "active-connections",
    label: "Active Connections",
    value: "42",
    tone: "blue",
    icon: Activity,
    delta: "+6",
    deltaDirection: "up",
    deltaIsGood: true,
    baseline: "vs previous hour",
    series: [28, 30, 32, 34, 33, 35, 36, 36, 38, 40, 41, 42],
  },
  {
    key: "slow-queries",
    label: "Slow Queries",
    value: "12",
    tone: "amber",
    icon: Timer,
    delta: "+2",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs previous 24h",
    series: [6, 7, 8, 7, 9, 9, 10, 10, 11, 11, 12, 12],
  },
  {
    key: "failed-queries",
    label: "Failed Queries",
    value: "4",
    tone: "green",
    icon: AlertOctagon,
    delta: "-3",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs previous 24h",
    series: [8, 7, 7, 6, 6, 5, 5, 5, 4, 4, 4, 4],
  },
  {
    key: "rls-denials",
    label: "RLS Denials",
    value: "28",
    tone: "orange",
    icon: ShieldX,
    delta: "+8",
    deltaDirection: "up",
    deltaIsGood: false,
    baseline: "vs previous 24h",
    series: [12, 14, 16, 17, 18, 20, 22, 23, 24, 26, 27, 28],
  },
  {
    key: "avg-query-time",
    label: "Avg Query Time",
    value: "84ms",
    tone: "green",
    icon: Gauge,
    delta: "-12ms",
    deltaDirection: "down",
    deltaIsGood: true,
    baseline: "vs previous 24h",
    series: [102, 99, 96, 94, 92, 91, 90, 89, 87, 86, 85, 84],
  },
];

/* ── Filter row defaults ─────────────────────────────────────────────────── */
export const DATABASE_FILTERS_DEFAULTS: DatabaseFiltersState = {
  table:       "All tables",
  queryType:   "All query types",
  status:      "All statuses",
  environment: "Production",
  timeframe:   "Last 24 hours",
};

/* ── Query Performance Over Time (24 hourly points × 3 series) ──────────── */
export const DB_QUERY_PERF_CHART: DbQueryPerfChart = {
  xLabels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM", "12 AM"],
  yLabels: ["0", "300", "600", "900", "1.2K"],
  yMax: 1200,
  series: [
    {
      key: "avg",
      label: "Avg Query Time (ms)",
      color: "var(--dev-chart-blue)",
      values: [
        88, 86, 84, 82, 80, 82, 86, 92, 102, 110, 118, 122, 124, 120, 116,
        112, 106, 102, 98, 96, 92, 88, 86, 84, 84,
      ],
    },
    {
      key: "p95",
      label: "p95 Query Time (ms)",
      color: "var(--dev-chart-violet)",
      values: [
        260, 250, 240, 230, 230, 240, 280, 320, 380, 460, 540, 620, 720, 700,
        660, 600, 540, 480, 420, 380, 340, 310, 290, 280, 270,
      ],
    },
    {
      key: "failed",
      label: "Failed Queries",
      color: "var(--dev-chart-amber)",
      values: [
        1, 1, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1,
        1, 1,
      ],
    },
  ],
};

/* ── Table Activity ──────────────────────────────────────────────────────── */
export const DB_TABLE_ACTIVITY: DbTableActivityRow[] = [
  { table: "profiles",         reads: 24812, writes: 1204, rowCount: 24918,  status: "Healthy"       },
  { table: "subscriptions",    reads: 8420,  writes: 382,  rowCount: 7848,   status: "Healthy"       },
  { table: "notifications",    reads: 18214, writes: 2184, rowCount: 102884, status: "High activity" },
  { table: "programs",         reads: 6928,  writes: 124,  rowCount: 148,    status: "Healthy"       },
  { table: "tutorials",        reads: 9112,  writes: 218,  rowCount: 420,    status: "Healthy"       },
  { table: "support_tickets",  reads: 3812,  writes: 248,  rowCount: 248,    status: "Healthy"       },
];

/* ── Slowest Queries ─────────────────────────────────────────────────────── */
export const DB_SLOW_QUERIES: DbSlowQueryRow[] = [
  { key: "q-notif",   query: "SELECT * FROM notifications WHERE user_id…",  p95Ms: 1240 },
  { key: "q-events",  query: "SELECT * FROM analytics_events…",             p95Ms: 985  },
  { key: "q-support", query: "SELECT * FROM support_tickets…",              p95Ms: 742  },
  { key: "q-posting", query: "SELECT * FROM posting_plans…",                p95Ms: 512  },
  { key: "q-subs",    query: "SELECT * FROM subscriptions…",                p95Ms: 412  },
];

/* ── RLS / Policy Monitor ────────────────────────────────────────────────── */
export const DB_RLS_POLICIES: DbRlsPolicyRow[] = [
  { key: "rls-profiles",        label: "profiles SELECT policy",       status: "Healthy"    },
  { key: "rls-subs-insert",     label: "subscriptions INSERT policy",  status: "Warning"    },
  { key: "rls-support-select",  label: "support_tickets SELECT policy",status: "Healthy"    },
  { key: "rls-admin-cms",       label: "admin CMS policies",           status: "Review"     },
  { key: "rls-dev-dashboard",   label: "dev dashboard policies",       status: "Restricted" },
];

/* ── Migration Status ────────────────────────────────────────────────────── */
export const DB_MIGRATION_STATUS: DbMigrationStatus = {
  latestMigration: "20260518_add_support_tickets",
  status: "Applied",
  lastRun: "28m ago",
  pendingCount: 0,
  failedCount: 0,
};

/* ── Storage Bucket Status ───────────────────────────────────────────────── */
export const DB_STORAGE_BUCKETS: DbStorageBucketRow[] = [
  { bucket: "avatars",              status: "Healthy", size: "1.8GB", usagePercent: 18 },
  { bucket: "support-attachments",  status: "Healthy", size: "420MB", usagePercent: 8  },
  { bucket: "tutorial-media",       status: "Warning", size: "8.4GB", usagePercent: 84 },
  { bucket: "program-assets",       status: "Healthy", size: "2.1GB", usagePercent: 21 },
];

/* ── RPC / Functions Health ──────────────────────────────────────────────── */
export const DB_RPC_HEALTH: DbRpcRow[] = [
  { fn: "get_user_dashboard",       status: "Healthy", avgMs: 82  },
  { fn: "mark_notification_read",   status: "Healthy", avgMs: 41  },
  { fn: "create_support_ticket",    status: "Healthy", avgMs: 124 },
  { fn: "sync_subscription_status", status: "Warning", avgMs: 318 },
  { fn: "calculate_user_progress",  status: "Healthy", avgMs: 96  },
];

/* ── Database Integrity Warnings ────────────────────────────────────────── */
export const DB_INTEGRITY_WARNINGS: DbIntegrityWarning[] = [
  { id: "iw-1", message: "9 Pro users missing subscription row",        tone: "danger"  },
  { id: "iw-2", message: "28 billing sync mismatches",                  tone: "warning" },
  { id: "iw-3", message: "14 notifications without action route",       tone: "warning" },
  { id: "iw-4", message: "6 users without onboarding category",         tone: "info"    },
  { id: "iw-5", message: "3 duplicate social account records",          tone: "warning" },
];

/* ── Recent Database Events table ───────────────────────────────────────── */
export const RECENT_DB_EVENTS: DbEventRow[] = [
  {
    id: "dbe-1",
    time: "10:41:58",
    event: "query_completed",
    source: "profiles",
    type: "SELECT",
    duration: "82ms",
    statusLabel: "Success",
    statusKind: "success",
    details: "user profile fetch",
  },
  {
    id: "dbe-2",
    time: "10:41:32",
    event: "rls_denied",
    source: "subscriptions",
    type: "SELECT",
    duration: "18ms",
    statusLabel: "Warning",
    statusKind: "warning",
    details: "policy denied request",
  },
  {
    id: "dbe-3",
    time: "10:40:11",
    event: "insert_completed",
    source: "support_tickets",
    type: "INSERT",
    duration: "124ms",
    statusLabel: "Success",
    statusKind: "success",
    details: "new ticket created",
  },
  {
    id: "dbe-4",
    time: "10:39:47",
    event: "slow_query",
    source: "notifications",
    type: "SELECT",
    duration: "1.24s",
    statusLabel: "Warning",
    statusKind: "warning",
    details: "unread notification query",
  },
  {
    id: "dbe-5",
    time: "10:38:10",
    event: "rpc_completed",
    source: "mark_notification_read",
    type: "RPC",
    duration: "41ms",
    statusLabel: "Success",
    statusKind: "success",
    details: "notification updated",
  },
  {
    id: "dbe-6",
    time: "10:36:54",
    event: "storage_upload",
    source: "support-attachments",
    type: "UPLOAD",
    duration: "512ms",
    statusLabel: "Success",
    statusKind: "success",
    details: "attachment uploaded",
  },
];

export const RECENT_DB_EVENTS_TOTAL = 842;
export const RECENT_DB_EVENTS_TOTAL_PAGES = 141;

/* Re-export icons used downstream by the database page in case a future
 * component needs them. Tree-shaken away when unused. */
export { ServerCog, HardDriveDownload, ShieldQuestion, ListTree };
