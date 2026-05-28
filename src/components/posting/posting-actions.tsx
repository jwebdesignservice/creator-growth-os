"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import {
  createPostingPlan,
  createPostingItem,
} from "@/app/(app)/posting/actions";
import type { PlatformKey } from "@/lib/posting/queries";

const PLATFORMS: { value: PlatformKey; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "snapchat", label: "Snapchat" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
];

const CONTENT_TYPES = [
  { value: "reel", label: "Reel" },
  { value: "short_video", label: "Short Video" },
  { value: "carousel", label: "Carousel" },
  { value: "story", label: "Story" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "post", label: "Post" },
];

function mondayIso() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function PostingActions({
  activePlanId,
}: {
  activePlanId: string | null;
}) {
  const [mode, setMode] = useState<"closed" | "plan" | "item">("closed");

  return (
    <>
      <button
        type="button"
        onClick={() => setMode(activePlanId ? "item" : "plan")}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {activePlanId ? "Add Post" : "Create New Plan"}
      </button>

      {mode === "plan" && (
        <NewPlanForm onClose={() => setMode("closed")} />
      )}
      {mode === "item" && activePlanId && (
        <NewItemForm
          planId={activePlanId}
          onClose={() => setMode("closed")}
        />
      )}
    </>
  );
}

function NewPlanForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState(
    `Content Plan – Week of ${new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })}`,
  );
  const [weekStart, setWeekStart] = useState(mondayIso());
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      setErr(null);
      const res = await createPostingPlan({
        title,
        week_start: weekStart,
        description: description || undefined,
      });
      if (!res.ok) setErr(res.error);
      else onClose();
    });

  return (
    <DialogShell title="New posting plan" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Plan title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Week starting">
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Description (optional)">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="Theme, goals, audience notes…"
          />
        </Field>
        {err && (
          <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {err}
          </div>
        )}
        <p className="text-[11.5px] text-ink-500">
          Creating this plan will archive your current active plan.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
          >
            {pending ? "Creating…" : "Create plan"}
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

function NewItemForm({
  planId,
  onClose,
}: {
  planId: string;
  onClose: () => void;
}) {
  const [platform, setPlatform] = useState<PlatformKey>("instagram");
  const [contentType, setContentType] = useState("reel");
  const [topic, setTopic] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      setErr(null);
      const res = await createPostingItem({
        plan_id: planId,
        platform,
        content_type: contentType,
        topic: topic || undefined,
        scheduled_for: scheduledFor || undefined,
      });
      if (!res.ok) setErr(res.error);
      else onClose();
    });

  return (
    <DialogShell title="Add a planned post" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Platform">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as PlatformKey)}
              className="input"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Content type">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="input"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Topic / hook">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input"
            placeholder="e.g. 3 hooks to stop the scroll"
          />
        </Field>
        <Field label="Schedule for (optional)">
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="input"
          />
        </Field>
        {err && (
          <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center h-10 px-4 rounded-[10px] border border-ink-200 text-[13px] font-semibold text-ink-700 hover:bg-cream-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-semibold"
          >
            {pending ? "Saving…" : "Save post"}
          </button>
        </div>
      </div>
    </DialogShell>
  );
}

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-xl border border-ink-100 w-full max-w-[480px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-h4 text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-700 mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}
