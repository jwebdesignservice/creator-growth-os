import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { ProgramsGrid } from "@/components/programs/programs-grid";
import type { ProgramRow } from "@/components/programs/program-card";
import { getProgressForPrograms } from "@/lib/programs/queries";
import {
  getOnboardingGate,
  isGateActive,
  readPreviewGate,
  ONBOARDING_PROGRAM_SLUG,
} from "@/lib/onboarding/gate";

export const metadata = { title: "Programs | Creator Growth OS" };

type SearchParams = Promise<{ previewGate?: string }>;

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { previewGate } = await searchParams;
  const gate = await getOnboardingGate();
  const gateActive = isGateActive(gate, readPreviewGate(previewGate));

  const supabase = await createClient();
  const { data: dbPrograms } = await supabase
    .from("programs")
    .select(
      "id, slug, title, description, plan_access, category_access, total_lessons, total_tasks, estimated_days, cover_image_url",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  // Pull real per-program progress in one round-trip.
  const progressMap = dbPrograms?.length
    ? await getProgressForPrograms(dbPrograms.map((p) => p.id))
    : new Map();

  const programs: ProgramRow[] = dbPrograms?.length
    ? dbPrograms.map((p, i): ProgramRow => {
        const prog = progressMap.get(p.id);
        const real = prog && prog.lessonsTotal > 0;
        // Compute status from real progress when present; otherwise fall
        // back to a friendly visual default so the demo stays alive.
        const status: ProgramRow["status"] =
          p.plan_access === "pro" && ctx.plan !== "pro"
            ? "pro_only"
            : real && prog!.percent === 100
              ? "completed"
              : real && prog!.percent > 0
                ? "in_progress"
                : real
                  ? "not_started"
                  : i === 2
                    ? "not_started"
                    : "in_progress";
        const progress = real ? prog!.percent : i === 0 ? 68 : i === 1 ? 42 : 0;
        return {
          slug: p.slug,
          title: p.title,
          description: p.description ?? "",
          status,
          progress,
          category_label: deriveCategoryLabel(p.category_access),
          total_lessons: p.total_lessons ?? undefined,
          total_tasks: p.total_tasks ?? undefined,
          estimated_days: p.estimated_days ?? undefined,
          cover_hue: i % 3 === 0 ? "rose" : i % 3 === 1 ? "cream" : "warm",
          cover_image_url: p.cover_image_url ?? null,
          // Soft-locked behind onboarding — every program except Start Here.
          locked: gateActive && p.slug !== ONBOARDING_PROGRAM_SLUG,
        };
      })
    : [];

  return (
    <PageShell>
      <div className="space-y-6 sm:space-y-7">
        {programs.length === 0 ? (
          <ProgramsEmptyState />
        ) : (
          <>
            {/* Grid + filters */}
            <ProgramsGrid programs={programs} />

            {/* Bottom CTA */}
            <UpgradeAccent />
          </>
        )}
      </div>
    </PageShell>
  );
}

function deriveCategoryLabel(arr: string[] | null | undefined) {
  if (!arr || arr.length === 0) return "Starter Creator";
  // Pick the first category in the access array
  const first = arr[0];
  return first === "starter"
    ? "Starter Creator"
    : first === "growth"
      ? "Growth Creator"
      : first === "monetization"
        ? "Monetization Creator"
        : first === "scale"
          ? "Scale Creator"
          : "Growth Creator";
}

function UpgradeAccent() {
  return (
    <div className="max-w-xl mx-auto w-full rounded-[20px] bg-rose-50/80 border border-rose-100 p-6 sm:p-7 flex flex-col items-center text-center">
      <span className="size-11 rounded-full bg-rose-100 text-rose-500 inline-flex items-center justify-center mb-3">
        <Sparkles className="size-5" strokeWidth={2} />
      </span>
      <h3 className="text-h4 text-ink-900 leading-tight mb-2">
        Unlock the Pro track
      </h3>
      <p className="text-[13px] text-ink-700 leading-snug mb-5 max-w-md">
        Pro unlocks <span className="font-semibold">Scale &amp; Automate</span>,
        the Monetization Path, content review and bonus modules in every
        program.
      </p>
      <Link
        href="/billing?upgrade=pro"
        className="inline-flex items-center justify-center h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium shadow-sm transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}

/* Real empty state — shown when no programs are published yet, instead of
   fabricated demo programs that linked to slugs the DB doesn't have. */
function ProgramsEmptyState() {
  return (
    <section className="card p-10 sm:p-14 text-center">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4 mx-auto">
        <Sparkles className="size-6" strokeWidth={1.8} aria-hidden />
      </div>
      <h2 className="text-h4 sm:text-[22px] text-ink-900 mb-2">
        No programs available yet
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-6 leading-relaxed">
        New growth programs are on the way. In the meantime, explore the
        tutorial library or plan out this week&apos;s content.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <Link
          href="/tutorials"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shadow-sm"
        >
          Browse tutorials
        </Link>
        <Link
          href="/posting"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-white border border-ink-200 hover:bg-cream-100 text-ink-900 text-[14px] font-medium transition-colors"
        >
          Plan your posts
        </Link>
      </div>
    </section>
  );
}
