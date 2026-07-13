import { CarouselRail } from "@/components/CarouselRail";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export async function ShopAllPressOns() {
  const all = await getProducts({ collection: "press-on-nails" });
  // "Shop All Press-Ons" highlights the newer / gem / bundle sets (not the best-seller rail)
  const products = all.filter((p) => !p.collections.includes("best-sellers")).slice(0, 8);
  return (
    <section className="w-full bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 className="heading-track mb-8 text-center text-[30px] font-medium text-ink md:mb-10 md:text-[38px]">
          Shop All Press-On Nails
        </h2>
        <CarouselRail ariaLabel="Shop all press-on nails">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
