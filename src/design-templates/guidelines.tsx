/* Guidelines ────────────────────────────────────────────────────────────
   Content + formatting conventions, documenting the product's ACTUAL
   patterns (real button labels, error/empty copy, and the date / number /
   currency / delta formats used across tables, KPIs and emails). Two
   gallery categories, re-spread via FOUNDATION_CATEGORIES.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { PencilLine, Hash, type LucideIcon } from "lucide-react";

/* ── Microcopy (do / don't) ───────────────────────────────────────────── */

function DoDont({ good, bad }: { good: string; bad: string }) {
  return (
    <div className="w-full max-w-[440px] rounded-[12px] border border-ink-100 bg-white p-3.5 space-y-2.5">
      <div className="flex items-start gap-2">
        <span className="size-4 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
          ✓
        </span>
        <span className="text-[12.5px] text-ink-800">{good}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="size-4 rounded-full bg-cream-200 text-ink-400 inline-flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
          ✕
        </span>
        <span className="text-[12.5px] text-ink-400 line-through">{bad}</span>
      </div>
    </div>
  );
}

/* ── Formatting ───────────────────────────────────────────────────────── */

function FormatBlock({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <div className="w-full max-w-[360px] divide-y divide-ink-100 rounded-[12px] border border-ink-100 bg-white px-3.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
          <span className="text-[12px] text-ink-500">{r.label}</span>
          <span className="text-[13px] text-ink-900 tabular-nums font-medium">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type GuidelineCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const GUIDELINE_CATEGORIES: GuidelineCategory[] = [
  {
    id: "microcopy",
    label: "Microcopy",
    icon: PencilLine,
    blurb: "UX-writing conventions — do / don't.",
    items: [
      { label: "Button labels", code: "DoDont", node: <DoDont good="Save changes" bad="OK" /> },
      {
        label: "Error messages",
        code: "DoDont",
        node: <DoDont good="That username is already taken." bad="Error: invalid input" />,
      },
      {
        label: "Empty states",
        code: "DoDont",
        node: <DoDont good="No posts planned yet — add your first." bad="No data." />,
      },
      { label: "Confirmations", code: "DoDont", node: <DoDont good="Ticket closed." bad="Success!!!" /> },
    ],
  },
  {
    id: "formatting",
    label: "Formatting",
    icon: Hash,
    blurb: "Date, number, currency & delta conventions.",
    items: [
      {
        label: "Dates & time",
        code: "FormatBlock",
        node: (
          <FormatBlock
            rows={[
              { label: "Full", value: "May 13, 2025 9:41 AM" },
              { label: "Short", value: "Jan 18" },
              { label: "Relative", value: "2 min ago" },
              { label: "Older", value: "3 days ago" },
            ]}
          />
        ),
      },
      {
        label: "Numbers",
        code: "FormatBlock",
        node: (
          <FormatBlock
            rows={[
              { label: "Thousands", value: "1,204" },
              { label: "Compact", value: "1.2K" },
              { label: "Large", value: "84,000" },
            ]}
          />
        ),
      },
      {
        label: "Currency",
        code: "FormatBlock",
        node: (
          <FormatBlock
            rows={[
              { label: "NOK", value: "25,000 NOK" },
              { label: "Monthly", value: "$19/mo" },
              { label: "Short", value: "kr 1,250" },
            ]}
          />
        ),
      },
      {
        label: "Percent & delta",
        code: "FormatBlock",
        node: (
          <FormatBlock
            rows={[
              { label: "Percent", value: "98%" },
              { label: "Delta", value: <span className="text-emerald-700">↑ 12%</span> },
              { label: "Ratio", value: "410 / 427" },
            ]}
          />
        ),
      },
    ],
  },
];
