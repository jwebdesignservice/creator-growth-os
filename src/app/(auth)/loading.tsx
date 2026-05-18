import { BrandMark } from "@/components/brand-mark";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <BrandMark size={56} />
        <div className="text-[12.5px] uppercase tracking-[0.12em] text-rose-600 font-semibold">
          Loading
        </div>
      </div>
    </div>
  );
}
