"use client";

import { useCart } from "@/lib/cart/cart-context";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/api";
import { formatPrice } from "@/lib/format";

/**
 * Cart free-shipping progress indicator. Shows how much more the shopper needs
 * to add to unlock free shipping, or a celebratory unlocked message.
 */
export function FreeShippingBar() {
  const { subtotal, currency } = useCart();
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  if (remaining <= 0) {
    return (
      <div className="px-5 py-3">
        <p className="text-center text-[13px] text-mauve">🎉 You&apos;ve unlocked FREE shipping!</p>
      </div>
    );
  }

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="px-5 py-3">
      <p className="text-center text-[13px] text-ink">
        You&apos;re {formatPrice(remaining, currency)} away from FREE shipping
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-mauve transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
