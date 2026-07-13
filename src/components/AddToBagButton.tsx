"use client";

import { useCart } from "@/lib/cart/cart-context";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface AddToBagButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  label?: string;
}

export function AddToBagButton({ product, quantity = 1, className, label = "Add to Bag" }: AddToBagButtonProps) {
  const { addItem } = useCart();
  return (
    <button
      type="button"
      onClick={() => addItem(product, quantity)}
      disabled={!product.available}
      className={cn("disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      {product.available ? label : "Sold Out"}
    </button>
  );
}
