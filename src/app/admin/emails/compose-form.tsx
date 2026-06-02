"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  Eye,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  Users,
  ChevronDown,
  Info,
  MessageSquare,
  Smile,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  Code,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Image as ImageIcon,
  Table,
  MoreHorizontal,
  Sparkles,
  PenSquare,
  Lightbulb,
  Code2,
  CalendarClock,
  FlaskConical,
  BarChart3,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  EMAIL_VARIABLES,
  previewContext,
  substituteVariables,
  type EmailVariable,
} from "@/lib/email/variables";
import {
  sendCampaign,
  sendTestEmail,
  saveAsDraft,
  scheduleCampaign,
  createEmailTemplate,
  type ComposeInput,
  type SendResult,
} from "./actions";

type Program = { id: string; slug: string; title: string };

const QUOTA = { used: 0, limit: 250 };
const DRAFT_KEY = "compose-draft-v1";
const VERIFY_DISMISS_KEY = "compose-verify-dismissed-v1";
const EMOJIS = ["🎉", "✨", "🚀", "💌", "📣", "🔥", "❤️", "👋", "👏", "🙌", "💡", "📈", "🎯", "⭐", "✅", "💎"];

type Toast =
  | { tone: "success"; text: string }
  | { tone: "error"; text: string }
  | { tone: "info"; text: string };

