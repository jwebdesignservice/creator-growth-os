"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Paperclip,
  Lightbulb,
  Info,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/app-shell/page-shell";
import { cn } from "@/lib/cn";
import {
  SUPPORT_TOPICS,
  SUPPORT_PAGE_OPTIONS,
  SUPPORT_PRIORITY_OPTIONS,
  SUPPORT_DEVICE_OPTIONS,
  NEXT_STEPS,
  RESPONSE_TIMES,
} from "./mock-data";
import type {
  NextStepRow,
  RecentTicket,
  ResponseTimeRow,
  StepperStep,
  SupportStepKey,
  SupportTopic,
  TicketStatus,
} from "./types";
import {
  submitSupportTicket,
  type ActionResult,
} from "@/lib/support/actions";
import type {
  HelpArticle as DbHelpArticle,
  SupportTicket as DbSupportTicket,
} from "@/lib/support/types";

/* ─────────────────────────────────────────────────────────────────────────
   Support / Contact page client.

   Multi-step wizard:
     • Step 1: Choose Topic     → only the topic grid + Next.
     • Step 2: Add Details      → topic recap + the full request form.
     • Step 3: Review & Send    → read-only preview + Submit.
     • Success state            → confirmation card with the new public_id.

   The current step lives in URL state (?step=topic|details|review) so the
   page is shareable, refresh-safe, and the browser back button moves
   between steps naturally. Form values live in component state — they are
   only persisted when the user submits.
   ───────────────────────────────────────────────────────────────────────── */

const STEP_ORDER: SupportStepKey[] = ["topic", "details", "review"];

const STEP_LABELS: Record<SupportStepKey, string> = {
  topic:   "Choose Topic",
  details: "Add Details",
  review:  "Review & Send",
};

function stepStates(active: SupportStepKey): StepperStep[] {
  const activeIndex = STEP_ORDER.indexOf(active);
  return STEP_ORDER.map((key, i) => ({
    index: i + 1,
    label: STEP_LABELS[key],
    state: i < activeIndex ? "completed" : i === activeIndex ? "active" : "upcoming",
  }));
}

type Props = {
  initialStep:  SupportStepKey;
  initialTopic?: string;
  recentTickets: DbSupportTicket[];
  helpArticles:  DbHelpArticle[];
  firstName?:    string;
};

