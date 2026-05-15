"use client";

import { useActionState, useRef, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { createAnnouncement } from "./actions";

export function ComposeForm() {
  const initial: { ok: true } | { ok: false; error: string } = {
    ok: false,
    error: "",
  };
  const [state, formAction, pending] = useActionState<
    { ok: true } | { ok: false; error: string },
    FormData
  >(createAnnouncement, initial);
  const errMessage = state.ok ? null : state.error;

  const formRef = useRef<HTMLFormElement | null>(null);
  // Reset form when a publish succeeds
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <label className="block">
        <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
          Title <span className="text-rose-500">*</span>
        </span>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Q&A with Sophie this Friday"
          className="w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </label>
      <label className="block">
        <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
          Body
        </span>
        <textarea
          name="body"
          rows={4}
          placeholder="Plain text. Members see this in their dashboard."
          className="w-full px-4 py-2.5 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
            Audience plan
          </span>
          <select
            name="audience_plan"
            defaultValue="all"
            className="w-full h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="all">All plans</option>
            <option value="free">Free only</option>
            <option value="basic">Basic only</option>
            <option value="pro">Pro only</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
            Audience category
          </span>
          <select
            name="audience_category"
            defaultValue="all"
            className="w-full h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            <option value="all">All categories</option>
            <option value="starter">Starter Creator</option>
            <option value="growth">Growth Creator</option>
            <option value="monetization">Monetization Creator</option>
            <option value="scale">Scale Creator</option>
          </select>
        </label>
      </div>

      {errMessage && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {errMessage}
        </div>
      )}
      {state.ok && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success">
          Broadcast published.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium cursor-pointer transition-colors shadow-sm"
        >
          <Megaphone className="size-4" strokeWidth={2} />
          {pending ? "Publishing…" : "Publish broadcast"}
        </button>
      </div>
    </form>
  );
}
