import { Megaphone } from "lucide-react";
import { getAnnouncements } from "@/lib/admin/queries";
import { ComposeForm } from "./compose-form";
import { DeleteButton } from "./delete-button";

export const metadata = { title: "Announcements · Admin · Creator Growth OS" };

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  monetization: "Monetization",
  scale: "Scale",
};

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-6 container-app">
      <header>
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">
          Announcements
        </h1>
        <p className="text-ink-500 text-[14px]">
          Broadcast updates to everyone or a specific segment. Visible in
          members&apos; dashboards.
        </p>
      </header>

      {/* Compose */}
      <section className="card p-6">
        <h2 className="text-h4 text-ink-900 mb-4">
          New broadcast
        </h2>
        <ComposeForm />
      </section>

      {/* List */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="text-h4 text-ink-900">Published</h2>
          <span className="text-[12px] text-ink-500">
            {announcements.length} total
          </span>
        </header>
        {announcements.length === 0 ? (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
              <Megaphone className="size-5" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] text-ink-500">
              Nothing published yet. Send your first update above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {announcements.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                    <Megaphone className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-[14.5px] font-semibold text-ink-900">
                        {a.title}
                      </h3>
                      {a.audience_plan && (
                        <span className="chip chip-rose capitalize">
                          {a.audience_plan}
                        </span>
                      )}
                      {a.audience_category && (
                        <span className="chip bg-cream-100 text-ink-700">
                          {CATEGORY_LABEL[a.audience_category] ?? a.audience_category}
                        </span>
                      )}
                      {!a.audience_plan && !a.audience_category && (
                        <span className="chip bg-cream-100 text-ink-700">
                          All members
                        </span>
                      )}
                    </div>
                    {a.body && (
                      <p className="text-[13px] text-ink-700 leading-relaxed mb-2">
                        {a.body}
                      </p>
                    )}
                    <div className="text-[11.5px] text-ink-500">
                      Published{" "}
                      {new Date(a.published_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <DeleteButton id={a.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
