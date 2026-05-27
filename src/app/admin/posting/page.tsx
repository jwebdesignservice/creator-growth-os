import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Posting Plans · Admin · Creator Growth OS",
};

export default async function AdminPostingPage() {
  const supabase = createServiceClient();

  const [{ data: plans }, { data: profiles }, { count: totalItems }] =
    await Promise.all([
      supabase
        .from("posting_plans")
        .select(
          "id, user_id, title, status, category, week_start, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("id, display_name, full_name, email"),
      supabase
        .from("posting_plan_items")
        .select("*", { count: "exact", head: true }),
    ]);

  const profileMap = new Map(
    profiles?.map((p) => [
      p.id,
      p.display_name ?? p.full_name ?? p.email ?? "Creator",
    ]) ?? [],
  );

  const counts = (plans ?? []).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0 } as Record<string, number>,
  );

  return (
    <div className="space-y-6 container-app">
      <header>
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">
          Posting Plans
        </h1>
        <p className="text-ink-500 text-[14px]">
          Oversight of every creator&apos;s posting plan. Read-only — creators
          manage their own plans in the app.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Plans visible" value={counts.total.toString()} />
        <Stat label="Active" value={(counts["active"] ?? 0).toString()} />
        <Stat label="Drafts" value={(counts["draft"] ?? 0).toString()} />
        <Stat
          label="Scheduled items"
          value={(totalItems ?? 0).toLocaleString()}
        />
      </div>

      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-h4 text-ink-900">
            Recent plans
          </h2>
          <span className="text-[12px] text-ink-500">
            Showing {(plans ?? []).length}
          </span>
        </header>
        {!plans || plans.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No posting plans yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide bg-cream-50">
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {plans.map((p) => (
                  <tr key={p.id} className="text-[13px] text-ink-800">
                    <td className="px-4 py-3">
                      {p.user_id ? (
                        <Link
                          href={`/admin/users/${p.user_id}`}
                          className="font-medium text-ink-900 hover:text-rose-600"
                        >
                          {profileMap.get(p.user_id) ?? p.user_id.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-ink-500">— (template)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-700">
                      {p.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.week_start}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold capitalize ${statusTone(p.status)}`}
                      >
                        {p.status}
                      </span>
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

function statusTone(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "draft") return "bg-ink-100 text-ink-600";
  if (status === "archived") return "bg-amber-100 text-amber-700";
  return "bg-ink-100 text-ink-600";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="text-h3 text-ink-900 tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}
