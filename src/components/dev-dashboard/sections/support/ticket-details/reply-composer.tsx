"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Paperclip,
  Smile,
  Type,
  Send,
  NotebookPen,
  Sparkles,
  ChevronDown,
  CloudUpload,
  MessageSquare,
} from "lucide-react";
import { addInternalNote, replyToTicket } from "@/lib/dev-support/actions";
import {
  REPLY_TEMPLATE_GROUPS,
  type ReplyTemplate,
  type ReplyTemplateKind,
} from "@/lib/dev-support/quick-reply-templates";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/cn";

type Props = { ticketPublicId: string };

const MAX_LEN = 5000;
const DRAFT_KEY_PREFIX = "dev-support:draft:";
const MODE_KEY_PREFIX  = "dev-support:mode:";

type ComposerMode = ReplyTemplateKind; // "reply" | "note"

/**
 * Reply composer with the affordances power-users need when they handle
 * dozens of tickets a day:
 *  - localStorage draft per ticket so an accidental nav doesn't lose work
 *  - persistent "Reply / Note" mode toggle per ticket
 *  - quick-reply templates (Acknowledgement / Need info / Resolution / Notes)
 *  - Cmd/Ctrl+Enter      → primary action for current mode
 *  - Cmd/Ctrl+Shift+Enter → opposite action (note in reply mode, etc.)
 *  - Cmd/Ctrl+/           → open quick-reply templates
 *  - live character count with overflow guard
 *  - toast feedback for success / error
 *  - smart auto-grow textarea (caps at ~12 rows)
 *  - "Draft saved" indicator so users know nav-aways are safe
 */
