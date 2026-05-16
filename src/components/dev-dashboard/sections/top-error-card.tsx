import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { TOP_ERROR } from "@/lib/dev-dashboard/mock-data";

export function TopErrorCard() {
  return (
    <DevSectionCard title="Top Error">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center px-2 h-[22px] rounded-md bg-[var(--dev-surface-elev)] border border-[var(--dev-border)] font-mono text-[11px] text-[var(--dev-text-secondary)]">
          {TOP_ERROR.id}
        </span>
        <span className="text-[11.5px] text-[var(--dev-danger-text)] tabular-nums">
          {TOP_ERROR.timeLabel}
        </span>
      </div>

      <p className="text-[15px] font-semibold text-[var(--dev-text-primary)] leading-snug">
        {TOP_ERROR.message}
      </p>

      <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
        <Field label="Type" value={TOP_ERROR.type} />
        <Field label="Status" value={String(TOP_ERROR.statusCode)} mono />
        <Field label="Occurrences" value={String(TOP_ERROR.occurrences)} mono />
        <Field label="Affected Users" value={String(TOP_ERROR.affectedUsers)} mono />
      </dl>

      <Link
        href="/dev/errors"
        className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View error details
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] text-[var(--dev-text-muted)] mb-0.5">{label}</dt>
      <dd
        className={
          "text-[13.5px] text-[var(--dev-text-primary)] font-medium " +
          (mono ? "tabular-nums" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}
