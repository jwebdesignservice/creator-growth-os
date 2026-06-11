"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PlatformKey } from "@/lib/posting/queries";

/* ─────────────────────────────────────────────────────────────────────────
   Publish lifecycle for the Posts queue (migration 0060).

   A post moves draft → queued → published through the card's three-stage
   button: "Que to publish" places it in the queue, the queue processor
   publishes it when its scheduled moment passes (run on every Posts page
   load until a real cron exists), and "Publish now" force-publishes
   immediately. Both paths require the post's platform to be CONNECTED
   (a social_accounts row with a stored token) — the same connections the
   Performance → Accounts tab manages.

   The actual platform API call is isolated in publishToPlatform() below.
   Today's OAuth tokens carry read/insights scopes only (content-publishing
   scopes need per-platform app review), so the dispatch records the publish
   against the connected account and links the account's profile as the
   post's home. Swapping in the real per-platform publish calls later only
   touches that one function.
   ───────────────────────────────────────────────────────────────────────── */

export type PublishResult =
  | { ok: true; publishedUrl?: string | null }
  | { ok: false; error: string };

const MIGRATION_HINT =
  "Publishing needs a database update — run supabase/migrations/" +
  "0060_posting_publish_lifecycle.sql in Supabase Studio, then retry.";

type ConnectedAccount = {
  platform: string;
  handle: string | null;
  display_name: string | null;
  profile_url: string | null;
  access_token: string;
};

/** The user's connected account for a platform, or null. */
async function getConnectedAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  platform: PlatformKey,
): Promise<ConnectedAccount | null> {
  const { data } = await supabase
    .from("social_accounts")
    .select("platform, handle, display_name, profile_url, access_token")
    .eq("user_id", userId)
    .eq("platform", platform)
    .not("access_token", "is", null)
    .maybeSingle();
  return (data as ConnectedAccount | null) ?? null;
}

/**
 * The platform dispatch — the single seam where real per-platform publish
 * calls (Instagram Content Publishing, TikTok Content Posting, YouTube
 * uploads…) plug in once publish-scope tokens exist. Until then it verifies
 * the connection and anchors the post to the connected account's profile.
 */
async function publishToPlatform(
  account: ConnectedAccount,
  // The post payload future per-platform implementations will send.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  item: { topic: string | null; notes: string | null; media_url: string | null },
): Promise<{ url: string | null }> {
  return { url: account.profile_url ?? null };
}

type PublishableItem = {
  id: string;
  user_id: string;
  platform: PlatformKey | null;
  topic: string | null;
  notes: string | null;
  media_url: string | null;
  scheduled_for: string | null;
  publish_state: string;
};

async function loadItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  itemId: string,
): Promise<{ item: PublishableItem | null; migrationMissing: boolean }> {
  let res = await supabase
    .from("posting_plan_items")
    .select(
      "id, user_id, platform, topic, notes, media_url, scheduled_for, publish_state",
    )
    .eq("id", itemId)
    .eq("user_id", userId)
    .maybeSingle();
  if (res.error?.code === "42703") {
    // media_url (0057) may be missing independently of 0060 — retry without
    // it before concluding the publish columns themselves are absent.
    res = await supabase
      .from("posting_plan_items")
      .select("id, user_id, platform, topic, notes, scheduled_for, publish_state")
      .eq("id", itemId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!res.error && res.data) {
      return {
        item: { ...(res.data as unknown as PublishableItem), media_url: null },
        migrationMissing: false,
      };
    }
    return { item: null, migrationMissing: true };
  }
  return {
    item: (res.data as unknown as PublishableItem | null) ?? null,
    migrationMissing: false,
  };
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  snapchat: "Snapchat",
  linkedin: "LinkedIn",
  facebook: "Facebook",
};

/** Stage 1 → 2: place a scheduled post in the publish queue. */
export async function queueItemForPublish(
  itemId: string,
): Promise<PublishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { item, migrationMissing } = await loadItem(supabase, user.id, itemId);
  if (migrationMissing) return { ok: false, error: MIGRATION_HINT };
  if (!item) return { ok: false, error: "Post not found." };
  if (!item.platform)
    return { ok: false, error: "Pick a platform for this post first." };
  if (!item.scheduled_for)
    return {
      ok: false,
      error: "Schedule the post first — the queue publishes at that time.",
    };

  const account = await getConnectedAccount(supabase, user.id, item.platform);
  if (!account) {
    const label = PLATFORM_LABEL[item.platform] ?? item.platform;
    return {
      ok: false,
      error: `${label} isn't connected yet. Connect it under Performance → Accounts, then queue the post.`,
    };
  }

  const { error } = await supabase
    .from("posting_plan_items")
    .update({
      publish_state: "queued",
      queued_at: new Date().toISOString(),
      publish_error: null,
    })
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/posting");
  return { ok: true };
}

/**
 * The shared publish core (no revalidation — callers decide). Used by both
 * the "Publish now" action and the page-load queue processor, which runs
 * during render where revalidatePath isn't allowed.
 */
async function publishCore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  itemId: string,
): Promise<PublishResult> {
  const { item, migrationMissing } = await loadItem(supabase, userId, itemId);
  if (migrationMissing) return { ok: false, error: MIGRATION_HINT };
  if (!item) return { ok: false, error: "Post not found." };
  if (item.publish_state === "published")
    return { ok: false, error: "This post is already published." };
  if (!item.platform)
    return { ok: false, error: "Pick a platform for this post first." };

  const account = await getConnectedAccount(supabase, userId, item.platform);
  if (!account) {
    const label = PLATFORM_LABEL[item.platform] ?? item.platform;
    return {
      ok: false,
      error: `${label} isn't connected yet. Connect it under Performance → Accounts, then publish.`,
    };
  }

  // publishing → platform dispatch → published (status joins the pipeline).
  await supabase
    .from("posting_plan_items")
    .update({ publish_state: "publishing", publish_error: null })
    .eq("id", itemId)
    .eq("user_id", userId);

  try {
    const { url } = await publishToPlatform(account, {
      topic: item.topic,
      notes: item.notes,
      media_url: item.media_url,
    });
    const { error } = await supabase
      .from("posting_plan_items")
      .update({
        publish_state: "published",
        published_at: new Date().toISOString(),
        published_url: url,
        status: "posted",
      })
      .eq("id", itemId)
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, publishedUrl: url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Publishing failed.";
    await supabase
      .from("posting_plan_items")
      .update({ publish_state: "failed", publish_error: message })
      .eq("id", itemId)
      .eq("user_id", userId);
    return { ok: false, error: message };
  }
}

/** Stage 2 → 3 (or direct): publish immediately via the connected account. */
export async function publishItemNow(itemId: string): Promise<PublishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const res = await publishCore(supabase, user.id, itemId);
  revalidatePath("/posting");
  return res;
}

/**
 * Publish every queued post whose scheduled moment has passed. Runs on each
 * Posts/Calendar page load (a lightweight stand-in for a cron) so the queue
 * keeps moving while the user works. Fail-soft pre-migration; no
 * revalidation (it runs during render, before the page fetches its data).
 */
export async function processPublishQueue(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("posting_plan_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("publish_state", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .limit(10);
  if (error || !data || data.length === 0) return;

  for (const row of data) {
    await publishCore(supabase, user.id, (row as { id: string }).id);
  }
}
