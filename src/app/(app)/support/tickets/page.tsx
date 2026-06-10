import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getMyTickets } from "@/lib/support/queries";
import { PageShell } from "@/components/app-shell/page-shell";
import { TicketsTable } from "./tickets-table";

export const metadata = { title: "Your Tickets" };

/**
 * "My tickets" page — premium table linked from the Settings → Security card.
 *
 * Server side just authenticates and pulls the user's tickets (limit 200);
 * the new `<TicketsTable />` client component owns search, status filtering,
 * pagination, and the close-ticket flow. All backend stays untouched —
 * close goes through the existing `closeTicket` server action.
 */
export default async function TicketsListPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  // 200 covers all but the most prolific users. Pagination is then handled
  // client-side over the materialised set so search + page-jumps stay
  // instant without round-tripping to the server for each filter change.
  const tickets = await getMyTickets({ status: "all", limit: 200 });

  return (
    <PageShell>
      <div className="max-w-[var(--container-content)]">
        <TicketsTable tickets={tickets} />
      </div>
    </PageShell>
  );
}
