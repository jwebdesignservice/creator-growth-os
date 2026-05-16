import { Wrench } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";

/**
 * Default body for any dev subpage that has not been fully built yet.
 * Renders the dev-card style and a clear "coming soon" message.
 */
export function StubSection({
  title = "Frontend foundation ready",
  description = "This view's data layer is not yet wired up. The shell, navigation, and design system are in place.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <DevSectionCard padded={false}>
      <div className="p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="size-12 rounded-full bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] inline-flex items-center justify-center">
          <Wrench className="size-5 text-[var(--dev-accent-text)]" strokeWidth={1.8} />
        </div>
        <div className="text-[15px] font-semibold text-[var(--dev-text-primary)]">
          {title}
        </div>
        <p className="max-w-md text-[13px] text-[var(--dev-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </DevSectionCard>
  );
}
