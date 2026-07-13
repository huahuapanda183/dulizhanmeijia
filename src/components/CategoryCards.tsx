import { CarouselRail } from "@/components/CarouselRail";

interface Category {
  label: string;
  image: string;
  href: string;
}

const CATEGORIES: Category[] = [
  {
    label: "Shop Glue On Nails",
    image: "/images/Shop_Nails.png",
    href: "/collections/all-nails",
  },
  {
    label: "Shop Quick Press Mani",
    image: "/images/Glamnetic_QuickPressMani_Homepage_CategoryModule.webp",
    href: "/collections/quick-press-mani",
  },
  {
    label: "Shop Accessories",
    image: "/images/SHOP_ACCESSORIE.png",
    href: "/collections/accessories",
  },
  {
    label: "Shop Lashes",
    image: "/images/Shop_Lashes.png",
    href: "/collections/all-lashes",
  },
];

export function CategoryCards() {
  return (
    <section className="w-full bg-cream py-3 md:py-4">
      <div className="pl-4 md:pl-8">
        <CarouselRail ariaLabel="Categories">
          {CATEGORIES.map((category) => (
            <a
              key={category.href}
              href={category.href}
              className="group relative h-[420px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-sm sm:w-[46vw] md:h-[560px] lg:w-[33vw]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt={category.label}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
              <span className="absolute bottom-6 left-6 font-semibold uppercase tracking-[0.06em] text-white text-[18px] md:text-[20px]">
                {category.label}
              </span>
            </a>
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
