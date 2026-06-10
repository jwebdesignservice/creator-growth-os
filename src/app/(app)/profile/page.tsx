import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Sparkles,
  Target,
  TrendingUp,
  Hash,
  AlertCircle,
  Mail,
  Phone,
  CalendarClock,
  ArrowRight,
  FileText,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { Avatar } from "@/components/app-shell/avatar";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Profile | Profluencer" };

const PLAN_LABEL: Record<string, string> = {
  free:  "Free",
  basic: "Basic",
  pro:   "Pro",
};

const PLAN_PILL: Record<string, string> = {
  free:  "bg-cream-200 text-ink-700 border border-ink-200",
  basic: "bg-rose-100 text-rose-700 border border-rose-200",
  pro:   "bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 border border-rose-300",
};

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok:    "TikTok",
  youtube:   "YouTube",
  twitter:   "Twitter / X",
  linkedin:  "LinkedIn",
  other:     "Other",
};

export default async function ProfilePage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { user, profile } = ctx;

  // Pull a couple of extra fields the shell context doesn't surface (created_at)
  // so we can show "Member since". One light read; failures fall back gracefully.
  let memberSince: string | null = null;
  let bio: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("created_at, bio")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.created_at) {
      memberSince = new Date(data.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
    bio = (data?.bio as string | null) ?? null;
  } catch {
    /* non-fatal — Member since / bio just won't render */
  }

  const fullName =
    profile?.display_name ??
    profile?.full_name ??
    user.email?.split("@")[0] ??
    "Creator";
  const firstName = fullName.split(" ")[0];
  const plan = (profile?.plan ?? "free") as "free" | "basic" | "pro";
  const primaryPlatform = profile?.primary_platform ?? null;
  const followerBase = profile?.follower_base ?? null;
  const mainGoal = profile?.main_goal ?? null;
  const niche = profile?.niche ?? null;
  const bottleneck = profile?.bottleneck ?? null;

  return (
    <PageShell>
      <div className="max-w-[var(--container-content)] space-y-6">
        {/* Eyebrow */}
        <div className="text-rose-600 font-medium text-[13.5px] flex items-center gap-2">
          Welcome back, {firstName}! <span aria-hidden>👋</span>
        </div>

        {/* Header card — avatar + name + plan + edit link */}
        <section className="card p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="size-[112px] rounded-full overflow-hidden border-[3px] border-white shadow-md">
                {profile?.avatar_url ? (
                  // Plain <img> mirrors the existing settings panel pattern.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={`${fullName}'s profile photo`}
                    className="size-full object-cover"
                  />
                ) : (
                  <Avatar name={fullName} size={112} />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-page-title text-ink-900">
                {fullName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[13px] text-ink-500">
                {profile?.email || user.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" strokeWidth={1.9} aria-hidden />
                    {profile?.email ?? user.email}
                  </span>
                ) : null}
                {profile?.phone && (
                  <>
                    <span className="text-ink-300" aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5" strokeWidth={1.9} aria-hidden />
                      {profile.phone}
                    </span>
                  </>
                )}
                {memberSince && (
                  <>
                    <span className="text-ink-300" aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" strokeWidth={1.9} aria-hidden />
                      Member since {memberSince}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span
                  className={
                    "inline-flex items-center px-2.5 h-[24px] rounded-full text-[12px] font-semibold " +
                    PLAN_PILL[plan]
                  }
                >
                  {PLAN_LABEL[plan]} plan
                </span>
                {ctx.railProfile?.category_label && (
                  <span className="inline-flex items-center px-2.5 h-[24px] rounded-full text-[12px] font-medium bg-cream-200 text-ink-700 border border-ink-100">
                    {ctx.railProfile.category_label}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 self-start sm:self-center">
              <Link
                href="/settings"
                aria-label="Edit profile in Settings"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
              >
                <Pencil className="size-3.5" strokeWidth={2.2} />
                Edit Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Profile basics from onboarding */}
        <section className="card p-5 sm:p-6">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-h4 text-ink-900">
              About my creator profile
            </h2>
            <Link
              href="/settings"
              className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-[8px] px-1"
            >
              Edit
            </Link>
          </header>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              icon={FileText}
              label="Bio"
              value={bio}
              wide
            />
            <Field
              icon={Sparkles}
              label="Primary platform"
              value={primaryPlatform ? PLATFORM_LABEL[primaryPlatform] ?? primaryPlatform : null}
            />
            <Field
              icon={TrendingUp}
              label="Follower base"
              value={followerBase}
            />
            <Field
              icon={Target}
              label="Main goal"
              value={mainGoal}
            />
            <Field
              icon={Hash}
              label="Niche"
              value={niche}
            />
            <Field
              icon={AlertCircle}
              label="Current bottleneck"
              value={bottleneck}
              wide
            />
          </dl>
        </section>

        {/* Quick links to related areas */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickLink href="/settings" title="Settings" subtitle="Account, notifications, social accounts" />
          <QuickLink href="/billing"  title="Billing"  subtitle="Plan, invoices, subscription" />
          <QuickLink href="/support"  title="Support"  subtitle="Get help from our team" />
        </section>
      </div>
    </PageShell>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function Field({
  icon: Icon,
  label,
  value,
  wide,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  label: string;
  value: string | null;
  wide?: boolean;
}) {
  return (
    <div
      className={
        "rounded-[12px] border border-ink-100 bg-cream-100/50 p-3.5 " +
        (wide ? "sm:col-span-2" : "")
      }
    >
      <dt className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider font-semibold text-ink-500">
        <Icon className="size-3.5" strokeWidth={1.9} aria-hidden />
        {label}
      </dt>
      <dd className="mt-1.5 text-[13.5px] text-ink-900">
        {value ? value : <span className="italic text-ink-400">Not set yet</span>}
      </dd>
    </div>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="card p-4 hover:border-rose-200 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-900 group-hover:text-rose-700 transition-colors">
            {title}
          </div>
          <p className="mt-0.5 text-[12px] text-ink-500 truncate">{subtitle}</p>
        </div>
        <ArrowRight className="size-4 text-ink-400 group-hover:text-rose-600 transition-colors" strokeWidth={2} aria-hidden />
      </div>
    </Link>
  );
}
