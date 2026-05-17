"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, CircleDot, Clock, ChevronDown } from "lucide-react";
import { updateCheckStatus } from "@/lib/dev-dashboard/qa-actions";
import type { QaCheckStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

/* Status visual config — kept in one place so the table cell and the menu
 * use the same pill styling. */
const STATUS_PILL: Record<QaCheckStatus, string> = {
  pending: "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border border-[var(--dev-border)]",
  passed:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]",
  review:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  blocker: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
};

const STATUS_LABEL: Record<QaCheckStatus, string> = {
  pending: "Pending",
  passed:  "Passed",
  review:  "Review",
  blocker: "Blocker",
};

const STATUS_ICON: Record<QaCheckStatus, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  pending: Clock,
  passed:  CheckCircle2,
  review:  CircleDot,
  blocker: CircleAlert,
};

export function QaCheckStatusMenu({
  checkResultId,
  status,
}: {
  checkResultId: string;
  status: QaCheckStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  // Optimistic status — flashes the new value immediately, then the router
  // refresh confirms it from the server.
  const [optimistic, setOptimistic] = useState<QaCheckStatus>(status);

  // Reset optimistic value if the prop changes from the outside (e.g. another
  // tab updated the row and we revalidated). Use the React-recommended
  // "adjust state during render" pattern to avoid an effect.
  const [prevStatus, setPrevStatus] = useState(status);
  if (status !== prevStatus) {
    setPrevStatus(status);
    setOptimistic(status);
  }

  function pick(next: QaCheckStatus) {
    setOpen(false);
    if (next === optimistic) return;
    setOptimistic(next);
    start(async () => {
      const result = await updateCheckStatus(checkResultId, next);
      if (!result.ok) {
        console.error("Update failed:", result.error);
        // Roll back optimistic state.
        setOptimistic(status);
        return;
      }
      router.refresh();
    });
  }

  const Icon = STATUS_ICON[optimistic];

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11.5px] font-semibold whitespace-nowrap transition-colors",
          STATUS_PILL[optimistic],
          pending && "opacity-60 cursor-progress",
        )}
      >
        <Icon className="size-3" strokeWidth={2} />
        {STATUS_LABEL[optimistic]}
        <ChevronDown className="size-3 opacity-70" strokeWidth={2} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] shadow-xl py-1"
        >
          {(Object.keys(STATUS_LABEL) as QaCheckStatus[]).map((opt) => {
            const isActive = opt === optimistic;
            const OptIcon = STATUS_ICON[opt];
            return (
              <li key={opt} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(opt);
                  }}
                  className={cn(
                    "w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12.5px] transition-colors",
                    isActive
                      ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
                      : "text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)]",
                  )}
                >
                  <OptIcon className="size-3.5" strokeWidth={2} />
                  {STATUS_LABEL[opt]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
