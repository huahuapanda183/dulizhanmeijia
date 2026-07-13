import Link from "next/link";
import { CarouselRail } from "@/components/CarouselRail";
import { CATEGORY_CARDS } from "@/lib/data/content";

export function CategoryCards() {
  return (
    <section className="w-full bg-cream py-3 md:py-4">
      <div className="pl-4 md:pl-8">
        <CarouselRail ariaLabel="Categories">
          {CATEGORY_CARDS.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group relative h-[420px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[46vw] md:h-[560px] lg:w-[33vw]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${category.image}`}
                alt={category.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
              <span className="absolute bottom-6 left-6 text-[18px] font-semibold uppercase tracking-[0.06em] text-white md:text-[20px]">
                {category.label}
              </span>
            </Link>
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
