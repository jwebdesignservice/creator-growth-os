"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { setCsatRating } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

type Props = {
  ticketPublicId: string;
  /** Existing rating, if any. */
  initialRating?: number | null;
};

/**
 * 5-star rating control that appears on the Ticket Details panel when the
 * selected ticket is resolved. Persists immediately to support_tickets.csat_rating.
 */
export function CsatRatingWidget({ ticketPublicId, initialRating }: Props) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function pick(n: number) {
    setError(null);
    setRating(n);
    start(async () => {
      const result = await setCsatRating(ticketPublicId, n);
      if (!result.ok) {
        setError(result.error);
        // Revert optimistic update on error.
        setRating(initialRating ?? 0);
        return;
      }
      setSavedAt(Date.now());
    });
  }

  const displayed = hover || rating;

  return (
    <div className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
          CSAT Rating
        </span>
        {pending ? (
          <Loader2 className="size-3 animate-spin text-[var(--dev-text-muted)]" strokeWidth={2.2} />
        ) : savedAt ? (
          <span className="text-[10.5px] text-[var(--dev-success-text)] font-medium">Saved</span>
        ) : rating > 0 ? (
          <span className="text-[10.5px] text-[var(--dev-text-muted)] font-medium tabular-nums">{rating} / 5</span>
        ) : null}
      </div>

      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= displayed;
          return (
            <button
              key={n}
              type="button"
              disabled={pending}
              onClick={() => pick(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`Rate ${n} out of 5`}
              aria-pressed={rating === n}
              className={cn(
                "inline-flex items-center justify-center size-7 rounded-md transition-colors",
                pending && "cursor-not-allowed opacity-60",
              )}
            >
              <Star
                className={cn(
                  "size-5 transition-colors",
                  filled
                    ? "text-[var(--dev-warning)] fill-[var(--dev-warning)]"
                    : "text-[var(--dev-text-muted)] hover:text-[var(--dev-warning-text)]",
                )}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-1.5 text-[11px] text-[var(--dev-danger-text)]">
          {error}
        </p>
      )}
    </div>
  );
}
