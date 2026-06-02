import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminMetricsChart } from "@/components/admin/metrics-chart";
import { ActiveBuildsSection } from "@/components/admin/active-builds";
import {
  getAdminStats,
  getAdminMetricsSeries,
  getActiveProgramBuilds,
} from "@/lib/admin/queries";

export const metadata = { title: "Admin · Creator Growth OS" };

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  monetization: "Monetization Creator",
  scale: "Scale Creator",
};

const PLAN_TONE: Record<string, "rose" | "gold" | "ink"> = {
  free: "ink",
  basic: "rose",
  pro: "gold",
};

export default async function AdminDashboardPage() {
  const [stats, metricsSeries, builds] = await Promise.all([
    getAdminStats(),
    getAdminMetricsSeries(),
    getActiveProgramBuilds(3),
  ]);

  return (
    <div className="space-y-6 container-app">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">
            Admin Dashboard
          </h1>
          <p className="text-ink-500 text-[14px]">
            Manage your members, missions, and platform health.
          </p>
        </div>
        <Link
          href="/create-new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
        >
          + Create New
        </Link>
      </header>

      {/* Top section — metrics chart */}
      <AdminMetricsChart series={metricsSeries} />

      {/* Continue where you left off — active program builds */}
      <ActiveBuildsSection builds={builds} />

      {/* Distribution row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DistributionCard
          title="Users by Category"
          rows={["starter", "growth", "monetization", "scale"].map((k) => ({
            label: CATEGORY_LABEL[k] ?? k,
            count: stats.byCategory[k] ?? 0,
            color: ["bg-rose-500","bg-rose-400","bg-rose-300","bg-cream-300"][["starter","growth","monetization","scale"].indexOf(k)] ?? "bg-rose-300",
          }))}
          total={stats.totalUsers}
        />
        <DistributionCard
          title="Users by Plan"
          rows={["free", "basic", "pro"].map((k) => ({
            label: k.charAt(0).toUpperCase() + k.slice(1),
            count: stats.byPlan[k] ?? 0,
            color: ["bg-ink-300","bg-rose-400","bg-rose-600"][["free","basic","pro"].indexOf(k)] ?? "bg-rose-400",
          }))}
          total={stats.totalUsers}
        />
      </section>

      {/* Recent signups */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h3 className="text-h4 text-ink-900">
            Recent Signups
          </h3>
          <Link
            href="/admin/users"
            className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
          >
            View all users
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </header>
        {stats.recentSignups.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No signups yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500">
                  <th className="font-semibold py-3 px-5">User</th>
                  <th className="font-semibold py-3 px-2">Plan</th>
                  <th className="font-semibold py-3 px-2">Category</th>
                  <th className="font-semibold py-3 px-2">Onboarded</th>
                  <th className="font-semibold py-3 px-2">Joined</th>
                  <th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody>
                {stats.recentSignups.map((u) => (
                  <tr key={u.id} className="border-t border-ink-100">
                    <td className="py-3 px-5">
                      <div className="text-ink-900 font-medium">
                        {u.full_name ?? u.email.split("@")[0]}
                      </div>
                      <div className="text-[11.5px] text-ink-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <PlanChip plan={u.plan} />
                    </td>
                    <td className="py-3 px-2 text-ink-700">
                      {CATEGORY_LABEL[u.category] ?? u.category}
                    </td>
                    <td className="py-3 px-2">
                      {u.onboarded ? (
                        <span className="chip chip-success">Yes</span>
                      ) : (
                        <span className="chip bg-cream-100 text-ink-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-ink-500 tabular-nums">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function DistributionCard({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; count: number; color: string }[];
  total: number;
}) {
  return (
    <div className="card p-5">
      <h3 className="text-h4 text-ink-900 mb-4">{title}</h3>
      <ul className="space-y-3">
        {rows.map((r) => {
          const pct = total === 0 ? 0 : Math.round((r.count / total) * 100);
          return (
            <li key={r.label}>
              <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                <span className="text-ink-700">{r.label}</span>
                <span className="text-ink-900 font-semibold tabular-nums">
                  {r.count}{" "}
                  <span className="text-ink-500 font-normal">({pct}%)</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className={`h-full ${r.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlanChip({ plan }: { plan: string }) {
  const tone = PLAN_TONE[plan] ?? "ink";
  const cls =
    tone === "rose"
      ? "chip chip-rose"
      : tone === "gold"
        ? "chip chip-gold"
        : "chip bg-ink-100 text-ink-700";
  return <span className={`${cls} capitalize`}>{plan}</span>;
}
