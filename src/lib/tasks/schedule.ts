import "server-only";

import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Time-based auto-assignment engine for admin missions (migration 0041).

   Complements `assign.ts` (event-triggered, per-user-from-a-source). This
   module is the SCHEDULED path: for each due `admin_mission` task_template
   with auto_assign=true, resolve the eligible users from
   `task_assignment_rules` and create a `missions` row per user — once per
   period.

   Duplicate safety (three layers, matching assign.ts):
     1. app-layer pre-filter on existing (template, period_key, user)
     2. the partial unique index (user_id, task_template_id, period_key)
     3. a per-row insert fallback that swallows unique-violation races
   The `period_key` is what makes a *daily* task assign once per DAY rather
   than once forever, so the trigger endpoint is safe to run every 15 min.
   ───────────────────────────────────────────────────────────────────────── */

const MISSING_TABLE = new Set(["42P01", "PGRST205", "PGRST204", "PGRST200"]);
function isMissingTable(err: { code?: string } | null | undefined): boolean {
  return !!err?.code && MISSING_TABLE.has(err.code);
}

type ScheduledTemplate = {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  frequency: string;
  schedule_time: string | null;
  timezone: string | null;
  recurrence: string | null;
  auto_assign: boolean;
  estimated_minutes: number | null;
  points: number | null;
  due_after_days: number | null;
  program_id: string | null;
  lesson_id: string | null;
};

const TEMPLATE_COLS =
  "id, title, description, status, frequency, schedule_time, timezone, recurrence, auto_assign, estimated_minutes, points, due_after_days, program_id, lesson_id";

export type ScheduleRunResult = {
  ok: boolean;
  error?: string;
  ranAt: string;
  templatesConsidered: number;
  templatesDue: number;
  totalAssigned: number;
  totalSkipped: number;
  perTemplate: { id: string; title: string; assigned: number; skipped: number }[];
};

/* ── Time helpers (timezone-aware via Intl, no extra deps) ───────────────── */

type TzParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string; // lowercase, e.g. "monday"
};

function tzParts(now: Date, tz: string | null): TzParts {
  const timeZone = tz || "UTC";
  const build = (zone: string) =>
    Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        weekday: "long",
      })
        .formatToParts(now)
        .map((p) => [p.type, p.value]),
    ) as Record<string, string>;

  let parts: Record<string, string>;
  try {
    parts = build(timeZone);
  } catch {
    parts = build("UTC"); // invalid tz string → UTC
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === "24" ? "0" : parts.hour),
    minute: Number(parts.minute),
    weekday: (parts.weekday || "").toLowerCase(),
  };
}

