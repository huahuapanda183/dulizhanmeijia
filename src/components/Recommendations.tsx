import { CarouselRail } from "@/components/CarouselRail";
import { ProductCard } from "@/components/ProductCard";
import { getRecommendations } from "@/lib/api";

/**
 * "You May Also Like" rail for the product detail page. Server component —
 * fetches related products by handle and renders them in a horizontal rail.
 */
export async function Recommendations({ handle }: { handle: string }) {
  const products = await getRecommendations(handle, 4);
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-line pt-12">
      <h2 className="heading-track mb-8 text-center text-[26px] font-medium text-ink md:text-[32px]">
        You May Also Like
      </h2>
      <CarouselRail ariaLabel="Recommendations">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </CarouselRail>
    </section>
  );
}
