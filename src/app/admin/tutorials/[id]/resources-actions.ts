"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for the Resources tab. Resources live in the
   `lesson_resources` table (migration 0037). Files are uploaded to the
   lesson-media bucket via a signed URL from the client; only the
   resulting metadata (title / url / ext / size) is persisted here.
   ───────────────────────────────────────────────────────────────────────── */

export type ResourceExt = "pdf" | "docx" | "xlsx" | "png" | "jpg" | "zip" | "link" | "file";

export type LessonResource = {
  id:        string;
  kind:      "file" | "link";
  title:     string;
  url:       string;
  ext:       ResourceExt;
  sizeBytes: number | null;
  placement: string;
  sortOrder: number;
};

export type ResourcesLoad = {
  resources:    LessonResource[];
  tableMissing: boolean;
};

type Result = { ok: true; resource?: LessonResource } | { ok: false; error: string };
type SimpleResult = { ok: true } | { ok: false; error: string };

function isMissingTable(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "42P01" || err.code === "PGRST205") return true;
  const m = (err.message ?? "").toLowerCase();
  return m.includes("could not find the table") ||
    (m.includes("relation") && m.includes("does not exist"));
}

function rowToResource(r: Record<string, unknown>): LessonResource {
  return {
    id:        r.id as string,
    kind:      (r.kind as "file" | "link") ?? "file",
    title:     (r.title as string) ?? "Untitled",
    url:       (r.url as string) ?? "",
    ext:       ((r.ext as ResourceExt) ?? "file"),
    sizeBytes: (r.size_bytes as number | null) ?? null,
    placement: (r.placement as string) ?? "lesson-overview",
    sortOrder: (r.sort_order as number) ?? 0,
  };
}

/** Read all resources for a lesson. Degrades to empty + tableMissing flag. */
export async function getLessonResources(lessonId: string): Promise<ResourcesLoad> {
  if (!lessonId) return { resources: [], tableMissing: false };
  const svc = createServiceClient();
  const { data, error } = await svc
    .from("lesson_resources")
    .select("id, lesson_id, kind, title, url, ext, size_bytes, placement, sort_order")
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });
  if (error) {
    return { resources: [], tableMissing: isMissingTable(error) };
  }
  return { resources: (data ?? []).map(rowToResource), tableMissing: false };
}

export type AddResourceInput = {
  lessonId:  string;
  kind:      "file" | "link";
  title:     string;
  url:       string;
  ext:       ResourceExt;
  sizeBytes?: number | null;
  placement?: string;
};

export async function addLessonResource(input: AddResourceInput): Promise<Result> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const title = input.title.trim();
  const url = input.url.trim();
  if (!title) return { ok: false, error: "Give the resource a name." };
  if (!url) return { ok: false, error: "A file URL or link is required." };
  if (input.kind === "link" && !/^https?:\/\//i.test(url)) {
    return { ok: false, error: "Links must start with http(s)://" };
  }

  const { data: { user } } = await guard.supabase.auth.getUser();
  const svc = createServiceClient();

  // Next sort order = end of the list.
  const { data: last } = await svc
    .from("lesson_resources")
    .select("sort_order")
    .eq("lesson_id", input.lessonId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = ((last?.sort_order as number | null) ?? -1) + 1;

  const { data, error } = await svc
    .from("lesson_resources")
    .insert({
      lesson_id:  input.lessonId,
      kind:       input.kind,
      title:      title.slice(0, 200),
      url:        url.slice(0, 2000),
      ext:        input.ext,
      size_bytes: input.sizeBytes ?? null,
      placement:  input.placement ?? "lesson-overview",
      sort_order: sortOrder,
      created_by: user?.id ?? null,
    })
    .select("id, lesson_id, kind, title, url, ext, size_bytes, placement, sort_order")
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) {
      return {
        ok: false,
        error: "Resources need migration 0037 (lesson_resources). Run the SQL in supabase/APPLY_THIS_IN_SUPABASE_STUDIO.sql.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/tutorials/${input.lessonId}`);
  return { ok: true, resource: data ? rowToResource(data) : undefined };
}

export async function renameLessonResource(
  id: string,
  lessonId: string,
  title: string,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  const t = title.trim();
  if (!t) return { ok: false, error: "Name cannot be empty." };

  const svc = createServiceClient();
  const { error } = await svc
    .from("lesson_resources")
    .update({ title: t.slice(0, 200) })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/tutorials/${lessonId}`);
  return { ok: true };
}

export async function deleteLessonResource(
  id: string,
  lessonId: string,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const svc = createServiceClient();
  const { error } = await svc.from("lesson_resources").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/tutorials/${lessonId}`);
  return { ok: true };
}

export async function reorderLessonResources(
  lessonId: string,
  orderedIds: string[],
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const svc = createServiceClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await svc
      .from("lesson_resources")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]!)
      .eq("lesson_id", lessonId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/tutorials/${lessonId}`);
  return { ok: true };
}
