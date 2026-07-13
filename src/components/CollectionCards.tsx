import { CarouselRail } from "@/components/CarouselRail";

interface Collection {
  label: string;
  image: string;
  href: string;
}

const collections: Collection[] = [
  {
    label: "Free Shipping",
    image: "2026_05_FreeUSShipping_HPWidget.webp",
    href: "/pages/shipping",
  },
  {
    label: "New: Sparkling Gems",
    image: "2026_07_SparklingGems_HPWidgetGeneral.webp",
    href: "/collections/sparkling-gems",
  },
  {
    label: "NEW: Sandal Season Collection",
    image: "2026_06_SandalSeason_HPWidget.webp",
    href: "/collections/sandal-season",
  },
  {
    label: "NEW STYLES ADDED: Glam Icons",
    image: "2026_06_GlamIcons_HPWidget.webp",
    href: "/collections/glam-icons",
  },
  {
    label: "GLAMNETIC X GLAMZILLA",
    image: "2026_05_Glamzilla_HPWidget_US.webp",
    href: "/collections/glamzilla",
  },
];

export function CollectionCards() {
  return (
    <section className="w-full bg-cream py-6 md:py-8">
      <div className="pl-4 md:pl-8">
        <CarouselRail ariaLabel="Collections">
          {collections.map((collection) => (
            <a
              key={collection.href}
              href={collection.href}
              className="group relative h-[300px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[46vw] md:h-[420px] lg:w-[31.5vw]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${collection.image}`}
                alt={collection.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="absolute bottom-5 left-6 right-6 text-[18px] font-semibold leading-tight text-white md:text-[22px]">
                {collection.label}
              </span>
            </a>
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
