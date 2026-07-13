import Link from "next/link";
import { CarouselRail } from "@/components/CarouselRail";
import { PROMO_CARDS } from "@/lib/data/content";

export function CollectionCards() {
  return (
    <section className="w-full bg-cream py-6 md:py-8">
      <div className="pl-4 md:pl-8">
        <CarouselRail ariaLabel="Collections">
          {PROMO_CARDS.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group relative h-[300px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[46vw] md:h-[420px] lg:w-[31.5vw]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${card.image}`}
                alt={card.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="absolute bottom-5 left-6 right-6 text-[18px] font-semibold leading-tight text-white md:text-[22px]">
                {card.label}
              </span>
            </Link>
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
