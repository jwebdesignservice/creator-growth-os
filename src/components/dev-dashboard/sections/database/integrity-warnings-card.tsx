import { ShieldAlert, TriangleAlert, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DB_INTEGRITY_WARNINGS } from "@/lib/dev-dashboard/mock-data";
import type { DbIntegrityTone, DbIntegrityWarning } from "@/lib/dev-dashboard/types";

const TONE_ICON: Record<DbIntegrityTone, LucideIcon> = {
  danger:  ShieldAlert,
  warning: TriangleAlert,
  info:    Info,
};

const TONE_COLOR: Record<DbIntegrityTone, string> = {
  danger:  "text-[var(--dev-danger-text)]",
  warning: "text-[var(--dev-warning-text)]",
  info:    "text-[var(--dev-accent-text)]",
};

export function IntegrityWarningsCard({ data }: { data?: DbIntegrityWarning[] }) {
  const rows = data ?? DB_INTEGRITY_WARNINGS;
  return (
    <DevSectionCard title="Database Integrity Warnings">
      <ul className="space-y-2.5">
        {rows.map((item) => {
          const Icon = TONE_ICON[item.tone];
          return (
            <li
              key={item.id}
              className="flex items-start gap-2.5 text-[12.5px] text-[var(--dev-text-secondary)]"
            >
              <Icon
                className={`size-4 shrink-0 mt-0.5 ${TONE_COLOR[item.tone]}`}
                strokeWidth={1.9}
                aria-hidden
              />
              <span className="leading-snug">{item.message}</span>
            </li>
          );
        })}
      </ul>
    </DevSectionCard>
  );
}
