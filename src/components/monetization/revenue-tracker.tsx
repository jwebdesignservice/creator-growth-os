"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import type { RevenueEntry } from "@/lib/monetization/queries";
import {
  createRevenueEntry,
  deleteRevenueEntry,
} from "@/app/(app)/monetization/actions";

export function RevenueTracker({ entries }: { entries: RevenueEntry[] }) {
  const [open, setOpen] = useState(false);

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const last30 = entries.filter(
    (e) =>
      new Date(e.received_on).getTime() >
      Date.now() - 30 * 24 * 60 * 60 * 1000,
  );
  const last30Total = last30.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="card p-[var(--space-card-padding)]">
      <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="font-display text-[22px] text-ink-900 leading-tight">
            Revenue Tracker
          </h2>
          <p className="text-[13px] text-ink-500 mt-1">
            Log every paid invoice and side-income source.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
        >
          <Plus className="size-3.5" strokeWidth={2.4} />
          Log income
        </button>
      </header>

      {open && <NewEntryForm onClose={() => setOpen(false)} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <Stat
          label="All-time"
          value={`${(total / 100).toLocaleString()} kr`}
          icon
        />
        <Stat
          label="Last 30 days"
          value={`${(last30Total / 100).toLocaleString()} kr`}
        />
        <Stat label="Entries" value={entries.length.toString()} />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-ink-500">
          No income logged yet.
        </div>
      ) : (
        <ul className="divide-y divide-ink-50">
          {entries.map((e) => (
            <RevenueRow key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RevenueRow({ entry }: { entry: RevenueEntry }) {
  const [pending, startTransition] = useTransition();
  const remove = () =>
    startTransition(async () => {
      await deleteRevenueEntry(entry.id);
    });

  return (
    <li className="py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink-900 truncate">
          {entry.source}
        </div>
        <div className="text-[11.5px] text-ink-500">
          {new Date(entry.received_on).toLocaleDateString()}
          {entry.category ? ` · ${entry.category}` : ""}
          {entry.note ? ` · ${entry.note}` : ""}
        </div>
      </div>
      <div className="text-[14px] font-semibold text-ink-900 tabular-nums">
        {(entry.amount / 100).toLocaleString()} {entry.currency.toUpperCase()}
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="Delete entry"
        className="size-8 rounded-[8px] hover:bg-rose-50 inline-flex items-center justify-center text-ink-500 hover:text-rose-600"
      >
        <Trash2 className="size-4" strokeWidth={2} />
      </button>
    </li>
  );
}

function NewEntryForm({ onClose }: { onClose: () => void }) {
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("brand_deal");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    startTransition(async () => {
      const res = await createRevenueEntry({
        source,
        category,
        amount: Number(amount),
        received_on: date,
        note: note || undefined,
      });
      if (!res.ok) setErr(res.error);
      else onClose();
    });
  };

  return (
    <div className="mb-5 rounded-[14px] border border-ink-100 bg-cream-50 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source (brand or product) *"
          className="input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          <option value="brand_deal">Brand deal</option>
          <option value="affiliate">Affiliate</option>
          <option value="product">Product / digital</option>
          <option value="ugc">UGC</option>
          <option value="tipping">Tips / fan funding</option>
          <option value="other">Other</option>
        </select>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Amount (NOK) *"
          className="input"
        />
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          className="input"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="input sm:col-span-2"
        />
      </div>
      {err && <div className="text-[12.5px] text-rose-700">{err}</div>}
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
          {pending ? "Saving…" : "Save entry"}
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: boolean;
}) {
  return (
    <div className="rounded-[12px] bg-cream-50 border border-ink-100 p-3.5">
      <div className="text-[11px] text-ink-500 font-medium uppercase tracking-wide flex items-center gap-1">
        {icon && (
          <TrendingUp
            className="size-3 text-rose-500"
            strokeWidth={2.2}
          />
        )}
        {label}
      </div>
      <div className="font-display text-[20px] text-ink-900 tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}
