"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

interface CarouselRailProps {
  children: ReactNode;
  className?: string;
  /** px to scroll per arrow click; defaults to ~one card + gap */
  step?: number;
  ariaLabel?: string;
}

/**
 * Horizontal scroll rail with ‹ › arrow controls and scroll-snap.
 * Used by the product / review / promo carousels.
 */
export function CarouselRail({ children, className, step = 320, ariaLabel }: CarouselRailProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    ref.current?.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollBy(-1)}
        className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white md:flex lg:-left-5"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth pb-2 md:gap-6",
          className,
        )}
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollBy(1)}
        className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white md:flex lg:-right-5"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
