import { ShieldCheck } from "lucide-react";

export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] bg-rose-50/60 border border-rose-100 px-4 py-3">
      <ShieldCheck
        className="size-4 text-rose-500 shrink-0"
        strokeWidth={2}
      />
      <p className="text-[12.5px] text-ink-700 leading-snug">{children}</p>
    </div>
  );
}
