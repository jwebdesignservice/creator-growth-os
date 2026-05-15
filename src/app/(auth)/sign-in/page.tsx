import Link from "next/link";
import {
  LayoutGrid,
  CalendarDays,
  PlayCircle,
  BarChart3,
  Users,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { AuthHeroPhoto, FeatureOverlayCard } from "@/components/auth/hero-photo";
import { Avatar } from "@/components/app-shell/topbar";
import { BRAND_NAME } from "@/lib/brand";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in · Creator Growth OS" };

const VALUE_PROPS = [
  {
    icon: LayoutGrid,
    title: "Personalized dashboard",
    sub: "Track what matters.",
  },
  {
    icon: CalendarDays,
    title: "Posting plans",
    sub: "Stay consistent. Grow faster.",
  },
  {
    icon: PlayCircle,
    title: "Creator tutorials",
    sub: "Learn, apply, and level up.",
  },
  {
    icon: BarChart3,
    title: "Progress tracking",
    sub: "Measure growth with clarity.",
  },
  {
    icon: Users,
    title: "Community access",
    sub: "Connect, collaborate, succeed.",
  },
];

export default function SignInPage() {
  return (
    <div className="grid lg:grid-cols-[288px_1fr_520px] min-h-screen bg-cream-100">
      {/* LEFT — brand + value props + coach */}
      <aside className="hidden lg:flex flex-col px-7 py-8 border-r border-ink-100">
        <Link href="/" className="flex items-start gap-3 mb-10">
          <BrandMark size={42} />
          <div className="text-[12.5px] font-medium leading-[1.25] text-ink-900 pt-0.5">
            How To Become
            <br />
            A Successful
            <br />
            Social Media Influencer
          </div>
        </Link>

        <div className="mb-8">
          <Sparkles className="size-5 text-rose-500 mb-3" strokeWidth={2} />
          <h2 className="font-display text-[26px] text-ink-900 leading-tight">
            Grow your influence.
            <br />
            Inspire the world.
            <br />
            <span className="text-rose-600">Earn with purpose.</span>
          </h2>
        </div>

        <ul className="space-y-4 mb-auto">
          {VALUE_PROPS.map(({ icon: Icon, title, sub }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div>
                <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">
                  {title}
                </div>
                <div className="text-[12px] text-ink-500">{sub}</div>
              </div>
            </li>
          ))}
        </ul>

        {/* Coach card */}
        <div className="mt-8 rounded-[14px] bg-white border border-ink-100 p-3.5">
          <div className="flex items-start gap-3">
            <Avatar name="Isabelle Morgan" size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] text-ink-500 uppercase tracking-wider">
                Your Coach
              </div>
              <div className="text-[13px] font-semibold text-ink-900 flex items-center gap-1">
                Isabelle Morgan
                <CheckCircle2
                  className="size-3.5 text-rose-500"
                  strokeWidth={2}
                  fill="currentColor"
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-ink-500 leading-snug italic">
            &ldquo;You&apos;ve got this. Keep showing up and your influence will
            grow.&rdquo;
          </p>
        </div>

        <Link
          href="mailto:support@creator-growth-os.com"
          className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          Need help? Contact support
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </aside>

      {/* CENTER — form card */}
      <main className="flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <BrandMark size={36} />
            <div className="text-[14px] font-semibold text-ink-900">
              {BRAND_NAME}
            </div>
          </div>

          <div className="card p-7 lg:p-9">
            <Sparkles className="size-5 text-rose-500 mb-3" strokeWidth={2} />
            <h1 className="font-display text-[36px] text-ink-900 leading-tight flex items-center gap-2.5">
              Welcome back <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-ink-500 text-[13.5px] leading-relaxed mb-6">
              Continue your creator journey and grow your influence with
              confidence.
            </p>

            <SignInForm />

            <div className="mt-5">
              <Link
                href="/sign-up"
                className="flex items-center justify-between gap-2 px-4 h-11 rounded-[12px] bg-rose-50/70 border border-rose-100 hover:bg-rose-100 text-[13.5px] font-medium text-ink-700 transition-colors"
              >
                <span>
                  New here?{" "}
                  <span className="text-rose-600 font-semibold">
                    Create your account
                  </span>
                </span>
                <ArrowRight className="size-4 text-rose-600" strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-ink-500">
            <ShieldCheck className="size-3.5" strokeWidth={2} />
            Your data is safe with us. We never share your information.
          </div>
        </div>
      </main>

      {/* RIGHT — lifestyle photo + overlay */}
      <div className="hidden lg:block relative">
        <AuthHeroPhoto>
          <FeatureOverlayCard
            headline="Everything you need to grow and succeed"
            blurb="Access your dashboard, posting plans, tutorials, and community in one beautiful space."
            bullets={[
              "Plan your content",
              "Track your progress",
              "Learn from experts",
              "Connect with creators",
            ]}
          />
        </AuthHeroPhoto>
      </div>
    </div>
  );
}
