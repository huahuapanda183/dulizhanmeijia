import { CarouselRail } from "@/components/CarouselRail";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";

const PRODUCTS: Product[] = [
  { name: "Citrus Coast", shape: "Short Oval", price: "$21.99", rating: "5.0", image: "CitrusCoast_1.webp", hoverImage: "CitrusCoast_2.webp", href: "/products/citrus-coast" },
  { name: "La Perle", shape: "Short Squoval", price: "$17.99", rating: "5.0", image: "LaPerle_1.webp", hoverImage: "LaPerle_2.webp", href: "/products/la-perle" },
  { name: "Salty Waves", shape: "Short Almond", price: "$21.99", rating: "4.8", image: "SaltyWaves_1.webp", hoverImage: "SaltyWaves_2.webp", href: "/products/salty-waves" },
  { name: "Pinch Me", shape: "Short Oval", price: "$19.99", rating: "4.8", image: "PinchMe_6.webp", hoverImage: "PinchMe_1.webp", href: "/products/pinch-me" },
  { name: "Seaspell", shape: "Short Almond", price: "$17.99", rating: "4.7", image: "Seaspell_1.webp", hoverImage: "Seaspell_2.webp", href: "/products/seaspell" },
  { name: "Summer Fresco", shape: "Medium Almond", price: "$19.99", rating: "4.7", image: "EuroSummerPDP_SummerFresco_1.webp", hoverImage: "EuroSummerPDP_SummerFresco_2.webp", href: "/products/summer-fresco" },
  { name: "Aperitivo Hour", shape: "Short Oval", price: "$21.99", rating: "4.8", image: "AperitivoHour_1.webp", hoverImage: "AperitivoHour_2.webp", href: "/products/aperitivo-hour" },
  { name: "Berry Fizz", shape: "Short Squoval", price: "$17.99", rating: "4.9", image: "2026_03_IndividualPDPUpdates_Batch3_BerryFizzUGC.webp", href: "/products/berry-fizz" },
];

export function BestSellers() {
  return (
    <section className="w-full bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 className="heading-track mb-8 text-center text-[30px] font-medium text-ink md:mb-10 md:text-[38px]">
          Our Best Sellers
        </h2>
        <CarouselRail ariaLabel="Best sellers">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