export function SupportPageClient({
  initialStep,
  initialTopic,
  recentTickets,
  helpArticles,
  firstName,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<SupportStepKey>(initialStep);
  const [, startTransition] = useTransition();

  // Form state — empty by default. Topic can be deep-linked via
  // /support/new?topic=<key>; other fields the user fills in fresh.
  // (We used to seed every field from a mock draft to make the layout
  // "feel alive", which left users staring at a pre-filled fake ticket
  // about a "MacBook Pro Chrome upload issue" — confusing and wrong.)
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic ?? "");
  const [subject,       setSubject]       = useState("");
  const [pageAffected,  setPageAffected]  = useState("");
  const [priority,      setPriority]      = useState<string>("medium");
  const [device,        setDevice]        = useState("");
  const [description,   setDescription]   = useState("");
  const [ticketRef,     setTicketRef]     = useState("");
  const [attachment,    setAttachment]    = useState<File | null>(null);

  // Submission state.
  const [submitting, setSubmitting] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});
  const [submitted,    setSubmitted]    = useState<{ publicId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const descMax = 2000;

  /* ── URL-aware step navigation ────────────────────────────────────── */
  function go(next: SupportStepKey) {
    setStep(next);
    startTransition(() => {
      router.replace(next === "topic" ? "/support/new" : `/support/new?step=${next}`, { scroll: false });
    });
  }

  function clientValidateDetails(): boolean {
    const errors: Record<string, string> = {};
    if (!subject.trim())                 errors.subject     = "Please give your request a short title.";
    if (!description.trim())             errors.description = "Please describe the issue.";
    else if (description.trim().length < 10) errors.description = "Please describe the issue in at least 10 characters.";
    if (description.length > descMax)    errors.description = `Description must be ${descMax} characters or fewer.`;
    if (!pageAffected)                   errors.pageAffected = "Choose which page or area is affected.";
    if (!priority)                       errors.priority     = "Choose a priority.";
    if (!device.trim())                  errors.device       = "Tell us which device or browser you’re using.";
    if (attachment && attachment.size > 10 * 1024 * 1024) {
      errors.attachment = "Attachment must be 10 MB or smaller.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* ── Submit handler ──────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!clientValidateDetails()) {
      go("details");
      return;
    }
    setServerError(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.set("topic",        selectedTopic);
    fd.set("subject",      subject);
    fd.set("pageAffected", pageAffected);
    fd.set("priority",     priority);
    fd.set("device",       device);
    fd.set("description",  description);
    if (ticketRef)  fd.set("ticketRef", ticketRef);
    if (attachment) fd.set("attachment", attachment);

    const result: ActionResult<{ publicId: string }> = await submitSupportTicket(null, fd);
    setSubmitting(false);

    if (!result.ok) {
      setServerError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      // If validation failed on the server, send the user back to the
      // form so they can fix the highlighted fields.
      go("details");
      return;
    }

    setSubmitted({ publicId: result.data!.publicId });
  }

  /* ── File upload handlers ─────────────────────────────────────────── */
  function onAttachClick() { fileInputRef.current?.click(); }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setAttachment(f);
    setFieldErrors((prev) => {
      if (!("attachment" in prev)) return prev;
      const next = { ...prev };
      delete next.attachment;
      return next;
    });
  }
  function clearAttachment() {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ── Derived view content ─────────────────────────────────────────── */
  const steps = useMemo(() => stepStates(submitted ? "review" : step), [step, submitted]);

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <PageShell
      rail={
        <SupportRail
          recentTickets={recentTickets.map(dbTicketToRail).slice(0, 3)}
          helpArticles={helpArticles}
        />
      }
    >
      <div className="max-w-[var(--container-content)] space-y-4">
        {/* ── Header ───────────────────────────────────────────────── */}
        <header>
          {firstName && (
            <div className="text-rose-600 font-medium text-[13.5px] flex items-center gap-2 mb-2">
              Welcome back, {firstName}! <span aria-hidden>👋</span>
            </div>
          )}
          <h1 className="text-page-title text-ink-900">
            Support &amp; Contact
          </h1>
          <p className="mt-1.5 text-[13.5px] sm:text-[14px] text-ink-500 max-w-2xl leading-relaxed">
            We’re here to help! Choose the right topic and share the details so our
            team can assist you faster.
          </p>
        </header>

        {/* ── Stepper ──────────────────────────────────────────────── */}
        <Stepper steps={steps} />

        {/* ── Success state takes over the form area ──────────────── */}
        {submitted ? (
          <SuccessCard publicId={submitted.publicId} onNew={() => {
            setSubmitted(null);
            setSelectedTopic("");
            setSubject("");
            setPageAffected("");
            setPriority("medium");
            setDevice("");
            setDescription("");
            setTicketRef("");
            setAttachment(null);
            setFieldErrors({});
            setServerError(null);
            go("topic");
          }} />
        ) : (
          <>
            {serverError && (
              <div className="flex items-start gap-2.5 rounded-[12px] border border-rose-200 bg-rose-50 px-3.5 py-3 text-[12.5px] text-rose-700">
                <AlertCircle className="size-4 shrink-0 mt-px" strokeWidth={1.9} aria-hidden />
                <span className="leading-snug flex-1">{humanizeError(serverError)}</span>
                <button
                  type="button"
                  onClick={() => setServerError(null)}
                  aria-label="Dismiss"
                  className="shrink-0 -my-1 -mr-1 size-7 rounded-full inline-flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <X className="size-3.5" strokeWidth={2.2} />
                </button>
              </div>
            )}

            {/* Main card — content varies per step. */}
            <section className="card p-4 sm:p-5 space-y-3.5 sm:space-y-4">
              {step === "topic" && (
                <TopicStep
                  selected={selectedTopic}
                  onSelect={setSelectedTopic}
                />
              )}

              {step === "details" && (
                <DetailsStep
                  selectedTopic={selectedTopic}
                  onChangeTopic={() => go("topic")}
                  subject={subject} setSubject={setSubject}
                  pageAffected={pageAffected} setPageAffected={setPageAffected}
                  priority={priority} setPriority={setPriority}
                  device={device} setDevice={setDevice}
                  description={description} setDescription={setDescription}
                  ticketRef={ticketRef} setTicketRef={setTicketRef}
                  attachment={attachment}
                  fileInputRef={fileInputRef}
                  onAttachClick={onAttachClick}
                  onFileChange={onFileChange}
                  onClearAttachment={clearAttachment}
                  descMax={descMax}
                  fieldErrors={fieldErrors}
                />
              )}

              {step === "review" && (
                <ReviewStep
                  selectedTopic={selectedTopic}
                  subject={subject}
                  pageAffected={pageAffected}
                  priority={priority}
                  device={device}
                  description={description}
                  ticketRef={ticketRef}
                  attachment={attachment}
                  onEdit={() => go("details")}
                />
              )}
            </section>

            {/* ── Form actions ──────────────────────────────────────── */}
            <FormActions
              step={step}
              submitting={submitting}
              canAdvanceFromTopic={Boolean(selectedTopic)}
              onBack={() => {
                if (step === "topic") return;
                go(step === "review" ? "details" : "topic");
              }}
              onPrimary={() => {
                if (step === "topic") {
                  if (!selectedTopic) return;
                  go("details");
                  return;
                }
                if (step === "details") {
                  if (!clientValidateDetails()) return;
                  go("review");
                  return;
                }
                // step === "review" → submit
                handleSubmit();
              }}
            />
          </>
        )}
      </div>
    </PageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Form actions row
   ───────────────────────────────────────────────────────────────────────── */

function FormActions({
  step,
  submitting,
  canAdvanceFromTopic,
  onBack,
  onPrimary,
}: {
  step: SupportStepKey;
  submitting: boolean;
  canAdvanceFromTopic: boolean;
  onBack: () => void;
  onPrimary: () => void;
}) {
  const primaryLabel =
    step === "topic"   ? "Continue" :
    step === "details" ? "Review Request" :
                         submitting ? "Sending…" : "Submit Request";

  const primaryDisabled =
    submitting || (step === "topic" && !canAdvanceFromTopic);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Primary action — first in source order so it's the dominant CTA on
         mobile (column flow), but sits in the middle/right on desktop. */}
      <Button
        variant="primary"
        size="md"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="gap-1.5 w-full sm:w-auto order-1 sm:order-2"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : null}
        {primaryLabel}
        {!submitting && <ArrowRight className="size-4" strokeWidth={2} />}
      </Button>

      {step !== "topic" && (
        <Button
          variant="outline"
          size="md"
          className="gap-1.5 w-full sm:w-auto order-2 sm:order-1"
          onClick={onBack}
          disabled={submitting}
        >
          <ArrowLeft className="size-4" strokeWidth={1.9} />
          Back
        </Button>
      )}

      <Link
        href="/support"
        className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[12.5px] text-ink-500 hover:text-rose-700 transition-colors order-3"
      >
        Browse Help Center
        <ExternalLink className="size-3" strokeWidth={2} />
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Step 1 — Topic only
   ───────────────────────────────────────────────────────────────────────── */

function TopicStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (k: string) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-[15px] sm:text-[16px] font-semibold text-ink-900">
        Choose your support topic
      </h2>
      <p className="text-[13px] text-ink-500 -mt-1.5 leading-relaxed">
        Selecting the right category routes your request to the right team.
      </p>
      <TopicGrid topics={SUPPORT_TOPICS} selected={selected} onSelect={onSelect} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Step 2 — Details form (same layout as the original spec)
   ───────────────────────────────────────────────────────────────────────── */

function DetailsStep(props: {
  selectedTopic: string;
  onChangeTopic: () => void;
  subject: string;       setSubject: (v: string) => void;
  pageAffected: string;  setPageAffected: (v: string) => void;
  priority: string;      setPriority: (v: string) => void;
  device: string;        setDevice: (v: string) => void;
  description: string;   setDescription: (v: string) => void;
  ticketRef: string;     setTicketRef: (v: string) => void;
  attachment: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAttachClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAttachment: () => void;
  descMax: number;
  fieldErrors: Record<string, string>;
}) {
  const {
    selectedTopic, onChangeTopic,
    subject, setSubject,
    pageAffected, setPageAffected,
    priority, setPriority,
    device, setDevice,
    description, setDescription,
    ticketRef, setTicketRef,
    attachment, fileInputRef, onAttachClick, onFileChange, onClearAttachment,
    descMax, fieldErrors,
  } = props;

  const descLen = description.length;
  const topic = SUPPORT_TOPICS.find((t) => t.key === selectedTopic);

  return (
    <>
      {/* Topic recap — compact pinned row at the top so the user can confirm */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold tracking-wider uppercase text-ink-400">
          Selected topic
        </div>
        {topic ? (
          <div className="flex items-center gap-2.5 rounded-[10px] border border-rose-200 bg-rose-50/40 px-2.5 py-2">
            <span className="size-7 rounded-[8px] inline-flex items-center justify-center shrink-0 bg-rose-100 text-rose-600" aria-hidden>
              <topic.icon className="size-[14px]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                {topic.label}
              </div>
            </div>
            <button
              type="button"
              onClick={onChangeTopic}
              className="text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onChangeTopic}
            className="text-[13px] font-medium text-rose-700 hover:text-rose-600 transition-colors underline-offset-2 hover:underline"
          >
            Pick a topic
          </button>
        )}
      </div>

      {/* Tip — placed once at the top, scoped to the whole form */}
      <GuidanceCallout />

      {/* Form sections — each is a thematic chunk of fields. The wrapper's
         divide-y separates the three sections with a single hairline. */}
      <div className="divide-y divide-ink-100 -mx-1">
      <FormSection
        title="What's the issue?"
        subtitle="A clear summary plus context helps us route this to the right team."
      >
        <FieldText
          label="Subject / Request title"
          required
          value={subject}
          onChange={setSubject}
          placeholder="Briefly describe the issue"
          error={fieldErrors.subject}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="support-description"
            className="block text-[13px] font-medium text-ink-700"
          >
            Detailed description <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <textarea
              id="support-description"
              rows={5}
              maxLength={descMax}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-[12px] bg-white border text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-colors resize-y leading-relaxed",
                fieldErrors.description
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                  : "border-ink-200 focus:border-rose-400 focus:ring-rose-200",
              )}
              placeholder="Describe what happened, what you expected, and any steps to reproduce."
            />
            <span className="absolute bottom-2.5 right-3 text-[11px] text-ink-400 tabular-nums select-none">
              {descLen}/{descMax}
            </span>
          </div>
          {fieldErrors.description && (
            <p className="text-[12px] text-rose-600">{fieldErrors.description}</p>
          )}
        </div>
      </FormSection>

      {/* Section 2 — where & how. Side-by-side selects for the technical
          context. Priority sits on its own row because it's a different axis. */}
      <FormSection
        title="Where did it happen?"
        subtitle="This helps us reproduce the issue on our end."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldSelect
            label="Page or area affected"
            required
            value={pageAffected}
            onChange={setPageAffected}
            options={SUPPORT_PAGE_OPTIONS}
            error={fieldErrors.pageAffected}
          />
          <FieldSelect
            label="Device / Browser"
            required
            value={device}
            onChange={setDevice}
            options={SUPPORT_DEVICE_OPTIONS}
            error={fieldErrors.device}
          />
        </div>
        <FieldSelect
          label="Priority"
          required
          value={priority}
          onChange={setPriority}
          options={SUPPORT_PRIORITY_OPTIONS}
          leadingDot={priorityDotClass(priority)}
          error={fieldErrors.priority}
        />
      </FormSection>

      {/* Section 3 — optional extras. Skippable but useful when relevant. */}
      <FormSection
        title="Additional details"
        subtitle="Optional — helps us find your account or see the issue faster."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldText
            label="Ticket ID or Order / Subscription Reference"
            optional
            value={ticketRef}
            onChange={setTicketRef}
            hint="Helps us find your account or order faster."
            placeholder="SUB-XXXXX-XXX"
          />
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-ink-700">
              Attach screenshot <span className="text-ink-400">(optional)</span>
            </label>
            <UploadField
              file={attachment}
              onClick={onAttachClick}
              onClear={onClearAttachment}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={onFileChange}
            />
            {fieldErrors.attachment && (
              <p className="text-[12px] text-rose-600">{fieldErrors.attachment}</p>
            )}
          </div>
        </div>
      </FormSection>
      </div>
    </>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 py-4 px-1 first:pt-0 last:pb-0">
      <div>
        <h3 className="text-[14px] font-semibold text-ink-900">{title}</h3>
        {subtitle && (
          <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Step 3 — Review & Send
   ───────────────────────────────────────────────────────────────────────── */

function ReviewStep(props: {
  selectedTopic: string;
  subject: string;
  pageAffected: string;
  priority: string;
  device: string;
  description: string;
  ticketRef: string;
  attachment: File | null;
  onEdit: () => void;
}) {
  const topic = SUPPORT_TOPICS.find((t) => t.key === props.selectedTopic);
  const pageLabel = SUPPORT_PAGE_OPTIONS.find((o) => o.value === props.pageAffected)?.label ?? props.pageAffected;
  const priorityLabel = SUPPORT_PRIORITY_OPTIONS.find((o) => o.value === props.priority)?.label ?? props.priority;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-ink-900">
            Review &amp; send
          </h2>
          <p className="text-[12.5px] text-ink-500 mt-1">
            Double-check everything below. You can still go back and edit.
          </p>
        </div>
        <button
          type="button"
          onClick={props.onEdit}
          className="text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors shrink-0"
        >
          Edit details
        </button>
      </div>

      <div className="rounded-[12px] border border-ink-100 bg-cream-50 overflow-hidden">
        <ReviewRow
          label="Topic"
          value={
            <span className="inline-flex items-center gap-2">
              {topic && (
                <span className="size-6 rounded-[7px] bg-rose-100 text-rose-600 inline-flex items-center justify-center" aria-hidden>
                  <topic.icon className="size-[14px]" strokeWidth={1.9} />
                </span>
              )}
              <span className="whitespace-pre-line">{topic?.label ?? props.selectedTopic}</span>
            </span>
          }
        />
        <ReviewRow label="Subject"        value={props.subject || <Em>—</Em>} />
        <ReviewRow label="Page or area"   value={pageLabel || <Em>—</Em>} />
        <ReviewRow
          label="Priority"
          value={
            <span className="inline-flex items-center gap-2">
              <span className={cn("size-2 rounded-full", priorityDotClass(props.priority))} aria-hidden />
              {priorityLabel}
            </span>
          }
        />
        <ReviewRow label="Device / Browser" value={props.device || <Em>—</Em>} />
        <ReviewRow
          label="Description"
          value={
            <span className="whitespace-pre-wrap leading-relaxed text-ink-700">
              {props.description || <Em>—</Em>}
            </span>
          }
        />
        <ReviewRow label="Reference"      value={props.ticketRef || <Em>None</Em>} />
        <ReviewRow
          label="Attachment"
          value={
            props.attachment ? (
              <span className="inline-flex items-center gap-2 text-ink-700">
                <FileText className="size-3.5 text-ink-400" strokeWidth={1.9} />
                <span className="truncate max-w-[260px]">{props.attachment.name}</span>
                <span className="text-ink-400 text-[11.5px]">
                  ({formatFileSize(props.attachment.size)})
                </span>
              </span>
            ) : (
              <Em>No file attached</Em>
            )
          }
          last
        />
      </div>

      <div className="flex items-start gap-2.5 rounded-[12px] bg-cream-200/70 border border-cream-300 px-3.5 py-3">
        <span aria-hidden className="size-7 rounded-[8px] inline-flex items-center justify-center bg-gold-400/15 text-gold-500 shrink-0">
          <Lightbulb className="size-4" strokeWidth={1.9} />
        </span>
        <p className="text-[12.5px] sm:text-[13px] text-ink-700 leading-snug">
          By submitting, you confirm the details are accurate. We’ll email
          you when the team picks up your request.
        </p>
      </div>
    </div>
  );
}

function ReviewRow({
  label, value, last,
}: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-3 sm:gap-5 px-4 py-3 text-[13px]",
        !last && "border-b border-ink-100",
      )}
    >
      <div className="text-[11.5px] uppercase tracking-wider font-semibold text-ink-400">
        {label}
      </div>
      <div className="text-ink-900 min-w-0 break-words">{value}</div>
    </div>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-400">{children}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────
   Success card
   ───────────────────────────────────────────────────────────────────────── */

function SuccessCard({ publicId, onNew }: { publicId: string; onNew: () => void }) {
  return (
    <section className="card p-6 sm:p-8 text-center">
      <div className="mx-auto size-14 rounded-full inline-flex items-center justify-center bg-success-bg text-success">
        <CheckCircle2 className="size-7" strokeWidth={1.8} />
      </div>
      <h2 className="mt-4 text-[20px] sm:text-[22px] font-display text-ink-900 leading-tight">
        Request submitted
      </h2>
      <p className="mt-1.5 text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
        Thanks — we’ve received your request and emailed you a confirmation.
        We’ll follow up as soon as a team member picks it up.
      </p>
      <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-cream-200 text-[12.5px] font-semibold text-ink-700 tabular-nums">
        Reference
        <span className="text-rose-700">#{publicId}</span>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/support/tickets/${publicId}`}
          className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] text-[14px] font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors gap-1.5 shadow-sm"
        >
          View ticket
          <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] text-[14px] font-medium bg-white border border-ink-200 text-ink-900 hover:bg-cream-100 transition-colors"
        >
          Submit another request
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Stepper (shared by all 3 steps)
   ───────────────────────────────────────────────────────────────────────── */

function Stepper({ steps }: { steps: StepperStep[] }) {
  return (
    <nav aria-label="Support flow steps" className="w-full">
      <ol className="flex items-center justify-between gap-2 sm:gap-3 max-w-lg mx-auto">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step.index} className="flex-1 flex items-center min-w-0">
              <div className="flex flex-col items-center gap-2 min-w-0 shrink-0">
                <StepCircle state={step.state} index={step.index} />
                <span
                  className={cn(
                    "text-[12px] sm:text-[12.5px] font-medium tabular-nums text-center whitespace-nowrap",
                    step.state === "active"
                      ? "text-rose-700"
                      : step.state === "completed"
                        ? "text-ink-900"
                        : "text-ink-400",
                  )}
                >
                  {step.index}. {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-px mx-2 sm:mx-3 self-start mt-[14px] sm:mt-[16px] relative">
                  <div className="absolute inset-0 bg-ink-200 rounded-full" />
                  {step.state === "completed" && (
                    <div className="absolute inset-0 bg-rose-600 rounded-full" />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepCircle({ state, index }: { state: StepperStep["state"]; index: number }) {
  if (state === "completed") {
    return (
      <span
        aria-label={`Step ${index} completed`}
        className="size-7 sm:size-8 rounded-full bg-rose-600 text-white inline-flex items-center justify-center shadow-sm"
      >
        <Check className="size-3.5 sm:size-4" strokeWidth={2.4} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span
        aria-label={`Step ${index} active`}
        aria-current="step"
        className="size-7 sm:size-8 rounded-full bg-rose-600 text-white inline-flex items-center justify-center text-[12px] sm:text-[13px] font-semibold ring-4 ring-rose-100"
      >
        {index}
      </span>
    );
  }
  return (
    <span
      aria-label={`Step ${index} upcoming`}
      className="size-7 sm:size-8 rounded-full bg-white border border-ink-200 text-ink-400 inline-flex items-center justify-center text-[12px] sm:text-[13px] font-semibold"
    >
      {index}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Topic grid
   ───────────────────────────────────────────────────────────────────────── */

function TopicGrid({
  topics,
  selected,
  onSelect,
}: {
  topics: SupportTopic[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Support topic"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {topics.map((t) => {
        const Icon = t.icon;
        const active = selected === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(t.key)}
            className={cn(
              "relative text-left group flex flex-col items-start gap-3 rounded-[16px] border bg-white p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100",
              active
                ? "border-rose-400 bg-rose-50/40 ring-1 ring-rose-300/60 shadow-card"
                : "border-ink-100 hover:border-rose-200 hover:shadow-soft",
            )}
          >
            <span
              className={cn(
                "size-11 rounded-[12px] inline-flex items-center justify-center transition-colors",
                active
                  ? "bg-rose-100 text-rose-600"
                  : "bg-cream-200 text-ink-700 group-hover:bg-rose-100 group-hover:text-rose-600",
              )}
              aria-hidden
            >
              <Icon className="size-[20px]" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 w-full">
              <div
                className={cn(
                  "text-[14px] font-semibold leading-snug",
                  active ? "text-rose-700" : "text-ink-900",
                )}
              >
                {t.label}
              </div>
              <p className="text-[12px] text-ink-500 leading-snug mt-1">
                {t.description}
              </p>
            </div>
            {active && (
              <span
                aria-hidden
                className="absolute top-3 right-3 size-[20px] rounded-full bg-rose-600 text-white inline-flex items-center justify-center"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Field primitives
   ───────────────────────────────────────────────────────────────────────── */

function FieldText({
  label, value, onChange, placeholder, hint, required, optional, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
}) {
  const id = `field-${slug(label)}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
        {optional && <span className="text-ink-400"> (optional)</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full h-11 px-4 rounded-[12px] bg-white border text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-colors",
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
            : "border-ink-200 focus:border-rose-400 focus:ring-rose-200",
        )}
      />
      {error ? (
        <p className="text-[12px] text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

function FieldSelect({
  label, value, onChange, options, required, hint, leadingDot, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  leadingDot?: string;
  error?: string;
}) {
  const id = `field-${slug(label)}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <div className="relative">
        {leadingDot && (
          <span
            aria-hidden
            className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 size-2.5 rounded-full", leadingDot)}
          />
        )}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full h-11 rounded-[12px] bg-white border text-[13.5px] text-ink-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-colors pr-9",
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
              : "border-ink-200 focus:border-rose-400 focus:ring-rose-200",
            leadingDot ? "pl-9" : "pl-4",
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-500 pointer-events-none"
          strokeWidth={2}
        />
      </div>
      {error ? (
        <p className="text-[12px] text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

function priorityDotClass(value: string): string {
  switch (value) {
    case "low":    return "bg-ink-300";
    case "medium": return "bg-gold-400";
    case "high":   return "bg-rose-500";
    case "urgent": return "bg-rose-600";
    default:       return "bg-ink-300";
  }
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Map raw backend errors to user-safe messages. Validation errors and other
 * human-readable strings from server actions pass through unchanged.
 */
function humanizeError(raw: string): string {
  if (/table .*schema cache|relation .* does not exist|schema cache/i.test(raw)) {
    return "Support ticket submission isn't connected yet. Your details are saved — meanwhile, please reach us via the Help Center.";
  }
  if (/permission denied|row-level security|RLS|policy/i.test(raw)) {
    return "We couldn't submit your request right now. Please try again, or reach us via the Help Center.";
  }
  if (/network|fetch failed|timeout/i.test(raw)) {
    return "Network hiccup — please check your connection and try again.";
  }
  return raw;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Upload field
   ───────────────────────────────────────────────────────────────────────── */

function UploadField({
  file, onClick, onClear,
}: { file: File | null; onClick: () => void; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] border border-dashed border-rose-200 bg-rose-50/40 px-3 py-2.5 sm:py-3">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-white border border-rose-200 text-[13px] font-medium text-rose-700 hover:bg-rose-50 transition-colors"
      >
        <Paperclip className="size-3.5" strokeWidth={2} />
        Upload file
      </button>
      <div className="min-w-0 flex-1 flex items-center gap-2">
        {file ? (
          <>
            <span className="truncate text-[12.5px] text-ink-700">{file.name}</span>
            <span className="text-[11.5px] text-ink-400 shrink-0">
              ({formatFileSize(file.size)})
            </span>
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove attachment"
              className="size-6 inline-flex items-center justify-center rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-200 transition-colors shrink-0 ml-auto"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </>
        ) : (
          <span className="text-[12px] text-ink-400 truncate">
            PNG, JPG up to 10MB
          </span>
        )}
      </div>
    </div>
  );
}

function GuidanceCallout() {
  return (
    <div className="flex items-start gap-2 rounded-[10px] bg-cream-200/70 border border-cream-300 px-3 py-2.5">
      <Lightbulb
        aria-hidden
        className="size-3.5 text-gold-500 shrink-0 mt-0.5"
        strokeWidth={1.9}
      />
      <p className="text-[12.5px] text-ink-700 leading-snug">
        Support gets faster when you select the correct topic and add clear
        reproduction details.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Right rail
   ───────────────────────────────────────────────────────────────────────── */

function SupportRail({
  // recentTickets is still fetched in page.tsx and kept on the props contract,
  // but intentionally not rendered during the active creation flow — it gets
  // cut off below the fold and isn't contextually useful while submitting.
  // Users still reach tickets via /support/tickets and the success card link.
  helpArticles,
}: {
  recentTickets: RecentTicket[];
  helpArticles: DbHelpArticle[];
}) {
  return (
    <aside className="hidden xl:flex flex-col w-[300px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-4 pt-16 space-y-3">
        <WhatHappensNextCard steps={NEXT_STEPS} />
        <ResponseTimesCard rows={RESPONSE_TIMES} />
        <HelpArticlesCard articles={helpArticles} />
      </div>
    </aside>
  );
}

function WhatHappensNextCard({ steps }: { steps: NextStepRow[] }) {
  return (
    <section className="card p-4">
      <h3 className="text-[14px] font-semibold text-ink-900 mb-3">What happens next</h3>
      <ol className="space-y-3.5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === steps.length - 1;
          const iconBg =
            s.state === "done"
              ? "bg-rose-100 text-rose-600"
              : s.state === "current"
                ? "bg-rose-100 text-rose-600 ring-2 ring-rose-200"
                : "bg-cream-200 text-ink-500";
          return (
            <li key={s.key} className="relative flex items-start gap-3">
              <div className="relative flex flex-col items-center">
                <span className={cn("size-8 rounded-full inline-flex items-center justify-center shrink-0", iconBg)}>
                  <Icon className="size-[15px]" strokeWidth={1.9} />
                </span>
                {!isLast && (
                  <span aria-hidden className="mt-1 flex-1 w-px bg-ink-100 border-l border-dashed border-ink-200 h-6" />
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="text-[13px] font-semibold text-ink-900">{s.title}</div>
                <p className="text-[12px] text-ink-500 leading-snug">{s.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const BADGE_TONE: Record<"rose" | "success", string> = {
  rose:    "bg-rose-100 text-rose-700",
  success: "bg-success-bg text-success",
};

function ResponseTimesCard({ rows }: { rows: ResponseTimeRow[] }) {
  return (
    <section className="card p-4">
      <h3 className="text-[14px] font-semibold text-ink-900 mb-3">
        Estimated response times
      </h3>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3 text-[12.5px]">
            <span className="flex-1 min-w-0 truncate text-ink-700">{r.label}</span>
            <span className="text-ink-500 tabular-nums whitespace-nowrap">{r.range}</span>
            {r.badge && (
              <span
                className={cn(
                  "inline-flex items-center px-2 h-[20px] rounded-full text-[10.5px] font-semibold whitespace-nowrap",
                  BADGE_TONE[r.badge.tone],
                )}
              >
                {r.badge.label}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 inline-flex items-start gap-1.5 text-[11.5px] text-ink-500 leading-snug">
        <Info className="size-3.5 text-ink-400 mt-px shrink-0" strokeWidth={2} />
        Times may vary on weekends and holidays.
      </p>
    </section>
  );
}

function HelpArticlesCard({ articles }: { articles: DbHelpArticle[] }) {
  // Fallback to the static placeholder titles so the rail looks right
  // even when the DB has no articles yet.
  const fallback: { key: string; title: string; href: string }[] = [
    { key: "fb-1", title: "How to upload videos to Posting Plans", href: "/support/faq#posting" },
    { key: "fb-2", title: "Fixing common upload errors",           href: "/support/faq#technical" },
    { key: "fb-3", title: "Managing your subscription",            href: "/support/faq#billing" },
    { key: "fb-4", title: "Account login & access help",           href: "/support/faq#account" },
  ];
  const list = articles.length > 0
    ? articles.map((a) => ({ key: a.id, title: a.title, href: "/support/faq" }))
    : fallback;

  return (
    <section className="card p-4">
      <h3 className="text-[14px] font-semibold text-ink-900 mb-3">
        Popular help articles
      </h3>
      <ul className="space-y-0.5">
        {list.map((a) => (
          <li key={a.key}>
            <Link
              href={a.href}
              className="group flex items-center gap-2 py-1.5 text-[12.5px] text-ink-700 hover:text-rose-700 transition-colors"
            >
              <span className="flex-1 min-w-0 truncate">{a.title}</span>
              <ArrowRight
                className="size-3.5 text-ink-400 shrink-0 group-hover:text-rose-600 transition-colors"
                strokeWidth={2}
              />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/support/faq"
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors"
      >
        View all FAQs
        <ExternalLink className="size-3.5" strokeWidth={2} />
      </Link>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────────
   DB → UI mapping helpers
   ───────────────────────────────────────────────────────────────────────── */

function dbTicketToRail(t: DbSupportTicket): RecentTicket {
  return {
    id:     `#${t.publicId}`,
    title:  t.subject,
    meta:   ticketMeta(t),
    status: ticketStatusLabel(t.status),
  };
}

function ticketMeta(t: DbSupportTicket): string {
  if (t.status === "resolved" && t.resolvedAt) return `Resolved ${relativeDays(t.resolvedAt)}`;
  if (t.updatedAt && t.updatedAt !== t.createdAt) return `Updated ${relativeDays(t.updatedAt)}`;
  return `Created ${relativeDays(t.createdAt)}`;
}

function relativeDays(iso: string): string {
  const then = new Date(iso).getTime();
  const ms = Math.max(0, Date.now() - then);
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

function ticketStatusLabel(s: DbSupportTicket["status"]): TicketStatus {
  switch (s) {
    case "open":         return "Open";
    case "waiting":      return "Waiting";
    case "in_progress":  return "In Progress";
    case "resolved":     return "Resolved";
    case "closed":       return "Closed";
  }
}

/* Re-export ticket helpers so the /support/tickets pages can reuse them. */
export { ticketStatusLabel, ticketMeta };
