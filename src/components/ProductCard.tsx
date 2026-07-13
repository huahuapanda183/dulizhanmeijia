import { cn } from "@/lib/utils";
import { StarIcon } from "@/components/icons";
import type { Product } from "@/types";

/**
 * Glamnetic product card used in the Best Sellers and Shop All rails.
 * Static + CSS hover (primary image swaps to hover image on card hover).
 */
export function ProductCard({ product }: { product: Product }) {
  const onSale = Boolean(product.comparePrice);
  return (
    <article className="group/card w-[70vw] shrink-0 snap-start sm:w-[300px] md:w-[320px]">
      <a href={product.href} className="block">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/${product.image}`}
            alt={product.name}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-500",
              product.hoverImage && "group-hover/card:opacity-0",
            )}
            loading="lazy"
          />
          {product.hoverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/images/${product.hoverImage}`}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
              loading="lazy"
            />
          )}

          {product.badge && (
            <span className="absolute left-0 top-3 bg-mauve px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
              {product.badge}
            </span>
          )}

          {product.rating && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-ink shadow-sm">
              <StarIcon className="h-3 w-3 text-mauve" />
              {product.rating}
            </span>
          )}
        </div>

        <div className="mt-3 text-center">
          <h3 className="text-[19px] font-medium text-ink">{product.name}</h3>
          <p className="mt-0.5 text-[15px] text-body">{product.shape}</p>
          <p className="mt-1 text-[15px]">
            {onSale && (
              <span className="mr-2 text-body line-through">{product.comparePrice}</span>
            )}
            <span className={cn(onSale ? "text-mauve" : "text-ink")}>{product.price}</span>
          </p>
        </div>
      </a>

      <button
        type="button"
        className="mt-3 w-full text-center text-[15px] font-medium uppercase tracking-[0.14em] text-ink underline decoration-1 underline-offset-4 transition-colors hover:text-mauve"
      >
        Add to Bag
      </button>
    </article>
  );
}
