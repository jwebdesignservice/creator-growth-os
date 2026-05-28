import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import { AccessEditor } from "./access-editor";

export const metadata = { title: "Access · Admin" };

type Plan = "free" | "basic" | "pro" | "diamond";
type Params = Promise<{ id: string }>;

type ProgramAccessRow = {
  id: string;
  slug: string;
  title: string;
  plan_access: string;
  allowed_plans?: string[] | null;
  access_instant?: boolean | null;
  access_while_valid?: boolean | null;
  access_revoke_future?: boolean | null;
  access_admin_note?: string | null;
};

const VALID_PLANS = new Set<Plan>(["free", "basic", "pro", "diamond"]);

export default async function AccessPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Try the full select (migration 0035 columns). If the migration hasn't
  // been applied yet the columns don't exist (42703) — fall back to a
  // minimal select + sensible defaults so the page still renders, and flag
  // `tableMissing` so the editor can show a setup banner.
  let row: ProgramAccessRow | null = null;
  let tableMissing = false;

  const full = await supabase
    .from("programs")
    .select(
      "id, slug, title, plan_access, allowed_plans, access_instant, access_while_valid, access_revoke_future, access_admin_note",
    )
    .eq("id", id)
    .maybeSingle();

  if (full.data) {
    row = full.data as ProgramAccessRow;
  } else if (full.error?.code === "42703") {
    tableMissing = true;
    const fallback = await supabase
      .from("programs")
      .select("id, slug, title, plan_access")
      .eq("id", id)
      .maybeSingle();
    if (fallback.data) row = fallback.data as ProgramAccessRow;
  }

  if (!row) notFound();

  const allowedPlans: Plan[] =
    Array.isArray(row.allowed_plans) && row.allowed_plans.length > 0
      ? (row.allowed_plans.filter((p): p is Plan =>
          VALID_PLANS.has(p as Plan),
        ))
      : defaultAllowed(row.plan_access);

  // Per-plan member estimate from profiles.plan (every user has a profile).
  // Diamond isn't a billing tier yet, so it counts 0.
  const [free, basic, pro] = await Promise.all([
    countPlan(supabase, "free"),
    countPlan(supabase, "basic"),
    countPlan(supabase, "pro"),
  ]);
  const memberCounts: Record<Plan, number> = { free, basic, pro, diamond: 0 };

  return (
    <AccessEditor
      programId={row.id}
      programTitle={row.title}
      programSlug={row.slug}
      initialAllowedPlans={allowedPlans}
      initialInstant={row.access_instant ?? true}
      initialWhileValid={row.access_while_valid ?? true}
      initialRevokeFuture={row.access_revoke_future ?? true}
      initialAdminNote={row.access_admin_note ?? ""}
      memberCounts={memberCounts}
      tableMissing={tableMissing}
    />
  );
}

/** Hierarchical fallback when allowed_plans is unset: a tier sees its own
 *  content + everything below it; Diamond (top tier) sees everything. */
function defaultAllowed(planAccess: string): Plan[] {
  switch (planAccess) {
    case "free":
      return ["free", "basic", "pro", "diamond"];
    case "basic":
      return ["basic", "pro", "diamond"];
    case "pro":
      return ["pro", "diamond"];
    default:
      return ["free", "basic", "pro", "diamond"];
  }
}

async function countPlan(
  supabase: SupabaseClient,
  plan: "free" | "basic" | "pro",
): Promise<number> {
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("plan", plan);
  return count ?? 0;
}
