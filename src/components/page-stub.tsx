import { Construction } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";

type Props = {
  title: string;
  description: string;
  nextStep?: string;
};

export function PageStub({ title, description, nextStep }: Props) {
  return (
    <PageShell>
    <div className="max-w-[1240px] mx-auto">
      <header className="mb-6">
        <h1 className="text-h1 text-ink-900 leading-none mb-2">
          {title}
        </h1>
        <p className="text-ink-500 text-[14.5px]">{description}</p>
      </header>

      <div className="card p-10 text-center">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4">
          <Construction className="size-6" strokeWidth={1.8} />
        </div>
        <h2 className="font-display text-2xl text-ink-900 mb-2">
          Coming up next
        </h2>
        <p className="text-ink-500 text-[14px] max-w-md mx-auto">
          {nextStep ??
            "This screen is on the build roadmap. The data model, navigation and design system are already in place — implementation lands in the next phase."}
        </p>
      </div>
    </div>
    </PageShell>
  );
}
