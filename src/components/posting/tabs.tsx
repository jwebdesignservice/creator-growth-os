import Link from "next/link";
import { cn } from "@/lib/cn";

type TabKey = "my_plans" | "calendar";

const TABS: { key: TabKey; label: string; href: string }[] = [
  { key: "my_plans", label: "My Plans", href: "/posting" },
  { key: "calendar", label: "Content Calendar", href: "/posting?view=calendar" },
];

export function PostingTabs({ active }: { active: TabKey }) {
  return (
    <div className="border-b border-ink-100">
      <ul className="flex items-center gap-1 flex-wrap">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <li key={t.key}>
              <Link
                href={t.href}
                className={cn(
                  "h-11 px-4 inline-flex items-center text-[13.5px] font-medium border-b-2 -mb-px transition-colors",
                  isActive
                    ? "text-rose-700 border-rose-500"
                    : "text-ink-500 hover:text-ink-900 border-transparent",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
