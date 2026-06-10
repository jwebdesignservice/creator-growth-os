"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DealStage } from "@/lib/monetization/queries";

type Result = { ok: true } | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────────────
// Media Kit
// ─────────────────────────────────────────────────────────────────────

export async function saveMediaKit(input: {
  headline: string;
  bio: string;
  niche: string;
  audience_stats: Record<string, number | string>;
  rates: Record<string, number | string>;
  links: Array<{ label: string; url: string }>;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("media_kits").upsert(
    {
      user_id: user.id,
      headline: input.headline || null,
      bio: input.bio || null,
      niche: input.niche || null,
      audience_stats: input.audience_stats ?? {},
      rates: input.rates ?? {},
      links: input.links ?? [],
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("[monetization/actions] saveMediaKit failed:", error);
    return { ok: false, error: "Couldn't save your media kit. Please try again." };
  }

  revalidatePath("/monetization");
  return { ok: true };
}

export async function toggleMediaKitPublished(
  published: boolean,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  let slug: string | null = null;
  if (published) {
    const { data: existing } = await supabase
      .from("media_kits")
      .select("share_slug")
      .eq("user_id", user.id)
      .maybeSingle();
    slug =
      existing?.share_slug ??
      `${user.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  const { error } = await supabase
    .from("media_kits")
    .update({ published, share_slug: published ? slug : null })
    .eq("user_id", user.id);
  if (error) {
    console.error("[monetization/actions] toggleMediaKitPublished failed:", error);
    return {
      ok: false,
      error: "Couldn't update your media kit's visibility. Please try again.",
    };
  }

  revalidatePath("/monetization");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Brand Deals
// ─────────────────────────────────────────────────────────────────────

export async function createBrandDeal(input: {
  brand_name: string;
  contact_name?: string;
  contact_email?: string;
  stage: DealStage;
  value_amount?: number | null;
  deliverables?: string;
  due_date?: string | null;
  notes?: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!input.brand_name.trim()) {
    return { ok: false, error: "Brand name is required." };
  }

  const { error } = await supabase.from("brand_deals").insert({
    user_id: user.id,
    brand_name: input.brand_name.trim(),
    contact_name: input.contact_name?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    stage: input.stage,
    value_amount: input.value_amount ?? null,
    deliverables: input.deliverables?.trim() || null,
    due_date: input.due_date ?? null,
    notes: input.notes?.trim() || null,
  });
  if (error) {
    console.error("[monetization/actions] createBrandDeal failed:", error);
    return { ok: false, error: "Couldn't add the brand deal. Please try again." };
  }

  revalidatePath("/monetization");
  return { ok: true };
}

export async function updateDealStage(
  dealId: string,
  stage: DealStage,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("brand_deals")
    .update({ stage })
    .eq("id", dealId)
    .eq("user_id", user.id);
  if (error) {
    console.error("[monetization/actions] updateDealStage failed:", error);
    return { ok: false, error: "Couldn't update the deal stage. Please try again." };
  }

  revalidatePath("/monetization");
  return { ok: true };
}

export async function deleteDeal(dealId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("brand_deals")
    .delete()
    .eq("id", dealId)
    .eq("user_id", user.id);
  if (error) {
    console.error("[monetization/actions] deleteDeal failed:", error);
    return { ok: false, error: "Couldn't delete the deal. Please try again." };
  }

  revalidatePath("/monetization");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────
// Revenue
// ─────────────────────────────────────────────────────────────────────

export async function createRevenueEntry(input: {
  source: string;
  category?: string;
  amount: number;
  received_on?: string;
  note?: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (!input.source.trim()) return { ok: false, error: "Source is required." };
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }

  const { error } = await supabase.from("revenue_entries").insert({
    user_id: user.id,
    source: input.source.trim(),
    category: input.category?.trim() || null,
    amount: Math.round(input.amount * 100),
    received_on: input.received_on ?? new Date().toISOString().slice(0, 10),
    note: input.note?.trim() || null,
  });
  if (error) {
    console.error("[monetization/actions] createRevenueEntry failed:", error);
    return {
      ok: false,
      error: "Couldn't add the revenue entry. Please try again.",
    };
  }

  revalidatePath("/monetization");
  return { ok: true };
}

export async function deleteRevenueEntry(entryId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("revenue_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);
  if (error) {
    console.error("[monetization/actions] deleteRevenueEntry failed:", error);
    return {
      ok: false,
      error: "Couldn't delete the revenue entry. Please try again.",
    };
  }

  revalidatePath("/monetization");
  return { ok: true };
}
