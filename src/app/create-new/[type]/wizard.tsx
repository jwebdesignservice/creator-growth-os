"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Pencil,
  FileText,
  Users,
  BarChart3,
  Target,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Info,
  ShieldCheck,
  AlignLeft,
  UploadCloud,
  Image as ImageIcon,
  Frame,
  Maximize2,
  FileImage,
  Star,
  Upload,
  X,
  Globe,
  Gem,
  Crown,
  Clock,
  Lightbulb,
  Check,
  Save,
  Rocket,
  Calendar,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/cn";
import type { WizardType } from "./types";

const TOTAL_STEPS = 4;

/* ── Per-type copy ───────────────────────────────────────────────────────── */

type TypeCopy = {
  noun: string;          // "program" / "video" / "task" / "posting plan"
  titleLabel: string;    // "Program title"
  describeLabel: string; // "Describe your program"
  titlePlaceholder: string;
  describePlaceholder: string;
};

const COPY: Record<WizardType, TypeCopy> = {
  program: {
    noun: "program",
    titleLabel: "Program title",
    describeLabel: "Describe your program",
    titlePlaceholder: "Give your program a clear name",
    describePlaceholder:
      "What will creators learn, who is it for, and what outcome should they expect?",
  },
  video: {
    noun: "video",
    titleLabel: "Video title",
    describeLabel: "Describe your video",
    titlePlaceholder: "Give your video a clear name",
    describePlaceholder:
      "What's this video about, who is it for, and what should viewers walk away with?",
  },
  task: {
    noun: "task",
    titleLabel: "Task title",
    describeLabel: "Describe your task",
    titlePlaceholder: "Give your task a clear name",
    describePlaceholder:
      "What should creators do, and what counts as done?",
  },
  "posting-plan": {
    noun: "posting plan",
    titleLabel: "Plan title",
    describeLabel: "Describe your plan",
    titlePlaceholder: "Give your plan a clear name",
    describePlaceholder:
      "What's the cadence, which platforms, and what's the goal of the plan?",
  },
};

/* ── Dropdown options (Quick details) ────────────────────────────────────── */

const AUDIENCE_OPTIONS = ["Creators", "Beginners", "Growth-stage", "Pro/Advanced", "Teams"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "All levels"];
const GOAL_OPTIONS = ["Monetization", "Audience growth", "Consistency", "Brand building", "Skill building"];

const DESCRIBE_MAX = 1000;

/* ── Access tiers (Step 3) ───────────────────────────────────────────────── */

type AccessTier = "free" | "basic" | "pro" | "diamond" | "undecided";

type TierOption = {
  key: AccessTier;
  title: string;
  description: string;
  pillLabel: string;
  icon: typeof Globe;
  popular?: boolean;
};

const TIERS: TierOption[] = [
  { key: "free",      title: "Free",            description: "Available to all members at no cost",            pillLabel: "Open access", icon: Globe },
  { key: "basic",     title: "Basic",           description: "For entry-level members and core access",        pillLabel: "Core tier",   icon: Star },
  { key: "pro",       title: "Pro",             description: "For advanced members with more in-depth content", pillLabel: "Most popular", icon: Gem, popular: true },
  { key: "diamond",   title: "Diamond",         description: "For premium members with your highest-value access", pillLabel: "Premium",     icon: Crown },
  { key: "undecided", title: "I don't know yet", description: "Skip this for now and decide later",            pillLabel: "Decide later", icon: Clock },
];

/* Where to land the admin after they Continue out of the final step. The
   wizard isn't wired to a real save yet, so we just send them to the
   matching admin list view for now. */
const COMPLETED_HREF: Record<WizardType, string> = {
  "program":       "/admin/programs",
  "video":         "/admin/lessons",
  "task":          "/admin/missions",
  "posting-plan":  "/admin/posting",
};

type StepNumber = 1 | 2 | 3 | 4;

