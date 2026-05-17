"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createSupportTicket, type DevActionResult } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

type Result = DevActionResult<{ publicId: string }>;

const initial: Result = { ok: false, error: "" };

export function CreateTicketModal() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<Result, FormData>(createSupportTicket, initial);

  // Detect a fresh success during render so we can close the modal on the
  // same commit the action returns. The form re-mounts via the `key` prop
  // below so all fields clear without us touching a ref.
  const [seenPublicId, setSeenPublicId] = useState<string | null>(null);
  if (state.ok && state.data?.publicId && state.data.publicId !== seenPublicId) {
    setSeenPublicId(state.data.publicId);
    setOpen(false);
  }

  // Close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const fieldErrors = state.ok ? {} : state.fieldErrors ?? {};

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
      >
        <Plus className="size-3.5" strokeWidth={2.2} />
        Create Ticket
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-sm overflow-y-auto p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Create support ticket"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[560px] dev-card p-5 mt-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[var(--dev-text-primary)]">
                  Create Ticket
                </h3>
                <p className="mt-0.5 text-[12px] text-[var(--dev-text-muted)]">
                  Open a new support ticket on behalf of a client. The client will see
                  it on their /support page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex items-center justify-center size-7 rounded-md hover:bg-[var(--dev-surface-elev)] text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)]"
              >
                <X className="size-4" strokeWidth={1.9} />
              </button>
            </div>

            <form key={seenPublicId ?? "draft"} action={action} className="mt-4 space-y-3">
              <Field label="Client email" htmlFor="clientEmail" error={fieldErrors.clientEmail}>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  required
                  placeholder="client@example.com"
                />
              </Field>
              <Field label="Subject" htmlFor="subject" error={fieldErrors.subject}>
                <Input id="subject" name="subject" required maxLength={160} placeholder="Short summary of the issue" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category" htmlFor="category">
                  <Input id="category" name="category" maxLength={64} placeholder="API / Integrations" />
                </Field>
                <Field label="Affected Area" htmlFor="affectedArea">
                  <Input id="affectedArea" name="affectedArea" maxLength={64} placeholder="API Gateway" />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Topic" htmlFor="topic" error={fieldErrors.topic}>
                  <Select id="topic" name="topic" defaultValue="technical">
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="content">Content</option>
                    <option value="posting">Posting</option>
                    <option value="community">Community</option>
                    <option value="coaching">Coaching</option>
                    <option value="feature">Feature request</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
                <Field label="Priority" htmlFor="priority" error={fieldErrors.priority}>
                  <Select id="priority" name="priority" defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </Field>
                <Field label="Source" htmlFor="source" error={fieldErrors.source}>
                  <Select id="source" name="source" defaultValue="Web Portal">
                    <option value="Web Portal">Web Portal</option>
                    <option value="Email">Email</option>
                    <option value="API">API</option>
                    <option value="Chat">Chat</option>
                  </Select>
                </Field>
              </div>

              <Field label="SLA Deadline (optional)" htmlFor="slaDeadline" error={fieldErrors.slaDeadline}>
                <Input id="slaDeadline" name="slaDeadline" type="datetime-local" />
              </Field>

              <Field label="Description" htmlFor="description" error={fieldErrors.description}>
                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  placeholder="What's happening, how to reproduce, what you've tried…"
                  className="w-full px-3 py-2 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] resize-vertical"
                />
              </Field>

              {!state.ok && state.error && (
                <p
                  role="alert"
                  className="text-[12px] text-[var(--dev-danger-text)] bg-[var(--dev-danger-soft)] border border-[var(--dev-danger-border)] rounded-[8px] px-2.5 py-1.5"
                >
                  {state.error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors",
                    pending && "opacity-70 cursor-not-allowed",
                  )}
                >
                  {pending && <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />}
                  Create Ticket
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
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block mb-1 text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[11.5px] text-[var(--dev-danger-text)]">{error}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-10 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] transition-colors",
        props.className,
      )}
    />
  );
}

function Select({
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...rest}
      className="w-full h-10 px-3 pr-8 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[13px] text-[var(--dev-text-primary)] font-medium transition-colors cursor-pointer appearance-none"
    >
      {children}
    </select>
  );
}
