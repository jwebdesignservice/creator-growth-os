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
    : FALLBACK;

  return (
    <PageShell>
      <div className="space-y-6 sm:space-y-7">
        {/* Grid + filters */}
        <ProgramsGrid programs={programs} />

        {/* Bottom CTA */}
        <UpgradeAccent />
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
    <div className="rounded-[16px] bg-rose-50/80 border border-rose-100 p-5 flex flex-col">
      <Sparkles className="size-5 text-rose-500 mb-3" strokeWidth={2} />
      <h3 className="text-h4 text-ink-900 leading-tight mb-2">
        Unlock the Pro track
      </h3>
      <p className="text-[13px] text-ink-700 leading-snug mb-4 flex-1">
        Pro unlocks <span className="font-semibold">Scale &amp; Automate</span>,
        the Monetization Path, content review and bonus modules in every
        program.
      </p>
      <Link
        href="/billing?upgrade=pro"
        className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}

const FALLBACK: ProgramRow[] = [
  {
    slug: "influencer-blueprint",
    title: "The Influencer Blueprint",
    description: "Build your personal brand, find your niche, and create a consistent content system.",
    status: "in_progress",
    progress: 68,
    category_label: "Starter Creator",
    total_lessons: 24,
    total_tasks: 18,
    estimated_days: 30,
    cover_hue: "rose",
  },
  {
    slug: "content-that-connects",
    title: "Content That Connects",
    description: "Create content that attracts and converts your ideal audience.",
    status: "in_progress",
    progress: 42,
    category_label: "Growth Creator",
    total_lessons: 20,
    total_tasks: 15,
    estimated_days: 30,
    cover_hue: "cream",
  },
  {
    slug: "monetize-your-influence",
    title: "Monetize Your Influence",
    description: "Turn your audience into income with multiple revenue streams.",
    status: "not_started",
    progress: 0,
    category_label: "Monetization Creator",
    total_lessons: 22,
    total_tasks: 16,
    estimated_days: 30,
    cover_hue: "warm",
  },
  {
    slug: "scale-and-automate",
    title: "Scale & Automate",
    description: "Systemize your content, team and workflows to scale your impact.",
    status: "pro_only",
    category_label: "Monetization Creator",
    total_lessons: 20,
    total_tasks: 14,
    estimated_days: 30,
    cover_hue: "rose",
  },
];
