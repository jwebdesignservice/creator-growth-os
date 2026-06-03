"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { createEvent } from "./actions";
import { EVENT_KINDS } from "@/lib/community/event-kinds";

type State = { ok: true } | { ok: false; error: string };

const inputCls =
  "w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
const labelCls = "block text-[12.5px] font-medium text-ink-700 mb-1.5";

export function EventForm({ redirectTo }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const initial: State = { ok: false, error: "" };
  const [state, formAction, pending] = useActionState<State, FormData>(
    createEvent,
    initial,
  );
  const errMessage = state.ok ? null : state.error || null;

  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      if (redirectTo) router.push(redirectTo);
    }
  }, [state, redirectTo, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={labelCls}>
            Event type <span className="text-rose-500">*</span>
          </span>
          <select name="kind" defaultValue="live" className={inputCls}>
            {EVENT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Host</span>
          <input
            type="text"
            name="host_name"
            placeholder="e.g. Coach Lia"
            className={inputCls}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>
          Title <span className="text-rose-500">*</span>
        </span>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Pitching Your First Brand Deal"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className={labelCls}>Description</span>
        <textarea
          name="description"
          rows={3}
          placeholder="What's this session about? Anything members should prepare or bring?"
          className="w-full px-4 py-3 rounded-[12px] bg-white border border-ink-200 text-[14px] leading-relaxed resize-y focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </label>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className={labelCls}>
            Date &amp; time <span className="text-rose-500">*</span>
          </span>
          <input
            type="datetime-local"
            name="starts_at"
            required
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Duration (min)</span>
          <input
            type="number"
            name="duration_min"
            min={5}
            max={600}
            step={5}
            defaultValue={60}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Join link</span>
          <input
            type="url"
            name="url"
            placeholder="https://zoom.us/j/…"
            className={inputCls}
          />
        </label>
      </div>

      {errMessage && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {errMessage}
        </div>
      )}
      {state.ok && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success">
          Event created — it&apos;s now live in the members&apos; Events tab.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium"
        >
          <CalendarPlus className="size-4" strokeWidth={2} />
          {pending ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}
