"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useCart } from "@/lib/cart/cart-context";
import type { Product } from "@/lib/data/types";

/**
 * Interactive purchase controls on the PDP: quantity stepper, ADD TO BAG
 * (wired to the cart) and the nail-lineup selector.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [nail, setNail] = useState(0);
  const { addItem } = useCart();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-3">
        <div className="flex items-center rounded-sm border border-line">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 text-ink">
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-[15px] tabular-nums">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} className="px-3 text-ink">
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => addItem(product, qty)}
          disabled={!product.available}
          className="flex-1 rounded-sm bg-ink-2 py-3.5 text-[15px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {product.available ? "Add to Bag" : "Sold Out"}
        </button>
      </div>

      <div className="flex gap-2.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Nail ${i + 1}`}
            onClick={() => setNail(i)}
            className={cn(
              "flex h-14 w-12 items-end justify-center rounded-sm border p-1 transition",
              i === nail ? "border-mauve" : "border-line hover:border-body",
            )}
          >
            <span
              className="block h-9 w-6 rounded-t-full rounded-b-[3px]"
              style={{ background: "linear-gradient(180deg,#f6e7e1 0%,#efd6cf 60%,#e7c6bd 100%)" }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
