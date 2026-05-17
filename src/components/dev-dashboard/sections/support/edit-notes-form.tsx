"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { updateInternalNotes } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

type Props = {
  ticketId: string;
  initialNotes: string;
};

export function EditNotesForm({ ticketId, initialNotes }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNotes);
  const [savedValue, setSavedValue] = useState(initialNotes);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSave() {
    setError(null);
    start(async () => {
      const result = await updateInternalNotes(ticketId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedValue(value);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div>
        <p className="text-[12.5px] text-[var(--dev-text-primary)] leading-relaxed whitespace-pre-wrap">
          {savedValue || (
            <span className="italic text-[var(--dev-text-muted)]">No internal notes yet.</span>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setValue(savedValue);
            setEditing(true);
          }}
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          <Pencil className="size-3" strokeWidth={2} />
          Edit Notes
        </button>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        maxLength={4000}
        autoFocus
        className="w-full px-3 py-2 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] focus:border-[var(--dev-accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--dev-accent-soft)] text-[12.5px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] resize-vertical leading-relaxed"
        placeholder="Internal-only notes for the support team…"
      />
      {error && (
        <p role="alert" className="mt-1.5 text-[11.5px] text-[var(--dev-danger-text)]">
          {error}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12px] font-semibold transition-colors",
            pending && "opacity-70 cursor-not-allowed",
          )}
        >
          {pending ? <Loader2 className="size-3 animate-spin" strokeWidth={2.2} /> : <Check className="size-3" strokeWidth={2.5} />}
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(savedValue);
            setEditing(false);
            setError(null);
          }}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
        >
          <X className="size-3" strokeWidth={2} />
          Cancel
        </button>
      </div>
    </div>
  );
}
