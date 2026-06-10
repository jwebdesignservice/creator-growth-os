import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreateProgramForm } from "../create-form";

export const metadata = { title: "New Program · Admin" };

/**
 * Standalone "create program" route, reached via the "+ New program" button
 * on /admin/programs. Keeps the listing view clean — the create form lives
 * here on its own page.
 */
export default function NewProgramPage() {
  return (
    <div className="space-y-6 max-w-[840px] mx-auto">
      <Link
        href="/admin/programs"
        className="inline-flex items-center gap-1.5 text-[13px] text-rose-600 hover:text-rose-700 font-medium"
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.5} />
        Back to Programs
      </Link>

      <header>
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">
          New program
        </h1>
        <p className="text-ink-500 text-[14px]">
          Create a new learning path. Add lessons from the Lessons page after
          this.
        </p>
      </header>

      <section className="card p-6 sm:p-8">
        <CreateProgramForm />
      </section>
    </div>
  );
}
