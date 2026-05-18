import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Performance · Admin · Creator Growth OS",
};

export default async function AdminPerformancePage() {
  const supabase = createServiceClient();

  const since = new Date();
  since.setDate(since.getDate() - 28);
  const sinceIso = since.toISOString().slice(0, 10);

  const [{ data: latest }, { data: profiles }, { count: totalEntries }] =
    await Promise.all([
      supabase
        .from("performance_entries")
        .select(
          "user_id, week_start, followers, reach, views, posts_published, engagement_rate, profile_visits, clicks, revenue",
        )
        .gte("week_start", sinceIso)
        .order("week_start", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("id, display_name, full_name, email"),
      supabase
        .from("performance_entries")
        .select("*", { count: "exact", head: true }),
    ]);

  const profileMap = new Map(
    profiles?.map((p) => [
      p.id,
      p.display_name ?? p.full_name ?? p.email ?? "Creator",
    ]) ?? [],
  );

  const totals = (latest ?? []).reduce(
    (acc, row) => {
      acc.followers += row.followers ?? 0;
      acc.views += row.views ?? 0;
      acc.posts += row.posts_published ?? 0;
      acc.revenue += Number(row.revenue ?? 0);
      acc.creators.add(row.user_id);
      return acc;
    },
    { followers: 0, views: 0, posts: 0, revenue: 0, creators: new Set<string>() },
  );

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto">
      <header>
        <h1 className="font-display text-[36px] text-ink-900 leading-tight mb-1">
          Performance
        </h1>
        <p className="text-ink-500 text-[14px]">
          Aggregate creator metrics across the platform — last 28 days.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Active creators" value={totals.creators.size.toString()} />
        <Stat
          label="Total entries"
          value={(totalEntries ?? 0).toLocaleString()}
        />
        <Stat
          label="Followers gained"
          value={totals.followers.toLocaleString()}
        />
        <Stat label="Total views" value={totals.views.toLocaleString()} />
        <Stat
          label="Reported revenue"
          value={`${totals.revenue.toLocaleString()} kr`}
        />
      </div>

      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-[20px] text-ink-900">
            Recent submissions
          </h2>
          <span className="text-[12px] text-ink-500">
            Showing {(latest ?? []).length}
          </span>
        </header>
        {!latest || latest.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No performance entries in the last 28 days.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide bg-cream-50">
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Followers</th>
                  <th className="px-4 py-3">Reach</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Posts</th>
                  <th className="px-4 py-3">Eng %</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {latest.map((row) => (
                  <tr
                    key={`${row.user_id}-${row.week_start}`}
                    className="text-[13px] text-ink-800"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${row.user_id}`}
                        className="font-medium text-ink-900 hover:text-rose-600"
                      >
                        {profileMap.get(row.user_id) ?? row.user_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.week_start}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.followers?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.reach?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.views?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.posts_published ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.engagement_rate != null
                        ? `${row.engagement_rate}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.revenue
                        ? `${Number(row.revenue).toLocaleString()} kr`
                        : "—"}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="font-display text-[24px] text-ink-900 tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}
