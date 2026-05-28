import "server-only";
import Link from "next/link";
import {
  ClipboardCheck,
  Sparkles,
  Clock,
  Check,
  ArrowRight,
  CircleDashed,
  Play,
} from "lucide-react";
import { getTaskTemplatesForSource, getUserTasks } from "@/lib/tasks/queries";
import type { AssignTrigger } from "@/lib/tasks/types";

/* ─────────────────────────────────────────────────────────────────────────
   Program video task card — shown under the Lesson Overview on
   /programs/[slug]/[lessonSlug].

   Reads the ONE unified task system (src/lib/tasks): the active program-video
   `task_templates` for this lesson, matched to the user's assigned `missions`
   so each row reflects real per-user status. Display-only — assignment is
   owned by the central assign flow. Renders nothing when the lesson has no
   program-video task. (Legacy lesson_task_templates was migrated into
   task_templates by 0038, so there is no second store to read.)
   ───────────────────────────────────────────────────────────────────────── */

type CardState = "completed" | "active" | "pending";

type DisplayTask = {
  key: string;
  title: string;
  description: string;
  points: number;
  minutes: number;
  taskType: string;
  difficulty: string | null;
  required: boolean;
  highPriority: boolean;
  state: CardState;
  trigger: AssignTrigger | null;
};

export async function ProgramVideoTasks({
  lessonId,
  userId,
  lessonCompleted,
}: {
  lessonId: string;
  userId: string;
  lessonCompleted: boolean;
}) {
  const [unifiedRaw, userTasks] = await Promise.all([
    getTaskTemplatesForSource("program_video", lessonId),
    getUserTasks(userId),
  ]);

  // Match each active template to the user's assigned task (mission), if any.
  const byTemplate = new Map(
    userTasks
      .filter((t) => t.taskTemplateId)
      .map((t) => [t.taskTemplateId as string, t]),
  );

  const display: DisplayTask[] = unifiedRaw
    .filter((t) => t.status === "active")
    .map((t) => {
      const ut = byTemplate.get(t.id) ?? null;
      const state: CardState =
        ut?.status === "completed" ? "completed" : ut ? "active" : "pending";
      return {
        key: `u:${t.id}`,
        title: t.title,
        description: t.description,
        points: t.points,
        minutes: t.estimatedMinutes,
        taskType: t.taskType,
        difficulty: t.difficulty,
        required: t.isRequired,
        highPriority: false,
        state,
        trigger: t.autoAssignTrigger,
      };
    });

  if (display.length === 0) return null;

  const allAssigned = display.every((d) => d.state !== "pending");

  return (
    <section className="card p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <ClipboardCheck className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            {display.length === 1 ? "Your Lesson Task" : "Your Lesson Tasks"}
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            {allAssigned
              ? "Added to your missions — complete them anytime"
              : "A practical step tied to this lesson, ready in your missions"}
          </p>
        </div>
        <HeaderPill allAssigned={allAssigned} />
      </div>

      <div className="space-y-3">
        {display.map((task) => (
          <TaskCard key={task.key} task={task} lessonCompleted={lessonCompleted} />
        ))}
      </div>
    </section>
  );
}

function HeaderPill({ allAssigned }: { allAssigned: boolean }) {
  if (allAssigned) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-bg text-success text-[12px] font-semibold shrink-0 whitespace-nowrap">
        <Check className="size-3.5" strokeWidth={3} />
        In your Tasks
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-[12px] font-semibold shrink-0 whitespace-nowrap">
      <Sparkles className="size-3.5" strokeWidth={2} fill="currentColor" />
      Linked to this lesson
    </span>
  );
}

function TaskCard({
  task,
  lessonCompleted,
}: {
  task: DisplayTask;
  lessonCompleted: boolean;
}) {
  const tone =
    task.state === "completed"
      ? "bg-success-bg/40 border-success/30"
      : "bg-rose-50 border-rose-100";

  return (
    <div className={`rounded-[14px] border p-4 sm:p-5 ${tone}`}>
      <div className="flex items-start gap-3">
        <StatusMarker state={task.state} />

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-ink-900 leading-snug mb-1">
            {task.title}
          </div>
          {task.description && (
            <p className="text-[13px] text-ink-700 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-semibold text-rose-700">
              <Sparkles className="size-3" fill="currentColor" strokeWidth={0} />
              +{task.points} pts
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-700">
              <Clock className="size-3" strokeWidth={2} />~{task.minutes} min
            </span>
            <span className="inline-flex items-center rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-700 capitalize">
              {task.taskType}
            </span>
            {task.difficulty && (
              <span className="inline-flex items-center rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-700 capitalize">
                {task.difficulty}
              </span>
            )}
            {task.required && (
              <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-[11.5px] font-semibold">
                Required
              </span>
            )}
            {task.highPriority && (
              <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-[11.5px] font-semibold">
                High priority
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className={`h-px my-4 ${task.state === "completed" ? "bg-success/20" : "bg-rose-200/60"}`}
      />

      <Footer state={task.state} trigger={task.trigger} lessonCompleted={lessonCompleted} />
    </div>
  );
}

function StatusMarker({ state }: { state: CardState }) {
  if (state === "completed") {
    return (
      <span
        aria-hidden
        className="size-7 rounded-full bg-success text-white inline-flex items-center justify-center shrink-0 mt-0.5"
      >
        <Check className="size-4" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span
        aria-hidden
        className="size-7 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shrink-0 mt-0.5"
      >
        <Play className="size-3 ml-0.5" fill="currentColor" strokeWidth={0} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="size-7 rounded-full border-2 border-rose-300 bg-white inline-flex items-center justify-center shrink-0 mt-0.5 text-rose-300"
    >
      <CircleDashed className="size-4" strokeWidth={2} />
    </span>
  );
}

function Footer({
  state,
  trigger,
  lessonCompleted,
}: {
  state: CardState;
  trigger: AssignTrigger | null;
  lessonCompleted: boolean;
}) {
  if (state === "completed") {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12px] text-ink-500 leading-snug">
          Completed — nice work. You can revisit it anytime.
        </p>
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-success text-white text-[13.5px] font-semibold transition-colors shrink-0 hover:opacity-90"
        >
          View in My Tasks
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </Link>
      </div>
    );
  }

  if (state === "active") {
    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12px] text-ink-500 leading-snug">
          Already in your Tasks — mark it complete when you&apos;ve taken action.
        </p>
        <Link
          href="/missions"
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors shrink-0"
        >
          Open in My Tasks
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </Link>
      </div>
    );
  }

  // pending — not yet in the user's missions. Message keyed to the trigger.
  const hint =
    trigger === "on_complete"
      ? lessonCompleted
        ? "This task is being added to your missions."
        : "Complete this video to add it to your missions."
      : trigger === "on_start"
        ? "Starts when you begin this lesson — then it appears in your missions."
        : "Linked to this lesson — it will appear in your missions when assigned.";

  const pill =
    trigger === "on_complete" ? "Unlocks on completion" : "Unlocks on start";

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <p className="text-[12px] text-ink-500 leading-snug">{hint}</p>
      <span className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-100 text-rose-700 text-[13.5px] font-semibold shrink-0">
        <Sparkles className="size-3.5" strokeWidth={2} fill="currentColor" />
        {pill}
      </span>
    </div>
  );
}
