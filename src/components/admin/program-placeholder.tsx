import type { LucideIcon } from "lucide-react";

/**
 * Centered placeholder card used by every not-yet-built tab inside
 * /admin/programs/[id]/*. Mirrors the existing `PlaceholderTab` pattern
 * used by the tutorial editor (admin/tutorials/[id]/tutorial-editor.tsx)
 * so the two admin workflows feel like the same surface.
 *
 * Keep deliberately tiny — the page just composes <ProgramPlaceholder>
 * with its tab's label + lucide icon. When the real editor for a tab
 * ships, swap the placeholder out for the editor at the page level.
 */
export function ProgramPlaceholder({
  title,
  icon: Icon,
  body,
}: {
  title: string;
  icon: LucideIcon;
  body?: string;
}) {
  return (
    <section className="card p-10 text-center">
      <div
        className="mx-auto size-14 rounded-[14px] bg-rose-50 text-rose-600 inline-flex items-center justify-center mb-4"
        aria-hidden
      >
        <Icon className="size-6" strokeWidth={1.8} />
      </div>
      <h2 className="text-h3 text-ink-900">{title}</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-500 max-w-md mx-auto leading-relaxed">
        {body ??
          "This section is part of the program workflow. Detailed editor coming next — for now the Setup guide and Curriculum tabs are fully wired."}
      </p>
    </section>
  );
}
