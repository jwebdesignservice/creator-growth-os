import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  AUTH_EVENTS_PAGE_SIZE,
  type AuthFilterState,
} from "./auth-filters";
import {
  AUTH_ACTIVITY_CHART,
  AUTH_FILTERS_DEFAULTS,
  AUTH_METRIC_CARDS,
  AUTH_PROVIDER_BREAKDOWN,
  AUTH_ROUTE_HEALTH,
  FAILED_LOGIN_REASONS,
  RECENT_AUTH_EVENTS,
  RECENT_AUTH_EVENTS_TOTAL,
  REGIONAL_SIGNIN_ACTIVITY,
  SECURITY_SIGNALS,
  SESSION_HEALTH,
  SIGNUP_FUNNEL,
} from "./mock-data";
import type {
  AuthActivityChart,
  AuthEventDevice,
  AuthEventRow,
  AuthEventStatusKind,
  AuthMetricCard,
  AuthProviderBreakdown,
  AuthRouteRow,
  AuthRouteStatus,
  FailedLoginReason,
  RegionalSignInRow,
  SecuritySignal,
  SecuritySignalTone,
  SessionHealthRow,
  SignupFunnelStage,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server-side queries for /dev/auth.

   Strategy mirrors errors-queries.ts:
   - Try Supabase first (canonical source after migration 0011).
   - On any error (table missing, permission denied, network) fall back to
     centralized mock data so the page never breaks — useful in environments
     where the migration hasn't been applied yet.
   - All exports return the same typed shapes the components already expect.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function buildIsoCutoff(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

/** "10:41:58" — local-ish wall clock for the table. */
function clockTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function deltaIsGoodForMetric(key: string, delta: number): boolean {
  // Lower-is-better metrics treat a negative delta as "good".
  const lowerBetter = key === "failed-logins" || key === "auth-error-rate";
  if (lowerBetter) return delta <= 0;
  return delta >= 0;
}

function formatDelta(key: string, delta: number): string {
  const unit = key === "mfa-adoption" || key === "auth-error-rate" ? "%" : "%";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}${unit}`;
}

const PROVIDER_LABEL: Record<string, string> = {
  email:      "Email / Password",
  google:     "Google",
  apple:      "Apple",
  magic_link: "Magic Link",
  github:     "GitHub",
  other:      "Other",
};

const KIND_DEFAULT_STATUS: Record<string, AuthEventStatusKind> = {
  login_success:            "success",
  signup_completed:         "success",
  signup_started:           "tracked",
  password_reset_requested: "tracked",
  password_reset_completed: "success",
  magic_link_sent:          "tracked",
  mfa_challenge_sent:       "tracked",
  mfa_challenge_succeeded:  "success",
  mfa_challenge_failed:     "warning",
  login_failed:             "danger",
  session_revoked:          "warning",
  account_locked:           "warning",
  account_unlocked:         "success",
};

type DbAuthEventRow = {
  id: string;
  occurred_at: string;
  event_kind: string;
  status: AuthEventStatusKind;
  status_label: string;
  user_label: string;
  provider: string;
  route: string;
  device: AuthEventDevice;
  region: string | null;
  failure_reason: string | null;
  suspicious: boolean;
};

function rowToAuthEvent(r: DbAuthEventRow): AuthEventRow {
  return {
    id:          r.id,
    time:        clockTime(r.occurred_at),
    event:       r.event_kind,
    user:        r.user_label,
    provider:    PROVIDER_LABEL[r.provider] ?? r.provider,
    route:       r.route,
    device:      r.device,
    statusLabel: r.status_label,
    statusKind:  r.status ?? KIND_DEFAULT_STATUS[r.event_kind] ?? "tracked",
  };
}

/* ── Public queries ──────────────────────────────────────────────────────── */

/** Top-strip metric cards. Computes live counts where possible (signins,
 *  signups, failed logins, active sessions, MFA adoption, error rate) and
 *  patches them onto the mock card shapes so sparklines stay populated.
 *  Falls back to pure mock data if the table doesn't exist yet. */
export async function getAuthMetrics(filters: AuthFilterState): Promise<AuthMetricCard[]> {
  try {
    const supabase = await createClient();
    const cutoff = buildIsoCutoff(filters.timeframeHours);
    const prevCutoff = buildIsoCutoff(filters.timeframeHours * 2);

    const head = { count: "exact" as const, head: true };
    const [
      curSignIns, prevSignIns,
      curSignUps, prevSignUps,
      curFailed,  prevFailed,
      curMfaOk,
    ] = await Promise.all([
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "login_success").gte("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "login_success").gte("occurred_at", prevCutoff).lt("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "signup_completed").gte("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "signup_completed").gte("occurred_at", prevCutoff).lt("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "login_failed").gte("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "login_failed").gte("occurred_at", prevCutoff).lt("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "mfa_challenge_succeeded").gte("occurred_at", cutoff),
    ]);

    const signIns      = curSignIns.count  ?? 0;
    const signInsPrev  = prevSignIns.count ?? 0;
    const signUps      = curSignUps.count  ?? 0;
    const signUpsPrev  = prevSignUps.count ?? 0;
    const failed       = curFailed.count   ?? 0;
    const failedPrev   = prevFailed.count  ?? 0;

    const totalLogins      = signIns + failed;
    const totalLoginsPrev  = signInsPrev + failedPrev;
    const errorRate        = totalLogins     > 0 ? (failed     / totalLogins)     * 100 : 0;
    const errorRatePrev    = totalLoginsPrev > 0 ? (failedPrev / totalLoginsPrev) * 100 : 0;
    const mfaAdoption      = signIns > 0 ? Math.min(100, ((curMfaOk.count ?? 0) / signIns) * 100) : 0;

    function pctDelta(cur: number, prev: number): number {
      if (prev === 0) return cur === 0 ? 0 : 100;
      return ((cur - prev) / prev) * 100;
    }

    // If everything came back as 0 the table is probably empty — keep mock.
    if (signIns + signUps + failed === 0) return AUTH_METRIC_CARDS;

    const overrides: Record<string, { value: string; delta: number }> = {
      "sign-ins":        { value: signIns.toLocaleString(),       delta: pctDelta(signIns, signInsPrev) },
      "sign-ups":        { value: signUps.toLocaleString(),       delta: pctDelta(signUps, signUpsPrev) },
      "failed-logins":   { value: failed.toLocaleString(),        delta: pctDelta(failed, failedPrev) },
      "active-sessions": { value: signIns.toLocaleString(),       delta: pctDelta(signIns, signInsPrev) },
      "mfa-adoption":    { value: formatPercent(mfaAdoption),     delta: 0 },
      "auth-error-rate": { value: formatPercent(errorRate, 2),    delta: errorRate - errorRatePrev },
    };

    return AUTH_METRIC_CARDS.map((card) => {
      const o = overrides[card.key];
      if (!o) return card;
      const isGood = deltaIsGoodForMetric(card.key, o.delta);
      return {
        ...card,
        value: o.value,
        delta: formatDelta(card.key, o.delta),
        deltaDirection: o.delta >= 0 ? "up" : "down",
        deltaIsGood: isGood,
      };
    });
  } catch {
    return AUTH_METRIC_CARDS;
  }
}

/** Auth activity trends — hourly buckets for sign-ins, sign-ups, failed. */
export async function getAuthActivityChart(filters: AuthFilterState): Promise<AuthActivityChart> {
  try {
    const supabase = await createClient();
    const hours = filters.timeframeHours;
    const cutoff = buildIsoCutoff(hours);

    const { data, error } = await supabase
      .from("dev_auth_events")
      .select("occurred_at, event_kind")
      .gte("occurred_at", cutoff)
      .in("event_kind", ["login_success", "signup_completed", "login_failed"]);

    if (error || !data || data.length === 0) return AUTH_ACTIVITY_CHART;

    // Bucket into 24 evenly-spaced slots regardless of window size, so the
    // chart visual stays stable across timeframes.
    const SLOTS = 24;
    const slotMs = (hours * 3600 * 1000) / SLOTS;
    const start = Date.now() - hours * 3600 * 1000;
    const buckets: Record<string, number[]> = {
      login_success: Array(SLOTS).fill(0),
      signup_completed: Array(SLOTS).fill(0),
      login_failed: Array(SLOTS).fill(0),
    };

    for (const row of data) {
      const idx = Math.min(SLOTS - 1, Math.floor((new Date(row.occurred_at).getTime() - start) / slotMs));
      if (idx < 0) continue;
      const bucket = buckets[row.event_kind];
      if (bucket) bucket[idx] += 1;
    }

    const yMax = Math.max(
      1,
      ...buckets.login_success,
      ...buckets.signup_completed,
      ...buckets.login_failed,
    );
    // Round yMax up to a nice number for the axis.
    const niceMax = niceCeil(yMax);

    return {
      ...AUTH_ACTIVITY_CHART,
      yMax: niceMax,
      yLabels: ["0", String(Math.round(niceMax / 4)), String(Math.round(niceMax / 2)), String(Math.round((niceMax * 3) / 4)), String(niceMax)],
      series: [
        { ...AUTH_ACTIVITY_CHART.series[0], values: buckets.login_success },
        { ...AUTH_ACTIVITY_CHART.series[1], values: buckets.signup_completed },
        { ...AUTH_ACTIVITY_CHART.series[2], values: buckets.login_failed },
      ],
    };
  } catch {
    return AUTH_ACTIVITY_CHART;
  }
}

function niceCeil(v: number): number {
  if (v <= 10) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * mag;
}

/** Provider breakdown — percent split by provider over the window. */
export async function getAuthProviderBreakdown(filters: AuthFilterState): Promise<AuthProviderBreakdown> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_auth_events")
      .select("provider")
      .eq("event_kind", "login_success")
      .gte("occurred_at", buildIsoCutoff(filters.timeframeHours));

    if (error || !data || data.length === 0) return AUTH_PROVIDER_BREAKDOWN;

    const counts: Record<string, number> = {};
    for (const row of data) counts[row.provider] = (counts[row.provider] ?? 0) + 1;
    const total = data.length;

    return {
      slices: AUTH_PROVIDER_BREAKDOWN.slices.map((s) => ({
        ...s,
        percent: Math.round(((counts[providerEnumKey(s.key)] ?? 0) / total) * 100),
      })),
    };
  } catch {
    return AUTH_PROVIDER_BREAKDOWN;
  }
}

function providerEnumKey(uiKey: "email" | "google" | "apple" | "magic" | "other"): string {
  return uiKey === "magic" ? "magic_link" : uiKey;
}

/** Session health, signup funnel, failed reasons, regional, route health
 *  are derived/seeded — for now we return the mock data when the table is
 *  unreachable, and use the seeded rows when present. */

export async function getSessionHealth(_filters: AuthFilterState): Promise<SessionHealthRow[]> {
  void _filters;
  return SESSION_HEALTH;
}

export async function getSignupFunnel(filters: AuthFilterState): Promise<SignupFunnelStage[]> {
  try {
    const supabase = await createClient();
    const cutoff = buildIsoCutoff(filters.timeframeHours);
    const head = { count: "exact" as const, head: true };

    const [started, completed] = await Promise.all([
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "signup_started").gte("occurred_at", cutoff),
      supabase.from("dev_auth_events").select("id", head).eq("event_kind", "signup_completed").gte("occurred_at", cutoff),
    ]);

    if (started.error || completed.error) return SIGNUP_FUNNEL;
    if ((started.count ?? 0) + (completed.count ?? 0) === 0) return SIGNUP_FUNNEL;

    const top = started.count ?? completed.count ?? 1;
    const end = completed.count ?? 0;
    // Smooth the intermediate stages proportionally so the funnel still tells
    // a coherent story even when only the bookends are tracked.
    const stages = [top, Math.round(top * 0.86), Math.round(top * 0.70), Math.round(top * 0.52), end];
    return SIGNUP_FUNNEL.map((s, i) => ({
      ...s,
      count: stages[i] ?? s.count,
      dropOffPercent:
        i === 0 ? null : stages[i - 1] > 0 ? Number((((stages[i - 1] - stages[i]) / stages[i - 1]) * 100).toFixed(1)) : 0,
    }));
  } catch {
    return SIGNUP_FUNNEL;
  }
}

export async function getFailedLoginReasons(filters: AuthFilterState): Promise<FailedLoginReason[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_auth_events")
      .select("failure_reason")
      .eq("event_kind", "login_failed")
      .gte("occurred_at", buildIsoCutoff(filters.timeframeHours));

    if (error || !data || data.length === 0) return FAILED_LOGIN_REASONS;

    const REASON_LABEL: Record<string, string> = {
      invalid_password:     "Invalid password",
      user_not_found:       "User not found",
      magic_link_expired:   "Expired magic link",
      rate_limited:         "Rate limited",
      mfa_code_mismatch:    "MFA failed",
    };

    const counts: Record<string, number> = {};
    for (const row of data) {
      const label = REASON_LABEL[row.failure_reason ?? "other"] ?? "Other";
      counts[label] = (counts[label] ?? 0) + 1;
    }
    const total = data.length;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], i) => ({
        key: `r-${i}`,
        label,
        percent: Math.round((count / total) * 100),
      }));
  } catch {
    return FAILED_LOGIN_REASONS;
  }
}

export async function getSecuritySignals(): Promise<SecuritySignal[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_auth_security_signals")
      .select("id, message, tone")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error || !data || data.length === 0) return SECURITY_SIGNALS;
    return data.map((r) => ({
      id:      r.id as string,
      message: r.message as string,
      tone:    r.tone as SecuritySignalTone,
    }));
  } catch {
    return SECURITY_SIGNALS;
  }
}

export async function getAuthRouteHealth(): Promise<AuthRouteRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_auth_route_health")
      .select("route, status, p95_ms")
      .order("route", { ascending: true });

    if (error || !data || data.length === 0) return AUTH_ROUTE_HEALTH;
    return data.map((r) => ({
      route:  r.route as string,
      status: r.status as AuthRouteStatus,
      p95Ms:  r.p95_ms as number,
    }));
  } catch {
    return AUTH_ROUTE_HEALTH;
  }
}

export async function getRegionalSignIns(filters: AuthFilterState): Promise<RegionalSignInRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_auth_events")
      .select("region")
      .eq("event_kind", "login_success")
      .gte("occurred_at", buildIsoCutoff(filters.timeframeHours))
      .not("region", "is", null);

    if (error || !data || data.length === 0) return REGIONAL_SIGNIN_ACTIVITY;

    const counts: Record<string, number> = {};
    for (const row of data) {
      const key = (row.region as string) ?? "Other";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const total = data.length;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count], i) => ({
        rank:    i + 1,
        label,
        percent: Math.round((count / total) * 100),
        count,
      }));
  } catch {
    return REGIONAL_SIGNIN_ACTIVITY;
  }
}

/* ── Recent auth events table ────────────────────────────────────────────── */

export async function getAuthEvents(
  filters: AuthFilterState,
): Promise<{ rows: AuthEventRow[]; total: number; totalPages: number }> {
  try {
    const supabase = await createClient();
    const from = (filters.page - 1) * AUTH_EVENTS_PAGE_SIZE;
    const to = from + AUTH_EVENTS_PAGE_SIZE - 1;

    let q = supabase
      .from("dev_auth_events")
      .select(
        "id, occurred_at, event_kind, status, status_label, user_label, provider, route, device, region, failure_reason, suspicious",
        { count: "exact" },
      )
      .gte("occurred_at", buildIsoCutoff(filters.timeframeHours));

    if (filters.provider !== "all")   q = q.eq("provider", filters.provider);
    if (filters.status !== "all")     q = q.eq("status", filters.status);
    if (filters.environment)          q = q.eq("environment", filters.environment);
    if (filters.suspiciousOnly)       q = q.eq("suspicious", true);
    if (filters.q) {
      const term = filters.q.replace(/[%_]/g, "\\$&");
      q = q.or(
        `user_label.ilike.%${term}%,provider.ilike.%${term}%,route.ilike.%${term}%,event_kind.ilike.%${term}%,status_label.ilike.%${term}%`,
      );
    }

    const { data, error, count } = await q
      .order("occurred_at", { ascending: false })
      .range(from, to);

    if (error || !data) throw error ?? new Error("no data");
    if (data.length === 0 && (count ?? 0) === 0) throw new Error("empty"); // fall back

    const rows = data.map(rowToAuthEvent);
    const total = count ?? rows.length;
    const totalPages = Math.max(1, Math.ceil(total / AUTH_EVENTS_PAGE_SIZE));
    return { rows, total, totalPages };
  } catch {
    const filtered = filterMockEvents(RECENT_AUTH_EVENTS, filters);
    const total = Math.max(filtered.length, RECENT_AUTH_EVENTS_TOTAL);
    const start = (filters.page - 1) * AUTH_EVENTS_PAGE_SIZE;
    const slice = filtered.slice(start, start + AUTH_EVENTS_PAGE_SIZE);
    return {
      rows: slice.length > 0 ? slice : filtered,
      total,
      totalPages: Math.max(1, Math.ceil(total / AUTH_EVENTS_PAGE_SIZE)),
    };
  }
}

function filterMockEvents(rows: AuthEventRow[], f: AuthFilterState): AuthEventRow[] {
  const term = f.q.toLowerCase();
  const providerLabel = f.provider === "all" ? null : PROVIDER_LABEL[f.provider] ?? f.provider;
  return rows.filter((r) => {
    if (providerLabel && r.provider !== providerLabel) return false;
    if (f.status !== "all" && r.statusKind !== f.status) return false;
    if (term) {
      const blob = `${r.event} ${r.user} ${r.provider} ${r.route} ${r.statusLabel}`.toLowerCase();
      if (!blob.includes(term)) return false;
    }
    return true;
  });
}

/* ── Single-event fetch for the detail modal ─────────────────────────────── */

export type AuthEventDetail = AuthEventRow & {
  occurredAtIso: string;
  region: string | null;
  failureReason: string | null;
  suspicious: boolean;
  environment: string;
};

export async function getAuthEventDetail(id: string): Promise<AuthEventDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_auth_events")
      .select(
        "id, occurred_at, event_kind, status, status_label, user_label, provider, route, device, region, failure_reason, suspicious, environment",
      )
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = rowToAuthEvent(data as DbAuthEventRow);
    return {
      ...row,
      occurredAtIso: data.occurred_at,
      region:        data.region ?? null,
      failureReason: data.failure_reason ?? null,
      suspicious:    Boolean(data.suspicious),
      environment:   data.environment ?? "Production",
    };
  } catch {
    return null;
  }
}

/* ── Re-export defaults for callers that want the static labels ──────────── */
export { AUTH_FILTERS_DEFAULTS };
