/* Program surfaces ──────────────────────────────────────────────────────
   Composite surfaces from the Programs area: the featured-program hero
   banner (gradient + meta + progress + CTA + notebook motif), the
   "What you'll learn" outcomes grid, and the Templates & Downloads
   resource list. Pure presentational mirrors of src/components/programs/*
   and src/app/(app)/programs/[slug]/*.
   ───────────────────────────────────────────────────────────────────── */

import {
  Play,
  Sparkles,
  BookOpen,
  CheckSquare,
  CalendarDays,
  Library,
  FileText,
  FileSpreadsheet,
  Files,
  ChevronRight,
  Star,
  ArrowRight,
  Megaphone,
  Video,
  PenLine,
  Heart,
  type LucideIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Featured program hero — gradient banner with badge, meta, progress, CTA.
// ─────────────────────────────────────────────────────────────────────────────

export function FeaturedHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-rose-100 via-cream-200 to-cream-100 w-[720px] max-w-full">
      <div className="grid grid-cols-1 2xl:grid-cols-[1fr_280px] gap-6 p-8">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-[12.5px] mb-3">
            <Sparkles className="size-4" strokeWidth={2} /> Featured Program
          </span>
          <h2 className="text-[32px] font-display text-ink-900 leading-tight mb-3">
            The Influencer Blueprint
          </h2>
          <p className="text-[14px] text-ink-600 leading-relaxed mb-4 max-w-md">
            Build your personal brand, find your niche, and create a consistent
            content system from the ground up.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-600 mb-5">
            <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-rose-500" strokeWidth={2} /> Starter Creator</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} /> 30 Days</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen className="size-3.5 text-rose-500" strokeWidth={2} /> 26 Lessons</span>
            <span className="inline-flex items-center gap-1.5"><CheckSquare className="size-3.5 text-rose-500" strokeWidth={2} /> 18 Tasks</span>
          </div>
          <div className="mb-5 max-w-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12.5px] font-semibold text-ink-700">Overall Progress</span>
              <span className="text-[13px] font-bold text-ink-900 tabular-nums">83%</span>
            </div>
            <div className="h-2 rounded-full bg-white/70 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: "83%" }} />
            </div>
          </div>
          <span className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 text-white text-[15px] font-medium shadow-sm">
            <Play className="size-4" fill="currentColor" /> Continue Program
          </span>
        </div>

        {/* Notebook motif */}
        <div className="relative hidden 2xl:block">
          <div className="absolute right-0 top-2 w-56 rounded-[16px] bg-white shadow-card border border-ink-100 p-5 rotate-3">
            <div className="font-display text-[15px] text-ink-900 mb-3">Content Plan</div>
            {[80, 95, 70, 88].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-cream-200 mb-2" style={{ width: `${w}%` }} />
            ))}
            <Heart className="size-4 text-rose-400 mt-2" fill="currentColor" strokeWidth={0} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// What you'll learn — outcomes grid with icon tiles.
// ─────────────────────────────────────────────────────────────────────────────

export function WhatYoullLearn() {
  const outcomes: { icon: LucideIcon; text: string }[] = [
    { icon: PenLine, text: "Define a niche and positioning that actually converts" },
    { icon: Video, text: "Film and edit clean talking-head clips with just a phone" },
    { icon: Megaphone, text: "Write hooks that stop the scroll in the first 3 seconds" },
    { icon: Heart, text: "Build a content system you can keep up with weekly" },
  ];
  return (
    <div className="rounded-[20px] bg-cream-100 border border-cream-200 p-6 w-[480px] max-w-full">
      <header className="flex items-center justify-between mb-5">
        <h3 className="text-h4 text-ink-900">What you&apos;ll learn</h3>
        <span className="text-[12.5px] font-semibold text-rose-600">83% complete</span>
      </header>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {outcomes.map((o, i) => (
          <li key={i} className="flex items-start gap-3 rounded-[14px] bg-white border border-ink-100 p-3.5">
            <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <o.icon className="size-[18px]" strokeWidth={1.9} />
            </span>
            <span className="text-[13px] text-ink-800 leading-snug">{o.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates & Downloads — resource list with file-type chips + footer stats.
// ─────────────────────────────────────────────────────────────────────────────

export function TemplatesDownloads() {
  const items = [
    { title: "Niche Clarity Worksheet", desc: "Clarify your offer, audience, and positioning.", type: "PDF", icon: FileText },
    { title: "Content Pillars Template", desc: "Map your recurring themes and posting angles.", type: "Google Sheet", icon: FileSpreadsheet },
    { title: "Hook Library Starter Pack", desc: "Plug-and-play hook prompts for better content starts.", type: "Swipe File", icon: Files, pro: true },
    { title: "Creator Checklist", desc: "A simple execution checklist for consistent publishing.", type: "PDF Guide", icon: FileText },
  ];
  return (
    <section className="card overflow-hidden w-[480px] max-w-full">
      <div className="p-5 flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Library className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">Templates &amp; Downloads</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Ready-to-use resources to speed up execution</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600 shrink-0">
          View all <ArrowRight className="size-3.5" strokeWidth={2} />
        </span>
      </div>
      <ul>
        {items.map((it) => (
          <li key={it.title} className="border-t border-ink-100">
            <span className="flex items-center gap-3.5 w-full px-5 py-3.5 hover:bg-cream-50 transition-colors cursor-pointer">
              <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                <it.icon className="size-[20px]" strokeWidth={1.9} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-ink-900 leading-snug">
                  <span className="truncate">{it.title}</span>
                  {it.pro && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9.5px] font-bold">PRO</span>
                  )}
                </span>
                <span className="block text-[12px] text-ink-500 leading-snug mt-0.5 truncate">{it.desc}</span>
              </span>
              <span className="text-[12px] text-ink-500 shrink-0 hidden sm:inline">{it.type}</span>
              <ChevronRight className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-ink-100 px-5 py-3 flex items-center gap-2 text-[12px] text-ink-500">
        <span className="size-6 rounded-full bg-rose-100 text-rose-500 inline-flex items-center justify-center shrink-0">
          <Star className="size-3" fill="currentColor" strokeWidth={0} />
        </span>
        <span><span className="font-semibold text-ink-700 tabular-nums">4</span> ready resources</span>
        <span aria-hidden className="text-ink-300">·</span>
        <span><span className="font-semibold text-ink-700 tabular-nums">1</span> Pro resource included</span>
      </div>
    </section>
  );
}
