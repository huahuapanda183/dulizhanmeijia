"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Product } from "@/lib/data/types";

export function BundleBuilder({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const { addItem, openCart } = useCart();

  const add = (handle: string) => setSelected((s) => ({ ...s, [handle]: (s[handle] ?? 0) + 1 }));
  const dec = (handle: string) =>
    setSelected((s) => {
      const q = (s[handle] ?? 0) - 1;
      const next = { ...s };
      if (q <= 0) delete next[handle];
      else next[handle] = q;
      return next;
    });

  // Shows the true price only. This used to advertise "3 for 15% off / 5 for 20% off"
  // with a struck-through subtotal, but addBundle() adds every item at full price and
  // attaches no promo code, and the server recomputes the order from price_cents — so
  // a 5-item bundle displayed $71.96 and then charged $89.95. Displaying a discount the
  // checkout will not honour is worse than showing no discount at all. To bring the
  // offer back, add a real promo_codes row and apply it through applyPromoCode() so the
  // server grants the same amount the page promises.
  const { count, subtotal, currency } = useMemo(() => {
    let count = 0;
    let subtotalCents = 0;
    const currency = products[0]?.currency ?? "USD";
    for (const p of products) {
      const q = selected[p.handle] ?? 0;
      count += q;
      // Integer cents, matching the server's money model — float accumulation here
      // drifted from the charged total.
      subtotalCents += q * Math.round(p.price * 100);
    }
    return { count, subtotal: subtotalCents / 100, currency };
  }, [selected, products]);

  const addBundle = () => {
    products.forEach((p) => {
      const q = selected[p.handle] ?? 0;
      if (q > 0) addItem(p, q);
    });
    setSelected({});
    openCart();
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => {
          const q = selected[p.handle] ?? 0;
          return (
            <div key={p.id} className="flex flex-col">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/${p.images[0]}`} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                {q > 0 && (
                  <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-mauve px-1.5 text-[12px] font-semibold text-white">
                    {q}
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-center text-[15px] font-medium text-ink">{p.title}</h3>
              <p className="text-center text-[13px] text-body">{p.shape}</p>
              <p className="text-center text-[14px] text-ink">{formatPrice(p.price, p.currency)}</p>

              {q === 0 ? (
                <button
                  type="button"
                  onClick={() => add(p.handle)}
                  className="mt-2 rounded-sm bg-mauve py-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-mauve-dark"
                >
                  {t("Add")}
                </button>
              ) : (
                <div className="mt-2 flex items-center justify-center gap-3 rounded-sm border border-line py-1.5">
                  <button type="button" aria-label="Remove one" onClick={() => dec(p.handle)} className="text-ink">
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-[14px] tabular-nums">{q}</span>
                  <button type="button" aria-label="Add one" onClick={() => add(p.handle)} className="text-ink">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* sticky summary */}
      <div className="sticky bottom-0 z-10 mt-8 flex flex-col gap-3 border-t border-line bg-white/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-[15px] text-ink">
            {count} {t(count === 1 ? "item in bundle" : "items in bundle")}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[16px]">
            <span className="font-medium text-ink">{formatPrice(subtotal, currency)}</span>
          </span>
          <button
            type="button"
            onClick={addBundle}
            disabled={count === 0}
            className={cn(
              "rounded-sm bg-ink-2 px-8 py-3.5 text-[14px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink",
              count === 0 && "cursor-not-allowed opacity-50",
            )}
          >
            {t("Add Bundle to Bag")}
          </button>
        </div>
      </div>
    </div>
  );
}
