import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { EventForm } from "../event-form";

export const metadata = { title: "New event · Admin · Profluencer" };

export default async function NewEventPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  return (
    <div className="space-y-6 container-app max-w-3xl">
      <header>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-500 hover:text-rose-600 transition-colors mb-3"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
          Back to events
        </Link>
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">New event</h1>
        <p className="text-ink-500 text-[14px]">
          Schedule a live session, Q&amp;A or workshop. It appears in the
          members&apos; Community → Events tab.
        </p>
      </header>

      <section className="card p-6">
        <EventForm userId={ctx.user.id} redirectTo="/admin/events" />
      </section>
    </div>
  );
}
