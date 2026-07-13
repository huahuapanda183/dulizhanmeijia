"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HERO_SLIDES as SLIDES } from "@/lib/data/content";

export function HeroSlideshow() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section aria-label="Featured" className="relative w-full overflow-hidden bg-cream">
      <div className="relative">
        {SLIDES.map((slide, idx) => (
          <Link
            key={slide.desktop}
            href={slide.href}
            aria-hidden={idx !== i}
            tabIndex={idx === i ? 0 : -1}
            className={cn(
              "block transition-opacity duration-700",
              idx === i ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${slide.desktop}`}
              alt={slide.alt}
              className="hidden h-auto w-full md:block"
              fetchPriority={idx === 0 ? "high" : "auto"}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${slide.mobile}`}
              alt={slide.alt}
              className="block h-auto w-full md:hidden"
            />
          </Link>
        ))}
      </div>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to item ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn(
              "h-2 w-2 rounded-full border border-ink/50 transition",
              idx === i ? "bg-ink" : "bg-transparent",
            )}
          />
        ))}
      </div>
    </section>
  );
}
