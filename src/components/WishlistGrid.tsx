"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { getProductsByHandles } from "@/lib/api";
import type { Product } from "@/lib/data/types";

export function WishlistGrid() {
  const { items } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    getProductsByHandles(items.map((i) => i.handle)).then((result) => {
      if (active) setProducts(result);
    });
    return () => {
      active = false;
    };
  }, [items]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-12 md:px-8">
      <h1 className="heading-track text-[30px] font-medium text-ink md:text-[38px]">Your Wishlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-[18px] text-ink">Your wishlist is empty</p>
          <Link
            href="/collections/all"
            className="mt-4 inline-block bg-mauve px-8 py-3.5 text-[14px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-mauve-dark"
          >
            Shop All
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} layout="grid" />
          ))}
        </div>
      )}
    </div>
  );
}
