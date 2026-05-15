import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { RightRail } from "@/components/app-shell/right-rail";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type CategoryKey } from "@/lib/brand";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Try to load the profile, but degrade gracefully if the schema hasn't been
  // applied to Supabase yet — fall back to auth user metadata so the dashboard
  // still renders for the smoke test.
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, display_name, email, phone, avatar_url, category, plan, onboarded",
    )
    .eq("id", user.id)
    .maybeSingle();

  // If the user hasn't gone through onboarding yet, push them through it.
  // Only enforce when the profile row already exists (i.e. schema is applied);
  // otherwise let them through so the smoke test keeps working.
  if (profile && profile.onboarded === false) {
    redirect("/onboarding");
  }

  const fallbackName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Creator";

  const name =
    profile?.display_name ?? profile?.full_name ?? fallbackName;

  const plan = (profile?.plan ?? "free") as "free" | "basic" | "pro";
  const categoryKey = (profile?.category ?? "growth") as CategoryKey;
  const categoryMeta =
    CATEGORIES.find((c) => c.key === categoryKey) ?? CATEGORIES[1];

  const topUser = {
    name,
    avatar_url: profile?.avatar_url ?? null,
    plan,
  };

  const railProfile = {
    name,
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? null,
    avatar_url: profile?.avatar_url ?? null,
    plan,
    category_label: categoryMeta.label,
    category_description: categoryMeta.focus,
    // Profile completion will be computed properly once schema is live;
    // for now derive it from how many onboarding fields are filled.
    profile_completion: computeProfileCompletion(profile),
    socials: {
      instagram: 52300,
      tiktok: 28700,
      youtube: 12100,
    },
  };

  return (
    <div className="flex min-h-screen bg-cream-100 text-ink-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={topUser} />
        <div className="flex flex-1 min-w-0">
          <main className="flex-1 min-w-0 px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </main>
          <RightRail profile={railProfile} />
        </div>
      </div>
    </div>
  );
}

function computeProfileCompletion(
  profile:
    | {
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
        category: string | null;
        plan: string | null;
      }
    | null
    | undefined,
) {
  if (!profile) return 25;
  const checks = [
    !!profile.full_name,
    !!profile.phone,
    !!profile.avatar_url,
    !!profile.category,
    !!profile.plan,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
