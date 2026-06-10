import Link from "next/link";
import {
  CalendarDays,
  TrendingUp,
  Target,
  GraduationCap,
  PlayCircle,
  Users,
  FileText,
  Receipt,
  type LucideIcon,
} from "lucide-react";

/**
 * Marketing "services" grid — the platform's capabilities at a glance.
 *
 * Same layout as the reference (left headline + Book-a-Call, then a 4×2 grid
 * of outline-icon + title + one-liner), but every cell maps to a real
 * Profluencer surface (Posting Plans, Performance, Missions, Programs,
 * Tutorials, Community, Media Kit, Invoices) instead of template filler.
 */
const SERVICES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CalendarDays,
    title: "Posting Plans",
    body: "Plan and schedule content across every platform from one calendar.",
  },
  {
    icon: TrendingUp,
    title: "Performance",
    body: "Track followers, views and engagement across accounts, week over week.",
  },
  {
    icon: Target,
    title: "Missions",
    body: "Daily missions that turn big goals into clear next steps.",
  },
  {
    icon: GraduationCap,
    title: "Programs",
    body: "Step-by-step growth programs built by experienced creators.",
  },
  {
    icon: PlayCircle,
    title: "Tutorials",
    body: "Short, focused how-to videos for every creator skill.",
  },
  {
    icon: Users,
    title: "Community",
    body: "Connect, swap wins and get feedback from other creators.",
  },
  {
    icon: FileText,
    title: "Media Kit",
    body: "Build a polished media kit that wins brand deals.",
  },
  {
    icon: Receipt,
    title: "Invoices",
    body: "Send invoices and get paid for your work, on time.",
  },
];

export function ServicesGrid() {
  return (
    <section className="bg-cream-50">
      <div className="mx-auto max-w-[1340px] px-6 py-16 lg:px-10 lg:py-24">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-sans text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-5xl lg:text-[3.4rem]">
            Everything you need
            <br className="hidden sm:block" /> to grow as a creator
          </h2>
          <Link
            href="/sign-up"
            className="inline-flex h-12 shrink-0 items-center self-start rounded-[12px] bg-rose-600 px-6 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 md:self-auto"
          >
            Start free
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.title}>
              <s.icon className="size-7 text-rose-600" strokeWidth={1.7} />
              <h3 className="mt-5 text-[20px] font-bold tracking-tight text-ink-900">
                {s.title}
              </h3>
              <p className="mt-2.5 max-w-[250px] text-[14.5px] leading-relaxed text-ink-500">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
