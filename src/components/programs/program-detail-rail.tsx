import Link from "next/link";
import { MessageSquare, Play, ArrowRight, Lock, Check } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { Donut } from "@/components/dashboard/donut";
import { cn } from "@/lib/cn";

type ProgressBlock = {
  percent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  streakDays: number;
};

type CoachBlock = {
  name: string;
  role: string;
  blurb: string;
  avatarUrl?: string | null;
};

type NextLessonBlock = {
  title: string;
  moduleLabel: string;
  duration: string;
  href: string;
};

type Props = {
  userName: string;
  avatarUrl?: string | null;
  plan: "free" | "basic" | "pro";
  progress: ProgressBlock;
  coach: CoachBlock;
  nextLesson?: NextLessonBlock;
};

export function ProgramDetailRail({
  userName,
  avatarUrl,
  plan,
  progress,
  coach,
  nextLesson,
}: Props) {
  return (
    <aside className="hidden xl:flex flex-col w-[336px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-5 space-y-4">
        {/* Profile chip */}
        <div className="flex items-center gap-3 pb-2">
          <Avatar name={userName} src={avatarUrl ?? undefined} size={40} />
          <div className="text-[14px] font-semibold text-ink-900">
            {userName}
          </div>
        </div>

        {/* Program Progress */}
        <section className="card p-4">
          <div className="text-[13.5px] font-semibold text-ink-900 mb-3">
            Program Progress
          </div>
          <div className="flex items-center gap-4">
            <Donut
              percent={progress.percent}
              size={88}
              strokeWidth={10}
            >
              <div className="text-center">
                <div className="text-[18px] font-semibold text-ink-900 leading-none">
                  {progress.percent}%
                </div>
                <div className="text-[9.5px] text-ink-500 mt-0.5">
                  Overall Progress
                </div>
              </div>
            </Donut>
            <ul className="space-y-2.5 flex-1 min-w-0">
              <li>
                <div className="text-[15px] font-semibold text-ink-900 leading-tight">
                  {progress.lessonsCompleted}
                </div>
                <div className="text-[10.5px] text-ink-500">Lessons Completed</div>
              </li>
              <li>
                <div className="text-[15px] font-semibold text-ink-900 leading-tight">
                  {progress.lessonsCompleted} / {progress.lessonsTotal}
                </div>
                <div className="text-[10.5px] text-ink-500">Lessons Completed</div>
              </li>
              <li>
                <div className="text-[15px] font-semibold text-ink-900 leading-tight">
                  {progress.streakDays} days
                </div>
                <div className="text-[10.5px] text-ink-500">Current Streak</div>
              </li>
            </ul>
          </div>
          <Link
            href="/missions"
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
          >
            View full progress
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </section>

        {/* Your Coach */}
        <section className="card p-4">
          <div className="text-[13.5px] font-semibold text-ink-900 mb-3">
            Your Coach
          </div>
          <div className="flex items-start gap-3 mb-3">
            <Avatar
              name={coach.name}
              src={coach.avatarUrl ?? undefined}
              size={48}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-[14px] font-semibold text-ink-900 leading-tight">
                  {coach.name}
                </div>
                <span className="chip chip-rose text-[10px]">{coach.role}</span>
              </div>
              <p className="text-[11.5px] text-ink-500 leading-snug mt-1.5">
                {coach.blurb}
              </p>
            </div>
          </div>
          <Link
            href="/support?topic=coaching"
            className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-[13px] font-medium transition-colors cursor-pointer"
          >
            <MessageSquare className="size-3.5" strokeWidth={2} />
            Message Coach
          </Link>
        </section>

        {/* Your Plan */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Your Plan
            </div>
            <span className="chip chip-rose capitalize">{plan}</span>
          </div>
          {plan !== "pro" ? (
            <>
              <p className="text-[12px] text-ink-500 leading-snug mb-3">
                You&apos;re on the {plan} plan. Upgrade to unlock bonus modules,
                premium templates &amp; 1-to-1 coaching.
              </p>
              <Link
                href="/billing?upgrade=pro"
                className="block w-full h-10 leading-10 text-center text-[13px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] mb-3 transition-colors cursor-pointer"
              >
                Upgrade to Pro
              </Link>
              <ProRow label="Bonus Modules" />
              <ProRow label="Premium Resources" />
              <ProRow label="1-to-1 Coaching" />
            </>
          ) : (
            <div className="flex items-center gap-2 text-[12.5px] text-success">
              <Check className="size-3.5" strokeWidth={2.5} />
              You have full Pro access.
            </div>
          )}
        </section>

        {/* Next Lesson */}
        {nextLesson && (
          <section className="card p-4">
            <div className="text-[13.5px] font-semibold text-ink-900 mb-3">
              Next Lesson
            </div>
            <Link
              href={nextLesson.href}
              className="block group"
            >
              <div className="relative rounded-[12px] overflow-hidden mb-3 h-[120px] bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/60">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="size-10 rounded-full bg-rose-500 inline-flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="size-4 text-white ml-0.5" fill="currentColor" />
                  </span>
                </div>
              </div>
              <div className="text-[13.5px] font-semibold text-ink-900 leading-tight mb-1">
                {nextLesson.title}
              </div>
              <div className="text-[11.5px] text-ink-500 mb-2">
                {nextLesson.moduleLabel} · {nextLesson.duration}
              </div>
              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 group-hover:text-rose-700">
                Go to Lesson
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </span>
            </Link>
          </section>
        )}
      </div>
    </aside>
  );
}

function ProRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-ink-100 first:border-t-0">
      <span className="text-[12.5px] text-ink-700">{label}</span>
      <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-500">
        Pro Only
        <Lock className="size-3" strokeWidth={2} />
      </span>
    </div>
  );
}
