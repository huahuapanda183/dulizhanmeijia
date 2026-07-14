import { CarouselRail } from "@/components/CarouselRail";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { T } from "@/lib/i18n/i18n-context";

export async function BestSellers() {
  const products = await getProducts({ collection: "best-sellers" });
  return (
    <section className="w-full bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 className="heading-track mb-8 text-center text-[30px] font-medium text-ink md:mb-10 md:text-[38px]">
          <T k="Our Best Sellers" />
        </h2>
        <CarouselRail ariaLabel="Best sellers">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
