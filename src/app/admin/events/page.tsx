import { CalendarDays } from "lucide-react";
import { getAdminEvents, type AdminEvent } from "@/lib/admin/queries";
import { eventKindLabel } from "@/lib/community/event-kinds";
import { EventForm } from "./event-form";
import { DeleteEventButton } from "./delete-button";

export const metadata = { title: "Events · Admin · Creator Growth OS" };

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminEventsPage() {
  const events = await getAdminEvents();
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  // Most-recently-ended first.
  const past = events
    .filter((e) => new Date(e.starts_at).getTime() < now)
    .reverse();

  return (
    <div className="space-y-6 container-app">
      <header>
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">Events</h1>
        <p className="text-ink-500 text-[14px]">
          Schedule live sessions, Q&amp;As and workshops. They appear in the
          members&apos; Community → Events tab.
        </p>
      </header>

      {/* Create */}
      <section className="card p-6">
        <h2 className="text-h4 text-ink-900 mb-4">New event</h2>
        <EventForm />
      </section>

      {/* Upcoming */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-h4 text-ink-900">Upcoming</h2>
          <span className="text-[12px] text-ink-500">
            {upcoming.length} scheduled
          </span>
        </header>
        {upcoming.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
              <CalendarDays className="size-5" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] text-ink-500">
              No upcoming events. Create one above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {upcoming.map((e) => (
              <AdminEventRow key={e.id} event={e} />
            ))}
          </ul>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="card overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <h2 className="text-h4 text-ink-900">Past</h2>
            <span className="text-[12px] text-ink-500">{past.length} ended</span>
          </header>
          <ul className="divide-y divide-ink-100">
            {past.map((e) => (
              <AdminEventRow key={e.id} event={e} past />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AdminEventRow({ event: e, past = false }: { event: AdminEvent; past?: boolean }) {
  return (
    <li className={`px-5 py-4${past ? " opacity-70" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="chip chip-rose">{eventKindLabel(e.kind)}</span>
            {past && <span className="chip bg-cream-100 text-ink-700">Ended</span>}
            <h3 className="text-[14.5px] font-semibold text-ink-900">
              {e.title}
            </h3>
          </div>
          {e.description && (
            <p className="text-[13px] text-ink-700 leading-relaxed mb-2 line-clamp-2">
              {e.description}
            </p>
          )}
          <div className="text-[11.5px] text-ink-500 flex items-center gap-2 flex-wrap">
            <span>{formatWhen(e.starts_at)}</span>
            <span aria-hidden>·</span>
            <span>{e.duration_min} min</span>
            {e.host_name && (
              <>
                <span aria-hidden>·</span>
                <span>{e.host_name}</span>
              </>
            )}
            {e.url && (
              <>
                <span aria-hidden>·</span>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-600 hover:underline"
                >
                  Join link
                </a>
              </>
            )}
          </div>
        </div>
        <DeleteEventButton id={e.id} />
      </div>
    </li>
  );
}