function isoWeekKey(y: number, m: number, d: number): string {
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** The dedup bucket for this template's cadence at `now`. */
export function computePeriodKey(
  frequency: string,
  now: Date,
  tz: string | null,
): string {
  const p = tzParts(now, tz);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  switch (frequency) {
    case "daily":
      return `${p.year}-${mm}-${dd}`;
    case "weekly":
      return isoWeekKey(p.year, p.month, p.day);
    case "monthly":
      return `${p.year}-${mm}`;
    default:
      return "once"; // once | scheduled → assign a single time
  }
}

function scheduleMinutes(scheduleTime: string | null): number | null {
  if (!scheduleTime) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(scheduleTime.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseWeekday(recurrence: string | null): string | null {
  if (!recurrence) return null;
  const r = recurrence.toLowerCase();
  return WEEKDAYS.find((w) => r.includes(w)) ?? null;
}

function parseDayOfMonth(recurrence: string | null): number | null {
  if (!recurrence) return null;
  const m = /(\d{1,2})/.exec(recurrence);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 31 ? n : null;
}

/** Is this template due to assign right now (cadence + schedule_time gate)? */
export function isDueNow(t: ScheduledTemplate, now: Date): boolean {
  const p = tzParts(now, t.timezone);
  const nowMin = p.hour * 60 + p.minute;
  const schedMin = scheduleMinutes(t.schedule_time);
  const timeOk = schedMin == null ? true : nowMin >= schedMin;

  switch (t.frequency) {
    case "daily":
      return timeOk;
    case "weekly": {
      const wd = parseWeekday(t.recurrence);
      if (wd && p.weekday !== wd) return false;
      return timeOk;
    }
    case "monthly": {
      const dom = parseDayOfMonth(t.recurrence);
      if (dom && p.day !== dom) return false;
      return timeOk;
    }
    default: // once | scheduled
      return timeOk;
  }
}

/* ── Eligible-user resolution from task_assignment_rules ─────────────────── */

type ProfileRow = { id: string; plan: string | null; category: string | null };

/**
 * Resolve the set of user ids an admin-mission template targets.
 * Supported now: all | plan | category | user (include + exclude). Other
 * target types (onboarding/progress/streak/…) are reserved and ignored
 * until their resolvers land — so they never silently mass-assign.
 * No include rules → empty set (never assign to everyone by accident).
 */
export async function resolveEligibleUserIds(
  templateId: string,
): Promise<string[]> {
  const db = createServiceClient();

  const { data: rules, error } = await db
    .from("task_assignment_rules")
    .select("rule_type, target_type, target_value, active")
    .eq("task_template_id", templateId)
    .eq("active", true);
  if (error || !rules || rules.length === 0) return [];

  type Rule = {
    rule_type: string;
    target_type: string;
    target_value: Record<string, unknown> | null;
  };
  const includes = (rules as Rule[]).filter((r) => r.rule_type === "include");
  const excludes = (rules as Rule[]).filter((r) => r.rule_type === "exclude");
  if (includes.length === 0) return [];

  const val = (r: Rule, key: string): string | null => {
    const v = r.target_value?.[key] ?? r.target_value?.value;
    return v == null ? null : String(v);
  };

  const hasAll = includes.some((r) => r.target_type === "all");
  const planInc = new Set(
    includes.filter((r) => r.target_type === "plan").map((r) => val(r, "plan")),
  );
  const catInc = new Set(
    includes
      .filter((r) => r.target_type === "category")
      .map((r) => val(r, "category")),
  );
  const userInc = new Set(
    includes.filter((r) => r.target_type === "user").map((r) => val(r, "userId")),
  );
  const hadTypeGroups = planInc.size > 0 || catInc.size > 0;

  const { data: profiles } = await db
    .from("profiles")
    .select("id, plan, category");
  const all = (profiles ?? []) as ProfileRow[];

  const matched = new Set<string>();
  for (const p of all) {
    let ok: boolean;
    if (hasAll) {
      ok = true;
    } else if (hadTypeGroups) {
      ok = true;
      if (planInc.size > 0) ok = ok && planInc.has(p.plan);
      if (catInc.size > 0) ok = ok && catInc.has(p.category);
    } else {
      ok = false; // only explicit-user includes → handled below
    }
    if (ok) matched.add(p.id);
  }
  // Explicit user includes always count.
  for (const uid of userInc) if (uid) matched.add(uid);

  // Excludes remove.
  const planExc = new Set(
    excludes.filter((r) => r.target_type === "plan").map((r) => val(r, "plan")),
  );
  const catExc = new Set(
    excludes
      .filter((r) => r.target_type === "category")
      .map((r) => val(r, "category")),
  );
  const userExc = new Set(
    excludes.filter((r) => r.target_type === "user").map((r) => val(r, "userId")),
  );
  if (planExc.size || catExc.size || userExc.size) {
    const byId = new Map(all.map((p) => [p.id, p]));
    for (const id of [...matched]) {
      if (userExc.has(id)) {
        matched.delete(id);
        continue;
      }
      const p = byId.get(id);
      if (p && planExc.has(p.plan)) matched.delete(id);
      else if (p && catExc.has(p.category)) matched.delete(id);
    }
  }

  return [...matched];
}

/* ── Assignment (per template, per period) ───────────────────────────────── */

async function assignTemplateForPeriod(
  db: ReturnType<typeof createServiceClient>,
  t: ScheduledTemplate,
  periodKey: string,
  userIds: string[],
): Promise<{ assigned: string[]; skipped: string[] }> {
  if (userIds.length === 0) return { assigned: [], skipped: [] };

  // 1. Who already has this template for this period?
  const { data: existing } = await db
    .from("missions")
    .select("user_id")
    .eq("task_template_id", t.id)
    .eq("period_key", periodKey)
    .in("user_id", userIds);
  const have = new Set((existing ?? []).map((m) => m.user_id as string));

  const skipped = userIds.filter((u) => have.has(u));
  const fresh = userIds.filter((u) => !have.has(u));
  if (fresh.length === 0) return { assigned: [], skipped };

  const title = (t.title ?? "").trim() || "Task";
  const description = t.description ?? "";
  const dueDate =
    t.due_after_days != null
      ? new Date(Date.now() + t.due_after_days * 86_400_000)
          .toISOString()
          .slice(0, 10)
      : null;

  const rows = fresh.map((u) => ({
    user_id: u,
    task_template_id: t.id,
    title,
    description,
    title_snapshot: title,
    description_snapshot: description,
    status: "pending",
    source: "admin_mission",
    source_id: null,
    program_id: t.program_id ?? null,
    lesson_id: t.lesson_id ?? null,
    estimated_minutes: t.estimated_minutes ?? 15,
    points: t.points ?? 10,
    due_date: dueDate,
    period_key: periodKey,
  }));

  const assigned: string[] = [];
  const raced: string[] = [];

  const { data: inserted, error } = await db
    .from("missions")
    .insert(rows)
    .select("user_id");
  if (!error) {
    for (const r of inserted ?? []) assigned.push(r.user_id as string);
  } else {
    // Unique-violation race (or partial failure) → retry per row.
    for (const row of rows) {
      const { data: one, error: e1 } = await db
        .from("missions")
        .insert(row)
        .select("user_id")
        .maybeSingle();
      if (!e1 && one) assigned.push(one.user_id as string);
      else raced.push(row.user_id);
    }
  }

  await logEvents(db, t.id, periodKey, assigned, [...skipped, ...raced]);
  return { assigned, skipped: [...skipped, ...raced] };
}

async function logEvents(
  db: ReturnType<typeof createServiceClient>,
  templateId: string,
  periodKey: string,
  assignedUserIds: string[],
  skippedUserIds: string[],
): Promise<void> {
  const events = [
    ...assignedUserIds.map((uid) => ({
      user_id: uid,
      task_template_id: templateId,
      event_type: "assigned",
      source_type: "admin_mission",
      metadata: { period_key: periodKey, via: "scheduler" },
    })),
    ...skippedUserIds.map((uid) => ({
      user_id: uid,
      task_template_id: templateId,
      event_type: "skipped_duplicate",
      source_type: "admin_mission",
      metadata: { period_key: periodKey, via: "scheduler" },
    })),
  ];
  if (events.length === 0) return;
  try {
    await db.from("task_event_logs").insert(events);
  } catch {
    /* best-effort */
  }
}

/* ── Public entry points ─────────────────────────────────────────────────── */

/**
 * Assign one admin-mission template for the CURRENT period.
 * @param opts.force  skip the schedule-time/cadence "is it due?" gate
 *                    (used by the admin "Assign now" button).
 */
export async function runTemplateAssignment(
  templateId: string,
  opts?: { force?: boolean },
): Promise<{ ok: boolean; error?: string; assigned: number; skipped: number }> {
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("task_templates")
      .select(TEMPLATE_COLS)
      .eq("id", templateId)
      .maybeSingle();
    if (error) {
      if (isMissingTable(error)) return { ok: true, assigned: 0, skipped: 0 };
      return { ok: false, error: error.message, assigned: 0, skipped: 0 };
    }
    const t = data as ScheduledTemplate | null;
    if (!t) return { ok: false, error: "Template not found.", assigned: 0, skipped: 0 };
    if (t.status !== "active") {
      return { ok: false, error: "Template is not active.", assigned: 0, skipped: 0 };
    }

    const now = new Date();
    if (!opts?.force && !isDueNow(t, now)) {
      return { ok: true, assigned: 0, skipped: 0 };
    }

    const periodKey = computePeriodKey(t.frequency, now, t.timezone);
    const userIds = await resolveEligibleUserIds(templateId);
    const res = await assignTemplateForPeriod(db, t, periodKey, userIds);

    await db
      .from("task_templates")
      .update({ last_run_at: now.toISOString() })
      .eq("id", templateId);

    return { ok: true, assigned: res.assigned.length, skipped: res.skipped.length };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Assignment failed.",
      assigned: 0,
      skipped: 0,
    };
  }
}

/**
 * THE cron entry point. Assign every active, auto-assign admin-mission
 * template that is due right now. Safe to call repeatedly (period_key dedup).
 */
export async function runDueScheduledAssignments(): Promise<ScheduleRunResult> {
  const ranAt = new Date().toISOString();
  const base: ScheduleRunResult = {
    ok: true,
    ranAt,
    templatesConsidered: 0,
    templatesDue: 0,
    totalAssigned: 0,
    totalSkipped: 0,
    perTemplate: [],
  };

  try {
    const db = createServiceClient();
    const now = new Date();

    const { data, error } = await db
      .from("task_templates")
      .select(TEMPLATE_COLS)
      .eq("source_type", "admin_mission")
      .eq("status", "active")
      .eq("auto_assign", true);
    if (error) {
      if (isMissingTable(error)) return base;
      return { ...base, ok: false, error: error.message };
    }

    const templates = (data ?? []) as ScheduledTemplate[];
    base.templatesConsidered = templates.length;

    for (const t of templates) {
      if (!isDueNow(t, now)) continue;
      base.templatesDue += 1;

      const periodKey = computePeriodKey(t.frequency, now, t.timezone);
      const userIds = await resolveEligibleUserIds(t.id);
      const res = await assignTemplateForPeriod(db, t, periodKey, userIds);

      base.totalAssigned += res.assigned.length;
      base.totalSkipped += res.skipped.length;
      base.perTemplate.push({
        id: t.id,
        title: (t.title ?? "").trim() || "Untitled",
        assigned: res.assigned.length,
        skipped: res.skipped.length,
      });

      await db
        .from("task_templates")
        .update({ last_run_at: now.toISOString() })
        .eq("id", t.id);
    }

    return base;
  } catch (err) {
    return {
      ...base,
      ok: false,
      error: err instanceof Error ? err.message : "Scheduler run failed.",
    };
  }
}
