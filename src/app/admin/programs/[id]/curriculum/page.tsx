import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Upload,
  Search,
  Filter,
  SlidersHorizontal,
  BookOpen,
  Box,
  FilePen,
  CheckCircle2,
  Plus,
  Lightbulb,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { getCurriculumForProgram } from "@/lib/programs/queries";
import { ModuleList } from "./module-list";

export const metadata = { title: "Curriculum · Admin" };

type Params = Promise<{ id: string }>;

export default async function CurriculumEditorPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, title, total_lessons, total_tasks, published")
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  const modules = await getCurriculumForProgram(program.slug, "pro");
  const moduleCount = modules.length;
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  // Until lessons carry a publish flag of their own, every lesson is a draft.
  const draftCount = lessonCount;
  const taskFlowCount = (program.total_tasks ?? 0) > 0 ? 1 : 0;

  return (
    <div className="space-y-6 max-w-[1320px] mx-auto">
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
          <Link
            href={`/programs/${program.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-ink-900 text-[13px] font-medium hover:bg-cream-100 transition-colors shrink-0"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </Link>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
        >
          <Pencil className="size-3.5" strokeWidth={2} />
          Bulk edit
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
        >
          <Upload className="size-3.5" strokeWidth={2} />
          Import content
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search lessons…"
              aria-label="Search lessons"
              className="h-10 pl-9 pr-3 w-[200px] sm:w-[240px] rounded-[10px] bg-white border border-ink-100 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors cursor-pointer"
          >
            <Filter className="size-3.5" strokeWidth={2} />
            Filter
          </button>
          <button
            type="button"
            aria-label="View options"
            className="size-10 rounded-[10px] bg-white border border-ink-200 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <section className="card p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBlock icon={BookOpen} value={lessonCount} label="lessons" />
          <StatBlock icon={Box} value={moduleCount} label="modules" />
          <StatBlock icon={FilePen} value={draftCount} label="draft items" />
          <StatBlock icon={CheckCircle2} value={taskFlowCount} label="task flow" />
        </div>
      </section>

      {/* Module list — client expand/collapse */}
      <ModuleList modules={modules} />

      {/* Add new module */}
      <button
        type="button"
        className="w-full inline-flex items-center justify-center gap-2 py-5 rounded-[14px] border-2 border-dashed border-rose-200 bg-rose-50/30 hover:bg-rose-50/70 text-[14px] font-semibold text-rose-600 transition-colors cursor-pointer"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        Add new module
      </button>

      {/* Tip */}
      <div className="rounded-[14px] bg-cream-100/60 border border-cream-300 p-4 flex items-start gap-3">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Lightbulb className="size-4" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-ink-700 leading-snug">
            <span className="font-semibold text-ink-900">Tip:</span> Start each
            module with a clear outcome and end with an action step.
          </p>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 shrink-0"
        >
          Learn more about curriculum best practices
          <ArrowUpRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
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