export function CreateWizard({ type }: { type: WizardType }) {
  const copy = COPY[type];
  const router = useRouter();

  const [step, setStep] = useState<StepNumber>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [level, setLevel] = useState(LEVEL_OPTIONS[0]);
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  // We hang on to the File so a real upload to Supabase Storage can be wired
  // later without re-prompting the user for the image.
  const [, setThumbnailFile] = useState<File | null>(null);
  const [accessTier, setAccessTier] = useState<AccessTier | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");

  const canContinueStep1 = title.trim().length > 0 && description.trim().length > 0;
  const canContinueStep3 = accessTier !== null;
  // Thumbnail is optional (the "Skip for now" path is explicitly supported by
  // the design) so step 2 is always continuable.
  const canContinue =
    step === 1 ? canContinueStep1 :
    step === 3 ? canContinueStep3 :
    true;

  function goNext() {
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as StepNumber);
  }
  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as StepNumber);
  }

  function handleThumbnail(file: File, dataUrl: string) {
    setThumbnailFile(file);
    setThumbnailDataUrl(dataUrl);
  }
  function clearThumbnail() {
    setThumbnailFile(null);
    setThumbnailDataUrl(null);
  }
  function skipThumbnail() {
    clearThumbnail();
    goNext();
  }

  /* ── Step 4 finalize actions ────────────────────────────────────────────
     All three actions navigate to the matching admin list for now. Swap
     each one for a real server action (createDraft / scheduleFor /
     publishNow) when the persistence layer for this content type lands. */
  function finishTo() {
    router.push(COMPLETED_HREF[type]);
  }
  function saveAsDraft() {
    finishTo();
  }
  function publishNow() {
    finishTo();
  }
  function confirmSchedule() {
    if (!scheduledFor) return;
    finishTo();
  }

  function onPrimaryAction() {
    if (step < TOTAL_STEPS) goNext();
  }

  // datetime-local input needs a "now or later" floor in the user's local
  // time, formatted as YYYY-MM-DDTHH:MM.
  const nowLocalIso = (() => {
    const d = new Date();
    const off = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - off).toISOString().slice(0, 16);
  })();

  return (
    <div
      className="min-h-screen px-4 py-8 sm:py-10 lg:py-14"
      style={{
        backgroundImage:
          "radial-gradient(60% 60% at 50% 0%, rgba(244, 213, 209, 0.7) 0%, rgba(244, 213, 209, 0) 60%), linear-gradient(180deg, var(--cream-50) 0%, var(--cream-100) 100%)",
      }}
    >
      <div className="container-app bg-white rounded-[20px] sm:rounded-[28px] border border-ink-100 shadow-card overflow-hidden">
        <div className="p-5 sm:p-7 lg:p-10 space-y-7 sm:space-y-8">
          {/* Brand + stepper */}
          <header className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/create-new"
              className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <BrandMark size={28} />
              <span className="font-display text-[18px] sm:text-[20px] text-ink-900 leading-none tracking-tight">
                {BRAND_NAME}
              </span>
              <Sparkles className="size-4 text-rose-400" strokeWidth={2} aria-hidden />
            </Link>
            <Stepper current={step} total={TOTAL_STEPS} />
          </header>

          {/* Step content */}
          {step === 1 && (
            <Step1Details
              copy={copy}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              audience={audience}
              setAudience={setAudience}
              level={level}
              setLevel={setLevel}
              goal={goal}
              setGoal={setGoal}
            />
          )}
          {step === 2 && (
            <Step2Thumbnail
              copy={copy}
              thumbnailDataUrl={thumbnailDataUrl}
              onFile={handleThumbnail}
              onClear={clearThumbnail}
              onSkip={skipThumbnail}
            />
          )}
          {step === 3 && (
            <Step3AccessTier
              accessTier={accessTier}
              onSelect={setAccessTier}
            />
          )}
          {step === 4 && (
            <Step4Finalize
              copy={copy}
              title={title}
              description={description}
              audience={audience}
              level={level}
              goal={goal}
              accessTier={accessTier}
              thumbnailDataUrl={thumbnailDataUrl}
            />
          )}

          {/* Inline schedule panel (Step 4 only) */}
          {step === 4 && scheduleOpen && (
            <SchedulePanel
              value={scheduledFor}
              minIso={nowLocalIso}
              onChange={setScheduledFor}
              onCancel={() => {
                setScheduleOpen(false);
                setScheduledFor("");
              }}
              onConfirm={confirmSchedule}
            />
          )}

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 pt-6 border-t border-ink-100 flex-wrap">
            {step === 1 ? (
              <Link
                href="/create-new"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
              >
                <ArrowLeft className="size-4" strokeWidth={2} />
                Back
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setScheduleOpen(false);
                  goBack();
                }}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
              >
                <ArrowLeft className="size-4" strokeWidth={2} />
                Back
              </button>
            )}

            {step === TOTAL_STEPS ? (
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={saveAsDraft}
                  className="inline-flex items-center gap-2 h-12 px-5 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
                >
                  <Save className="size-4" strokeWidth={1.9} />
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleOpen((v) => !v)}
                  aria-pressed={scheduleOpen}
                  className={cn(
                    "inline-flex items-center gap-2 h-12 px-5 rounded-[14px] border text-[14px] font-medium transition-colors",
                    scheduleOpen
                      ? "bg-rose-50 border-rose-300 text-rose-700"
                      : "bg-white border-ink-200 text-ink-900 hover:bg-cream-100",
                  )}
                >
                  <Calendar className="size-4" strokeWidth={1.9} />
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={publishNow}
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-semibold transition-colors shadow-sm"
                >
                  <Rocket className="size-4" strokeWidth={2} />
                  Publish
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 h-12 px-8 rounded-[14px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[15px] font-semibold transition-colors shadow-sm"
              >
                Continue
                <ArrowRight className="size-4" strokeWidth={2} />
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ── Stepper ─────────────────────────────────────────────────────────────── */

function Stepper({ current, total }: { current: number; total: number }) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1.5 sm:gap-2" aria-label={`Step ${current} of ${total}`}>
      {steps.map((n, i) => (
        <div key={n} className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={cn(
              "inline-flex items-center justify-center size-7 sm:size-8 rounded-full text-[12.5px] font-semibold tabular-nums transition-colors",
              n === current
                ? "bg-rose-500 text-white"
                : n < current
                  ? "bg-rose-500 text-white"
                  : "bg-white border border-ink-200 text-ink-400",
            )}
            aria-current={n === current ? "step" : undefined}
          >
            {n}
          </span>
          {i < steps.length - 1 && (
            <span
              className={cn(
                "w-8 sm:w-10 h-[2px] rounded-full",
                n < current ? "bg-rose-500" : "bg-ink-100",
              )}
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Tell us about your X ────────────────────────────────────────── */

function Step1Details({
  copy,
  title,
  setTitle,
  description,
  setDescription,
  audience,
  setAudience,
  level,
  setLevel,
  goal,
  setGoal,
}: {
  copy: TypeCopy;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_360px]">
      {/* LEFT — form */}
      <div className="space-y-6 min-w-0">
        <header>
          <h1 className="font-display text-[30px] sm:text-[36px] lg:text-[42px] text-ink-900 leading-tight mb-2">
            Tell us about your {copy.noun}
          </h1>
          <p className="text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">
            This helps us customize your {copy.noun} experience. You can edit
            these details anytime.
          </p>
        </header>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="cw-title" className="block text-[13.5px] font-semibold text-ink-900">
            {copy.titleLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-10 rounded-[10px] bg-rose-50 text-rose-500 pointer-events-none"
              aria-hidden
            >
              <Pencil className="size-4" strokeWidth={1.9} />
            </span>
            <input
              id="cw-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={copy.titlePlaceholder}
              className="w-full h-[60px] pl-[60px] pr-4 rounded-[14px] bg-white border border-rose-200 hover:border-rose-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 text-[14px] text-ink-900 placeholder:text-ink-400 transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="cw-description" className="block text-[13.5px] font-semibold text-ink-900">
            {copy.describeLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-3 inline-flex items-center justify-center size-10 rounded-[10px] bg-rose-50 text-rose-500 pointer-events-none"
              aria-hidden
            >
              <FileText className="size-4" strokeWidth={1.9} />
            </span>
            <textarea
              id="cw-description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, DESCRIBE_MAX))
              }
              placeholder={copy.describePlaceholder}
              rows={6}
              maxLength={DESCRIBE_MAX}
              className="w-full pl-[60px] pr-4 pt-4 pb-9 rounded-[14px] bg-white border border-ink-200 hover:border-ink-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 text-[14px] text-ink-900 placeholder:text-ink-400 resize-none transition-colors"
            />
            <span className="absolute bottom-3 right-4 text-[11.5px] text-ink-400 tabular-nums pointer-events-none">
              {description.length} / {DESCRIBE_MAX}
            </span>
          </div>
        </div>

        {/* Quick details */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[13.5px] font-semibold text-ink-900">Quick details</span>
            <span className="text-[12.5px] text-ink-500">(optional)</span>
            <Info className="size-3.5 text-ink-400" strokeWidth={1.9} aria-hidden />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TileSelect
              icon={Users}
              label="Audience"
              value={audience}
              options={AUDIENCE_OPTIONS}
              onChange={setAudience}
            />
            <TileSelect
              icon={BarChart3}
              label="Level"
              value={level}
              options={LEVEL_OPTIONS}
              onChange={setLevel}
            />
            <TileSelect
              icon={Target}
              label="Goal"
              value={goal}
              options={GOAL_OPTIONS}
              onChange={setGoal}
            />
          </div>
        </div>
      </div>

      {/* RIGHT — tips */}
      <aside className="space-y-4">
        <div className="rounded-[18px] bg-rose-50/70 border border-rose-100 p-5">
          <header className="flex items-center gap-2.5 mb-4">
            <span className="inline-flex items-center justify-center size-9 rounded-[10px] bg-rose-100/80 text-rose-500">
              <Sparkles className="size-4" strokeWidth={2} aria-hidden />
            </span>
            <h3 className="font-semibold text-[15px] text-ink-900">Tips for a strong start</h3>
          </header>
          <ul className="space-y-4">
            <TipRow
              icon={Target}
              title="Be outcome-driven"
              body={`Focus on the results creators will achieve by joining your ${copy.noun}.`}
            />
            <TipRow
              icon={AlignLeft}
              title="Keep it specific"
              body="Clear details help attract the right creators and set expectations."
            />
            <TipRow
              icon={Sparkles}
              title="Think in transformation"
              body="Describe the before → after and the impact on their creator journey."
            />
          </ul>
        </div>

        <div className="rounded-[16px] bg-rose-50/70 border border-rose-100 p-4 flex items-start gap-2.5">
          <ShieldCheck className="size-5 text-rose-500 shrink-0 mt-0.5" strokeWidth={1.9} aria-hidden />
          <p className="text-[12.5px] text-ink-700 leading-relaxed">
            <span className="font-semibold text-ink-900">You can update all details later.</span>{" "}
            Nothing is set in stone.
          </p>
        </div>
      </aside>
    </div>
  );
}

function TipRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Target;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="inline-flex items-center justify-center size-9 rounded-[10px] bg-rose-100/80 text-rose-500 shrink-0">
        <Icon className="size-4" strokeWidth={1.9} aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold text-ink-900 leading-snug">{title}</div>
        <p className="text-[12.5px] text-ink-500 leading-relaxed mt-0.5">{body}</p>
      </div>
    </li>
  );
}

function TileSelect({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative h-[60px] rounded-[14px] bg-white border border-ink-200 hover:border-ink-300 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-colors">
      <span
        className="absolute left-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-10 rounded-[10px] bg-rose-50 text-rose-500 pointer-events-none"
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <div className="absolute left-[60px] top-2 text-[10.5px] uppercase tracking-wider font-semibold text-ink-400 pointer-events-none">
        {label}
      </div>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full h-full bg-transparent pl-[60px] pr-9 pt-5 pb-1.5 text-[13.5px] font-semibold text-ink-900 cursor-pointer focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
        strokeWidth={2}
      />
    </div>
  );
}

/* ── Step 2: Add a thumbnail image ───────────────────────────────────────── */

function Step2Thumbnail({
  copy,
  thumbnailDataUrl,
  onFile,
  onClear,
  onSkip,
}: {
  copy: TypeCopy;
  thumbnailDataUrl: string | null;
  onFile: (file: File, dataUrl: string) => void;
  onClear: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-7">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-[30px] sm:text-[36px] lg:text-[42px] text-ink-900 leading-tight mb-2">
          Add a thumbnail image
        </h1>
        <p className="text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">
          Your thumbnail appears at checkout and throughout the member
          experience. Upload one now, or choose one later.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ThumbnailUploadCard
          noun={copy.noun}
          thumbnailDataUrl={thumbnailDataUrl}
          onFile={onFile}
          onClear={onClear}
        />
        <ThumbnailSkipCard onSkip={onSkip} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-amber-50/60 border border-amber-100 px-4 sm:px-5 py-3.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <Sparkles
            className="size-4 text-amber-500 shrink-0 mt-0.5"
            strokeWidth={2}
            aria-hidden
          />
          <p className="text-[13px] text-ink-700 leading-snug">
            <span className="font-semibold text-ink-900">Best results:</span>{" "}
            Use a simple cover image with clear subject focus and minimal clutter.
          </p>
        </div>
        <button
          type="button"
          className="text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors shrink-0"
        >
          See examples
        </button>
      </div>
    </div>
  );
}

function ThumbnailUploadCard({
  noun,
  thumbnailDataUrl,
  onFile,
  onClear,
}: {
  noun: string;
  thumbnailDataUrl: string | null;
  onFile: (file: File, dataUrl: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      if (typeof url === "string") onFile(file, url);
    };
    reader.readAsDataURL(file);
  }

  function onPickFile() {
    inputRef.current?.click();
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(true);
  }
  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const hasImage = thumbnailDataUrl !== null;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative rounded-[20px] border-2 p-6 sm:p-7 text-center flex flex-col transition-colors",
        dragActive
          ? "border-rose-400 bg-rose-50"
          : "border-rose-200 bg-rose-50/40",
      )}
    >
      <span className="absolute top-4 left-4 inline-flex items-center gap-1 chip chip-rose">
        <Star className="size-3" strokeWidth={2} fill="currentColor" />
        Recommended
      </span>

      <div className="mx-auto mt-3 inline-flex items-center justify-center size-16 rounded-full bg-rose-100/80 text-rose-500">
        <UploadCloud className="size-7" strokeWidth={1.8} aria-hidden />
      </div>

      <h3 className="font-display text-[22px] sm:text-[24px] text-ink-900 leading-tight mt-4 mb-1.5">
        Upload an image
      </h3>
      <p className="text-[13.5px] text-ink-500 leading-relaxed">
        Drag and drop your image here
        <br className="hidden sm:inline" />
        or click to browse
      </p>

      {/* Preview / spec card */}
      <div
        className={cn(
          "mt-5 rounded-[14px] border-2 border-dashed px-4 py-3.5 transition-colors",
          dragActive ? "border-rose-300 bg-white" : "border-rose-200/80 bg-white/70",
        )}
      >
        {hasImage ? (
          <div className="flex items-center gap-4">
            <div className="relative size-[68px] sm:size-[76px] rounded-[10px] overflow-hidden bg-cream-100 shrink-0">
              {/* User-uploaded preview; data URLs are exempt from next/image
                  domain config so <Image> works directly. */}
              <Image
                src={thumbnailDataUrl}
                alt="Selected thumbnail preview"
                fill
                className="object-cover"
                sizes="76px"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[13px] font-semibold text-ink-900 truncate">
                Thumbnail selected
              </div>
              <p className="text-[11.5px] text-ink-500 mt-0.5">
                Looks good — you can replace it or remove it below.
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              aria-label="Remove selected thumbnail"
              className="size-8 inline-flex items-center justify-center rounded-full text-ink-500 hover:text-ink-900 hover:bg-cream-100 transition-colors shrink-0"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <div className="size-[68px] sm:size-[76px] rounded-[10px] overflow-hidden bg-gradient-to-br from-rose-100 via-amber-50 to-rose-50 shrink-0" aria-hidden />
            <ul className="space-y-1.5 min-w-0">
              <SpecRow icon={Frame} text="Recommended ratio: 16:9" />
              <SpecRow icon={Maximize2} text="Suggested size: 1024 × 576" />
              <SpecRow icon={FileImage} text="PNG or JPG" />
            </ul>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so picking the same file twice still triggers onChange.
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={onPickFile}
        className="mt-5 self-center inline-flex items-center gap-2 h-11 px-6 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors shadow-sm"
      >
        <Upload className="size-4" strokeWidth={2} />
        {hasImage ? "Replace image" : "Upload image"}
      </button>

      <p className="mt-4 text-[12.5px] text-ink-500 leading-relaxed max-w-sm mx-auto">
        Choose a clean, high-quality cover image that represents your {noun}{" "}
        at a glance.
      </p>
    </div>
  );
}

function SpecRow({
  icon: Icon,
  text,
}: {
  icon: typeof Frame;
  text: string;
}) {
  return (
    <li className="flex items-center gap-2 text-[12.5px] text-ink-700">
      <Icon className="size-3.5 text-rose-500 shrink-0" strokeWidth={1.9} aria-hidden />
      {text}
    </li>
  );
}

function ThumbnailSkipCard({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="rounded-[20px] border border-ink-100 bg-white p-6 sm:p-7 text-center flex flex-col">
      <div className="mx-auto mt-3 inline-flex items-center justify-center size-16 rounded-full bg-ink-50 text-ink-400">
        <ImageIcon className="size-7" strokeWidth={1.8} aria-hidden />
      </div>

      <h3 className="font-display text-[22px] sm:text-[24px] text-ink-900 leading-tight mt-4 mb-1.5">
        Choose one later
      </h3>
      <p className="text-[13.5px] text-ink-500 leading-relaxed">
        Skip this step for now and add a thumbnail
        <br className="hidden sm:inline" />
        when you&apos;re ready.
      </p>

      {/* Decorative card preview */}
      <div className="mt-5 mx-auto w-full max-w-[280px] rounded-[14px] bg-cream-50/80 border border-ink-100 p-3 shadow-sm">
        <div className="flex items-center gap-1 mb-2">
          <span className="size-1.5 rounded-full bg-ink-200" />
          <span className="size-1.5 rounded-full bg-ink-200" />
          <span className="size-1.5 rounded-full bg-ink-200" />
        </div>
        <div className="rounded-[10px] bg-rose-100/70 h-[60px] mb-2" aria-hidden />
        <div className="h-[6px] rounded-full bg-ink-100 mb-1.5" aria-hidden />
        <div className="h-[6px] rounded-full bg-ink-100 w-2/3 mb-3" aria-hidden />
        <div className="ml-auto w-[60px] h-[18px] rounded-md bg-rose-200" aria-hidden />
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-5 self-center inline-flex items-center justify-center h-11 px-6 rounded-[12px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
      >
        Skip for now
      </button>

      <p className="mt-4 text-[12.5px] text-ink-500 leading-relaxed">
        You can update this anytime.
      </p>
    </div>
  );
}

/* ── Step 3: Choose who gets access ──────────────────────────────────────── */

function Step3AccessTier({
  accessTier,
  onSelect,
}: {
  accessTier: AccessTier | null;
  onSelect: (t: AccessTier) => void;
}) {
  return (
    <div className="space-y-6">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-[30px] sm:text-[36px] lg:text-[42px] text-ink-900 leading-tight mb-2">
          Choose who gets access
        </h1>
        <p className="text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">
          Pick the access tier for this content. You can update availability
          later.
        </p>
      </header>

      <ul className="space-y-3 max-w-3xl mx-auto w-full">
        {TIERS.map((t) => (
          <li key={t.key}>
            <TierRow
              tier={t}
              selected={accessTier === t.key}
              onSelect={() => onSelect(t.key)}
            />
          </li>
        ))}
      </ul>

      <div className="max-w-3xl mx-auto w-full rounded-[12px] bg-rose-50/50 border border-rose-100 px-4 py-3 flex items-start gap-2.5">
        <Lightbulb
          className="size-4 text-rose-500 shrink-0 mt-0.5"
          strokeWidth={2}
          aria-hidden
        />
        <p className="text-[13px] text-ink-700 leading-snug">
          <span className="font-semibold text-ink-900">Tip:</span> Choose the
          lowest tier that matches the value of this content.
        </p>
      </div>
    </div>
  );
}

function TierRow({
  tier,
  selected,
  onSelect,
}: {
  tier: TierOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = tier.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group w-full text-left rounded-[16px] p-4 sm:p-5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
        selected
          ? "bg-rose-50/70 border-2 border-rose-300 shadow-[0_2px_10px_rgba(225,29,72,0.06)]"
          : "bg-white border border-ink-100 hover:border-rose-200 hover:bg-rose-50/30",
      )}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Icon tile */}
        <span
          className="inline-flex items-center justify-center size-12 sm:size-[52px] rounded-[12px] bg-rose-50 text-rose-500 shrink-0"
          aria-hidden
        >
          <Icon className="size-5 sm:size-[22px]" strokeWidth={1.8} />
        </span>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[18px] sm:text-[20px] text-ink-900 leading-snug">
            {tier.title}
          </h3>
          <p className="text-[12.5px] sm:text-[13px] text-ink-500 leading-snug mt-0.5">
            {tier.description}
          </p>
        </div>

        {/* Pill + (when selected) check */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={cn(
              "inline-flex items-center px-2.5 h-7 rounded-full text-[11.5px] font-semibold whitespace-nowrap",
              tier.popular
                ? "bg-rose-100/80 text-rose-700 border border-rose-200/60"
                : "bg-cream-100 text-ink-500 border border-ink-100",
            )}
          >
            {tier.pillLabel}
          </span>
          {selected && (
            <span
              className="inline-flex items-center justify-center size-7 rounded-full bg-rose-500 text-white"
              aria-hidden
            >
              <Check className="size-4" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Step 4: Review & finalize ───────────────────────────────────────────── */

function Step4Finalize({
  copy,
  title,
  description,
  audience,
  level,
  goal,
  accessTier,
  thumbnailDataUrl,
}: {
  copy: TypeCopy;
  title: string;
  description: string;
  audience: string;
  level: string;
  goal: string;
  accessTier: AccessTier | null;
  thumbnailDataUrl: string | null;
}) {
  const tier = TIERS.find((t) => t.key === accessTier);
  const TierIcon = tier?.icon;

  return (
    <div className="space-y-6">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="font-display text-[30px] sm:text-[36px] lg:text-[42px] text-ink-900 leading-tight mb-2">
          Ready to publish your {copy.noun}
        </h1>
        <p className="text-ink-500 text-[14px] sm:text-[15px] leading-relaxed">
          Review the details below, then choose how to launch it — save as a
          draft, schedule for later, or publish right now.
        </p>
      </header>

      {/* Summary card */}
      <section className="max-w-3xl mx-auto w-full rounded-[18px] border border-ink-100 bg-white overflow-hidden">
        <header className="px-5 sm:px-6 py-3.5 border-b border-ink-100 flex items-center justify-between">
          <span className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-ink-500">
            Summary
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-rose-600">
            <Check className="size-3.5" strokeWidth={2.5} />
            All steps complete
          </span>
        </header>

        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
          {/* Thumbnail */}
          <div className="relative size-[112px] sm:size-[128px] rounded-[14px] overflow-hidden shrink-0 bg-cream-100 mx-auto sm:mx-0">
            {thumbnailDataUrl ? (
              <Image
                src={thumbnailDataUrl}
                alt={`${title || "Untitled"} thumbnail`}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                <ImageIcon className="size-7" strokeWidth={1.5} aria-hidden />
              </div>
            )}
          </div>

          {/* Title + description */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-[22px] sm:text-[26px] text-ink-900 leading-tight">
              {title || `Untitled ${copy.noun}`}
            </h3>
            {description ? (
              <p className="mt-1.5 text-[13.5px] text-ink-500 leading-relaxed line-clamp-3">
                {description}
              </p>
            ) : (
              <p className="mt-1.5 text-[13px] text-ink-400 italic">
                No description provided.
              </p>
            )}
          </div>
        </div>

        {/* Detail chips */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1 flex flex-wrap gap-2">
          <SummaryChip icon={Users} label="Audience" value={audience} />
          <SummaryChip icon={BarChart3} label="Level" value={level} />
          <SummaryChip icon={Target} label="Goal" value={goal} />
          {tier && TierIcon && (
            <SummaryChip
              icon={TierIcon}
              label="Access"
              value={tier.title}
              tone={tier.popular ? "rose" : "default"}
            />
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto w-full rounded-[12px] bg-rose-50/50 border border-rose-100 px-4 py-3 flex items-start gap-2.5">
        <ShieldCheck
          className="size-4 text-rose-500 shrink-0 mt-0.5"
          strokeWidth={2}
          aria-hidden
        />
        <p className="text-[13px] text-ink-700 leading-snug">
          <span className="font-semibold text-ink-900">Nothing is final.</span>{" "}
          You can edit, unpublish, or change access anytime from the admin
          console.
        </p>
      </div>
    </div>
  );
}

function SummaryChip({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "default" | "rose";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 h-9 text-[12.5px]",
        tone === "rose"
          ? "bg-rose-50 border border-rose-200 text-rose-700"
          : "bg-cream-100 border border-ink-100 text-ink-700",
      )}
    >
      <Icon
        className={cn(
          "size-3.5",
          tone === "rose" ? "text-rose-500" : "text-ink-500",
        )}
        strokeWidth={1.9}
        aria-hidden
      />
      <span
        className={cn(
          "text-[10.5px] uppercase tracking-wider font-semibold",
          tone === "rose" ? "text-rose-500" : "text-ink-500",
        )}
      >
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

/* ── Schedule panel (Step 4 inline) ──────────────────────────────────────── */

function SchedulePanel({
  value,
  minIso,
  onChange,
  onCancel,
  onConfirm,
}: {
  value: string;
  minIso: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canConfirm = value.length > 0 && value >= minIso;
  return (
    <div className="max-w-3xl mx-auto w-full rounded-[16px] border border-rose-200 bg-rose-50/60 p-4 sm:p-5">
      <div className="flex items-start gap-2.5 mb-3.5">
        <Calendar className="size-4 text-rose-500 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
        <div>
          <div className="text-[13.5px] font-semibold text-ink-900 leading-snug">
            Schedule for later
          </div>
          <p className="text-[12.5px] text-ink-500 mt-0.5 leading-snug">
            Pick the date and time when this content should go live.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="flex-1 min-w-0">
          <span className="block text-[10.5px] uppercase tracking-wider font-semibold text-ink-500 mb-1.5">
            Publish at
          </span>
          <input
            type="datetime-local"
            value={value}
            min={minIso}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-11 px-3.5 rounded-[12px] bg-white border border-ink-200 hover:border-ink-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 text-[14px] text-ink-900 transition-colors"
          />
        </label>

        <div className="flex items-center gap-2 sm:self-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center h-11 px-4 rounded-[12px] bg-white border border-ink-200 text-ink-700 text-[13px] font-medium hover:bg-cream-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold transition-colors"
          >
            <Calendar className="size-3.5" strokeWidth={2} />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
