import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Flame,
  Mail,
  Target,
  Activity,
  CalendarDays,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { getUserDetail } from "@/lib/admin/queries";
import { UserEditForms } from "./edit-forms";

export const metadata = { title: "User · Admin · Profluencer" };

type Params = Promise<{ id: string }>;

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  monetization: "Monetization Creator",
  scale: "Scale Creator",
};

/* Initials for the avatar — first letters of the name (or the email handle). */
function getInitials(name: string | null | undefined, email: string) {
  const base = (name && name.trim()) || email.split("@")[0] || "?";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const chars =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : base.slice(0, 2);
  return chars.toUpperCase();
}

export default async function AdminUserDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getUserDetail(id);
  if (!data) notFound();

  const { profile, subscription, aggregates } = data;

  const displayName = profile.full_name ?? profile.email.split("@")[0];
  const initials = getInitials(profile.full_name, profile.email);
  const joinedShort = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const joinedFull = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const joinedAgo = timeAgo(profile.created_at);

  // Does this user have any onboarding answers on file? Drives a clean empty
  // state instead of a grid of em-dashes for users who haven't onboarded.
  const onboardingAnswered =
    [
      profile.primary_platform,
      profile.follower_base,
      profile.niche,
      profile.main_goal,
      profile.bottleneck,
      profile.weekly_pace,
      profile.content_frequency,
    ].some((v) => v && v !== "") ||
    [
      profile.top_value_priorities,
      profile.focus_formats,
      profile.help_needs,
    ].some((v) => Array.isArray(v) && v.length > 0);

  return (
    <div className="container-app space-y-6">
      {/* Breadcrumb */}
      <nav className="text-[13px]">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
          Users
        </Link>
        <span className="text-ink-400 mx-2">/</span>
        <span className="text-ink-700">{displayName}</span>
      </nav>

      {/* ── Hero — cover + identity + stats ───────────────────────────── */}
      <section className="card overflow-hidden">
        {/* Cover band */}
        <div className="h-24 bg-gradient-to-r from-rose-200 via-rose-100 to-cream-200" />

        <div className="px-6 pb-6">
          {/* Identity row — avatar straddles the cover */}
          <div className="-mt-10 flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-4 min-w-0">
              <span className="size-20 rounded-full bg-rose-600 text-white text-[26px] font-semibold inline-flex items-center justify-center ring-4 ring-white shadow-sm shrink-0">
                {initials}
              </span>
              <div className="pb-1 min-w-0">
                <h1 className="text-h2 text-ink-900 leading-tight truncate">
                  {displayName}
                </h1>
                <div className="text-[14px] text-ink-500 truncate">
                  {profile.email}
                </div>
              </div>
            </div>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-200 text-[13.5px] font-medium text-ink-900 hover:bg-cream-100 transition-colors shrink-0"
            >
              <Mail className="size-4 text-ink-500" strokeWidth={1.9} />
              Email
            </a>
          </div>

          {/* Status chips */}
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <span className="chip chip-rose capitalize">{profile.plan}</span>
            <span className="chip bg-cream-100 text-ink-700">
              {CATEGORY_LABEL[profile.category] ?? profile.category}
            </span>
            {profile.onboarded ? (
              <span className="chip chip-success">Onboarded</span>
            ) : (
              <span className="chip bg-cream-100 text-ink-500">
                Pending onboarding
              </span>
            )}
            {profile.daily_streak > 0 && (
              <span className="chip chip-rose inline-flex items-center gap-1">
                <Flame className="size-3" strokeWidth={1.6} fill="currentColor" />
                {profile.daily_streak} day streak
              </span>
            )}
          </div>

          {/* Stats strip */}
          <div className="mt-5 grid grid-cols-3 rounded-[14px] border border-ink-100 bg-cream-50/60 divide-x divide-ink-100 overflow-hidden">
            <HeroStat
              icon={Target}
              label="Missions"
              value={aggregates.missionsCompleted}
              sub={`of ${aggregates.missionsAssigned}`}
            />
            <HeroStat
              icon={Activity}
              label="Weeks Logged"
              value={aggregates.weeksLogged}
              sub="performance"
            />
            <HeroStat
              icon={CalendarDays}
              label="Joined"
              value={joinedShort}
              sub={joinedAgo}
            />
          </div>
        </div>
      </section>

      {/* ── Main + aside ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Manage Access */}
          <section className="card p-6">
            <h2 className="text-h4 text-ink-900 mb-1">Manage Access</h2>
            <p className="text-[12.5px] text-ink-500 mb-4">
              Changes apply immediately. Plan changes also write to the
              subscriptions table.
            </p>
            <UserEditForms
              userId={profile.id}
              category={profile.category ?? "starter"}
              plan={profile.plan ?? "free"}
              onboarded={!!profile.onboarded}
            />
          </section>

          {/* Onboarding answers */}
          <section className="card p-6">
            <h2 className="text-h4 text-ink-900 mb-4">Onboarding Answers</h2>
            {!onboardingAnswered ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center size-11 rounded-full bg-cream-100 text-ink-400 mb-2.5">
                  <ClipboardList className="size-5" strokeWidth={1.8} />
                </div>
                <p className="text-[13px] text-ink-500">
                  {profile.onboarded
                    ? "No onboarding answers on file."
                    : "This user hasn't completed onboarding yet."}
                </p>
              </div>
            ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
              <Field label="Primary platform" value={profile.primary_platform} />
              <Field label="Follower base" value={profile.follower_base} />
              <Field label="Niche" value={profile.niche} />
              <Field label="Main goal" value={profile.main_goal} />
              <Field label="Bottleneck" value={profile.bottleneck} />
              <Field label="Weekly pace" value={profile.weekly_pace} />
              <Field label="Content frequency" value={profile.content_frequency} />
              <Field
                label="Top priorities"
                value={
                  Array.isArray(profile.top_value_priorities) &&
                  profile.top_value_priorities.length > 0
                    ? profile.top_value_priorities.join(", ")
                    : null
                }
              />
              <Field
                label="Focus formats"
                value={
                  Array.isArray(profile.focus_formats) &&
                  profile.focus_formats.length > 0
                    ? profile.focus_formats.join(", ")
                    : null
                }
              />
              <Field
                label="Help needs"
                value={
                  Array.isArray(profile.help_needs) &&
                  profile.help_needs.length > 0
                    ? profile.help_needs.join(", ")
                    : null
                }
              />
            </dl>
            )}
          </section>
        </div>

        {/* Aside column */}
        <aside className="space-y-6">
          {/* Account snapshot */}
          <section className="card p-6">
            <h2 className="text-h4 text-ink-900 mb-4">Account</h2>
            <dl className="space-y-3 text-[13px]">
              <Field
                label="Status"
                value={profile.onboarded ? "Onboarded" : "Pending onboarding"}
              />
              <Field label="Plan" value={profile.plan} />
              <Field
                label="Category"
                value={CATEGORY_LABEL[profile.category] ?? profile.category}
              />
              <Field
                label="Daily streak"
                value={
                  profile.daily_streak > 0
                    ? `${profile.daily_streak} days`
                    : null
                }
              />
              <Field label="Joined" value={joinedFull} />
              <div className="flex items-start justify-between gap-3">
                <dt className="text-ink-500 shrink-0">User ID</dt>
                <dd className="text-ink-700 font-mono text-[11px] text-right break-all">
                  {profile.id}
                </dd>
              </div>
            </dl>
          </section>

          {/* Subscription */}
          <section className="card p-6">
            <h2 className="text-h4 text-ink-900 mb-4">Subscription</h2>
            {subscription ? (
              <dl className="space-y-3 text-[13px]">
                <Field label="Plan" value={subscription.plan} />
                <Field label="Status" value={subscription.status} />
                <Field
                  label="Current period end"
                  value={
                    subscription.current_period_end
                      ? new Date(
                          subscription.current_period_end,
                        ).toLocaleDateString()
                      : null
                  }
                />
                <Field
                  label="Cancel at period end"
                  value={subscription.cancel_at_period_end ? "Yes" : "No"}
                />
                {subscription.stripe_customer_id && (
                  <Field
                    label="Stripe customer"
                    value={subscription.stripe_customer_id}
                  />
                )}
              </dl>
            ) : (
              <p className="text-[13px] text-ink-500">
                No active subscription on file. This user is on the free plan.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="size-3.5 text-rose-500" strokeWidth={2} />
        <span className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">
          {label}
        </span>
      </div>
      <div className="text-[22px] font-bold text-ink-900 leading-none tabular-nums">
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-ink-500 mt-1 truncate">{sub}</div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 pb-2 last:border-b-0">
      <dt className="text-ink-500 shrink-0">{label}</dt>
      <dd className="text-ink-900 font-medium text-right capitalize">
        {value && value !== "" ? String(value).replace(/_/g, " ") : "—"}
      </dd>
    </div>
  );
}
