"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CalendarDays,
  TrendingUp,
  CalendarClock,
  FileText,
  CalendarX,
  Clock,
  MessageSquarePlus,
  ListPlus,
  BellRing,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import type {
  AdminPlanRow,
  AdminReviewState,
} from "@/lib/admin/posting-queries";
import {
  setReviewStatus,
  saveAdminNote,
  sendReminder,
  addFeedback,
  assignTask,
  type ActionResult,
} from "@/app/admin/posting/actions";

export function PostingPlanDrawer({
  plan,
  onClose,
}: {
  plan: AdminPlanRow | null;
  onClose: () => void;
}) {
  // Persist the last plan through the slide-out so content doesn't vanish
  // mid-animation. Adopting it during render (not in an effect) is the
  // React-recommended "adjust state when a prop changes" pattern.
  const [shown, setShown] = useState<AdminPlanRow | null>(plan);
  const open = Boolean(plan);
  if (plan && plan !== shown) {
    setShown(plan);
  }

  // When closed, clear the retained content after the slide-out finishes.
  useEffect(() => {
    if (plan) return;
    const t = window.setTimeout(() => setShown(null), 250);
    return () => window.clearTimeout(t);
  }, [plan]);

  // ESC to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // The admin <main> is a sibling of the backdrop-filter header (not a
  // descendant), so a plain fixed panel positions against the viewport
  // correctly — no portal needed.
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink-900/50 transition-opacity duration-300 ease-out",
          open
            ? "opacity-100 backdrop-blur-[3px] pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Plan details"
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-full max-w-[460px] bg-cream-100 border-l border-ink-100 shadow-2xl flex flex-col will-change-transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
      >
        {shown && (
          <DrawerContent key={shown.id} plan={shown} onClose={onClose} />
        )}
      </aside>
    </>
  );
}

/* ── Content ──────────────────────────────────────────────────────────── */

