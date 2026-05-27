import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

type Props = {
  slug: string;
  name: string;
  description: string | null;
  member_count: number;
  featured?: boolean;
  hue?: "rose" | "cream" | "warm";
};

export function SpaceCard({
  slug,
  name,
  description,
  member_count,
  featured,
  hue = "rose",
}: Props) {
  const gradients = {
    rose: "from-rose-100 via-cream-200 to-cream-300",
    cream: "from-cream-200 via-rose-50 to-cream-300",
    warm: "from-rose-50 via-cream-100 to-rose-100",
  };
  return (
    <Link
      href={`/community?space=${slug}`}
      className="card p-5 hover:shadow-md transition-shadow group"
    >
      <div
        className={`size-12 rounded-[12px] bg-gradient-to-br ${gradients[hue]} mb-4`}
      />
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-h4 text-ink-900 leading-tight">
          {name}
        </h3>
        {featured && (
          <span className="text-[10.5px] font-medium uppercase tracking-wide text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
            Featured
          </span>
        )}
      </div>
      <p className="text-[13px] text-ink-500 leading-snug mb-4 line-clamp-2">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-ink-500 inline-flex items-center gap-1.5">
          <Users className="size-3.5 text-ink-400" strokeWidth={2} />
          {member_count.toLocaleString()} members
        </span>
        <span className="text-[12.5px] font-medium text-rose-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
          Open
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
