import { createServiceClient } from "@/lib/supabase/server";
import { CreateLessonForm } from "./create-form";
import { LessonRow } from "./lesson-row";

export const metadata = { title: "Lessons · Admin · Creator Growth OS" };

type LessonListRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  program_id: string | null;
  plan_access: "free" | "basic" | "pro";
  duration_seconds: number;
  module_number: number | null;
  module_title: string | null;
  published: boolean;
  program_title?: string;
};

export default async function AdminLessonsPage() {
  const supabase = createServiceClient();

  const [{ data: lessons }, { data: programs }] = await Promise.all([
    supabase
      .from("lessons")
      .select(
        "id, slug, title, description, program_id, plan_access, duration_seconds, module_number, module_title, published",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("programs")
      .select("id, title")
      .order("sort_order", { ascending: true }),
  ]);

  const programMap = new Map(programs?.map((p) => [p.id, p.title]) ?? []);
  const lessonsWithProgram: LessonListRow[] = (lessons ?? []).map((l) => ({
    ...l,
    program_title: l.program_id ? programMap.get(l.program_id) : undefined,
  }));

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto">
      <header>
        <h1 className="font-display text-[36px] text-ink-900 leading-tight mb-1">
          Lessons
        </h1>
        <p className="text-ink-500 text-[14px]">
          Create and publish tutorials. Publishing notifies every user on the
          right plan tier.
        </p>
      </header>

      <section className="card p-6">
        <h2 className="font-display text-[20px] text-ink-900 mb-4">
          New lesson
        </h2>
        <CreateLessonForm
          programs={(programs ?? []).map((p) => ({ id: p.id, title: p.title }))}
        />
      </section>

      <section className="card overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-[20px] text-ink-900">All lessons</h2>
          <span className="text-[12px] text-ink-500">
            {lessonsWithProgram.length} total
          </span>
        </header>
        {lessonsWithProgram.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-500">
            No lessons yet.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {lessonsWithProgram.map((l) => (
              <LessonRow key={l.id} lesson={l} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
