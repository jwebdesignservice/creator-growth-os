"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, X } from "lucide-react";
import { createAlertRule, type ActionResult } from "@/lib/dev-dashboard/errors-actions";
import { SEVERITY_OPTIONS, SOURCE_OPTIONS } from "@/lib/dev-dashboard/errors-filters";

const INITIAL: ActionResult = { ok: true };

export function CreateAlertRuleModal() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionResult>(INITIAL);
  const [pending, startTransition] = useTransition();
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["critical", "high"]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createAlertRule(state, formData);
      setState(result);
      if (result.ok) {
        setOpen(false);
        setSelectedSeverities(["critical", "high"]);
        setSelectedSources([]);
      }
    });
  }

  // ESC + body-scroll lock while open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function toggle<T extends string>(list: T[], v: T): T[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
      >
        <Bell className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
        Create Alert Rule
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create alert rule"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-[520px] dev-card p-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <header className="flex items-start justify-between mb-4 gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-[var(--dev-text-primary)]">
                  Create Alert Rule
                </h2>
                <p className="mt-0.5 text-[12.5px] text-[var(--dev-text-muted)]">
                  Get notified when matching errors cross a threshold.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="size-7 inline-flex items-center justify-center rounded-md hover:bg-[var(--dev-surface-soft)] text-[var(--dev-text-secondary)]"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </header>

            <form action={handleSubmit} className="space-y-4">
              <input type="hidden" name="severities" value={selectedSeverities.join(",")} />
              <input type="hidden" name="sources"    value={selectedSources.join(",")} />

              <Field label="Name" htmlFor="name">
                <input
                  id="name"
                  name="name"
                  required
                  maxLength={120}
                  placeholder="High error rate on /api/notifications"
                  className="w-full h-9 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors"
                />
              </Field>

              <Field label="Description (optional)" htmlFor="description">
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  placeholder="What this rule is for"
                  className="w-full px-3 py-2 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] resize-none transition-colors"
                />
              </Field>

              <Field label="Severities">
                <div className="flex flex-wrap gap-1.5">
                  {SEVERITY_OPTIONS.filter((o) => o.value !== "all").map((o) => {
                    const active = selectedSeverities.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setSelectedSeverities((prev) => toggle(prev, o.value))}
                        className={
                          "inline-flex items-center px-2.5 h-7 rounded-md text-[11.5px] font-semibold border transition-colors " +
                          (active
                            ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border-[var(--dev-accent-border)]"
                            : "bg-[var(--dev-surface-soft)] text-[var(--dev-text-secondary)] border-[var(--dev-border)] hover:text-[var(--dev-text-primary)]")
                        }
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Sources (any if empty)">
                <div className="flex flex-wrap gap-1.5">
                  {SOURCE_OPTIONS.filter((o) => o.value !== "all").map((o) => {
                    const active = selectedSources.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setSelectedSources((prev) => toggle(prev, o.value))}
                        className={
                          "inline-flex items-center px-2.5 h-7 rounded-md text-[11.5px] font-medium border transition-colors " +
                          (active
                            ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border-[var(--dev-accent-border)]"
                            : "bg-[var(--dev-surface-soft)] text-[var(--dev-text-secondary)] border-[var(--dev-border)] hover:text-[var(--dev-text-primary)]")
                        }
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Threshold" htmlFor="threshold_count">
                  <input
                    id="threshold_count"
                    name="threshold_count"
                    type="number"
                    min={1}
                    defaultValue={10}
                    className="w-full h-9 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] tabular-nums transition-colors"
                  />
                </Field>
                <Field label="Period" htmlFor="threshold_period">
                  <select
                    id="threshold_period"
                    name="threshold_period"
                    defaultValue="15m"
                    className="w-full h-9 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] transition-colors"
                  >
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                  </select>
                </Field>
              </div>

              <Field label="Channel" htmlFor="channel">
                <select
                  id="channel"
                  name="channel"
                  defaultValue="email"
                  className="w-full h-9 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] transition-colors"
                >
                  <option value="email">Email</option>
                  <option value="slack">Slack</option>
                  <option value="webhook">Webhook</option>
                </select>
              </Field>

              {!state.ok && (
                <div className="text-[12.5px] text-[var(--dev-danger-text)] bg-[var(--dev-danger-soft)] border border-[var(--dev-danger-border)] rounded-[8px] px-3 py-2">
                  {state.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center justify-center h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12.5px] font-semibold transition-colors"
                >
                  {pending ? "Creating…" : "Create rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--dev-text-muted)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
