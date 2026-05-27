import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { getUsersList } from "@/lib/admin/queries";

export const metadata = { title: "Users · Admin · Creator Growth OS" };

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  monetization: "Monetization Creator",
  scale: "Scale Creator",
};

type Search = Promise<{
  q?: string;
  category?: string;
  plan?: string;
  page?: string;
}>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.page ?? "0", 10) || 0);
  const pageSize = 25;
  const { rows, total } = await getUsersList({
    search: sp.q,
    category: sp.category && sp.category !== "all" ? sp.category : undefined,
    plan: sp.plan && sp.plan !== "all" ? sp.plan : undefined,
    page,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6 container-app">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">
            Users
          </h1>
          <p className="text-ink-500 text-[14px]">
            Browse, filter and manage every member.{" "}
            <span className="font-semibold text-ink-900">{total}</span> in
            total.
          </p>
        </div>
      </header>

      {/* Filters */}
      <form className="card p-4 grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3">
        <label className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
            strokeWidth={2}
          />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search by name or email"
            className="w-full h-11 pl-10 pr-4 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <select
          name="category"
          defaultValue={sp.category ?? "all"}
          className="h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        >
          <option value="all">All categories</option>
          <option value="starter">Starter Creator</option>
          <option value="growth">Growth Creator</option>
          <option value="monetization">Monetization Creator</option>
          <option value="scale">Scale Creator</option>
        </select>
        <select
          name="plan"
          defaultValue={sp.plan ?? "all"}
          className="h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-[12px] bg-ink-900 text-white text-[13px] font-medium cursor-pointer hover:bg-ink-700"
        >
          <Filter className="size-3.5" strokeWidth={2} />
          Apply
        </button>
      </form>

      {/* Table */}
      <section className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No users match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 bg-cream-100/60">
                  <th className="font-semibold py-3 px-5">User</th>
                  <th className="font-semibold py-3 px-2">Plan</th>
                  <th className="font-semibold py-3 px-2">Category</th>
                  <th className="font-semibold py-3 px-2">Streak</th>
                  <th className="font-semibold py-3 px-2">Onboarded</th>
                  <th className="font-semibold py-3 px-2">Joined</th>
                  <th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t border-ink-100">
                    <td className="py-3 px-5">
                      <div className="text-ink-900 font-medium">
                        {u.full_name ?? u.email.split("@")[0]}
                      </div>
                      <div className="text-[11.5px] text-ink-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="chip chip-rose capitalize">{u.plan}</span>
                    </td>
                    <td className="py-3 px-2 text-ink-700">
                      {CATEGORY_LABEL[u.category] ?? u.category}
                    </td>
                    <td className="py-3 px-2 text-ink-700 tabular-nums">
                      {u.daily_streak}d
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

        {totalPages > 1 && (
          <footer className="border-t border-ink-100 px-5 py-3 flex items-center justify-between text-[12.5px] text-ink-500">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {page > 0 && (
                <Link
                  href={buildHref(sp, { page: page - 1 })}
                  className="px-3 h-8 rounded-[8px] border border-ink-200 text-ink-700 hover:bg-cream-100 inline-flex items-center"
                >
                  Previous
                </Link>
              )}
              {page < totalPages - 1 && (
                <Link
                  href={buildHref(sp, { page: page + 1 })}
                  className="px-3 h-8 rounded-[8px] border border-ink-200 text-ink-700 hover:bg-cream-100 inline-flex items-center"
                >
                  Next
                </Link>
              )}
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}

function buildHref(
  sp: { q?: string; category?: string; plan?: string; page?: string },
  override: Partial<{ q: string; category: string; plan: string; page: number }>,
) {
  const params = new URLSearchParams();
  const final = { ...sp, ...override };
  if (final.q) params.set("q", String(final.q));
  if (final.category && final.category !== "all")
    params.set("category", String(final.category));
  if (final.plan && final.plan !== "all") params.set("plan", String(final.plan));
  if (final.page !== undefined && Number(final.page) > 0)
    params.set("page", String(final.page));
  const qs = params.toString();
  return `/admin/users${qs ? `?${qs}` : ""}`;
}
