import { getMissionTemplates } from "@/lib/admin/queries";
import { CreateMissionForm } from "./create-form";
import { TemplateRow } from "./template-row";

export const metadata = { title: "Missions · Admin · Creator Growth OS" };

export default async function AdminMissionsPage() {
  const templates = await getMissionTemplates();

  return (
    <div className="space-y-6 container-app">
      <header>
        <h1 className="font-display text-[36px] text-ink-900 leading-tight mb-1">
          Mission Templates
        </h1>
        <p className="text-ink-500 text-[14px]">
          Author missions once, then bulk-assign to any category + plan with one
          click.
        </p>
      </header>

      {/* Create form */}
      <section className="card p-6">
        <h2 className="font-display text-[20px] text-ink-900 mb-4">
          Create new mission template
        </h2>
        <CreateMissionForm />
      </section>

      {/* List */}
      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-[20px] text-ink-900">Templates</h2>
          <span className="text-[12px] text-ink-500">
            {templates.length} total
          </span>
        </header>
        {templates.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No templates yet. Create your first above.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {templates.map((t) => (
              <TemplateRow key={t.id} template={t} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
