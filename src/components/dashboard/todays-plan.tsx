import Link from "next/link";
import {
  GraduationCap,
  ClipboardList,
  Send,
  BarChart3,
  Users,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Status =
  | { kind: "done"; label: string }
  | { kind: "progress"; label: string }
  | { kind: "count"; label: string }
  | { kind: "action"; label: string; href: string }
  | { kind: "action-muted"; label: string; href: string };

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
  done: boolean;
  status: Status;
};

/**
 * Today's Plan — a guided "daily creator session" of five fixed steps,
 * shown as a connected timeline. Step 2 reflects real task progress; the
 * rest are the session template.
 */
export function TodaysPlan({
  tasksCompleted,
  tasksTotal,
}: {
  tasksCompleted: number;
  tasksTotal: number;
}) {
  const taskGoal = Math.max(tasksTotal, 2);
  const steps: Step[] = [
    {
      icon: GraduationCap,
      title: "Watch 1 lesson",
      desc: "Learn something new",
      done: true,
      status: { kind: "done", label: "Completed" },
    },
    {
      icon: ClipboardList,
      title: "Complete 2 creator tasks",
      desc: "Make progress on your goals",
      done: tasksCompleted >= taskGoal,
      status: { kind: "progress", label: `${tasksCompleted} of ${taskGoal}` },
    },
    {
      icon: Send,
      title: "Publish or schedule 1 post",
      desc: "Share content with your audience",
      done: false,
      status: { kind: "action", label: "Do this", href: "/posting" },
    },
    {
      icon: BarChart3,
      title: "Review yesterday's result",
      desc: "See what worked and improve",
      done: false,
      status: { kind: "action-muted", label: "Review", href: "/performance" },
    },
    {
      icon: Users,
      title: "Send 3 brand outreach messages",
      desc: "Build relationships and opportunities",
      done: false,
      status: { kind: "count", label: "0 of 3" },
    },
  ];

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="p-[var(--space-card-padding-sm)] flex-1">
        <header className="mb-4">
          <h3 className="text-h4 text-ink-900">Today&apos;s Plan</h3>
          <p className="text-[12.5px] text-ink-500">Your daily creator session</p>
        </header>

        <ol>
          {steps.map((s, i) => (
            <StepRow
              key={s.title}
              step={s}
              index={i}
              isFirst={i === 0}
              isLast={i === steps.length - 1}
            />
          ))}
        </ol>
      </div>

      <Link
        href="/missions"
        className="flex items-center justify-center gap-1.5 py-3.5 bg-rose-50 text-rose-600 text-[13.5px] font-semibold hover:bg-rose-100 transition-colors"
      >
        Continue Session <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
    </div>
  );
}

function StepRow({
  step,
  index,
  isFirst,
  isLast,
}: {
  step: Step;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const Icon = step.icon;
  return (
    <li className="flex items-center gap-3 py-2">
      {/* Timeline marker */}
      <div className="relative self-stretch flex flex-col items-center justify-center w-7 shrink-0">
        {!isFirst && (
          <span
            aria-hidden
            className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-0.5 bg-ink-100"
          />
        )}
        {!isLast && (
          <span
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1/2 w-0.5 bg-ink-100"
          />
        )}
        <span
          className={cn(
            "relative z-[1] size-7 rounded-full inline-flex items-center justify-center text-[11px] font-semibold",
            step.done
              ? "bg-rose-500 text-white"
              : "border-2 border-ink-200 text-ink-400 bg-white",
          )}
        >
          {step.done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
        </span>
      </div>

      {/* Icon */}
      <span className="size-10 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[18px]" strokeWidth={1.8} />
      </span>

      {/* Title + desc */}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">
          {step.title}
        </div>
        <div className="text-[12px] text-ink-500 leading-snug truncate">
          {step.desc}
        </div>
      </div>

      {/* Status / action */}
      <StatusBadge status={step.status} />
    </li>
  );
}

function StatusBadge({ status }: { status: Status }) {
  switch (status.kind) {
    case "done":
      return (
        <span className="text-[12.5px] font-semibold text-success shrink-0">
          {status.label}
        </span>
      );
    case "progress":
      return (
        <span className="text-[12.5px] font-semibold text-rose-600 shrink-0">
          {status.label}
        </span>
      );
    case "count":
      return (
        <span className="text-[12.5px] font-medium text-ink-400 shrink-0">
          {status.label}
        </span>
      );
    case "action":
      return (
        <Link
          href={status.href}
          className="shrink-0 inline-flex items-center h-8 px-3.5 rounded-full bg-rose-100 text-rose-700 text-[12.5px] font-semibold hover:bg-rose-200 transition-colors"
        >
          {status.label}
        </Link>
      );
    case "action-muted":
      return (
        <Link
          href={status.href}
          className="shrink-0 inline-flex items-center h-8 px-3.5 rounded-full bg-cream-200 text-ink-700 text-[12.5px] font-semibold hover:bg-cream-300 transition-colors"
        >
          {status.label}
        </Link>
      );
  }
}
