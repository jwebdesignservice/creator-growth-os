import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, BookOpen, Box, FilePen, CheckCircle2 } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { CurriculumEditor } from "./curriculum-editor";

export const metadata = { title: "Curriculum · Admin" };

type Params = Promise<{ id: string }>;

export type ModuleRow = {
  id: string;
  number: number;
  title: string;
  bonus: boolean;
  pro_only: boolean;
};

export type LessonRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number;
  module_number: number | null;
  module_title: string | null;
  plan_access: "free" | "basic" | "pro";
  published: boolean;
  archived: boolean;
  sort_order: number;
};

export type TaskTemplate = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  task_type: string;
  priority: "low" | "normal" | "high";
  estimated_minutes: number;
  points: number;
  is_required: boolean;
  sort_order: number;
};

export default async function CurriculumEditorPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, title, published")
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  // Modules from the first-class table.
  const { data: rawModules } = await supabase
    .from("program_modules")
    .select("id, number, title, bonus, pro_only")
    .eq("program_id", program.id)
    .order("number", { ascending: true });

  const modules: ModuleRow[] = (rawModules ?? []).map((m) => ({
    id: m.id,
    number: m.number,
    title: m.title,
    bonus: !!m.bonus,
    pro_only: !!m.pro_only,
  }));

  // Lessons for the whole program.
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, video_url, duration_seconds, module_number, module_title, plan_access, published, archived, sort_order",
    )
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  const lessons: LessonRow[] = (rawLessons ?? []).map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    video_url: l.video_url,
    duration_seconds: l.duration_seconds ?? 0,
    module_number: l.module_number,
    module_title: l.module_title,
    plan_access: l.plan_access as "free" | "basic" | "pro",
    published: !!l.published,
    archived: !!l.archived,
    sort_order: l.sort_order ?? 0,
  }));

  // Task templates for every lesson, grouped by lesson_id.
  const lessonIds = lessons.map((l) => l.id);
  let templates: TaskTemplate[] = [];
  if (lessonIds.length > 0) {
    const { data: rawTemplates } = await supabase
      .from("lesson_task_templates")
      .select(
        "id, lesson_id, title, description, task_type, priority, estimated_minutes, points, is_required, sort_order",
      )
      .in("lesson_id", lessonIds)
      .order("sort_order", { ascending: true });

    templates = (rawTemplates ?? []).map((t) => ({
      id: t.id,
      lesson_id: t.lesson_id,
      title: t.title,
      description: t.description,
      task_type: t.task_type,
      priority: (t.priority as "low" | "normal" | "high") ?? "normal",
      estimated_minutes: t.estimated_minutes ?? 15,
      points: t.points ?? 10,
      is_required: !!t.is_required,
      sort_order: t.sort_order ?? 0,
    }));
  }

  const templatesByLesson: Record<string, TaskTemplate[]> = {};
  for (const t of templates) {
    if (!templatesByLesson[t.lesson_id]) templatesByLesson[t.lesson_id] = [];
    templatesByLesson[t.lesson_id]!.push(t);
  }

  // Quick stats for the bar at the top.
  const moduleCount = modules.length;
  const lessonCount = lessons.filter((l) => !l.archived).length;
  const draftCount = lessons.filter((l) => !l.published && !l.archived).length;
  const taskFlowCount = templates.length;

  return (
    <div className="space-y-6 container-dashboard">
      {/* Breadcrumb + title + Preview */}
      <header>
        <nav className="text-[12.5px] mb-2">
          <Link
            href={`/admin/programs/${program.id}`}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Programs
          </Link>
          <span className="mx-2 text-ink-400">/</span>
          <span className="text-ink-700">{program.title}</span>
        </nav>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-display text-[34px] sm:text-[36px] text-ink-900 leading-tight">
              Curriculum
            </h1>
            <p className="mt-2 text-[14px] text-ink-500 max-w-2xl">
              Structure the learning journey with modules, lessons, and action
              steps.
            </p>
          </div>
          <a
            href={`/programs/${program.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors shrink-0"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </a>
        </div>
      </header>

      {/* Stats bar */}
      <section className="card p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBlock icon={BookOpen} value={lessonCount} label="lessons" />
          <StatBlock icon={Box} value={moduleCount} label="modules" />
          <StatBlock icon={FilePen} value={draftCount} label="draft items" />
          <StatBlock
            icon={CheckCircle2}
            value={taskFlowCount}
            label="task templates"
          />
        </div>
      </section>

      {/* Interactive editor */}
      <CurriculumEditor
        programId={program.id}
        modules={modules}
        lessons={lessons}
        templatesByLesson={templatesByLesson}
      />
    </div>
  );
}

function StatBlock({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="size-10 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[20px] font-bold text-ink-900 tabular-nums leading-none">
          {value}
        </div>
        <div className="text-[12px] text-ink-500 mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}
