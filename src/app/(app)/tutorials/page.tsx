import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getAllTutorials } from "@/lib/programs/tutorial-queries";
import { TutorialLibrary } from "@/components/tutorials/library";
import { FeaturedTutorial } from "@/components/tutorials/featured";
import {
  getOnboardingGate,
  isGateActive,
  readPreviewGate,
} from "@/lib/onboarding/gate";
import { OnboardingLockedNotice } from "@/components/onboarding/onboarding-locked-notice";

export const metadata = { title: "Tutorials | Creator Growth OS" };

type SearchParams = Promise<{ q?: string; previewGate?: string }>;

export default async function TutorialsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { q = "", previewGate } = await searchParams;

  // Onboarding gate — the Tutorials library is locked until the user finishes
  // the Start Here onboarding. Enforced server-side (direct URL included).
  const gate = await getOnboardingGate();
  if (isGateActive(gate, readPreviewGate(previewGate))) {
    return (
      <PageShell>
        <div className="space-y-6 sm:space-y-7 max-w-[1600px] mx-auto">
          <header>
            <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
              <Sparkles className="size-4" strokeWidth={2} />
              Welcome back, {ctx.name.split(" ")[0]}!
            </div>
            <h1 className="text-h1 text-ink-900 mb-1">Tutorials</h1>
            <p className="text-ink-500 text-[14px]">
              Learn practical creator skills, drills, templates and assignments
              to grow your influence.
            </p>
          </header>
          <OnboardingLockedNotice
            percent={gate.percent}
            programSlug={gate.programSlug}
            kind="tutorial"
          />
        </div>
      </PageShell>
    );
  }

  const query = q.trim().toLowerCase();

  const all = await getAllTutorials();
  const tutorials = query
    ? all.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description ?? "").toLowerCase().includes(query) ||
          (t.programTitle ?? "").toLowerCase().includes(query),
      )
    : all;

  // Featured = first non-completed lesson the user can access, else first
  const featured =
    tutorials.find(
      (t) => !t.completed && (t.planAccess !== "pro" || ctx.plan === "pro"),
    ) ?? tutorials[0];

  const firstName = ctx.name.split(" ")[0];

  return (
    <PageShell>
      <div className="space-y-6 sm:space-y-7 max-w-[1600px] mx-auto">
        {/* Header */}
        <header>
          <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
            <Sparkles className="size-4" strokeWidth={2} />
            Welcome back, {firstName}!
          </div>
          <h1 className="text-h1 text-ink-900 mb-1">
            Tutorials
          </h1>
          <p className="text-ink-500 text-[14px]">
            Learn practical creator skills, drills, templates and assignments to
            grow your influence.
          </p>
        </header>

        {/* Featured */}
        {featured && (
          <FeaturedTutorial
            slug={featured.slug}
            title={featured.title}
            description={
              featured.description ??
              "A focused, practical lesson — built around what actually moves the needle for creators at your stage."
            }
            duration={featured.duration}
            difficulty={featured.difficulty}
            moduleTitle={featured.moduleTitle}
            coverUrl={featured.coverUrl}
          />
        )}

        {/* Library */}
        {tutorials.length === 0 ? (
          <div className="card p-10 text-center text-ink-500 text-[14px]">
            No tutorials seeded yet. Apply migration{" "}
            <code className="text-ink-900 bg-cream-100 px-1.5 py-0.5 rounded">
              0003_lessons_seed.sql
            </code>{" "}
            to populate the lessons table.
          </div>
        ) : (
          <TutorialLibrary tutorials={tutorials} userPlan={ctx.plan} />
        )}
      </div>
    </PageShell>
  );
}
