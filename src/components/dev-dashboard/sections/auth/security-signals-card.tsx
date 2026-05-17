import Link from "next/link";
import { ArrowRight, ShieldAlert, TriangleAlert, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { SECURITY_SIGNALS } from "@/lib/dev-dashboard/mock-data";
import type { SecuritySignal, SecuritySignalTone } from "@/lib/dev-dashboard/types";

const TONE_ICON: Record<SecuritySignalTone, LucideIcon> = {
  danger:  ShieldAlert,
  warning: TriangleAlert,
  info:    Info,
};

const TONE_COLOR: Record<SecuritySignalTone, string> = {
  danger:  "text-[var(--dev-danger-text)]",
  warning: "text-[var(--dev-warning-text)]",
  info:    "text-[var(--dev-accent-text)]",
};

export function SecuritySignalsCard({ data }: { data?: SecuritySignal[] }) {
  const items = data ?? SECURITY_SIGNALS;
  return (
    <DevSectionCard
      title="Security Signals"
      trailing={
        <Link
          href="/dev/errors"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View security events
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {items.map((item) => {
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
