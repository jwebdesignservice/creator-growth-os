// ─────────────────────────────────────────────────────────────────────────────
// Notification system — write / creation service
//
// ALWAYS uses the service-role Supabase client so that notifications can be
// written for ANY user, bypassing RLS.  Never import this file into client
// bundles — it must remain server-only.
//
// Usage examples
//   import { notifyTaskAssigned } from "@/lib/notifications/service";
//   await notifyTaskAssigned(userId, mission.id, mission.title);
//
// For admin broadcasts:
//   import { createForAllUsers } from "@/lib/notifications/service";
//   await createForAllUsers({ title: "🎉 New feature!", ... });
// ─────────────────────────────────────────────────────────────────────────────

import { createServiceClient } from "@/lib/supabase/server";
import type { CreateNotificationPayload } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Core primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Create a single notification for one user. */
export async function createNotification(
  userId: string,
  payload: CreateNotificationPayload,
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("notifications").insert({
    user_id:      userId,
    title:        payload.title,
    body:         payload.body         ?? null,
    type:         payload.type,
    category:     payload.category,
    priority:     payload.priority     ?? 3,
    action_label: payload.action_label ?? null,
    action_url:   payload.action_url   ?? null,
    metadata:     payload.metadata     ?? {},
    expires_at:   payload.expires_at   ?? null,
  });
  if (error) console.error("[notifications] createNotification:", error.message);
}

/** Broadcast to all users (no plan or category filter). */
export async function createForAllUsers(
  payload: CreateNotificationPayload,
): Promise<void> {
  await _broadcast(payload, null, null);
}

/** Broadcast to all users on a specific plan tier. */
export async function createForPlan(
  plan: "free" | "basic" | "pro",
  payload: CreateNotificationPayload,
): Promise<void> {
  await _broadcast(payload, plan, null);
}

/** Broadcast to all users in a specific creator category. */
export async function createForCategory(
  category: "starter" | "growth" | "monetization" | "scale",
  payload: CreateNotificationPayload,
): Promise<void> {
  await _broadcast(payload, null, category);
}

