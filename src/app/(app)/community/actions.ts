"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyCommunityReply } from "@/lib/notifications/service";

type Result = { ok: true } | { ok: false; error: string };

export async function createPost(
  spaceSlug: string,
  title: string,
  body: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  if (!title.trim()) return { ok: false, error: "Title is required." };
  if (!body.trim()) return { ok: false, error: "Body is required." };

  const { data: space } = await supabase
    .from("community_spaces")
    .select("id")
    .eq("slug", spaceSlug)
    .maybeSingle();
  if (!space) return { ok: false, error: "Space not found." };

  const { error } = await supabase.from("community_posts").insert({
    space_id: space.id,
    user_id: user.id,
    title: title.trim(),
    body: body.trim(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/community");
  return { ok: true };
}

export async function createReply(
  postId: string,
  body: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!body.trim()) return { ok: false, error: "Reply cannot be empty." };

  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id, title")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };

  const { error } = await supabase.from("community_replies").insert({
    post_id: postId,
    user_id: user.id,
    body: body.trim(),
  });
  if (error) return { ok: false, error: error.message };

  if (post.user_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", user.id)
      .maybeSingle();
    const authorName =
      profile?.display_name ?? profile?.full_name ?? "A creator";
    await notifyCommunityReply(post.user_id, authorName, postId);
  }

  revalidatePath("/community");
  return { ok: true };
}
