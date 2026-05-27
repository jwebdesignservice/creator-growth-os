import Link from "next/link";
import {
  Star,
  UserRound,
  MessageSquare,
  PenLine,
  ArrowRight,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; desc: string; href: string }[] = [
  {
    icon: UserRound,
    title: "Complete your profile",
    desc: "Add bio, niche & links",
    href: "/settings",
  },
  {
    icon: MessageSquare,
    title: "Connect your socials",
    desc: "Link Instagram, TikTok & more",
    href: "/settings",
  },
  {
    icon: PenLine,
    title: "Create your first post",
    desc: "Share and start building momentum",
    href: "/posting",
  },
];

export function GettingStarted() {
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <header className="flex items-center gap-2.5 mb-4">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Star className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900 leading-tight">
            Getting Started
          </h3>
          <p className="text-[12.5px] text-ink-500 leading-snug">
            Set up your foundation
          </p>
        </div>
      </header>

      <ul className="space-y-2.5 flex-1">
        {STEPS.map((s) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className="flex items-center gap-3 group rounded-[12px] -mx-2 px-2 py-1.5 hover:bg-cream-100 transition-colors"
            >
              <span className="size-9 rounded-[11px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                <s.icon className="size-[18px]" strokeWidth={1.9} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-ink-900 group-hover:text-rose-700 transition-colors">
                  {s.title}
                </div>
                <div className="text-[11.5px] text-ink-500 leading-snug">
                  {s.desc}
                </div>
              </div>
              <ChevronRight className="size-4 text-ink-300 shrink-0 group-hover:text-rose-500 transition-colors" strokeWidth={2} />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/support"
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
      >
        View onboarding guide <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
