"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { trackEvent } from "@/lib/api";
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
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => {
        addItem(product, quantity);
        void trackEvent({ type: "add", handle: product.handle, title: product.title });
      }}
      disabled={!product.available}
      className={cn("disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      {product.available ? t(label) : t("Sold Out")}
    </button>
  );
}
