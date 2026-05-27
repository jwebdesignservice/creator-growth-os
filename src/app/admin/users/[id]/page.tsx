import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Flame } from "lucide-react";
import { getUserDetail } from "@/lib/admin/queries";
import { UserEditForms } from "./edit-forms";

export const metadata = { title: "User · Admin · Creator Growth OS" };

type Params = Promise<{ id: string }>;

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  monetization: "Monetization Creator",
  scale: "Scale Creator",
};

export default async function AdminUserDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getUserDetail(id);
  if (!data) notFound();

  const { profile, subscription, aggregates } = data;

  return (
    <div className="space-y-6 container-app">
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
        <span className="text-ink-700">
          {profile.full_name ?? profile.email}
        </span>
      </nav>

      {/* Header card */}
      <section className="card p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-h1 text-ink-900 leading-tight mb-1">
              {profile.full_name ?? profile.email.split("@")[0]}
            </h1>
            <div className="text-[14px] text-ink-500 mb-3">{profile.email}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip chip-rose capitalize">{profile.plan}</span>
              <span className="chip bg-cream-100 text-ink-700">
                {CATEGORY_LABEL[profile.category] ?? profile.category}
              </span>
              {profile.onboarded ? (
                <span className="chip chip-success">Onboarded</span>
              ) : (
                <span className="chip bg-cream-100 text-ink-500">Pending onboarding</span>
              )}
              {profile.daily_streak > 0 && (
                <span className="chip chip-rose inline-flex items-center gap-1">
                  <Flame
                    className="size-3"
                    strokeWidth={1.6}
                    fill="currentColor"
                  />
                  {profile.daily_streak} day streak
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Missions" value={aggregates.missionsCompleted} sub={`of ${aggregates.missionsAssigned}`} />
            <Stat label="Weeks Logged" value={aggregates.weeksLogged} sub="performance" />
            <Stat
              label="Joined"
              value={new Date(profile.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "2-digit",
              })}
              sub=""
            />
          </div>
        </div>
      </section>

      {/* Edit forms */}
      <section className="card p-6">
        <h2 className="text-h4 text-ink-900 mb-4">
          Manage Access
        </h2>
        <UserEditForms
          userId={profile.id}
          category={profile.category ?? "starter"}
          plan={profile.plan ?? "free"}
          onboarded={!!profile.onboarded}
        />
        <p className="mt-3 text-[11.5px] text-ink-500">
          Changes apply immediately. Plan changes also write to the
          subscriptions table.
        </p>
      </section>

      {/* Onboarding answers */}
      <section className="card p-6">
        <h2 className="text-h4 text-ink-900 mb-4">
          Onboarding Answers
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
          <Field label="Primary platform" value={profile.primary_platform} />
          <Field label="Follower base" value={profile.follower_base} />
          <Field label="Niche" value={profile.niche} />
          <Field label="Main goal" value={profile.main_goal} />
          <Field label="Bottleneck" value={profile.bottleneck} />
          <Field label="Weekly pace" value={profile.weekly_pace} />
          <Field
            label="Content frequency"
            value={profile.content_frequency}
          />
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
      </section>

      {/* Subscription */}
      {subscription && (
        <section className="card p-6">
          <h2 className="text-h4 text-ink-900 mb-4">
            Subscription
          </h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-[13px]">
            <Field label="Plan" value={subscription.plan} />
            <Field label="Status" value={subscription.status} />
            <Field
              label="Current period end"
              value={
                subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
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
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
        {label}
      </div>
      <div className="text-[20px] font-semibold text-ink-900 leading-none">
        {value}
      </div>
      {sub && <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 pb-2 last:border-b-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-900 font-medium text-right capitalize">
        {value && value !== "" ? String(value).replace(/_/g, " ") : "—"}
      </dd>
    </div>
  );
}
