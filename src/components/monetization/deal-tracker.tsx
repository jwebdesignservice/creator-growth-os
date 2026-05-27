"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { BrandDeal, DealStage } from "@/lib/monetization/queries";
import {
  createBrandDeal,
  updateDealStage,
  deleteDeal,
} from "@/app/(app)/monetization/actions";

const STAGES: { value: DealStage; label: string; tone: string }[] = [
  { value: "lead", label: "Lead", tone: "bg-ink-100 text-ink-700" },
  { value: "pitched", label: "Pitched", tone: "bg-rose-100 text-rose-700" },
  {
    value: "in_negotiation",
    label: "Negotiating",
    tone: "bg-amber-100 text-amber-700",
  },
  { value: "agreed", label: "Agreed", tone: "bg-sky-100 text-sky-700" },
  { value: "live", label: "Live", tone: "bg-indigo-100 text-indigo-700" },
  { value: "paid", label: "Paid", tone: "bg-emerald-100 text-emerald-700" },
  { value: "lost", label: "Lost", tone: "bg-ink-100 text-ink-500" },
];

export function DealTracker({ deals }: { deals: BrandDeal[] }) {
  const [open, setOpen] = useState(false);

  const pipelineValue = deals
    .filter((d) => d.stage !== "lost")
    .reduce((sum, d) => sum + (d.value_amount ?? 0), 0);
  const wonValue = deals
    .filter((d) => d.stage === "paid")
    .reduce((sum, d) => sum + (d.value_amount ?? 0), 0);

  return (
    <div className="card p-[var(--space-card-padding)]">
      <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-h3 text-ink-900 leading-tight">
            Brand Deal Tracker
          </h2>
          <p className="text-[13px] text-ink-500 mt-1">
            From cold lead to paid invoice — keep every deal in one view.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
        >
          <Plus className="size-3.5" strokeWidth={2.4} />
          Add deal
        </button>
      </header>

      {open && <NewDealForm onClose={() => setOpen(false)} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Total deals" value={deals.length.toString()} />
        <Stat
          label="Pipeline value"
          value={`${pipelineValue.toLocaleString()} kr`}
        />
        <Stat label="Paid" value={`${wonValue.toLocaleString()} kr`} />
        <Stat
          label="Live"
          value={
            deals.filter((d) => d.stage === "live").length.toString()
          }
        />
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-ink-500">
          No deals yet. Tap “Add deal” to log your first lead.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide bg-cream-50">
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {deals.map((d) => (
                <DealRow key={d.id} deal={d} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DealRow({ deal }: { deal: BrandDeal }) {
  const [pending, startTransition] = useTransition();
  const stageMeta = STAGES.find((s) => s.value === deal.stage)!;

  const setStage = (v: DealStage) =>
    startTransition(async () => {
      await updateDealStage(deal.id, v);
    });

  const remove = () =>
    startTransition(async () => {
      await deleteDeal(deal.id);
    });

  return (
    <tr className="text-[13px] text-ink-800">
      <td className="px-4 py-3">
        <div className="font-semibold text-ink-900">{deal.brand_name}</div>
        {deal.contact_name && (
          <div className="text-[11.5px] text-ink-500">{deal.contact_name}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={deal.stage}
          onChange={(e) => setStage(e.target.value as DealStage)}
          disabled={pending}
          className={`text-[12px] font-semibold rounded-full px-2.5 h-7 border-0 cursor-pointer ${stageMeta.tone}`}
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 tabular-nums">
        {deal.value_amount
          ? `${deal.value_amount.toLocaleString()} ${deal.value_currency.toUpperCase()}`
          : "—"}
      </td>
      <td className="px-4 py-3 text-ink-700">
        {deal.due_date ? new Date(deal.due_date).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label="Delete deal"
          className="size-8 rounded-[8px] hover:bg-rose-50 inline-flex items-center justify-center text-ink-500 hover:text-rose-600"
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}

function NewDealForm({ onClose }: { onClose: () => void }) {
  const [brand, setBrand] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<DealStage>("lead");
  const [value, setValue] = useState("");
  const [due, setDue] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    startTransition(async () => {
      const res = await createBrandDeal({
        brand_name: brand,
        contact_name: contact || undefined,
        contact_email: email || undefined,
        stage,
        value_amount: value ? Number(value) : null,
        due_date: due || null,
      });
      if (!res.ok) setErr(res.error);
      else onClose();
    });
  };

  return (
    <div className="mb-5 rounded-[14px] border border-ink-100 bg-cream-50 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Brand name *"
          className="input"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as DealStage)}
          className="input"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Contact name"
          className="input"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Contact email"
          className="input"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          placeholder="Value (NOK)"
          className="input"
        />
        <input
          value={due}
          onChange={(e) => setDue(e.target.value)}
          type="date"
          className="input"
        />
      </div>
      {err && (
        <div className="text-[12.5px] text-rose-700">{err}</div>
      )}
      <div className="flex justify-end gap-2">
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
          {pending ? "Saving…" : "Save deal"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-cream-50 border border-ink-100 p-3.5">
      <div className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">
        {label}
      </div>
      <div className="text-h4 text-ink-900 tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}
