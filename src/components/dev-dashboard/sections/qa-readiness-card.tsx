import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DevDonut } from "../dev-donut";
import { QA_READINESS } from "@/lib/dev-dashboard/mock-data";

export function QaReadinessCard() {
  const { score, checks } = QA_READINESS;
  // Donut with two slices: passed + remainder.
  const slices = [
    { value: score, color: "var(--dev-success)" },
    { value: 100 - score, color: "var(--dev-surface-elev)" },
  ];

  return (
    <DevSectionCard title="QA Readiness Score">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 items-center">
        <DevDonut slices={slices} size={140} strokeWidth={14} trackColor="var(--dev-surface-elev)">
          <span className="text-[26px] font-semibold text-[var(--dev-success-text)] leading-none tabular-nums">
            {score}%
          </span>
          <span className="text-[11px] text-[var(--dev-text-muted)] mt-1">Ready</span>
        </DevDonut>

        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-[12.5px]">
              {c.passing ? (
                <CircleCheck className="size-4 text-[var(--dev-success-text)] shrink-0" strokeWidth={2} />
              ) : (
                <CircleX className="size-4 text-[var(--dev-danger-text)] shrink-0" strokeWidth={2} />
              )}
              <span className="text-[var(--dev-text-secondary)] truncate">{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/dev/qa-checklist"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View checklist
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}
