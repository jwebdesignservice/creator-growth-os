"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BellPlus, Loader2, X } from "lucide-react";
import {
  createAlertRule,
  type AlertMetric,
  type AlertOp,
} from "@/lib/dev-dashboard/performance-actions";
import { cn } from "@/lib/cn";

const METRIC_LABELS: Record<AlertMetric, string> = {
  response_time_p95: "p95 Response Time (ms)",
  response_time_p99: "p99 Response Time (ms)",
  error_rate:        "Error Rate (0–1)",
  requests_per_min:  "Requests / Min",
  cpu_percent:       "CPU Usage (%)",
  memory_percent:    "Memory Usage (%)",
  apdex:             "Apdex Score (0–1)",
};

const OP_LABELS: Record<AlertOp, string> = {
  ">":  "greater than",
  ">=": "greater than or equal",
  "<":  "less than",
  "<=": "less than or equal",
};

const SERVICE_SUGGESTIONS = ["", "frontend", "backend-api", "auth-service", "notifications", "payments", "database"];

/**
 * Header button + modal for "Create Alert Rule". The form validates
 * locally for instant feedback; the server action validates again and
 * returns a typed result the modal renders inline.
 *
 * Modal is keyboard-dismissible (Esc) and focus-trapped lightly via
 * autoFocus on the name input; deeper focus management is overkill for
 * a single-step form.
 */
export function CreateAlertRuleModal() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName]               = useState("");
  const [metric, setMetric]           = useState<AlertMetric>("response_time_p95");
  const [op, setOp]                   = useState<AlertOp>(">");
  const [threshold, setThreshold]     = useState("500");
  const [service, setService]         = useState("");
  const [windowMinutes, setWindow]    = useState(5);
  const [notifyEmail, setNotifyEmail] = useState("");

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function resetForm() {
    setName("");
    setMetric("response_time_p95");
    setOp(">");
    setThreshold("500");
    setService("");
    setWindow(5);
    setNotifyEmail("");
    setError(null);
    setSuccess(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const thresholdNum = Number(threshold);
    if (!Number.isFinite(thresholdNum)) {
      setError("Threshold must be a number.");
      return;
    }
    startTransition(async () => {
      const res = await createAlertRule({
        name,
        metric,
        op,
        threshold: thresholdNum,
        service: service || null,
        windowMinutes,
        notifyEmail: notifyEmail || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`Alert rule created (${res.data!.id.slice(0, 8)}…).`);
      // Keep the modal open for a beat so the user sees the confirmation,
      // then reset for a possible second rule.
      setTimeout(() => {
        resetForm();
        setOpen(false);
      }, 900);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
      >
        <BellPlus className="size-3.5" strokeWidth={2} />
        Create Alert Rule
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-rule-title"
            className="w-full max-w-[480px] rounded-[14px] bg-[var(--dev-surface)] border border-[var(--dev-border-strong)] shadow-2xl"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--dev-border-soft)]">
              <h2 id="alert-rule-title" className="text-[15px] font-semibold text-[var(--dev-text-primary)]">
                Create Alert Rule
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="size-7 inline-flex items-center justify-center rounded-[8px] text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </header>

            <form onSubmit={onSubmit} className="px-5 py-4 space-y-4">
              <Field label="Rule name">
                <input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. p95 backend-api over 500ms"
                  className={inputClass}
                  maxLength={120}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Metric">
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as AlertMetric)}
                    className={selectClass}
                  >
                    {(Object.keys(METRIC_LABELS) as AlertMetric[]).map((m) => (
                      <option key={m} value={m} className="bg-[var(--dev-surface)]">
                        {METRIC_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Operator">
                  <select
                    value={op}
                    onChange={(e) => setOp(e.target.value as AlertOp)}
                    className={selectClass}
                  >
                    {(Object.keys(OP_LABELS) as AlertOp[]).map((o) => (
                      <option key={o} value={o} className="bg-[var(--dev-surface)]">
                        {o} ({OP_LABELS[o]})
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Threshold">
                  <input
                    required
                    inputMode="decimal"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="500"
                    className={inputClass}
                  />
                </Field>
                <Field label="Window (minutes)">
                  <input
                    required
                    type="number"
                    min={1}
                    max={1440}
                    value={windowMinutes}
                    onChange={(e) => setWindow(Number(e.target.value))}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Service (optional)">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={selectClass}
                >
                  {SERVICE_SUGGESTIONS.map((s) => (
                    <option key={s || "any"} value={s} className="bg-[var(--dev-surface)]">
                      {s || "Any service"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Notify email (optional)">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="oncall@example.com"
                  className={inputClass}
                />
              </Field>

              {error && (
                <p role="alert" className="text-[12.5px] text-[var(--dev-danger-text)]">
                  {error}
                </p>
              )}
              {success && (
                <p role="status" className="text-[12.5px] text-[var(--dev-success-text)]">
                  {success}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--dev-border-soft)]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors disabled:opacity-60"
                >
                  {pending && (
                    <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                  )}
                  Create rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass = cn(
  "w-full h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)]",
  "hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)]",
  "text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors",
);

const selectClass = cn(
  "w-full h-10 pl-3 pr-9 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)]",
  "hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)]",
  "text-[13px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer appearance-none",
);
