import { cn } from "@/lib/utils";
import { StarIcon, StarHalfIcon } from "@/components/icons";

/** Renders a 0–5 star rating (supports half stars). */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full === 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className={cn("flex items-center text-mauve", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <StarIcon key={`f${i}`} className="h-4 w-4" />
      ))}
      {half && <StarHalfIcon className="h-4 w-4" />}
      {Array.from({ length: empty }).map((_, i) => (
        <StarIcon key={`e${i}`} className="h-4 w-4 opacity-25" />
      ))}
    </span>
  );
}