/** Broadcast with both plan and creator-category filters applied. */
export async function createForPlanAndCategory(
  plan: "free" | "basic" | "pro",
  category: "starter" | "growth" | "monetization" | "scale",
  payload: CreateNotificationPayload,
): Promise<void> {
  await _broadcast(payload, plan, category);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal broadcast helper (calls the SQL function notify_broadcast)
// ─────────────────────────────────────────────────────────────────────────────

async function _broadcast(
  payload:         CreateNotificationPayload,
  plan:            string | null,
  categoryFilter:  string | null,
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.rpc("notify_broadcast", {
    p_title:           payload.title,
    p_body:            payload.body         ?? null,
    p_type:            payload.type,
    p_category:        payload.category,
    p_priority:        payload.priority     ?? 3,
    p_action_label:    payload.action_label ?? null,
    p_action_url:      payload.action_url   ?? null,
    p_metadata:        payload.metadata     ?? {},
    p_plan:            plan,
    p_category_filter: categoryFilter,
  });
  if (error) console.error("[notifications] _broadcast:", error.message);
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain-specific event helpers
// Call these from server actions or API routes when relevant events occur.
// ─────────────────────────────────────────────────────────────────────────────

export async function notifyTaskAssigned(
  userId:     string,
  missionId:  string,
  taskTitle:  string,
): Promise<void> {
  await createNotification(userId, {
    title:        "New task assigned",
    body:         taskTitle,
    type:         "task_assigned",
    category:     "task",
    priority:     2,
    action_label: "View Task",
    action_url:   "/missions",
    metadata:     { mission_id: missionId },
  });
}

export async function notifyTaskDue(
  userId:    string,
  missionId: string,
  taskTitle: string,
): Promise<void> {
  await createNotification(userId, {
    title:        "Task due soon",
    body:         `"${taskTitle}" is due today. Complete it before your streak breaks.`,
    type:         "task_due",
    category:     "task",
    priority:     2,
    action_label: "See Task",
    action_url:   "/missions",
    metadata:     { mission_id: missionId },
  });
}

export async function notifyTaskCompleted(
  userId:    string,
  taskTitle: string,
): Promise<void> {
  await createNotification(userId, {
    title:        "Task completed ✓",
    body:         `You completed "${taskTitle}". Great work!`,
    type:         "task_completed",
    category:     "task",
    priority:     4,
    action_label: "View Tasks",
    action_url:   "/missions",
  });
}

export async function notifyMilestoneReached(
  userId:      string,
  programSlug: string,
  percent:     number,
): Promise<void> {
  await createNotification(userId, {
    title:        "Milestone reached! 🎉",
    body:         `You've completed ${percent}% of the program. Keep it up!`,
    type:         "milestone_reached",
    category:     "program",
    priority:     3,
    action_label: "View Progress",
    action_url:   `/programs/${programSlug}`,
    metadata:     { program_slug: programSlug, percent },
  });
}

export async function notifyPostingPlanUpdated(userId: string): Promise<void> {
  await createNotification(userId, {
    title:        "Your posting plan was updated",
    body:         "A new content schedule is ready for you.",
    type:         "posting_plan_updated",
    category:     "task",
    priority:     3,
    action_label: "See Plan",
    action_url:   "/posting",
  });
}

export async function notifyPostReminder(
  userId:       string,
  scheduledFor: string,
): Promise<void> {
  await createNotification(userId, {
    title:        "Scheduled post due soon",
    body:         `You have a post scheduled for ${new Date(scheduledFor).toLocaleDateString()}.`,
    type:         "post_reminder",
    category:     "task",
    priority:     2,
    action_label: "See Plan",
    action_url:   "/posting",
    metadata:     { scheduled_for: scheduledFor },
  });
}

export async function notifyTutorialUnlocked(
  userId:      string,
  lessonSlug:  string,
  lessonTitle: string,
): Promise<void> {
  await createNotification(userId, {
    title:        "New tutorial unlocked for you",
    body:         `"${lessonTitle}" is now available in your program.`,
    type:         "tutorial_unlocked",
    category:     "program",
    priority:     3,
    action_label: "Open Tutorial",
    action_url:   `/tutorials/${lessonSlug}`,
    metadata:     { lesson_slug: lessonSlug },
  });
}

export async function notifyProgramAvailable(
  userId:       string,
  programSlug:  string,
  programTitle: string,
): Promise<void> {
  await createNotification(userId, {
    title:        "New program available",
    body:         `"${programTitle}" is now available for your plan.`,
    type:         "program_available",
    category:     "program",
    priority:     3,
    action_label: "Start Program",
    action_url:   `/programs/${programSlug}`,
    metadata:     { program_slug: programSlug },
  });
}

export async function notifyCommunityReply(
  userId:     string,
  authorName: string,
  postId:     string,
): Promise<void> {
  await createNotification(userId, {
    title:        `${authorName} replied to your post`,
    body:         "You have a new reply in the community.",
    type:         "community_reply",
    category:     "community",
    priority:     4,
    action_label: "Reply",
    action_url:   "/community",
    metadata:     { author_name: authorName, post_id: postId },
  });
}

export async function notifyCoachMessage(
  userId:     string,
  fromName:   string,
  messageId:  string,
): Promise<void> {
  await createNotification(userId, {
    title:        `${fromName} sent you a message`,
    body:         "Check out your latest feedback and coaching notes.",
    type:         "coach_message",
    category:     "community",
    priority:     2,
    action_label: "View Message",
    action_url:   "/community",
    metadata:     { from_name: fromName, message_id: messageId },
  });
}

/**
 * Notify multiple users about a live event simultaneously.
 * Uses a single bulk insert instead of N individual inserts.
 */
export async function notifyLiveEvent(
  userIds:    string[],
  eventTitle: string,
  startAt:    string,
): Promise<void> {
  if (userIds.length === 0) return;
  const supabase = createServiceClient();

  const time = new Date(startAt).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
  });

  const rows = userIds.map((userId) => ({
    user_id:      userId,
    title:        `Live: ${eventTitle} starts in 1 hour`,
    body:         `Join the live session starting at ${time}.`,
    type:         "live_event"  as const,
    category:     "event"       as const,
    priority:     1,
    action_label: "Join Live",
    action_url:   "/community",
    metadata:     { event_title: eventTitle, start_at: startAt, live: true },
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) console.error("[notifications] notifyLiveEvent:", error.message);
}

export async function notifyUpgradeRecommendation(userId: string): Promise<void> {
  await createNotification(userId, {
    title:        "Pro content recommended for you",
    body:         "Unlock advanced lessons and exclusive coaching by upgrading your plan.",
    type:         "upgrade_recommendation",
    category:     "program",
    priority:     4,
    action_label: "Upgrade to Pro",
    action_url:   "/billing?upgrade=pro",
  });
}

export async function notifyBillingUpdate(
  userId:  string,
  message: string,
): Promise<void> {
  await createNotification(userId, {
    title:        "Billing update",
    body:         message,
    type:         "billing_update",
    category:     "system",
    priority:     3,
    action_label: "View Billing",
    action_url:   "/billing",
  });
}

/**
 * Send a platform-wide announcement.
 * Pass audience to limit to a plan or creator category; omit for all users.
 */
export async function notifyAnnouncement(
  content: {
    title:         string;
    body:          string;
    action_label?: string;
    action_url?:   string;
  },
  audience?: {
    plan?:     "free" | "basic" | "pro";
    category?: "starter" | "growth" | "monetization" | "scale";
  },
): Promise<void> {
  await _broadcast(
    {
      title:        content.title,
      body:         content.body,
      type:         "announcement",
      category:     "system",
      priority:     3,
      action_label: content.action_label,
      action_url:   content.action_url,
    },
    audience?.plan     ?? null,
    audience?.category ?? null,
  );
}

export async function notifyChatMention(
  userId: string,
  authorName: string,
  messageId: string,
  bodyPreview: string,
): Promise<void> {
  await createNotification(userId, {
    title: `${authorName} mentioned you in Community Chat`,
    body: bodyPreview,
    type: "chat_mention",
    category: "community",
    priority: 3,
    action_label: "View Chat",
    action_url: "/community/chat",
    metadata: { message_id: messageId, author_name: authorName },
  });
}

export async function notifyChatReply(
  userId: string,
  authorName: string,
  messageId: string,
  parentMessageId: string,
  bodyPreview: string,
): Promise<void> {
  await createNotification(userId, {
    title: `${authorName} replied to your message`,
    body: bodyPreview,
    type: "chat_reply",
    category: "community",
    priority: 3,
    action_label: "View Reply",
    action_url: "/community/chat",
    metadata: {
      message_id: messageId,
      reply_to_id: parentMessageId,
      author_name: authorName,
    },
  });
}
