"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { createMissionTemplate } from "./actions";

export function CreateMissionForm() {
  const initial: { ok: true } | { ok: false; error: string } = {
    ok: false,
    error: "",
  };
  const [state, formAction, pending] = useActionState<
    { ok: true } | { ok: false; error: string },
    FormData
  >(createMissionTemplate, initial);
  const errMessage = state.ok ? null : state.error;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field name="title" label="Title" required placeholder="e.g. Post 1 short-form video" />
        <Select
          name="mission_type"
          label="Type"
          options={[
            { value: "posting", label: "Posting" },
            { value: "strategy", label: "Content Strategy" },
            { value: "engagement", label: "Engagement" },
            { value: "performance", label: "Performance" },
            { value: "monetization", label: "Monetization" },
            { value: "confidence", label: "Confidence" },
          ]}
        />
      </div>
      <Textarea
        name="description"
        label="Description"
        placeholder="Short, actionable instructions..."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          name="category"
          label="Category"
          options={[
            { value: "all", label: "All categories" },
            { value: "starter", label: "Starter Creator" },
            { value: "growth", label: "Growth Creator" },
            { value: "monetization", label: "Monetization Creator" },
            { value: "scale", label: "Scale Creator" },
          ]}
        />
        <Select
          name="plan_access"
          label="Required plan"
          defaultValue="basic"
          options={[
            { value: "free", label: "Free" },
            { value: "basic", label: "Basic" },
            { value: "pro", label: "Pro" },
          ]}
        />
        <Field name="points" label="Points" defaultValue="10" type="number" />
      </div>

      {errMessage && (
        <div className="px-4 py-3 rounded-[10px] bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
          {errMessage}
        </div>
      )}
      {state.ok && (
        <div className="px-4 py-3 rounded-[10px] bg-success-bg border border-success/30 text-[13px] text-success">
          Template created — it appears below.
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-medium cursor-pointer transition-colors shadow-sm"
        >
          <Sparkles className="size-4" strokeWidth={2} />
          {pending ? "Creating…" : "Create Template"}
        </button>
      </div>
    </form>
  );
}

function Field(props: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {props.label}
        {props.required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        type={props.type ?? "text"}
        name={props.name}
        required={props.required}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        className="w-full h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      />
    </label>
  );
}

function Textarea(props: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {props.label}
      </span>
      <textarea
        name={props.name}
        rows={3}
        placeholder={props.placeholder}
        className="w-full px-4 py-2.5 rounded-[12px] bg-white border border-ink-200 text-[14px] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 resize-none"
      />
    </label>
  );
}

function Select(props: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-700 mb-1.5">
        {props.label}
      </span>
      <select
        name={props.name}
        defaultValue={props.defaultValue ?? props.options[0]?.value}
        className="w-full h-11 px-3 rounded-[12px] bg-white border border-ink-200 text-[14px] cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
