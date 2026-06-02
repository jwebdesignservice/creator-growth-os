import Link from "next/link";
import { PerformanceDashboard } from "@/components/admin/performance-dashboard";
import {
  getAdminPerformanceData,
  type AdminPerfRecentRow,
} from "@/lib/performance/admin-queries";

export const metadata = {
  title: "Performance · Admin · Creator Growth OS",
};

const PLATFORM_LABEL: Record<string, string> = {
  manual: "Manual",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  twitter: "X / Twitter",
  x: "X / Twitter",
};

export default async function AdminPerformancePage() {
  const data = await getAdminPerformanceData();

  return (
    <div className="space-y-6 container-app">
      <header>
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">Performance</h1>
        <p className="text-ink-500 text-[14px]">
          Platform-wide creator performance — last {data.weeksCount} weeks.
        </p>
      </header>

      <PerformanceDashboard data={data} />

      {/* Recent submissions — per-creator drill-through (preserved) */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-h4 text-ink-900">Recent submissions</h2>
          <span className="text-[12px] text-ink-500">
            Showing {data.recent.length}
          </span>
        </header>
        {data.recent.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No performance entries in the last {data.weeksCount} weeks.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide bg-cream-50">
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Platform</th>
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
                {data.recent.map((row, i) => (
                  <RecentRow key={`${row.user_id}-${row.week_start}-${i}`} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function RecentRow({ row }: { row: AdminPerfRecentRow }) {
  return (
    <tr className="text-[13px] text-ink-800">
      <td className="px-4 py-3">
        <Link
          href={`/admin/users/${row.user_id}`}
          className="font-medium text-ink-900 hover:text-rose-600"
        >
          {row.creator}
        </Link>
      </td>
      <td className="px-4 py-3 text-ink-600">
        {PLATFORM_LABEL[row.platform] ?? row.platform}
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
      <td className="px-4 py-3 tabular-nums">{row.posts_published ?? "—"}</td>
      <td className="px-4 py-3 tabular-nums">
        {row.engagement_rate != null ? `${row.engagement_rate}%` : "—"}
      </td>
      <td className="px-4 py-3 tabular-nums">
        {row.revenue ? `${row.revenue.toLocaleString()} kr` : "—"}
      </td>
    </tr>
  );
}
