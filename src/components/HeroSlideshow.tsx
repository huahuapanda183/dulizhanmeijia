"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types";

const SLIDES: HeroSlide[] = [
  {
    desktop: "2026_07_FreeUSShipping_HP_Desktop_copy.webp",
    mobile: "2026_07_FreeUSShipping_HP_Mobile_copy.webp",
    alt: "Score free U.S. economy shipping",
    href: "/collections/all",
  },
  {
    desktop: "2026_06_GlamIcons_HP_Desktop_1.webp",
    mobile: "2026_06_GlamIcons_HP_Mobile_3.webp",
    alt: "Glam Icons collection",
    href: "/collections/glam-icons",
  },
  {
    desktop: "2026_06_Glamzilla_HP_Desktop.webp",
    mobile: "2026_06_Glamzilla_HP_Mobile.webp",
    alt: "Glamnetic x Glamzilla",
    href: "/collections/glamzilla",
  },
  {
    desktop: "2026_06_SandalSeason_HP_Desktop.webp",
    mobile: "2026_06_SandalSeason_HP_Mobile.webp",
    alt: "Sandal season collection",
    href: "/collections/sandal-season",
  },
  {
    desktop: "2026_07_SparklingGems_HP_DesktopGeneral.webp",
    mobile: "2026_07_SparklingGems_HP_MobileGeneral.webp",
    alt: "Sparkling gems collection",
    href: "/collections/sparkling-gems",
  },
];

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
          <a
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
          </a>
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
