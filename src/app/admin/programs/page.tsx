import { createServiceClient } from "@/lib/supabase/server";
import { CreateProgramForm } from "./create-form";
import { ProgramRow } from "./program-row";

export const metadata = { title: "Programs · Admin · Creator Growth OS" };

export default async function AdminProgramsPage() {
  const supabase = createServiceClient();

  const { data: programs } = await supabase
    .from("programs")
    .select(
      "id, slug, title, description, plan_access, total_lessons, estimated_days, published",
    )
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto">
      <header>
        <h1 className="font-display text-[36px] text-ink-900 leading-tight mb-1">
          Programs
        </h1>
        <p className="text-ink-500 text-[14px]">
          Create and manage learning paths. Lessons attach to programs from the
          Lessons page.
        </p>
      </header>

      <section className="card p-6">
        <h2 className="font-display text-[20px] text-ink-900 mb-4">
          New program
        </h2>
        <CreateProgramForm />
      </section>

      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-[20px] text-ink-900">All programs</h2>
          <span className="text-[12px] text-ink-500">
            {programs?.length ?? 0} total
          </span>
        </header>
        {!programs || programs.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No programs yet.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {programs.map((p) => (
              <ProgramRow key={p.id} program={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
