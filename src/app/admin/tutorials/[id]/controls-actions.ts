"use server";

import "server-only";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import {
  DEFAULT_CONTROLS,
  type CompletionThreshold,
  type ReminderTiming,
  type FollowUpTask,
  type AccessMode,
  type CtaTrigger,
  type LessonControls,
  type ControlsLoadResult,
  type ActionResult,
} from "./controls-types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions backing the Controls tab on /admin/tutorials/[id].

   • `getLessonControls`  — service-role read (called from the server
     page). Returns DEFAULT_CONTROLS when no row exists or the table is
     missing entirely (graceful fallback so the editor still loads in
     environments where migration 0033 hasn't been applied yet).
   • `saveLessonControls` — admin-gated upsert. Inserts on first save,
     updates thereafter (1:1 with lessons via UNIQUE constraint).
   • `resetLessonControls` — admin-gated delete (row goes away → next
     read falls back to defaults).

   Types + DEFAULT_CONTROLS live in `controls-types.ts` so this file can
   keep its `"use server"` directive (which forbids non-async exports).
   ───────────────────────────────────────────────────────────────────────── */

const VALID_THRESHOLDS = new Set<CompletionThreshold>([50, 60, 70, 80, 90, 100]);
const VALID_TIMINGS    = new Set<ReminderTiming>(["never", "1d", "3d", "7d", "14d"]);
const VALID_TASKS      = new Set<FollowUpTask>(["", "feedback", "next", "checkin", "review"]);
const VALID_ACCESS     = new Set<AccessMode>(["open", "private", "scheduled"]);
const VALID_CTA        = new Set<CtaTrigger>(["immediate", "final-chapter", "after-completion"]);

/** Whether a Supabase error means the lesson_controls table doesn't
 *  exist yet. Codes vary across PostgREST versions, so we match on
 *  message text as well as the canonical PG / PostgREST codes. */
function isTableMissing(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  if (code === "42P01" || code === "PGRST205" || code === "PGRST204") return true;
  const msg = (err.message ?? "").toLowerCase();
  return msg.includes("relation") && msg.includes("does not exist")
      || msg.includes("could not find the table");
}

/* ─────────────────────────────────────────────────────────────────────── */

export async function getLessonControls(
  lessonId: string,
): Promise<ControlsLoadResult> {
  if (!lessonId) return { controls: DEFAULT_CONTROLS, tableMissing: false };

  const service = createServiceClient();
  const { data, error } = await service
    .from("lesson_controls")
    .select(
      [
        "autoplay_next_chapter",
        "allow_playback_speed",
        "loop_preview",
        "show_captions_default",
        "completion_threshold",
        "require_chapters_in_order",
        "resume_from_last_position",
        "allow_skipping_ahead",
        "show_chapter_list",
        "enable_notes",
        "enable_downloads",
        "show_cta_at_end",
        "reminder_timing",
        "notify_on_completion",
        "follow_up_task",
        "access_mode",
        "cta_trigger",
      ].join(","),
    )
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error && isTableMissing(error)) {
    return { controls: DEFAULT_CONTROLS, tableMissing: true };
  }
  if (error || !data) {
    return { controls: DEFAULT_CONTROLS, tableMissing: false };
  }

  return {
    controls: rowToControls(data as unknown as Record<string, unknown>),
    tableMissing: false,
  };
}

export async function saveLessonControls(
  lessonId: string,
  patch: LessonControls,
): Promise<ActionResult<LessonControls>> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!lessonId) return { ok: false, error: "Missing lesson id." };

  // Validate up-front so a single bad value rejects the whole save.
  if (!VALID_THRESHOLDS.has(patch.completionThreshold)) {
    return { ok: false, error: "Invalid completion threshold." };
  }
  if (!VALID_TIMINGS.has(patch.reminderTiming)) {
    return { ok: false, error: "Invalid reminder timing." };
  }
  if (!VALID_TASKS.has(patch.followUpTask)) {
    return { ok: false, error: "Invalid follow-up task." };
  }
  if (!VALID_ACCESS.has(patch.accessMode)) {
    return { ok: false, error: "Invalid access mode." };
  }
  if (!VALID_CTA.has(patch.ctaTrigger)) {
    return { ok: false, error: "Invalid CTA trigger." };
  }

  const service = createServiceClient();
  const row = controlsToRow(lessonId, patch);

  const { data, error } = await service
    .from("lesson_controls")
    .upsert(row, { onConflict: "lesson_id" })
    .select()
    .single();

  if (error) {
    if (isTableMissing(error)) {
      return { ok: false, error: "Lesson controls table missing — apply migration 0033_lesson_controls.sql." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, data: rowToControls(data as unknown as Record<string, unknown>) };
}

export async function resetLessonControls(
  lessonId: string,
): Promise<ActionResult<LessonControls>> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!lessonId) return { ok: false, error: "Missing lesson id." };

  const service = createServiceClient();
  const { error } = await service
    .from("lesson_controls")
    .delete()
    .eq("lesson_id", lessonId);

  if (error && !isTableMissing(error)) {
    return { ok: false, error: error.message };
  }
  return { ok: true, data: DEFAULT_CONTROLS };
}

/* ── Mappers ──────────────────────────────────────────────────────────── */

function rowToControls(row: Record<string, unknown>): LessonControls {
  return {
    autoplayNextChapter:    Boolean(row.autoplay_next_chapter),
    allowPlaybackSpeed:     Boolean(row.allow_playback_speed),
    loopPreview:            Boolean(row.loop_preview),
    showCaptionsDefault:    Boolean(row.show_captions_default),
    completionThreshold:    Number(row.completion_threshold) as CompletionThreshold,
    requireChaptersInOrder: Boolean(row.require_chapters_in_order),
    resumeFromLastPosition: Boolean(row.resume_from_last_position),
    allowSkippingAhead:     Boolean(row.allow_skipping_ahead),
    showChapterList:        Boolean(row.show_chapter_list),
    enableNotes:            Boolean(row.enable_notes),
    enableDownloads:        Boolean(row.enable_downloads),
    showCtaAtEnd:           Boolean(row.show_cta_at_end),
    reminderTiming:         (row.reminder_timing as ReminderTiming) ?? "3d",
    notifyOnCompletion:     Boolean(row.notify_on_completion),
    followUpTask:           (row.follow_up_task as FollowUpTask) ?? "",
    accessMode:             (row.access_mode as AccessMode) ?? "open",
    ctaTrigger:             (row.cta_trigger as CtaTrigger) ?? "final-chapter",
  };
}

function controlsToRow(lessonId: string, c: LessonControls) {
  return {
    lesson_id:                  lessonId,
    autoplay_next_chapter:      c.autoplayNextChapter,
    allow_playback_speed:       c.allowPlaybackSpeed,
    loop_preview:               c.loopPreview,
    show_captions_default:      c.showCaptionsDefault,
    completion_threshold:       c.completionThreshold,
    require_chapters_in_order:  c.requireChaptersInOrder,
    resume_from_last_position:  c.resumeFromLastPosition,
    allow_skipping_ahead:       c.allowSkippingAhead,
    show_chapter_list:          c.showChapterList,
    enable_notes:               c.enableNotes,
    enable_downloads:           c.enableDownloads,
    show_cta_at_end:            c.showCtaAtEnd,
    reminder_timing:            c.reminderTiming,
    notify_on_completion:       c.notifyOnCompletion,
    follow_up_task:             c.followUpTask,
    access_mode:                c.accessMode,
    cta_trigger:                c.ctaTrigger,
  };
}
