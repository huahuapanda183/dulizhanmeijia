"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { MinusIcon, PlusIcon, BagIcon } from "@/components/icons";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import { useI18n } from "@/lib/i18n/i18n-context";

export function CartContents() {
  const { t } = useI18n();
  const { lines, subtotal, currency, updateQuantity, removeItem } = useCart();

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
      <h1 className="heading-track text-[30px] md:text-[36px] font-medium text-ink mb-8">
        {t("Your Bag")}
      </h1>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BagIcon className="h-14 w-14 text-ink" />
          <p className="mt-4 text-[18px] text-ink">{t("Your bag is empty")}</p>
          <Link
            href="/collections/all"
            className="mt-4 inline-block bg-mauve px-8 py-3.5 text-white uppercase tracking-[0.12em] text-[14px]"
          >
            {t("Shop All")}
          </Link>
        </div>
      ) : (
        <>
          <div className="-mx-5 mb-6">
            <FreeShippingBar />
          </div>
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Line items */}
          <div>
            {lines.map((line) => (
              <div key={line.id} className="flex gap-4 py-5 border-b border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${line.image}`}
                  alt={line.title}
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 rounded-sm object-cover"
                />

                <div className="flex flex-1 flex-col">
                  <h2 className="text-[17px] text-ink font-medium">{line.title}</h2>
                  <p className="text-[14px] text-body">{line.shape}</p>

                  <div className="mt-auto pt-3">
                    <div className="border border-line rounded-sm inline-flex items-center">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-[15px] text-ink">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-ink"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <span className="text-[16px] text-ink font-medium">
                    {formatPrice(line.price * line.quantity, line.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(line.id)}
                    className="text-[13px] text-body underline"
                  >
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <aside className="rounded-md border border-line bg-white p-6 h-fit">
            <h2 className="text-[18px] text-ink font-medium">{t("Order Summary")}</h2>

            <div className="mt-5 flex items-center justify-between text-[15px] text-ink">
              <span>{t("Subtotal")}</span>
              <span className="font-medium">{formatPrice(subtotal, currency)}</span>
            </div>

            <p className="mt-2 text-[13px] text-body">
              {t("Shipping & taxes calculated at checkout")}
            </p>

            <Link
              href="/checkout"
              className="mt-6 block w-full bg-ink-2 text-white text-center uppercase tracking-[0.12em] py-3.5 rounded-sm text-[14px]"
            >
              {t("Checkout")}
            </Link>

            <Link
              href="/collections/all"
              className="mt-4 block text-center text-[14px] text-body underline"
            >
              {t("Continue Shopping")}
            </Link>
          </aside>
          </div>
        </>
      )}
    </div>
  );
}
