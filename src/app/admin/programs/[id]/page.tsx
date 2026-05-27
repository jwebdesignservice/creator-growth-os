import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Pencil,
  BookOpen,
  Crown,
  ListChecks,
  Layers,
  Check,
  Settings2,
  Sparkles,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { getCurriculumForProgram } from "@/lib/programs/queries";
import { cn } from "@/lib/cn";
import { CurriculumOutline } from "./curriculum-outline";
import { PublishButton } from "./publish-button";
import {
  EditTitleButton,
  EditDescriptionButton,
  EditThumbnailButton,
  PlanAccessPicker,
  SalesPageEditor,
  ProgramHeaderActions,
  PreviewProgramLink,
} from "./program-detail-editors";

export const metadata = { title: "Program Setup Guide · Admin" };

type Params = Promise<{ id: string }>;

export default async function AdminProgramDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: program } = await supabase
    .from("programs")
    .select(
      "id, slug, title, description, plan_access, cover_image_url, total_lessons, total_tasks, estimated_days, published, archived, sales_page_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  const modules = await getCurriculumForProgram(program.slug, "pro");
  const moduleCount = modules.length;
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalTasks = program.total_tasks ?? 0;

  // Setup checklist — derived from program completeness
  const checks: { key: string; label: string; done: boolean }[] = [
    { key: "title", label: "Add program title", done: !!program.title?.trim() },
    { key: "curriculum", label: "Complete curriculum", done: lessonCount > 0 },
    { key: "thumbnail", label: "Add thumbnail", done: !!program.cover_image_url },
    { key: "access", label: "Choose access tier", done: !!program.plan_access },
    { key: "sales", label: "Connect sales page", done: false },
  ];
  const completedChecks = checks.filter((c) => c.done).length;
  const readinessPct = Math.round((completedChecks / checks.length) * 100);

  const accessLabel =
    program.plan_access.charAt(0).toUpperCase() + program.plan_access.slice(1);

  return (
    <div className="space-y-6 container-dashboard">
      {/* Header — breadcrumb + title + actions */}
      <header>
        <nav className="text-[12.5px] mb-2">
          <Link
            href="/admin/programs"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Programs
          </Link>
          <span className="mx-2 text-ink-400">/</span>
          <span className="text-ink-700">{program.title}</span>
        </nav>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-h1 sm:text-[36px] text-ink-900 leading-tight">
                Program Setup Guide
              </h1>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold",
                  program.published
                    ? "bg-success-bg text-success border border-success/20"
                    : "bg-ink-100 text-ink-600 border border-ink-200",
                )}
              >
                {program.published ? "Published" : "Draft"}
              </span>
            </div>
            <p className="mt-2 text-[14px] text-ink-500 max-w-2xl">
              Build, customize, and publish your program. Follow the steps to
              make it discoverable and launch-ready.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <PreviewProgramLink slug={program.slug} />
            <PublishButton programId={program.id} published={program.published} />
            <ProgramHeaderActions
              programId={program.id}
              programTitle={program.title}
              archived={program.archived}
            />
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] gap-5 items-start">
        {/* ── Left: numbered setup cards ──────────────────────────────── */}
        <div className="space-y-5 min-w-0">
          <StepCard
            n={1}
            title="Build your curriculum"
            subtitle="Create and organize the learning experience for your members."
            actions={
              <>
                <Link
                  href={`/programs/${program.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
                >
                  <Eye className="size-3.5" strokeWidth={2} />
                  Preview curriculum
                </Link>
                <Link
                  href={`/admin/programs/${program.id}/curriculum`}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-200 text-[12.5px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  <Pencil className="size-3.5" strokeWidth={2} />
                  Edit curriculum
                </Link>
              </>
            }
          >
            <CurriculumOutline modules={modules} />
          </StepCard>

          <StepCard
            n={2}
            title="Access & pricing"
            subtitle="Choose who can access your program and how it's offered."
          >
            <PlanAccessPicker
              programId={program.id}
              current={program.plan_access as "free" | "basic" | "pro"}
            />
          </StepCard>

          <StepCard
            n={3}
            title="Sales flow"
            subtitle="Connect your program to a sales page where members can discover and purchase."
          >
            <div className="space-y-3">
              <SalesPageEditor
                programId={program.id}
                currentUrl={program.sales_page_url}
              />
              <div className="rounded-[10px] bg-rose-50/60 border border-rose-100 px-3 py-2.5 flex items-center gap-2">
                <Sparkles className="size-3.5 text-rose-500 shrink-0" strokeWidth={2} />
                <p className="text-[12.5px] text-ink-700 leading-snug">
                  A high-converting sales page can significantly increase program
                  enrollments.{" "}
                  <Link
                    href="/support"
                    className="text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Learn best practices →
                  </Link>
                </p>
              </div>
            </div>
          </StepCard>
        </div>

        {/* ── Right: sidebar ──────────────────────────────────────────── */}
        <aside className="space-y-5 min-w-0">
          {/* Customize */}
          <section className="card p-5">
            <header className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-ink-900">
                Customize your program
              </h3>
              <Settings2 className="size-4 text-ink-400" strokeWidth={2} />
            </header>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-ink-500 mb-0.5">
                    Program title
                  </div>
                  <div className="text-[13px] font-semibold text-ink-900 truncate">
                    {program.title}
                  </div>
                </div>
                <EditTitleButton
                  programId={program.id}
                  currentTitle={program.title}
                />
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-ink-500 mb-0.5">
                    Program description
                  </div>
                  <div className="text-[13px] font-semibold text-ink-900 truncate">
                    {program.description && program.description.length > 0
                      ? program.description.length > 60
                        ? `${program.description.slice(0, 60)}…`
                        : program.description
                      : "—"}
                  </div>
                </div>
                <EditDescriptionButton
                  programId={program.id}
                  currentDescription={program.description}
                />
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-ink-500 mb-1">
                    Thumbnail
                  </div>
                  <div className="w-full max-w-[160px] h-[68px] rounded-[8px] overflow-hidden bg-gradient-to-br from-rose-100 via-rose-50 to-cream-200">
                    {program.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={program.cover_image_url}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <EditThumbnailButton
                  programId={program.id}
                  currentUrl={program.cover_image_url}
                />
              </li>

              <li className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] text-ink-500 mb-0.5">
                    Curriculum layout
                  </div>
                  <div className="text-[13px] font-semibold text-ink-900 truncate">
                    Accordion
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* Program snapshot */}
          <section className="card p-5">
            <header className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-ink-900">
                Program snapshot
              </h3>
              <BarChart3 className="size-4 text-rose-500" strokeWidth={2} />
            </header>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <SnapshotStat icon={BookOpen} value={lessonCount} label="Lessons" />
              <SnapshotStat icon={Layers} value={moduleCount} label="Modules" />
              <SnapshotStat
                icon={ListChecks}
                value={totalTasks > 0 ? 1 : 0}
                label="Task flow"
              />
              <SnapshotStat icon={Crown} value={accessLabel} label="Access" />
            </div>
            <div>
              <div className="flex items-center justify-between text-[12px] text-ink-500 mb-1.5">
                <span>Program readiness</span>
                <span className="font-semibold text-ink-900 tabular-nums">
                  {readinessPct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-[width] duration-500"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
            </div>
          </section>

          {/* Setup checklist */}
          <section className="card p-5">
            <header className="flex items-center justify-between mb-1.5">
              <h3 className="text-[15px] font-bold text-ink-900">Setup checklist</h3>
              <ListChecks className="size-4 text-rose-500" strokeWidth={2} />
            </header>
            <p className="text-[12px] text-ink-500 mb-3 tabular-nums">
              {completedChecks} / {checks.length} completed
            </p>
            <ul className="space-y-2.5">
              {checks.map((c) => (
                <li key={c.key} className="flex items-center gap-2.5">
                  {c.done ? (
                    <span className="size-5 rounded-full bg-rose-500 text-white inline-flex items-center justify-center shrink-0">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="size-5 rounded-full border-2 border-ink-200 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-[13px]",
                      c.done ? "text-ink-400 line-through" : "text-ink-700",
                    )}
                  >
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ─── Local UI bits ──────────────────────────────────────────────────────── */

function StepCard({
  n,
  title,
  subtitle,
  actions,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="size-7 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
            {n}
          </span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold text-ink-900 leading-tight">
              {title}
            </h2>
            <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">{actions}</div>
        )}
      </header>
      {children}
    </section>
  );
}

function SnapshotStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-[10px] bg-cream-100/60 border border-ink-100 p-2.5 text-center">
      <Icon className="size-4 mx-auto text-rose-500" strokeWidth={2} />
      <div className="text-[15px] font-bold text-ink-900 mt-1 tabular-nums">
        {value}
      </div>
      <div className="text-[10.5px] text-ink-500 mt-0.5">{label}</div>
    </div>
  );
}
