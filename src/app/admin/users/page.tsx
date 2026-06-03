import { Filter } from "lucide-react";
import { getUsersList } from "@/lib/admin/queries";
import { UsersTable } from "./users-table";

export const metadata = { title: "Users · Admin · Creator Growth OS" };

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

  return (
    <div className="flex flex-col -mx-6 lg:-mx-8 -my-6 lg:-my-8 h-[calc(100vh_-_69px)]">
      {/* One cohesive dense panel — the "Users" title sits on the toolbar row
          (left of the filters), with table actions on the right, matching the
          "Data table · V2 dense" design. Member search lives in the global
          topbar (routes to ?q=); the hidden field carries the active query
          through when filters are applied. */}
      <UsersTable rows={rows} total={total} page={page} pageSize={pageSize} title="Users">
        <form className="flex flex-wrap items-center gap-2.5">
          <input type="hidden" name="q" defaultValue={sp.q ?? ""} />
          <select
            name="category"
            defaultValue={sp.category ?? "all"}
            className="h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[13px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
            className="h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[13px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-[10px] bg-ink-900 text-white text-[13px] font-medium cursor-pointer hover:bg-ink-700"
          >
            <Filter className="size-3.5" strokeWidth={2} />
            Apply
          </button>
        </form>
      </UsersTable>
    </div>
  );
}