export function ComposeForm({
  adminName,
  adminEmail,
  totalUsers,
  programs,
}: {
  adminName: string;
  adminEmail: string;
  totalUsers: number;
  programs: Program[];
}) {
  /* ── Form state ───────────────────────────────────────────────────────── */
  const [audience, setAudience] = useState<"all" | "active" | "program">("all");
  const [programId, setProgramId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [trackOpens, setTrackOpens] = useState(true);
  const [verifyDismissed, setVerifyDismissed] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  /** Server-side draft row id — reused so repeated "Save draft" clicks update
   *  one History row instead of creating a new draft each time. */
  const [serverDraftId, setServerDraftId] = useState<string | null>(null);

  /* ── UI / async state ─────────────────────────────────────────────────── */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subjectVarOpen, setSubjectVarOpen] = useState(false);
  const [messageVarOpen, setMessageVarOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<Toast | null>(null);

  /* ── Refs ────────────────────────────────────────────────────────────── */
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const lastFocusRef = useRef<"subject" | "message">("message");

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const estimated = useMemo(() => {
    if (audience === "all") return totalUsers;
    if (audience === "program") return Math.max(0, Math.round(totalUsers * 0.35));
    return Math.max(0, Math.round(totalUsers * 0.6));
  }, [audience, totalUsers]);

  const wordCount = useMemo(() => {
    const t = message.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [message]);

  const canSend = subject.trim().length > 0 && message.trim().length > 0;

  /* ── Draft persistence (localStorage) ───────────────────────────────────
     One-time external-store hydration on mount. React 19 generally
     prefers deriving state during render or `useSyncExternalStore`, but
     neither pattern fits a mount-time JSON-blob restore that has to dodge
     SSR (no `window`). The set-state-in-effect rule is suppressed
     intentionally here. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<{
          audience: typeof audience;
          programId: string;
          subject: string;
          message: string;
          useTemplate: boolean;
          trackOpens: boolean;
          scheduledFor: string;
        }>;
        if (draft.audience) setAudience(draft.audience);
        if (draft.programId !== undefined) setProgramId(draft.programId);
        if (draft.subject !== undefined) setSubject(draft.subject);
        if (draft.message !== undefined) setMessage(draft.message);
        if (typeof draft.useTemplate === "boolean") setUseTemplate(draft.useTemplate);
        if (typeof draft.trackOpens === "boolean") setTrackOpens(draft.trackOpens);
        if (draft.scheduledFor) setScheduledFor(draft.scheduledFor);
        setDraftRestored(true);
      }
      const dismissed = window.localStorage.getItem(VERIFY_DISMISS_KEY) === "1";
      if (dismissed) setVerifyDismissed(true);
    } catch {
      // ignore corrupt JSON / storage access errors
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ── Auto-dismiss toast ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const saveDraft = useCallback(
    function saveDraft() {
      if (typeof window === "undefined") return;
      const draft = {
        audience,
        programId,
        subject,
        message,
        useTemplate,
        trackOpens,
        scheduledFor,
      };
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        const t = new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        setDraftSavedAt(t);
        setToast({ tone: "success", text: "Draft saved locally." });
      } catch {
        setToast({ tone: "error", text: "Could not save draft to this browser." });
      }
    },
    [audience, programId, subject, message, useTemplate, trackOpens, scheduledFor],
  );

  function clearDraft() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
    }
    setDraftSavedAt(null);
  }

  function dismissVerify() {
    setVerifyDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VERIFY_DISMISS_KEY, "1");
    }
  }

  function buildInput(): ComposeInput {
    return {
      audience,
      programId,
      subject,
      message,
      useTemplate,
      trackOpens,
    };
  }

  function onSendConfirmed() {
    startTransition(async () => {
      const res: SendResult = await sendCampaign(buildInput());
      if (!res.ok) {
        setToast({ tone: "error", text: res.error });
        return;
      }
      setToast({
        tone: "success",
        text: `Sent to ${res.sent} recipient${res.sent === 1 ? "" : "s"}${res.skipped ? ` · ${res.skipped} skipped` : ""}.`,
      });
      setConfirmOpen(false);
      clearDraft();
      setSubject("");
      setMessage("");
    });
  }

  function onSendTest() {
    startTransition(async () => {
      const res = await sendTestEmail(buildInput());
      if (!res.ok) {
        setToast({ tone: "error", text: res.error });
        return;
      }
      setToast({ tone: "success", text: `Test sent to ${adminEmail}.` });
    });
  }

  /** Persist the current compose state as a server-side draft so it shows on
   *  the History page (status: Draft). Keeps the localStorage autosave too. */
  function onSaveDraftServer() {
    saveDraft(); // instant local autosave
    startTransition(async () => {
      const res = await saveAsDraft(buildInput(), serverDraftId ?? undefined);
      if (!res.ok) {
        setToast({ tone: "error", text: res.error });
        return;
      }
      if (res.id) setServerDraftId(res.id);
      setToast({ tone: "success", text: "Draft saved to History." });
    });
  }

  function onSchedule() {
    if (!scheduledFor) return;
    const iso = new Date(scheduledFor).toISOString();
    startTransition(async () => {
      const res = await scheduleCampaign(buildInput(), iso);
      if (!res.ok) {
        setToast({ tone: "error", text: res.error });
        return;
      }
      saveDraft();
      setScheduleOpen(false);
      setToast({
        tone: "success",
        text: `Scheduled for ${formatLocalDateTime(scheduledFor)}. It'll send automatically (or run it from History).`,
      });
    });
  }

  /** Save the current subject/body as a reusable template. */
  function onSaveAsTemplate() {
    const name = typeof window !== "undefined"
      ? window.prompt("Template name", subject.trim() || "Untitled template")
      : null;
    if (name === null) return; // cancelled
    startTransition(async () => {
      const res = await createEmailTemplate({
        name: name.trim() || "Untitled template",
        subject,
        body: message,
        useBrandedTemplate: useTemplate,
        trackOpens,
      });
      if (!res.ok) {
        setToast({ tone: "error", text: res.error });
        return;
      }
      setToast({ tone: "success", text: "Saved to Templates." });
    });
  }

  /* ── Insertion helpers (textarea + input cursor manipulation) ─────────── */
  function insertIntoMessage(text: string) {
    const el = messageRef.current;
    if (!el) {
      setMessage((m) => m + text);
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    const next = message.slice(0, start) + text + message.slice(end);
    setMessage(next);
    // Restore cursor after React commits.
    window.requestAnimationFrame(() => {
      const pos = start + text.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  function wrapMessageSelection(prefix: string, suffix: string = prefix, placeholder = "") {
    const el = messageRef.current;
    if (!el) return;
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? message.length;
    const selected = message.slice(start, end) || placeholder;
    const next = message.slice(0, start) + prefix + selected + suffix + message.slice(end);
    setMessage(next);
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function prefixMessageLine(prefix: string) {
    const el = messageRef.current;
    if (!el) return;
    const start = el.selectionStart ?? message.length;
    const lineStart = message.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const next = message.slice(0, lineStart) + prefix + message.slice(lineStart);
    setMessage(next);
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + prefix.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function insertIntoSubject(text: string) {
    const el = subjectRef.current;
    if (!el) {
      setSubject((s) => s + text);
      return;
    }
    const start = el.selectionStart ?? subject.length;
    const end = el.selectionEnd ?? subject.length;
    const next = subject.slice(0, start) + text + subject.slice(end);
    setSubject(next);
    window.requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function insertVariable(v: EmailVariable) {
    if (lastFocusRef.current === "subject") insertIntoSubject(v.code);
    else insertIntoMessage(v.code);
  }

  function insertEmoji(e: string) {
    if (lastFocusRef.current === "subject") insertIntoSubject(e);
    else insertIntoMessage(e);
    setEmojiOpen(false);
  }

  function onConfirmLink() {
    const url = linkUrl.trim();
    if (!url) return;
    const text = linkText.trim() || url;
    insertIntoMessage(`[${text}](${url})`);
    setLinkPromptOpen(false);
    setLinkText("");
    setLinkUrl("");
  }

  /* ── Preview rendering ────────────────────────────────────────────────── */
  const previewSubject = useMemo(
    () => substituteVariables(subject || "(no subject)", previewContext()),
    [subject],
  );
  const previewHtml = useMemo(() => {
    const body = substituteVariables(message || "(empty message)", previewContext());
    return mdToHtml(body);
  }, [message]);

  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed top-6 right-6 z-50 max-w-sm px-4 py-3 rounded-[12px] shadow-card border text-[13px] flex items-start gap-2.5",
            toast.tone === "success" && "bg-success-bg border-success/30 text-success",
            toast.tone === "error" && "bg-rose-50 border-rose-200 text-rose-700",
            toast.tone === "info" && "bg-amber-50 border-amber-200 text-ink-700",
          )}
        >
          <span className="flex-1 min-w-0">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="shrink-0 -mr-1 size-6 rounded-full inline-flex items-center justify-center hover:bg-white/40"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">
            Compose
          </h1>
          <p className="text-ink-500 text-[14px]">
            Send a message to individual creators, members in a program, or
            your full audience.
          </p>
          {draftRestored && (
            <p className="mt-1.5 text-[11.5px] text-ink-500 italic">
              Restored a saved draft from this browser.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Eye className="size-4" strokeWidth={2} />
            Preview
          </button>
          <button
            type="button"
            onClick={onSaveDraftServer}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Save className="size-4" strokeWidth={2} />
            {draftSavedAt ? `Saved · ${draftSavedAt}` : "Save draft"}
          </button>
          <button
            type="button"
            disabled={!canSend || pending}
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold transition-colors shadow-sm"
          >
            <Send className="size-4" strokeWidth={2} />
            Send email
          </button>
        </div>
      </header>

      {/* ── Two-column body ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* ─── Main column ─────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Sending available banner */}
          <Banner tone="success">
            <CheckCircle2 className="size-5 text-success shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-900">
                Sending available
              </div>
              <p className="text-[12.5px] text-ink-500 mt-0.5">
                {QUOTA.limit - QUOTA.used} emails remaining in the current 24-hour window.
              </p>
            </div>
            <Link
              href="/admin/emails/settings"
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-success hover:opacity-90 shrink-0"
            >
              Usage details
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </Link>
          </Banner>

          {/* Verify domain banner */}
          {!verifyDismissed && (
            <Banner tone="warning">
              <AlertTriangle className="size-5 text-amber-600 shrink-0" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-ink-900">
                  Verify your sending domain to improve deliverability.
                </div>
                <p className="text-[12.5px] text-ink-500 mt-0.5">
                  Authenticating your domain helps your emails reach the inbox.
                </p>
              </div>
              <Link
                href="/admin/emails/settings"
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-amber-700 hover:opacity-90 shrink-0"
              >
                Verify domain
                <ChevronRight className="size-3.5" strokeWidth={2} />
              </Link>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={dismissVerify}
                className="size-7 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-amber-100 hover:text-ink-700 shrink-0"
              >
                <X className="size-3.5" strokeWidth={2} />
              </button>
            </Banner>
          )}

          {/* Audience card */}
          <section className="card p-5 sm:p-6">
            <header className="flex items-center gap-2 mb-4">
              <Users className="size-4 text-rose-600" strokeWidth={2} />
              <h2 className="text-[15px] font-bold text-ink-900">Audience</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Send to">
                <Select
                  value={audience}
                  onChange={(v) => setAudience(v as typeof audience)}
                  options={[
                    { value: "all", label: "All users" },
                    { value: "active", label: "Active users" },
                    { value: "program", label: "Program members" },
                  ]}
                />
              </Field>
              <Field label="Program / segment" optional>
                <Select
                  value={programId}
                  onChange={setProgramId}
                  disabled={audience !== "program"}
                  options={[
                    { value: "", label: "All programs" },
                    ...programs.map((p) => ({ value: p.id, label: p.title })),
                  ]}
                />
              </Field>
              <div>
                <div className="text-[12.5px] text-ink-500 mb-1.5 flex items-center gap-1">
                  Estimated recipients
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[24px] font-bold text-ink-900 tabular-nums leading-none">
                    {estimated.toLocaleString()}
                  </span>
                  <Info className="size-3.5 text-ink-400" strokeWidth={2} />
                </div>
                <Link
                  href="/admin/users"
                  className="mt-1.5 inline-block text-[12px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  View audience breakdown
                </Link>
              </div>
            </div>
          </section>

          {/* Subject card */}
          <section className="card p-5 sm:p-6">
            <header className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-rose-600" strokeWidth={2} />
                <h2 className="text-[15px] font-bold text-ink-900">Subject line</h2>
              </div>
              <Popover
                open={subjectVarOpen}
                onClose={() => setSubjectVarOpen(false)}
                trigger={
                  <button
                    type="button"
                    onClick={() => {
                      lastFocusRef.current = "subject";
                      setSubjectVarOpen((v) => !v);
                    }}
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Personalize
                    <ChevronDown className="size-3.5" strokeWidth={2} />
                  </button>
                }
              >
                <VariableMenu
                  onPick={(v) => {
                    insertIntoSubject(v.code);
                    setSubjectVarOpen(false);
                  }}
                />
              </Popover>
            </header>
            <div className="relative">
              <input
                ref={subjectRef}
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onFocus={() => (lastFocusRef.current = "subject")}
                placeholder="Write a compelling subject line..."
                className="w-full h-12 pl-4 pr-12 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
              />
              <Popover
                open={emojiOpen}
                onClose={() => setEmojiOpen(false)}
                anchorClassName="absolute right-3 top-1/2 -translate-y-1/2"
                trigger={
                  <button
                    type="button"
                    aria-label="Insert emoji"
                    onClick={() => {
                      // emoji button on the subject row — insert there by default
                      lastFocusRef.current = "subject";
                      setEmojiOpen((v) => !v);
                    }}
                    className="size-8 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-rose-500"
                  >
                    <Smile className="size-4" strokeWidth={2} />
                  </button>
                }
              >
                <EmojiPicker onPick={insertEmoji} />
              </Popover>
            </div>
          </section>

          {/* Message card */}
          <section className="card p-5 sm:p-6">
            <header className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <PenSquare className="size-4 text-rose-600" strokeWidth={2} />
                <h2 className="text-[15px] font-bold text-ink-900">Message</h2>
              </div>
              <div className="flex items-center gap-3">
                <Popover
                  open={messageVarOpen}
                  onClose={() => setMessageVarOpen(false)}
                  trigger={
                    <button
                      type="button"
                      onClick={() => {
                        lastFocusRef.current = "message";
                        setMessageVarOpen((v) => !v);
                      }}
                      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-700 hover:text-rose-600"
                    >
                      Insert variable
                      <ChevronDown className="size-3.5" strokeWidth={2} />
                    </button>
                  }
                >
                  <VariableMenu
                    onPick={(v) => {
                      insertIntoMessage(v.code);
                      setMessageVarOpen(false);
                    }}
                  />
                </Popover>
                <button
                  type="button"
                  onClick={() => setVariablesModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Lightbulb className="size-3.5" strokeWidth={2} />
                  Personalization guide
                </button>
              </div>
            </header>

            {/* Toolbar */}
            <RichTextToolbar
              onBold={() => wrapMessageSelection("**", "**", "bold text")}
              onItalic={() => wrapMessageSelection("*", "*", "italic text")}
              onUnderline={() => wrapMessageSelection("__", "__", "underlined")}
              onStrike={() => wrapMessageSelection("~~", "~~", "strikethrough")}
              onLink={() => setLinkPromptOpen(true)}
              onQuote={() => prefixMessageLine("> ")}
              onCode={() => wrapMessageSelection("`", "`", "code")}
              onBullet={() => prefixMessageLine("- ")}
              onOrdered={() => prefixMessageLine("1. ")}
            />

            {/* Body */}
            <div className="relative">
              <textarea
                ref={messageRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => (lastFocusRef.current = "message")}
                placeholder="Start writing your message..."
                rows={10}
                className="w-full px-4 py-4 rounded-b-[12px] border-x border-b border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 resize-y focus:outline-none focus:border-rose-300 transition-colors font-mono"
              />
              <div className="absolute bottom-3 right-3 text-[11.5px] text-ink-400 tabular-nums pointer-events-none">
                {wordCount} word{wordCount === 1 ? "" : "s"}
              </div>
            </div>

            {/* Toggles */}
            <div className="mt-4 flex items-center gap-6 flex-wrap">
              <Toggle
                icon={<PenSquare className="size-3.5" strokeWidth={2} />}
                label="Use branded template"
                checked={useTemplate}
                onChange={setUseTemplate}
              />
              <Toggle
                icon={<Eye className="size-3.5" strokeWidth={2} />}
                label="Track opens"
                checked={trackOpens}
                onChange={setTrackOpens}
              />
            </div>
          </section>

          {/* Bottom action row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <SecondaryButton
                onClick={onSendTest}
                disabled={pending}
                icon={
                  pending ? (
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <FlaskConical className="size-4" strokeWidth={2} />
                  )
                }
              >
                Send test
              </SecondaryButton>
              <SecondaryButton
                onClick={() => setScheduleOpen(true)}
                icon={<CalendarClock className="size-4" strokeWidth={2} />}
              >
                Schedule
              </SecondaryButton>
              <SecondaryButton
                onClick={onSaveDraftServer}
                icon={<Save className="size-4" strokeWidth={2} />}
              >
                {draftSavedAt ? `Saved · ${draftSavedAt}` : "Save draft"}
              </SecondaryButton>
              <SecondaryButton
                onClick={onSaveAsTemplate}
                icon={<Copy className="size-4" strokeWidth={2} />}
              >
                Save as template
              </SecondaryButton>
            </div>
            <button
              type="button"
              disabled={!canSend || pending}
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold transition-colors shadow-sm"
            >
              <Send className="size-4" strokeWidth={2} />
              Send email
            </button>
          </div>
        </div>

        {/* ─── Right rail ─────────────────────────────────────────── */}
        <aside className="space-y-5 xl:sticky xl:top-4">
          <RightCard
            icon={<BarChart3 className="size-4" strokeWidth={2} />}
            title="Campaign summary"
          >
            <SummaryRow label="Audience" value={audienceLabel(audience)} />
            <SummaryRow label="Estimated sends" value={estimated.toLocaleString()} />
            <SummaryRow
              label="Sender"
              value={
                <span className="text-right">
                  <span className="block text-ink-900 font-semibold">{adminName}</span>
                  <span className="block text-[11.5px] text-ink-500">{adminEmail}</span>
                </span>
              }
            />
            <SummaryRow
              label="Send time"
              value={scheduledFor ? formatLocalDateTime(scheduledFor) : "Send now"}
            />
            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-500">
              Counts are estimates and may change.
              <Info className="size-3 text-ink-400" strokeWidth={2} />
            </div>
          </RightCard>

          <RightCard
            icon={<Lightbulb className="size-4" strokeWidth={2} />}
            title="Best practices"
          >
            <BestPractice
              icon={<MessageSquare className="size-4" strokeWidth={2} />}
              title="Write a clear, benefit-driven subject line"
              body="Keep it under 60 characters and create curiosity."
            />
            <BestPractice
              icon={<Sparkles className="size-4" strokeWidth={2} />}
              title="Personalize your message"
              body="Use variables like first name or program to connect."
            />
            <BestPractice
              icon={<Send className="size-4" strokeWidth={2} />}
              title="Add a strong call to action"
              body="Guide readers to take one desired action."
            />
          </RightCard>

          <RightCard
            icon={<Code2 className="size-4" strokeWidth={2} />}
            title="Quick variables"
          >
            {EMAIL_VARIABLES.slice(0, 3).map((v) => (
              <VariableRow key={v.key} variable={v} onInsert={() => insertVariable(v)} />
            ))}
            <button
              type="button"
              onClick={() => setVariablesModalOpen(true)}
              className="mt-2 inline-block text-[12px] font-semibold text-rose-600 hover:text-rose-700"
            >
              View all variables →
            </button>
          </RightCard>
        </aside>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {previewOpen && (
        <Modal onClose={() => setPreviewOpen(false)} title="Email preview">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
              Subject
            </div>
            <div className="text-[18px] font-semibold text-ink-900 leading-snug">
              {previewSubject}
            </div>
            <div className="border-t border-ink-100 pt-4">
              <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                Body
              </div>
              <div
                className="text-[14px] text-ink-900 leading-relaxed prose prose-rose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <p className="pt-3 text-[11.5px] text-ink-500 italic border-t border-ink-100">
              Preview uses sample values for every variable.
            </p>
          </div>
        </Modal>
      )}

      {scheduleOpen && (
        <Modal onClose={() => setScheduleOpen(false)} title="Schedule send">
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-[13px] text-ink-500 leading-relaxed">
              Pick the date and time when this email should be sent. Your draft
              is saved in this browser; a delivery worker isn&apos;t wired yet,
              so you&apos;ll need to come back to send manually for now.
            </p>
            <div>
              <label className="block text-[12.5px] font-semibold text-ink-900 mb-1.5">
                Send at
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                min={nowLocalIso()}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 focus:outline-none focus:border-rose-400"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setScheduledFor("");
                  setScheduleOpen(false);
                }}
                className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSchedule}
                disabled={!scheduledFor}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
              >
                <CalendarClock className="size-3.5" strokeWidth={2} />
                Schedule
              </button>
            </div>
          </div>
        </Modal>
      )}

      {variablesModalOpen && (
        <Modal onClose={() => setVariablesModalOpen(false)} title="All variables">
          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-[13px] text-ink-500 leading-relaxed">
              Click any variable to insert it into the field you most recently
              focused (subject line or message). Each one is replaced with the
              recipient&apos;s value when the email is sent.
            </p>
            <ul className="space-y-2 pt-1">
              {EMAIL_VARIABLES.map((v) => (
                <li
                  key={v.key}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-ink-100 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900">
                      {v.label}
                    </div>
                    <div className="text-[11.5px] text-ink-500 truncate">
                      Example: {v.example}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <code className="px-2 py-1 rounded-[6px] bg-rose-50 text-rose-700 text-[11px] font-mono">
                      {v.code}
                    </code>
                    <button
                      type="button"
                      aria-label="Insert variable"
                      onClick={() => {
                        insertVariable(v);
                        setVariablesModalOpen(false);
                      }}
                      className="size-8 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-700 inline-flex items-center justify-center"
                    >
                      <Copy className="size-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}

      {confirmOpen && (
        <Modal onClose={() => setConfirmOpen(false)} title="Send email?">
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-[13.5px] text-ink-700 leading-relaxed">
              You&apos;re about to send{" "}
              <strong className="text-ink-900">
                &ldquo;{subject.trim() || "Untitled campaign"}&rdquo;
              </strong>{" "}
              to approximately{" "}
              <strong className="text-ink-900 tabular-nums">
                {estimated.toLocaleString()} {audienceLabel(audience).toLowerCase()}
              </strong>
              . This action cannot be undone.
            </p>
            <div className="rounded-[10px] bg-cream-100/60 border border-ink-100 px-3.5 py-2.5 text-[12.5px] text-ink-700">
              <div>
                <span className="text-ink-500">Sender:</span>{" "}
                <span className="font-semibold">{adminName}</span>{" "}
                <span className="text-ink-500">&lt;{adminEmail}&gt;</span>
              </div>
              {useTemplate && (
                <div className="mt-1 text-ink-500">Branded template enabled.</div>
              )}
              {trackOpens && (
                <div className="mt-1 text-ink-500">Open tracking enabled.</div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
                className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSendConfirmed}
                disabled={pending}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold shadow-sm"
              >
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <Send className="size-3.5" strokeWidth={2} />
                )}
                Send to {estimated.toLocaleString()}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {linkPromptOpen && (
        <Modal onClose={() => setLinkPromptOpen(false)} title="Insert link">
          <div className="p-5 sm:p-6 space-y-3">
            <label className="block">
              <span className="block text-[12.5px] font-semibold text-ink-900 mb-1.5">
                Display text
              </span>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Read the guide"
                className="w-full h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] focus:outline-none focus:border-rose-400"
              />
            </label>
            <label className="block">
              <span className="block text-[12.5px] font-semibold text-ink-900 mb-1.5">
                URL
              </span>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-10 px-3.5 rounded-[10px] border border-ink-200 bg-white text-[13.5px] focus:outline-none focus:border-rose-400"
              />
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkPromptOpen(false)}
                className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmLink}
                disabled={!linkUrl.trim()}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
              >
                <Link2 className="size-3.5" strokeWidth={2} />
                Insert
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                   */
/* ───────────────────────────────────────────────────────────────────────── */

function audienceLabel(a: "all" | "active" | "program"): string {
  return a === "all" ? "All users" : a === "active" ? "Active users" : "Program members";
}

function nowLocalIso(): string {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function formatLocalDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Minimal markdown → HTML for the in-app preview. Mirrors the server-side
 *  renderer in actions.ts so what the admin sees matches what gets sent. */
function mdToHtml(input: string): string {
  return escapeHtml(input)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*[^*\s]|[^*\s])\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>")
    .replace(/__([^_]+)__/g, "<u>$1</u>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/`([^`]+)`/g, "<code style=\"background:#f9e8e8;padding:1px 5px;border-radius:4px;\">$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#e11d48;text-decoration:underline;">$1</a>')
    .replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid #f9c5c5;padding-left:10px;color:#6b7280;margin:8px 0;">$1</blockquote>')
    .replace(/(^|\n)- (.+)/g, "$1• $2")
    .replace(/(^|\n)\d+\. (.+)/g, "$1$2")
    .replace(/\n/g, "<br>");
}

/* ───────────────────────────────────────────────────────────────────────── */
/* UI primitives                                                             */
/* ───────────────────────────────────────────────────────────────────────── */

function Banner({
  tone,
  children,
}: {
  tone: "success" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border px-4 py-3 flex items-center gap-3",
        tone === "success" && "bg-success-bg/40 border-success/20",
        tone === "warning" && "bg-amber-50 border-amber-200",
      )}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[12.5px] text-ink-500 mb-1.5 flex items-center gap-1.5">
        {label}
        {optional && <span className="text-[11px] text-ink-400 italic">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "appearance-none w-full h-11 pl-3.5 pr-9 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-900 cursor-pointer focus:outline-none focus:border-rose-400 transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function Toggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <span className="size-6 rounded-[8px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-[13px] text-ink-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex items-center h-6 w-11 rounded-full transition-colors",
          checked ? "bg-rose-500" : "bg-ink-200",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}

function SecondaryButton({
  onClick,
  icon,
  children,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}

function RichTextToolbar({
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onLink,
  onQuote,
  onCode,
  onBullet,
  onOrdered,
}: {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrike: () => void;
  onLink: () => void;
  onQuote: () => void;
  onCode: () => void;
  onBullet: () => void;
  onOrdered: () => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap px-3 py-2 rounded-t-[12px] border border-ink-200 bg-cream-50/60">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] text-[12.5px] font-medium text-ink-700 hover:bg-cream-200 cursor-default"
        title="Paragraph"
      >
        Paragraph
        <ChevronDown className="size-3" strokeWidth={2} />
      </button>
      <Sep />
      <ToolBtn icon={Bold} label="Bold (**text**)" onClick={onBold} />
      <ToolBtn icon={Italic} label="Italic (*text*)" onClick={onItalic} />
      <ToolBtn icon={Underline} label="Underline (__text__)" onClick={onUnderline} />
      <ToolBtn icon={Strikethrough} label="Strikethrough (~~text~~)" onClick={onStrike} />
      <Sep />
      <ToolBtn icon={Link2} label="Insert link" onClick={onLink} />
      <ToolBtn icon={Quote} label="Quote (> text)" onClick={onQuote} />
      <ToolBtn icon={Code} label="Inline code (`code`)" onClick={onCode} />
      <Sep />
      <ToolBtn icon={List} label="Bulleted list" onClick={onBullet} />
      <ToolBtn icon={ListOrdered} label="Numbered list" onClick={onOrdered} />
      <Sep />
      <ToolBtn icon={AlignLeft} label="Align left (visual only)" onClick={() => undefined} disabled />
      <ToolBtn icon={AlignCenter} label="Align center (visual only)" onClick={() => undefined} disabled />
      <Sep />
      <ToolBtn icon={Type} label="Text color (visual only)" onClick={() => undefined} disabled />
      <ToolBtn icon={Type} label="Background (visual only)" onClick={() => undefined} disabled />
      <Sep />
      <ToolBtn icon={ImageIcon} label="Image (coming soon)" onClick={() => undefined} disabled />
      <ToolBtn icon={Table} label="Table (coming soon)" onClick={() => undefined} disabled />
      <ToolBtn icon={MoreHorizontal} label="More" onClick={() => undefined} disabled />
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "size-8 inline-flex items-center justify-center rounded-[8px] text-ink-600 hover:bg-cream-200 hover:text-ink-900 cursor-pointer",
        disabled && "opacity-40 hover:bg-transparent hover:text-ink-600 cursor-not-allowed",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="w-px h-5 bg-ink-200 mx-1" />;
}

function RightCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <header className="flex items-center gap-2 mb-3">
        <span className="text-rose-600">{icon}</span>
        <h3 className="text-[14px] font-bold text-ink-900">{title}</h3>
      </header>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-ink-500 shrink-0">{label}</span>
      <span className="text-right text-ink-900 font-medium min-w-0">{value}</span>
    </div>
  );
}

function BestPractice({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="size-7 rounded-[8px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink-900 leading-snug">{title}</div>
        <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">{body}</p>
      </div>
    </div>
  );
}

function VariableRow({
  variable,
  onInsert,
}: {
  variable: EmailVariable;
  onInsert: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onInsert}
      className="w-full flex items-center justify-between gap-3 text-left hover:bg-cream-100/60 -mx-1 px-1 py-0.5 rounded-[6px] transition-colors"
      title={`Insert ${variable.code}`}
    >
      <span className="text-[12.5px] text-ink-700">{variable.label}</span>
      <code className="inline-flex items-center px-2 py-1 rounded-[6px] bg-rose-50 text-rose-700 text-[11px] font-mono">
        {variable.code}
      </code>
    </button>
  );
}

function VariableMenu({ onPick }: { onPick: (v: EmailVariable) => void }) {
  return (
    <ul className="py-1 min-w-[220px]">
      {EMAIL_VARIABLES.map((v) => (
        <li key={v.key}>
          <button
            type="button"
            onClick={() => onPick(v)}
            className="w-full text-left px-3 py-2 flex items-center justify-between gap-3 hover:bg-cream-100"
          >
            <span className="text-[12.5px] text-ink-900 font-medium">{v.label}</span>
            <code className="text-[10.5px] font-mono text-rose-700">{v.code}</code>
          </button>
        </li>
      ))}
    </ul>
  );
}

function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1 p-2 w-[260px]">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onPick(e)}
          className="size-8 inline-flex items-center justify-center rounded-[6px] hover:bg-cream-100 text-[18px] leading-none"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function Popover({
  open,
  onClose,
  trigger,
  children,
  anchorClassName,
}: {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  anchorClassName?: string;
}) {
  return (
    <span className={cn("relative inline-block", anchorClassName)}>
      {trigger}
      {open && (
        <>
          <span
            onClick={onClose}
            className="fixed inset-0 z-30"
            aria-hidden
          />
          <div className="absolute right-0 top-[calc(100%+6px)] z-40 bg-white border border-ink-200 rounded-[12px] shadow-card overflow-hidden">
            {children}
          </div>
        </>
      )}
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-ink-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
