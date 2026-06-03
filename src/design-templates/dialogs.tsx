/* Dialogs ─────────────────────────────────────────────────────────────────
   In-app replacements for the browser's native confirm / alert / prompt
   popups — the small centred modals the app shows instead of the grey
   "this page says…" browser dialogs. Covers the whole family:
     • destructive confirm  (Delete …?)
     • neutral confirm      (Leave …?)
     • warning confirm      (icon + tinted footer)
     • alert / acknowledge  (single button)
     • success acknowledge  (single button, success accent)
     • prompt               (text input)

   Presentational — they render the panel itself (no backdrop). Every action
   shares one button system so the family stays perfectly consistent.
   ───────────────────────────────────────────────────────────────────────── */

import { AlertTriangle, X, CheckCircle2, AlertCircle, Pencil } from "lucide-react";

// One button system for the whole dialog family — same radius, weight, and
// hover / active / keyboard-focus behaviour; only the emphasis colour differs.
const BTN =
  "inline-flex items-center justify-center rounded-[12px] font-medium cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50";
const SECONDARY = `${BTN} bg-white border border-ink-200 text-ink-800 hover:bg-cream-100 active:bg-cream-200 focus-visible:ring-rose-200`;
const DANGER = `${BTN} font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-300`;
const NEUTRAL = `${BTN} font-semibold text-white bg-ink-900 hover:bg-ink-800 active:bg-ink-700 focus-visible:ring-rose-300`;

/* Shared panel shell — white rounded card + soft shadow. */
function Panel({
  children,
  width = 440,
  label,
}: {
  children: React.ReactNode;
  width?: number;
  label: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="rounded-[20px] bg-white shadow-xl border border-ink-100 overflow-hidden max-w-full"
      style={{ width }}
    >
      {children}
    </div>
  );
}

function CloseButton() {
  return (
    <button
      type="button"
      aria-label="Close"
      className="size-8 -mr-1 -mt-1 inline-flex items-center justify-center rounded-[10px] text-ink-400 hover:text-ink-700 hover:bg-cream-100 cursor-pointer transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
    >
      <X className="size-[18px]" strokeWidth={2} />
    </button>
  );
}

/* 1 · Destructive confirm — the canonical "Delete lesson?" dialog. */
export function DeleteConfirm() {
  return (
    <Panel label="Delete lesson?">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-bold text-ink-900 leading-tight">Delete lesson?</h2>
          <CloseButton />
        </div>
        <p className="mt-1.5 text-[14px] text-ink-500 leading-relaxed">
          This will permanently delete the lesson and all of its content.
        </p>
        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" className={`${SECONDARY} h-11 px-5 text-[14px]`}>Cancel</button>
          <button type="button" className={`${DANGER} h-11 px-5 text-[14px]`}>Delete</button>
        </div>
      </div>
    </Panel>
  );
}

/* 2 · Neutral confirm — non-destructive decision; primary reads in ink. */
export function LeaveConfirm() {
  return (
    <Panel label="Leave without saving?">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-bold text-ink-900 leading-tight">Leave without saving?</h2>
          <CloseButton />
        </div>
        <p className="mt-1.5 text-[14px] text-ink-500 leading-relaxed">
          You have unsaved changes. If you leave now, they&apos;ll be lost.
        </p>
        <div className="mt-7 flex items-center justify-end gap-3">
          <button type="button" className={`${SECONDARY} h-11 px-5 text-[14px]`}>Keep editing</button>
          <button type="button" className={`${NEUTRAL} h-11 px-5 text-[14px]`}>Leave</button>
        </div>
      </div>
    </Panel>
  );
}

/* 3 · Warning confirm — destructive action with a leading icon + tinted footer. */
export function WarningConfirm() {
  return (
    <Panel width={430} label="Disconnect Instagram?">
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <span className="size-10 rounded-full inline-flex items-center justify-center shrink-0 bg-rose-100 text-rose-600">
          <AlertTriangle className="size-5" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-semibold text-ink-900 leading-tight">Disconnect Instagram?</h2>
          <p className="mt-1.5 text-[13px] text-ink-500 leading-relaxed">
            Your past analytics stay in the dashboard, but new data won&apos;t
            sync until you reconnect.
          </p>
        </div>
        <CloseButton />
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-4 bg-cream-50/60 border-t border-ink-100">
        <button type="button" className={`${SECONDARY} h-10 px-4 text-[13px]`}>Cancel</button>
        <button type="button" className={`${DANGER} h-10 px-4 text-[13px]`}>Disconnect</button>
      </div>
    </Panel>
  );
}

/* 4 · Alert / acknowledge — single-button notice. */
export function AlertAcknowledge() {
  return (
    <Panel width={400} label="Plan limit reached">
      <div className="p-6 text-center">
        <span className="mx-auto size-12 rounded-full inline-flex items-center justify-center bg-amber-100 text-amber-600 mb-3">
          <AlertCircle className="size-6" strokeWidth={2} />
        </span>
        <h2 className="text-[17px] font-bold text-ink-900 leading-tight">Plan limit reached</h2>
        <p className="mt-1.5 text-[13.5px] text-ink-500 leading-relaxed">
          You&apos;ve used all 3 programs on the Free plan. Upgrade to add more.
        </p>
        <button type="button" className={`${DANGER} mt-5 w-full h-11 text-[14px]`}>Got it</button>
      </div>
    </Panel>
  );
}

/* 5 · Success acknowledge — friendly single-button variant. */
export function SuccessDialog() {
  return (
    <Panel width={400} label="Upload complete">
      <div className="p-6 text-center">
        <span className="mx-auto size-12 rounded-full inline-flex items-center justify-center bg-emerald-100 text-emerald-600 mb-3">
          <CheckCircle2 className="size-6" strokeWidth={2} />
        </span>
        <h2 className="text-[17px] font-bold text-ink-900 leading-tight">Upload complete</h2>
        <p className="mt-1.5 text-[13.5px] text-ink-500 leading-relaxed">
          Your video finished processing and is ready to publish.
        </p>
        <button type="button" className={`${NEUTRAL} mt-5 w-full h-11 text-[14px]`}>Done</button>
      </div>
    </Panel>
  );
}

/* 6 · Prompt — confirm with a text input. */
export function PromptDialog() {
  return (
    <Panel label="Rename lesson">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-9 rounded-[11px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Pencil className="size-[18px]" strokeWidth={2} />
            </span>
            <h2 className="text-[18px] font-bold text-ink-900 leading-tight">Rename lesson</h2>
          </div>
          <CloseButton />
        </div>
        <label className="mt-4 block">
          <span className="block text-[12px] font-medium text-ink-600 mb-1.5">Lesson title</span>
          <input
            type="text"
            defaultValue="The 3-second hook framework"
            className="w-full h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 transition focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" className={`${SECONDARY} h-11 px-5 text-[14px]`}>Cancel</button>
          <button type="button" className={`${DANGER} h-11 px-5 text-[14px]`}>Save</button>
        </div>
      </div>
    </Panel>
  );
}
