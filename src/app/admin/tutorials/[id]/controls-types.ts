/* ─────────────────────────────────────────────────────────────────────────
   Shared types + canonical defaults for the Controls tab.

   This file is intentionally separate from `controls-actions.ts`. Files
   with a top-level `"use server"` directive are only allowed to export
   async functions — Next.js 16 throws "A 'use server' file can only
   export async functions" if a type alias or a plain object slips in.
   The types and the DEFAULT_CONTROLS object live here so both the server
   actions and the client `ControlsTab` can import them without that rule
   firing.
   ───────────────────────────────────────────────────────────────────────── */

export type CompletionThreshold = 50 | 60 | 70 | 80 | 90 | 100;
export type ReminderTiming     = "never" | "1d" | "3d" | "7d" | "14d";
export type FollowUpTask       = "" | "feedback" | "next" | "checkin" | "review";
export type AccessMode         = "open" | "private" | "scheduled";
export type CtaTrigger         = "immediate" | "final-chapter" | "after-completion";

export type LessonControls = {
  // 1 · Playback
  autoplayNextChapter:      boolean;
  allowPlaybackSpeed:       boolean;
  loopPreview:              boolean;
  showCaptionsDefault:      boolean;
  // 2 · Progress & completion
  completionThreshold:      CompletionThreshold;
  requireChaptersInOrder:   boolean;
  resumeFromLastPosition:   boolean;
  allowSkippingAhead:       boolean;
  // 3 · Learner experience
  showChapterList:          boolean;
  enableNotes:              boolean;
  enableDownloads:          boolean;
  showCtaAtEnd:             boolean;
  // 4 · Notifications & follow-ups
  reminderTiming:           ReminderTiming;
  notifyOnCompletion:       boolean;
  followUpTask:             FollowUpTask;
  // Quick-status display-only
  accessMode:               AccessMode;
  ctaTrigger:               CtaTrigger;
};

export type ControlsLoadResult = {
  controls:      LessonControls;
  tableMissing:  boolean; // true when migration 0033 hasn't been applied
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/** Canonical defaults — matches the table's DEFAULT clauses. */
export const DEFAULT_CONTROLS: LessonControls = {
  autoplayNextChapter:    false,
  allowPlaybackSpeed:     true,
  loopPreview:            false,
  showCaptionsDefault:    true,
  completionThreshold:    80,
  requireChaptersInOrder: true,
  resumeFromLastPosition: true,
  allowSkippingAhead:     false,
  showChapterList:        true,
  enableNotes:            true,
  enableDownloads:        true,
  showCtaAtEnd:           true,
  reminderTiming:         "3d",
  notifyOnCompletion:     true,
  followUpTask:           "",
  accessMode:             "open",
  ctaTrigger:             "final-chapter",
};
