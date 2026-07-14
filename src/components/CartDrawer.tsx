"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CloseIcon, MinusIcon, PlusIcon, BagIcon } from "@/components/icons";
import { FreeShippingBar } from "@/components/FreeShippingBar";

export function CartDrawer() {
  const { lines, subtotal, itemCount, currency, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const { t } = useI18n();

  return (
    <>
      {/* backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* panel */}
      <aside
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-[420px] flex-col bg-cream shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[15px] font-semibold uppercase tracking-[0.12em] text-ink">
            {t("Your Bag")} ({itemCount})
          </h2>
          <button type="button" aria-label="Close" onClick={closeCart} className="text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <BagIcon className="h-10 w-10 text-body" />
            <p className="text-[16px] text-ink">{t("Your bag is empty")}</p>
            <Link
              href="/collections/all"
              onClick={closeCart}
              className="mt-2 bg-mauve px-8 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-mauve-dark"
            >
              {t("Shop All")}
            </Link>
          </div>
        ) : (
          <>
            <FreeShippingBar />
            <ul className="flex-1 overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 border-b border-line py-4">
                  <Link href={`/products/${line.handle}`} onClick={closeCart} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/${line.image}`}
                      alt={line.title}
                      className="h-20 w-20 rounded-sm object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-[15px] font-medium text-ink">{line.title}</p>
                        <p className="text-[13px] text-body">{line.shape}</p>
                      </div>
                      <p className="text-[14px] text-ink">{formatPrice(line.price * line.quantity, line.currency)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-sm border border-line">
                        <button type="button" aria-label="Decrease" onClick={() => updateQuantity(line.id, line.quantity - 1)} className="px-2 py-1 text-ink">
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-[13px] tabular-nums">{line.quantity}</span>
                        <button type="button" aria-label="Increase" onClick={() => updateQuantity(line.id, line.quantity + 1)} className="px-2 py-1 text-ink">
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(line.id)} className="text-[12px] text-body underline underline-offset-2 hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-ink">{t("Subtotal")}</span>
                <span className="font-medium text-ink">{formatPrice(subtotal, currency)}</span>
              </div>
              <p className="mt-1 text-[12px] text-body">{t("Shipping & taxes calculated at checkout.")}</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 block w-full rounded-sm bg-ink-2 py-3.5 text-center text-[14px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink"
              >
                {t("Checkout")}
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block w-full py-2 text-center text-[13px] text-ink underline underline-offset-4"
              >
                {t("View Bag")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
