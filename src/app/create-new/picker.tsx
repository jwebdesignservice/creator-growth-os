"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Clapperboard,
  ClipboardCheck,
  CalendarDays,
  CalendarClock,
  Star,
  BookOpen,
  PlayCircle,
  CheckSquare,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/cn";

type OptionKey = "programs" | "videos" | "tasks" | "posting";

type Option = {
  key: OptionKey;
  title: string;
  description: string;
  icon: typeof TrendingUp;
  href: string;
  recommended?: boolean;
  metaLeft: { icon: typeof Star; label: string };
  metaRight: { icon: typeof BookOpen; label: string };
};

const OPTIONS: Option[] = [
  {
    key: "programs",
    title: "Programs",
    description:
      "Build a structured creator journey with lessons, tasks, and progression.",
    icon: TrendingUp,
    href: "/create-new/program",
    recommended: true,
    metaLeft: { icon: Star, label: "Best for full creator systems" },
    metaRight: { icon: BookOpen, label: "Includes lessons + tasks" },
  },
  {
    key: "videos",
    title: "Videos",
    description:
      "Create focused lesson content with clear teaching steps and actionable takeaways.",
    icon: Clapperboard,
    href: "/create-new/video",
    metaLeft: { icon: Star, label: "Best for education and onboarding" },
    metaRight: { icon: PlayCircle, label: "Lesson workflow" },
  },
  {
    key: "tasks",
    title: "Tasks",
    description:
      "Add practical action steps creators can complete to move forward.",
    icon: ClipboardCheck,
    href: "/create-new/task",
    metaLeft: { icon: Star, label: "Best for execution and accountability" },
    metaRight: { icon: CheckSquare, label: "Action step tracking" },
  },
  {
    key: "posting",
    title: "Posting Plans",
    description:
      "Organize content schedules, posting rhythm, and publishing consistency.",
    icon: CalendarClock,
    href: "/create-new/posting-plan",
    metaLeft: { icon: Star, label: "Best for content planning" },
    metaRight: { icon: CalendarDays, label: "Scheduling workflow" },
  },
];

export function CreateNewPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<OptionKey>("programs");

  function onContinue() {
    const opt = OPTIONS.find((o) => o.key === selected);
    if (opt) router.push(opt.href);
  }

  return (
    <div
      className="min-h-screen px-4 py-8 sm:py-10 lg:py-14"
      style={{
        // Soft creator-warmth gradient — matches the onboarding flow tones.
        backgroundImage:
          "radial-gradient(60% 60% at 50% 0%, rgba(244, 213, 209, 0.7) 0%, rgba(244, 213, 209, 0) 60%), linear-gradient(180deg, var(--cream-50) 0%, var(--cream-100) 100%)",
      }}
    >
      <div className="max-w-[1180px] mx-auto bg-white rounded-[20px] sm:rounded-[28px] border border-ink-100 shadow-card overflow-hidden">
        <div className="p-5 sm:p-7 lg:p-10 space-y-7 sm:space-y-8">
          {/* Brand row */}
          <header className="flex items-center justify-between gap-3 pb-5 sm:pb-6 border-b border-ink-100">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <BrandMark size={32} />
              <span className="text-h4 sm:text-[20px] text-ink-900 leading-none tracking-tight">
                {BRAND_NAME}
              </span>
            </Link>
          </header>

          {/* Heading */}
          <div>
            <h1 className="text-h1 text-ink-900 leading-tight mb-2">
              Choose what to create
            </h1>
            <p className="text-ink-500 text-[14px] sm:text-[15px] max-w-2xl leading-relaxed">
              Pick the format you want to build inside {BRAND_NAME}. Each option
              is designed to help you guide creators through a clear system.
            </p>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {OPTIONS.map((opt) => (
              <OptionCard
                key={opt.key}
                option={opt}
                selected={selected === opt.key}
                onSelect={() => setSelected(opt.key)}
              />
            ))}
          </div>

          {/* Footer actions */}
          <footer className="flex items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-ink-100">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
            >
              <ArrowLeft className="size-4" strokeWidth={2} />
              Back
            </Link>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-semibold transition-colors shadow-sm"
            >
              Continue
              <ArrowRight className="size-4" strokeWidth={2} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;
  const MetaLeftIcon = option.metaLeft.icon;
  const MetaRightIcon = option.metaRight.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative text-left rounded-[18px] sm:rounded-[20px] p-5 sm:p-6 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
        selected
          ? "bg-rose-50/60 border-2 border-rose-300 shadow-[0_2px_12px_rgba(225,29,72,0.08)]"
          : "bg-white border border-ink-100 hover:border-rose-200 hover:bg-rose-50/30",
      )}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Icon tile */}
        <span
          className={cn(
            "inline-flex items-center justify-center size-[60px] sm:size-[68px] rounded-[14px] sm:rounded-[16px] shrink-0",
            "bg-gradient-to-br from-rose-100 via-rose-50 to-rose-100/40 text-rose-500",
          )}
          aria-hidden
        >
          <Icon className="size-7" strokeWidth={1.8} />
        </span>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-h4 sm:text-[22px] text-ink-900 leading-tight">
              {option.title}
            </h3>
            {option.recommended && (
              <span className="inline-flex items-center gap-1 chip chip-rose shrink-0 whitespace-nowrap">
                <Star className="size-3" strokeWidth={2} fill="currentColor" />
                Recommended
              </span>
            )}
          </div>
          <p className="text-[13.5px] sm:text-[14px] text-ink-500 leading-relaxed">
            {option.description}
          </p>
        </div>
      </div>

      {/* Footer metadata */}
      <div
        className={cn(
          "mt-5 sm:mt-6 pt-4 border-t flex items-center justify-between gap-3 flex-wrap",
          selected ? "border-rose-100" : "border-ink-100",
        )}
      >
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500">
          <MetaLeftIcon className="size-3.5 text-rose-500" strokeWidth={2} />
          {option.metaLeft.label}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-rose-600 font-medium">
          <MetaRightIcon className="size-3.5" strokeWidth={2} />
          {option.metaRight.label}
        </span>
      </div>
    </button>
  );
}