function DrawerContent({
  plan,
  onClose,
}: {
  plan: AdminPlanRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null,
  );

  const [note, setNote] = useState(plan.adminNote);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("");

  const noteChanged = note.trim() !== plan.adminNote.trim();

  function run(
    fn: () => Promise<ActionResult>,
    successMsg: string,
    after?: () => void,
  ) {
    setFlash(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setFlash({ kind: "ok", msg: successMsg });
        after?.();
        router.refresh();
      } else {
        setFlash({ kind: "err", msg: res.error });
      }
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-ink-100 shrink-0">
        <div className="min-w-0">
          <div className="text-[11px] font-bold tracking-wider uppercase text-ink-400">
            {plan.creatorName}
          </div>
          <h2 className="text-h4 text-ink-900 leading-tight truncate">
            {plan.title}
          </h2>
          {plan.creatorEmail && (
            <div className="text-[12px] text-ink-500 truncate">
              {plan.creatorEmail}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="size-9 rounded-full inline-flex items-center justify-center text-ink-600 hover:bg-cream-200 transition-colors shrink-0"
        >
          <X className="size-[18px]" strokeWidth={1.9} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6">
        {/* Flash */}
        {flash && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-[12px] px-3.5 py-2.5 text-[12.5px] leading-snug",
              flash.kind === "ok"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-rose-50 border border-rose-200 text-rose-700",
            )}
          >
            {flash.kind === "ok" ? (
              <CheckCircle2 className="size-4 shrink-0 mt-px" strokeWidth={1.9} />
            ) : (
              <AlertCircle className="size-4 shrink-0 mt-px" strokeWidth={1.9} />
            )}
            <span>{flash.msg}</span>
          </div>
        )}

        {/* Status row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Pill className="bg-ink-100 text-ink-600 capitalize">{plan.status}</Pill>
          <HealthPill health={plan.health} />
          <ReviewPill state={plan.reviewState} />
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={CalendarDays} label="Week of" value={formatWeek(plan.weekStart)} />
          <Metric icon={TrendingUp} label="Completion" value={`${plan.completion}%`} />
          <Metric icon={CalendarClock} label="Scheduled posts" value={String(plan.scheduledPosts)} />
          <Metric icon={FileText} label="Draft posts" value={String(plan.draftPosts)} />
          <Metric
            icon={CalendarX}
            label="Missing days"
            value={plan.missingDays > 0 ? `${plan.missingDays} of 7` : "None"}
            tone={plan.missingDays > 0 ? "rose" : "default"}
          />
          <Metric icon={Clock} label="Last activity" value={formatRelative(plan.lastActivity)} />
        </div>

        {/* Posts */}
        <section>
          <h3 className="text-[13px] font-semibold text-ink-900 mb-2">
            Posts in this plan
          </h3>
          {plan.items.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-ink-200 bg-cream-50 px-4 py-8 text-center">
              <span className="size-10 rounded-full bg-cream-200 inline-flex items-center justify-center mb-2">
                <Inbox className="size-4 text-ink-400" strokeWidth={1.7} />
              </span>
              <p className="text-[13px] text-ink-500">
                No posts found for this plan yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {plan.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-3 rounded-[12px] border border-ink-100 bg-white px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-ink-900 truncate">
                      {it.topic || prettyType(it.content_type) || "Untitled post"}
                    </div>
                    <div className="text-[11.5px] text-ink-500 truncate">
                      {[
                        prettyPlatform(it.platform),
                        prettyType(it.content_type),
                        it.scheduled_for ? formatDay(it.scheduled_for) : "No date",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <StatusPill status={it.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Review controls */}
        <section>
          <h3 className="text-[13px] font-semibold text-ink-900 mb-2">Review</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending || plan.reviewState === "reviewed"}
              onClick={() =>
                run(() => setReviewStatus(plan.id, "reviewed"), "Marked as reviewed")
              }
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="size-4" strokeWidth={2} />
              Mark reviewed
            </button>
            <button
              type="button"
              disabled={isPending || plan.reviewState === "needs_changes"}
              onClick={() =>
                run(
                  () => setReviewStatus(plan.id, "needs_changes"),
                  "Flagged as needs changes",
                )
              }
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-white border border-amber-300 text-amber-700 text-[12.5px] font-medium hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Needs changes
            </button>
            {plan.reviewState !== "not_reviewed" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  run(() => setReviewStatus(plan.id, "not_reviewed"), "Review reset")
                }
                className="inline-flex items-center h-9 px-3 rounded-[10px] text-ink-500 text-[12.5px] font-medium hover:bg-cream-200 transition-colors disabled:opacity-50"
              >
                Reset
              </button>
            )}
          </div>
        </section>

        {/* Internal admin notes — persisted via saveAdminNote */}
        <section>
          <h3 className="text-[13px] font-semibold text-ink-900 mb-2">
            Internal admin notes
          </h3>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes for the team — only admins see these."
            className="w-full px-3.5 py-3 rounded-[12px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors resize-y leading-relaxed"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[11.5px] text-ink-400">
              {noteChanged ? "Unsaved changes." : "Only admins can see this."}
            </p>
            <button
              type="button"
              disabled={isPending || !noteChanged}
              onClick={() =>
                run(() => saveAdminNote(plan.id, note), "Note saved")
              }
              className="inline-flex items-center h-8 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Save note
            </button>
          </div>
        </section>

        {/* Follow-up actions */}
        <section>
          <h3 className="text-[13px] font-semibold text-ink-900 mb-2">
            Follow-up
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon={MessageSquarePlus}
              label="Add feedback"
              active={feedbackOpen}
              onClick={() => {
                setFeedbackOpen((v) => !v);
                setTaskOpen(false);
              }}
            />
            <ActionButton
              icon={ListPlus}
              label="Assign task"
              active={taskOpen}
              onClick={() => {
                setTaskOpen((v) => !v);
                setFeedbackOpen(false);
              }}
            />
            <ActionButton
              icon={BellRing}
              label="Send reminder"
              disabled={isPending}
              onClick={() =>
                run(() => sendReminder(plan.id), "Reminder sent to the creator")
              }
            />
          </div>

          {/* Feedback composer */}
          {feedbackOpen && (
            <div className="mt-3 rounded-[12px] border border-ink-100 bg-cream-50 p-3 space-y-2">
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback the creator will receive as a notification…"
                className="w-full px-3 py-2.5 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors resize-y leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className="h-8 px-3 rounded-[10px] text-ink-500 text-[12.5px] font-medium hover:bg-cream-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending || !feedback.trim()}
                  onClick={() =>
                    run(
                      () => addFeedback(plan.id, feedback),
                      "Feedback sent to the creator",
                      () => {
                        setFeedback("");
                        setFeedbackOpen(false);
                      },
                    )
                  }
                  className="h-8 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send feedback
                </button>
              </div>
            </div>
          )}

          {/* Task composer */}
          {taskOpen && (
            <div className="mt-3 rounded-[12px] border border-ink-100 bg-cream-50 p-3 space-y-2">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title (e.g. Schedule 3 more posts this week)"
                className="w-full h-10 px-3 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
              />
              <div className="flex items-center gap-2">
                <label className="text-[11.5px] text-ink-500 shrink-0">
                  Due
                </label>
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTaskOpen(false)}
                  className="h-8 px-3 rounded-[10px] text-ink-500 text-[12.5px] font-medium hover:bg-cream-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending || !taskTitle.trim()}
                  onClick={() =>
                    run(
                      () => assignTask(plan.id, taskTitle, taskDue || null),
                      "Task assigned to the creator",
                      () => {
                        setTaskTitle("");
                        setTaskDue("");
                        setTaskOpen(false);
                      },
                    )
                  }
                  className="h-8 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign task
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────── */

function Metric({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "default" | "rose";
}) {
  return (
    <div className="rounded-[12px] border border-ink-100 bg-white px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-500 uppercase tracking-wide">
        <Icon className="size-3.5 text-ink-400" strokeWidth={2} />
        {label}
      </div>
      <div
        className={cn(
          "text-[16px] font-semibold tabular-nums mt-1",
          tone === "rose" ? "text-rose-600" : "text-ink-900",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 h-10 px-3 rounded-[12px] border text-[12.5px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        active
          ? "bg-rose-50 border-rose-300 text-rose-700"
          : "bg-white border-ink-100 text-ink-700 hover:bg-cream-100",
      )}
    >
      <Icon
        className={cn("size-4", active ? "text-rose-600" : "text-ink-400")}
        strokeWidth={1.9}
      />
      {label}
    </button>
  );
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

const HEALTH_META: Record<AdminPlanRow["health"], { label: string; cls: string }> = {
  on_track: { label: "On track", cls: "bg-emerald-100 text-emerald-700" },
  needs_review: { label: "Needs review", cls: "bg-amber-100 text-amber-700" },
  missing_content: { label: "Missing content", cls: "bg-rose-100 text-rose-700" },
  inactive: { label: "Inactive", cls: "bg-ink-100 text-ink-600" },
  draft_only: { label: "Draft only", cls: "bg-ink-100 text-ink-500" },
};

function HealthPill({ health }: { health: AdminPlanRow["health"] }) {
  const m = HEALTH_META[health];
  return <Pill className={m.cls}>{m.label}</Pill>;
}

const REVIEW_META: Record<AdminReviewState, { label: string; cls: string }> = {
  not_reviewed: { label: "Not reviewed", cls: "bg-ink-100 text-ink-500" },
  reviewed: { label: "Reviewed", cls: "bg-emerald-100 text-emerald-700" },
  needs_changes: { label: "Needs changes", cls: "bg-amber-100 text-amber-700" },
};

function ReviewPill({ state }: { state: AdminReviewState }) {
  const m = REVIEW_META[state];
  return <Pill className={m.cls}>{m.label}</Pill>;
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "posted" || status === "reviewed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "idea" || status === "planned"
        ? "bg-ink-100 text-ink-600"
        : "bg-amber-100 text-amber-700";
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap shrink-0",
        cls,
      )}
    >
      {status}
    </span>
  );
}

/* ── Formatting ───────────────────────────────────────────────────────── */

function prettyPlatform(p: string | null): string {
  if (!p) return "";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function prettyType(t: string | null): string {
  if (!t) return "";
  return t
    .split("_")
    .map((w) => (w[0]?.toUpperCase() ?? "") + w.slice(1))
    .join(" ");
}

function formatWeek(weekStart: string): string {
  const d = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return weekStart;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