export function ReplyComposer({ ticketPublicId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const draftKey = `${DRAFT_KEY_PREFIX}${ticketPublicId}`;
  const modeKey  = `${MODE_KEY_PREFIX}${ticketPublicId}`;

  const taRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState<string>("");
  const [mode, setMode] = useState<ComposerMode>("reply");
  const [draftSaved, setDraftSaved] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [pendingReply, startReply] = useTransition();
  const [pendingNote, startNote]   = useTransition();
  const pending = pendingReply || pendingNote;

  // Restore draft + mode on first mount. State updates are deferred to a
  // microtask to keep the effect free of react-hooks/set-state-in-effect.
  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const storedBody = window.localStorage.getItem(draftKey);
        if (storedBody) setBody(storedBody);
        const storedMode = window.localStorage.getItem(modeKey);
        if (storedMode === "reply" || storedMode === "note") setMode(storedMode);
      } catch {
        // Storage disabled — silently ignore.
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [draftKey, modeKey]);

  // Persist body. Also flash a "Draft saved" cue so the user can see that
  // typing is being captured — the cue fades after ~1.4s of inactivity.
  useEffect(() => {
    try {
      if (body) {
        window.localStorage.setItem(draftKey, body);
        const id = window.setTimeout(() => setDraftSaved(true), 0);
        const fadeId = window.setTimeout(() => setDraftSaved(false), 1400);
        return () => {
          window.clearTimeout(id);
          window.clearTimeout(fadeId);
        };
      } else {
        window.localStorage.removeItem(draftKey);
      }
    } catch {
      // ignore quota / private-mode errors
    }
  }, [body, draftKey]);

  // Persist mode whenever it changes.
  useEffect(() => {
    try { window.localStorage.setItem(modeKey, mode); } catch { /* ignore */ }
  }, [mode, modeKey]);

  // Auto-grow textarea up to a cap so the composer scales with longer
  // replies without pushing the conversation thread off-screen.
  const autoGrow = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    const cap = 12 * 22; // ~12 rows × line-height
    el.style.height = `${Math.min(el.scrollHeight, cap)}px`;
  }, []);

  useEffect(() => { autoGrow(); }, [body, autoGrow]);

  // Close the templates popover on Esc.
  useEffect(() => {
    if (!templatesOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTemplatesOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [templatesOpen]);

  function clearComposer() {
    setBody("");
    try { window.localStorage.removeItem(draftKey); } catch { /* ignore */ }
  }

  function insertTemplate(t: ReplyTemplate) {
    setTemplatesOpen(false);
    setMode(t.kind);
    setBody((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return t.body;
      // Append with a separator so an existing draft isn't destroyed.
      return `${prev.replace(/\s+$/, "")}\n\n${t.body}`;
    });
    requestAnimationFrame(() => taRef.current?.focus());
  }

  const onSendReply = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Reply cannot be empty.");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      toast.error(`Reply too long (max ${MAX_LEN} characters).`);
      return;
    }
    startReply(async () => {
      const result = await replyToTicket(ticketPublicId, trimmed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      clearComposer();
      toast.success("Reply sent to client");
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, ticketPublicId, router, toast, draftKey]);

  const onAddNote = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Note cannot be empty.");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      toast.error(`Note too long (max ${MAX_LEN} characters).`);
      return;
    }
    startNote(async () => {
      const result = await addInternalNote(ticketPublicId, trimmed);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      clearComposer();
      toast.success("Internal note added");
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, ticketPublicId, router, toast, draftKey]);

  // Keyboard shortcuts on the textarea:
  //  - ⌘/Ctrl+Enter        → primary action for current mode
  //  - ⌘/Ctrl+Shift+Enter   → the other action
  //  - ⌘/Ctrl+/             → open quick-reply templates
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const metaOrCtrl = e.metaKey || e.ctrlKey;
    if (metaOrCtrl && e.key === "Enter") {
      e.preventDefault();
      // XOR: in reply mode +Shift means "note"; in note mode +Shift means "reply".
      const primaryReply = (mode === "reply") !== e.shiftKey;
      if (primaryReply) onSendReply();
      else              onAddNote();
      return;
    }
    if (metaOrCtrl && e.key === "/") {
      e.preventDefault();
      setTemplatesOpen((v) => !v);
    }
  }

  const remaining = MAX_LEN - body.length;
  const tooLong = remaining < 0;

  const placeholder = useMemo(() => (
    mode === "reply"
      ? "Write a reply to the client…  (⌘+Enter to send · ⌘+Shift+Enter for internal note · ⌘+/ templates)"
      : "Write an internal note…  (⌘+Enter to add · ⌘+Shift+Enter for client reply · ⌘+/ templates)"
  ), [mode]);

  return (
    <div
      className={cn(
        "mt-5 rounded-[12px] border transition-colors",
        // Subtle warm tint when in Note mode so the work-mode reads at a glance.
        mode === "note"
          ? "bg-[var(--dev-warning-soft)]/40 border-[var(--dev-warning-border)]"
          : "bg-[var(--dev-surface-soft)] border-[var(--dev-border-soft)]",
      )}
    >
      {/* ── Header: mode toggle + draft indicator + templates ────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2.5 pb-1.5">
        <ModeToggle mode={mode} onChange={setMode} />

        <div className="flex items-center gap-2">
          {/* Draft saved indicator. */}
          <span
            aria-live="polite"
            className={cn(
              "inline-flex items-center gap-1 text-[10.5px] font-medium tabular-nums transition-opacity",
              draftSaved
                ? "opacity-100 text-[var(--dev-success-text)]"
                : body
                  ? "opacity-70 text-[var(--dev-text-muted)]"
                  : "opacity-0",
            )}
          >
            <CloudUpload className="size-3" strokeWidth={2} aria-hidden />
            {draftSaved ? "Draft saved" : "Draft"}
          </span>

          <TemplatesButton
            open={templatesOpen}
            onToggle={() => setTemplatesOpen((v) => !v)}
            onPick={insertTemplate}
            onClose={() => setTemplatesOpen(false)}
            mode={mode}
          />
        </div>
      </div>

      <textarea
        ref={taRef}
        rows={3}
        value={body}
        aria-label={mode === "reply" ? "Write a reply to the client" : "Write an internal note"}
        placeholder={placeholder}
        disabled={pending}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        className="block w-full px-3 pb-3 bg-transparent border-0 resize-none text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] focus:outline-none disabled:opacity-60 leading-[1.55]"
        style={{ minHeight: 66 }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 border-t border-[var(--dev-border-soft)] bg-[var(--dev-surface-soft)] rounded-b-[12px]">
        <div className="flex items-center gap-1">
          <ComposerIcon ariaLabel="Attach file"><Paperclip className="size-4" strokeWidth={1.8} /></ComposerIcon>
          <ComposerIcon ariaLabel="Insert emoji"><Smile className="size-4" strokeWidth={1.8} /></ComposerIcon>
          <ComposerIcon ariaLabel="Formatting"><Type className="size-4" strokeWidth={1.8} /></ComposerIcon>
          <span
            className={cn(
              "ml-1.5 text-[10.5px] tabular-nums",
              tooLong ? "text-[var(--dev-danger-text)] font-semibold" : "text-[var(--dev-text-muted)]",
            )}
            aria-live={tooLong ? "polite" : undefined}
          >
            {body.length.toLocaleString()} / {MAX_LEN.toLocaleString()}
          </span>
        </div>

        {/* Action buttons — order/emphasis swaps with mode so the primary
            action always sits at the right edge. */}
        <div className="flex items-center gap-2 ml-auto">
          {mode === "reply" ? (
            <>
              <NoteButton onClick={onAddNote} disabled={pending || tooLong} pending={pendingNote} primary={false} />
              <ReplyButton onClick={onSendReply} disabled={pending || tooLong} pending={pendingReply} primary={true} />
            </>
          ) : (
            <>
              <ReplyButton onClick={onSendReply} disabled={pending || tooLong} pending={pendingReply} primary={false} />
              <NoteButton onClick={onAddNote} disabled={pending || tooLong} pending={pendingNote} primary={true} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Mode toggle — segmented control persisted per-ticket.
   ───────────────────────────────────────────────────────────────────────── */

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ComposerMode;
  onChange: (m: ComposerMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Composer mode"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-[8px] bg-[var(--dev-surface-elev)] border border-[var(--dev-border)]"
    >
      <ModeButton active={mode === "reply"} onClick={() => onChange("reply")}>
        <MessageSquare className="size-3" strokeWidth={2} aria-hidden />
        Reply
      </ModeButton>
      <ModeButton active={mode === "note"} onClick={() => onChange("note")}>
        <NotebookPen className="size-3" strokeWidth={2} aria-hidden />
        Note
      </ModeButton>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-[6px] text-[11px] font-semibold transition-colors",
        active
          ? "bg-[var(--dev-accent)] text-white"
          : "text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)]",
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Templates dropdown — grouped canned replies.
   ───────────────────────────────────────────────────────────────────────── */

function TemplatesButton({
  open,
  onToggle,
  onPick,
  onClose,
  mode,
}: {
  open: boolean;
  onToggle: () => void;
  onPick: (t: ReplyTemplate) => void;
  onClose: () => void;
  mode: ComposerMode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Quick replies (⌘+/)"
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2 rounded-[8px] text-[11.5px] font-semibold transition-colors border",
          open
            ? "bg-[var(--dev-accent-soft)] border-[var(--dev-accent-border)] text-[var(--dev-accent-text)]"
            : "bg-[var(--dev-surface)] border-[var(--dev-border)] text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:border-[var(--dev-border-strong)]",
        )}
      >
        <Sparkles className="size-3" strokeWidth={2} aria-hidden />
        Templates
        <ChevronDown className="size-3 opacity-70" strokeWidth={2} />
      </button>

      {open && (
        <>
          {/* Outside-click catcher — lives behind the menu, swallows clicks
              anywhere else on the page to close the dropdown. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onClose}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-1.5 z-20 w-[320px] max-h-[420px] overflow-y-auto rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] shadow-2xl py-1"
          >
            {REPLY_TEMPLATE_GROUPS.map((g, gi) => {
              // Dim the "wrong-mode" group but keep it pickable — agents
              // sometimes need to insert a note while in reply mode.
              const dim = (mode === "reply" && g.groupKey === "internal")
                || (mode === "note"  && g.groupKey !== "internal");
              return (
                <div key={g.groupKey} className={cn(gi > 0 && "border-t border-[var(--dev-border-soft)] mt-1 pt-1")}>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] flex items-center gap-2">
                    {g.groupLabel}
                    {dim && (
                      <span className="text-[9.5px] normal-case tracking-normal text-[var(--dev-text-faint)] font-medium">
                        ({g.groupKey === "internal" ? "internal note" : "public reply"})
                      </span>
                    )}
                  </div>
                  <ul>
                    {g.templates.map((t) => (
                      <li key={t.key} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => onPick(t)}
                          className={cn(
                            "w-full text-left px-3 py-1.5 transition-colors",
                            "hover:bg-[var(--dev-surface-soft)]",
                            dim && "opacity-65",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-[12.5px] font-medium text-[var(--dev-text-primary)] truncate">
                              {t.label}
                            </span>
                            <KindPill kind={t.kind} />
                          </div>
                          {t.blurb && (
                            <p className="text-[11px] text-[var(--dev-text-muted)] leading-snug truncate">
                              {t.blurb}
                            </p>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function KindPill({ kind }: { kind: ReplyTemplateKind }) {
  const cfg = kind === "reply"
    ? { label: "Reply", cls: "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border-[var(--dev-accent-border)]" }
    : { label: "Note",  cls: "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]" };
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center px-1.5 h-[16px] rounded-md border text-[9.5px] font-semibold uppercase tracking-wider",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Action buttons — variant changes based on which is primary for the
   current composer mode.
   ───────────────────────────────────────────────────────────────────────── */

function ReplyButton({
  onClick,
  disabled,
  pending,
  primary,
}: {
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
  primary: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Send Reply (⌘+Enter in reply mode)"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        primary
          ? "h-10 px-4 bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[13px] font-semibold shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_12px_rgba(79,141,224,0.22)]"
          : "h-9 px-3 bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[var(--dev-text-primary)] text-[12.5px] font-medium",
      )}
    >
      <Send className={cn("size-3.5", !primary && "text-[var(--dev-accent-text)]")} strokeWidth={2} />
      {pending ? "Sending…" : "Send Reply"}
    </button>
  );
}

function NoteButton({
  onClick,
  disabled,
  pending,
  primary,
}: {
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
  primary: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Add Internal Note (⌘+Enter in note mode)"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        primary
          ? "h-10 px-4 bg-[var(--dev-warning-soft)] border border-[var(--dev-warning-border)] hover:border-[var(--dev-warning-text)] text-[var(--dev-warning-text)] text-[13px] font-semibold"
          : "h-9 px-3 bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[var(--dev-text-primary)] text-[12.5px] font-medium",
      )}
    >
      <NotebookPen className={cn("size-3.5", !primary && "text-[var(--dev-warning-text)]")} strokeWidth={1.9} />
      {pending ? "Saving…" : "Add Internal Note"}
    </button>
  );
}

function ComposerIcon({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="size-8 inline-flex items-center justify-center rounded-md text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-elev)] transition-colors"
    >
      {children}
    </button>
  );
}
