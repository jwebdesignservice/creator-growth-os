import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ProgramCover = {
  imageUrl: string | null;
  hue: "rose" | "cream" | "warm";
  /** 0–100 when this is an in-progress course; null otherwise. */
  progress: number | null;
};

type Props = {
  href: string;
  total: number;
  inProgress: number;
  /** Up to 3 covers, front-most first. */
  covers: ProgramCover[];
};

// Cohesive rose/mauve family so the fanned deck always reads as one set.
const HUE: Record<ProgramCover["hue"], string> = {
  rose: "from-[#C26174] to-[#8E3447]",
  warm: "from-[#B5738A] to-[#8A4057]",
  cream: "from-[#A98494] to-[#735060]",
};

// Resting + hover transform per fan position (front → back). Tuned so the fan
// opens entirely WITHIN the covers column — it can never reach the text.
const POS = [
  {
    z: "z-30",
    base: "[transform:translateX(-26px)_rotate(-10deg)]",
    hover:
      "group-hover:[transform:translateX(-56px)_translateY(-12px)_rotate(-18deg)_scale(1.04)]",
  },
  {
    z: "z-20",
    base: "[transform:translateX(0px)_rotate(0deg)]",
    hover: "group-hover:[transform:translateY(-16px)_scale(1.02)]",
  },
  {
    z: "z-10",
    base: "[transform:translateX(26px)_rotate(10deg)]",
    hover:
      "group-hover:[transform:translateX(56px)_translateY(-12px)_rotate(18deg)]",
  },
];

function Cover({ cover, pos }: { cover: ProgramCover; pos: (typeof POS)[number] }) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 -ml-[49px] -mt-[64px] h-[128px] w-[98px] overflow-hidden rounded-[13px] border-2 border-white shadow-[0_10px_24px_-12px_rgba(26,24,22,0.5)] [transform-origin:50%_120%] transition-transform duration-[520ms] ease-[cubic-bezier(0.45,0,0.55,1)] will-change-transform",
        pos.z,
        pos.base,
        pos.hover,
      )}
    >
      {cover.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", HUE[cover.hue])}>
          <GraduationCap
            className="absolute left-1/2 top-3 size-5 -translate-x-1/2 text-white/90"
            strokeWidth={1.8}
          />
          <span className="absolute bottom-[30px] left-3 h-1.5 w-[62px] rounded-full bg-white/90" />
          <span className="absolute bottom-5 left-3 h-1 w-11 rounded-full bg-white/55" />
        </div>
      )}

      {cover.progress != null && (
        <>
          <span className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/35 to-transparent" />
          <span className="absolute inset-x-3 bottom-[11px] h-1 rounded-full bg-white/35">
            <span
              className="block h-full rounded-full bg-white"
              style={{ width: `${Math.min(100, Math.max(0, cover.progress))}%` }}
            />
          </span>
        </>
      )}
    </div>
  );
}

/**
 * Launcher tile for the Programs section. A fanned stack of course covers — on
 * hover the covers spread apart like pulling courses off a shelf. Text and
 * covers live in separate columns so the fan never overlaps the copy.
 */
export function ProgramsCard({ href, total, inProgress, covers }: Props) {
  const meta =
    `${total} program${total === 1 ? "" : "s"}` +
    (inProgress > 0 ? ` · ${inProgress} in progress` : "");
  const shown = covers.slice(0, 3);

  return (
    <Link
      href={href}
      className="group relative flex min-h-[200px] overflow-hidden rounded-[18px] border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition-[transform,box-shadow] duration-[380ms] ease-[cubic-bezier(0.45,0,0.55,1)] hover:-translate-y-[3px] hover:shadow-[0_22px_44px_-26px_rgba(26,24,22,0.45)]"
    >
      {/* Left — label */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-4">
        <span className="flex size-[42px] items-center justify-center rounded-[13px] bg-rose-50 text-rose-600 transition-transform duration-[380ms] ease-[cubic-bezier(0.45,0,0.55,1)] group-hover:-rotate-[4deg] group-hover:scale-105">
          <GraduationCap className="size-[22px]" strokeWidth={2} />
        </span>
        <h3 className="mt-3.5 text-[20px] font-bold tracking-[-0.01em] text-ink-900">
          Programs
        </h3>
        <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-ink-500">
          Structured courses to grow your audience
        </p>
        <span className="mt-3 self-start whitespace-nowrap rounded-full bg-rose-50 px-[11px] py-[5px] text-[11.5px] font-semibold text-rose-700">
          {meta}
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3.5 text-[13px] font-semibold text-rose-700">
          Open
          <ArrowRight
            className="size-[15px] transition-transform duration-[380ms] ease-[cubic-bezier(0.45,0,0.55,1)] group-hover:translate-x-1"
            strokeWidth={2}
          />
        </span>
      </div>

      {/* Right — fanned cover stack (own column; the fan stays inside it) */}
      <div className="relative h-[150px] w-[200px] shrink-0 self-center sm:w-[236px]">
        {shown.map((cover, i) => (
          <Cover key={i} cover={cover} pos={POS[i] ?? POS[0]} />
        ))}
      </div>
    </Link>
  );
}
