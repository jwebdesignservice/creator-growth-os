"use server";

import { revalidatePath } from "next/cache";
import { requireDevClient } from "./require-dev";
import {
  DEFAULT_LOGS_FILTERS,
  timeframeToSeconds,
  type LogsFilters,
} from "./logs-filters";
import type { SavedViewTone } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for the /dev/logs page. All actions are dev-only,
   enforced by `requireDevClient()` which checks the allowlist before
   touching the database. RLS is the second layer of defense.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/* ─── Save a new view ────────────────────────────────────────────────── */

export type SaveLogViewInput = {
  name:        string;
  description?: string;
  filters:     Partial<LogsFilters>;
  tone?:       SavedViewTone;
  iconKey?:    string;
};

export async function saveLogView(input: SaveLogViewInput): Promise<ActionResult<{ id: string }>> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { supabase, user } = guard;

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (name.length > 80) return { ok: false, error: "Name must be 80 characters or fewer." };

  // Strip transient fields before persisting.
  const filtersToSave = {
    q:           input.filters.q ?? "",
    service:     input.filters.service ?? "",
    level:       input.filters.level ?? "",
    source:      input.filters.source ?? "",
    environment: input.filters.environment ?? DEFAULT_LOGS_FILTERS.environment,
    timeframe:   input.filters.timeframe   ?? DEFAULT_LOGS_FILTERS.timeframe,
  };

  // Find the next sort_order for this user so the new view appears last.
  const { data: existing } = await supabase
    .from("dev_log_saved_views")
    .select("sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("dev_log_saved_views")
    .insert({
      user_id:     user.id,
      name,
      description: input.description ?? null,
      filters:     filtersToSave,
      tone:        input.tone    ?? "neutral",
      icon_key:    input.iconKey ?? "bookmark",
      sort_order:  nextOrder,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[logs] saveLogView:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dev/logs");
  return { ok: true, data: { id: data.id as string } };
}

/* ─── Delete a saved view ────────────────────────────────────────────── */

export async function deleteLogView(id: string): Promise<ActionResult> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { supabase, user } = guard;

  if (!id) return { ok: false, error: "Missing view id." };

  const { error } = await supabase
    .from("dev_log_saved_views")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);  // belt-and-suspenders: RLS also enforces this

  if (error) {
    console.error("[logs] deleteLogView:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dev/logs");
  return { ok: true };
}

/* ─── Export current filter result as JSON ────────────────────────────
   The page's Export Logs button POSTs the active filters here. We
   re-run the live-rows query with no pagination (capped) and return
   a JSON-stringified payload the client can offer as a download.
   ───────────────────────────────────────────────────────────────────── */

const EXPORT_HARD_CAP = 5000;

export type ExportLogsInput = { filters: Partial<LogsFilters> };

export async function exportLogsJson(
  input: ExportLogsInput,
): Promise<ActionResult<{ filename: string; json: string; rowCount: number; truncated: boolean }>> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { supabase } = guard;

  const f = { ...DEFAULT_LOGS_FILTERS, ...input.filters };
  const sinceIso = new Date(Date.now() - timeframeToSeconds(f.timeframe) * 1000).toISOString();

  let query = supabase
    .from("dev_log_events")
    .select("*")
    .gte("ts", sinceIso)
    .eq("environment", f.environment)
    .order("ts", { ascending: false })
    .limit(EXPORT_HARD_CAP);

  if (f.service) query = query.eq("service", f.service);
  if (f.level)   query = query.eq("level",   f.level);
  if (f.source)  query = query.eq("source",  f.source);
  if (f.q) {
    query = query.or(
      `message.ilike.%${f.q}%,trace_id.ilike.%${f.q}%,route.ilike.%${f.q}%,user_label.ilike.%${f.q}%,service.ilike.%${f.q}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[logs] exportLogsJson:", error.message);
    return { ok: false, error: error.message };
  }

  const rows = data ?? [];
  const payload = {
    exported_at: new Date().toISOString(),
    environment: f.environment,
    timeframe:   f.timeframe,
    filters:     {
      service: f.service || null,
      level:   f.level   || null,
      source:  f.source  || null,
      search:  f.q       || null,
    },
    row_count:   rows.length,
    truncated:   rows.length >= EXPORT_HARD_CAP,
    rows,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return {
    ok: true,
    data: {
      filename:  `dev-logs-${stamp}.json`,
      json:      JSON.stringify(payload, null, 2),
      rowCount:  rows.length,
      truncated: rows.length >= EXPORT_HARD_CAP,
    },
  };
}
