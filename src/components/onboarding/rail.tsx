import { ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";

type Reason = { icon: LucideIcon; label: string };
type NextUp = {
  title: string;
  description: string;
  platforms: ("instagram" | "tiktok" | "youtube" | "snapchat")[];
  /** 1-based step index for the carousel dots */
  step?: number;
  totalSteps?: number;
};

type Props = {
  reasons: Reason[];
  nextUp?: NextUp;
};

export function OnboardingRail({ reasons, nextUp }: Props) {
  return (
    <aside className="space-y-4 lg:w-[280px] shrink-0">
      {/* Why we ask this */}
      <div className="bg-white rounded-[16px] border border-ink-100 p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
          <span className="text-[13px] font-semibold text-ink-900">
            Why we ask this
          </span>
        </div>
        <ul className="space-y-3">
          {reasons.map((r) => (
            <li key={r.label} className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center size-7 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <r.icon className="size-3.5" strokeWidth={2} />
              </span>
              <span className="text-[12.5px] text-ink-700 leading-snug pt-1">
                {r.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next up preview */}
      {nextUp && (
        <div className="bg-white rounded-[16px] border border-ink-100 p-4">
          <div className="text-[13px] font-semibold text-ink-900 mb-1">
            Next up: {nextUp.title}
          </div>
          <p className="text-[12px] text-ink-500 leading-snug mb-3">
            {nextUp.description}
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            {nextUp.platforms.map((p) => (
              <PlatformBubble key={p} platform={p} />
            ))}
          </div>
          {nextUp.totalSteps && nextUp.step && (
            <CarouselDots step={nextUp.step} total={nextUp.totalSteps} />
          )}
        </div>
      )}

      {/* Privacy */}
      <div className="bg-cream-100 rounded-[16px] border border-ink-100 p-4">
        <div className="flex items-start gap-2.5">
          <ShieldCheck
            className="size-4 text-ink-500 shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <p className="text-[12px] text-ink-700 leading-snug">
            Your data is private and never shared.
            <br />
            <span className="text-ink-500">You can update this anytime.</span>
          </p>
        </div>
      </div>
    </aside>
  );
}

function PlatformBubble({
  platform,
}: {
  platform: "instagram" | "tiktok" | "youtube" | "snapchat";
}) {
  const cls = "size-9 rounded-full flex items-center justify-center";
  if (platform === "instagram") {
    return (
      <span className={cn(cls, "bg-rose-100 text-rose-600")}>
        <InstagramIcon size={18} />
      </span>
    );
  }
  if (platform === "tiktok") {
    return (
      <span className={cn(cls, "bg-ink-100 text-ink-900")}>
        <TiktokIcon size={18} />
      </span>
    );
  }
  if (platform === "youtube") {
    return (
      <span className={cn(cls, "bg-rose-100 text-rose-600")}>
        <YoutubeIcon size={18} />
      </span>
    );
  }
  return (
    <span className={cn(cls, "bg-[#FFF9CC] text-[#8B7300]")}>
      <SnapchatGlyph />
    </span>
  );
}

function SnapchatGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M12 2c3.4 0 5.6 2.4 5.6 5.5 0 1 .1 2 .3 2.6.6 0 1.4-.1 2 .3.6.4.4 1-.1 1.4-.7.5-2.1.6-2.4 1.1-.3.6.6 1.9 1.5 2.7.8.7 1.7 1 2.1 1.2.3.2.4.4.3.6-.4.7-2.1.9-2.6 1.1-.1.4-.3 1.1-.6 1.3-.3.2-.9 0-1.5-.1-.7-.1-1.5-.2-2.2.1-.6.3-1.2.9-1.7 1.3-.6.4-1.4.9-2.7.9s-2.1-.5-2.7-.9c-.5-.4-1.1-1-1.7-1.3-.7-.3-1.5-.2-2.2-.1-.6.1-1.2.3-1.5.1-.3-.2-.5-.9-.6-1.3-.5-.2-2.2-.4-2.6-1.1-.1-.2 0-.4.3-.6.4-.2 1.3-.5 2.1-1.2.9-.8 1.8-2.1 1.5-2.7-.3-.5-1.7-.6-2.4-1.1-.5-.4-.7-1-.1-1.4.6-.4 1.4-.3 2-.3.2-.6.3-1.6.3-2.6C6.4 4.4 8.6 2 12 2Z" />
    </svg>
  );
}

function CarouselDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "size-1.5 rounded-full",
            i + 1 === step ? "bg-rose-500" : "bg-ink-200",
          )}
        />
      ))}
    </div>
  );
}
