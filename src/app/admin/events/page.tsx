import Link from "next/link";
import { Plus, Sparkles, CalendarClock } from "lucide-react";
import { getAdminEvents } from "@/lib/admin/queries";
import { EVENT_KIND_VALUES } from "@/lib/community/event-kinds";
import { EventsToolbar } from "./events-toolbar";
import { EventAdminRow, type EventRowData } from "./event-admin-row";

export const metadata = { title: "Events · Admin · Profluencer" };

type SearchParams = Promise<{
  status?: string;
  kind?: string;
  sort?: string;
}>;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status: statusRaw, kind: kindRaw, sort: sortRaw } = await searchParams;

  const status =
    statusRaw === "past" || statusRaw === "all" ? statusRaw : "upcoming";
  const kind = kindRaw && EVENT_KIND_VALUES.includes(kindRaw) ? kindRaw : "";
  const sort = sortRaw === "latest" ? "latest" : "soonest";

  const all = await getAdminEvents(); // ascending by starts_at

  let rows: EventRowData[] = filterByStatus(all, status);
  if (kind) rows = rows.filter((e) => (e.kind ?? "other") === kind);
  if (sort === "latest") rows = [...rows].reverse();

  const hasFilters = status !== "upcoming" || Boolean(kind);

  return (
    <div className="flex flex-col -mx-6 lg:-mx-8 -my-6 lg:-my-8 h-[calc(100vh_-_69px)]">
      <section className="bg-white flex flex-col flex-1 min-h-0">
        {/* Title + toolbar + primary action — one row */}
        <div className="px-6 lg:px-8 py-3 border-b border-ink-100 shrink-0 flex items-center gap-x-4 gap-y-3 flex-wrap">
          <h1 className="text-page-title text-ink-900 shrink-0">Events</h1>
          <div className="flex-1 min-w-0">
            <EventsToolbar />
          </div>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors shadow-sm shrink-0"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            New event
          </Link>
        </div>

        {/* Results table */}
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 bg-cream-100/60 border-b border-ink-100">
                <th className="py-3 pl-6 lg:pl-8 pr-3">Date</th>
                <th className="py-3 pr-3">Event</th>
                <th className="py-3 pr-3">Host</th>
                <th className="py-3 pr-3">When</th>
                <th className="py-3 pr-3">Duration</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3">Type</th>
                <th className="py-3 pr-6 lg:pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState hasFilters={hasFilters} status={status} />
                  </td>
                </tr>
              ) : (
                rows.map((e) => <EventAdminRow key={e.id} event={e} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: tip + count */}
        <div className="border-t border-ink-100 px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="inline-flex items-center gap-2 text-[12px] text-ink-500">
            <span className="size-6 rounded-full bg-rose-100 text-rose-500 inline-flex items-center justify-center shrink-0">
              <Sparkles className="size-3" strokeWidth={2} fill="currentColor" />
            </span>
            <span>
              <span className="font-semibold text-ink-700">Tip:</span> add a
              Google Meet or Zoom link so members can join in one tap.
            </span>
          </div>
          <span className="text-[12.5px] text-ink-500 tabular-nums">
            {rows.length} {rows.length === 1 ? "event" : "events"}
          </span>
        </div>
      </section>
    </div>
  );
}

/** Upcoming/past split — the per-request clock read lives outside the
 *  component body so the render itself stays pure. */
function filterByStatus(
  rows: EventRowData[],
  status: "upcoming" | "past" | "all",
): EventRowData[] {
  const now = Date.now();
  if (status === "upcoming") {
    return rows.filter((e) => new Date(e.starts_at).getTime() >= now);
  }
  if (status === "past") {
    return rows.filter((e) => new Date(e.starts_at).getTime() < now);
  }
  return rows;
}

function EmptyState({
  hasFilters,
  status,
}: {
  hasFilters: boolean;
  status: string;
}) {
  return (
    <div className="text-center text-[13px] text-ink-500 py-16">
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
        <CalendarClock className="size-5" strokeWidth={1.8} />
      </div>
      <div className="text-[14px] font-semibold text-ink-900 mb-1">
        {hasFilters
          ? "No events match these filters"
          : status === "past"
            ? "No past events"
            : "No upcoming events"}
      </div>
      <p className="max-w-md mx-auto leading-snug">
        {hasFilters ? (
          <>
            Try a different type or status, or{" "}
            <Link
              href="/admin/events"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              reset to upcoming
            </Link>
            .
          </>
        ) : (
          <>
            Schedule your first event with{" "}
            <Link
              href="/admin/events/new"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              New event
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
}
