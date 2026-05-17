import { DevSectionCard } from "../../dev-section-card";
import { QA_RELEASE_NOTES } from "@/lib/dev-dashboard/mock-data";
import type { QaReleaseNote } from "@/lib/dev-dashboard/types";

export function ReleaseNotesCard({ data }: { data?: QaReleaseNote[] }) {
  const notes = data ?? QA_RELEASE_NOTES;
  return (
    <DevSectionCard title="Release Notes">
      <ul className="space-y-2.5">
        {notes.map((n) => (
          <li key={n.label} className="flex items-start gap-2 text-[12.5px] leading-snug">
            <span
              className="size-1 rounded-full bg-[var(--dev-text-faint)] shrink-0 mt-[7px]"
              aria-hidden
            />
            <span className="text-[var(--dev-text-secondary)]">
              <span className="text-[var(--dev-text-primary)] font-medium">{n.label}:</span>{" "}
              {n.value}
            </span>
          </li>
        ))}
      </ul>
    </DevSectionCard>
  );
}
