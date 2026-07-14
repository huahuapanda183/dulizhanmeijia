"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/data/types";

const LAST_ORDER_KEY = "glamnetic-last-order";

export default function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOrder(JSON.parse(raw) as Order);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
          {!ready ? null : !order ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-[18px] text-ink">No recent order</p>
              <Link
                href="/collections/all"
                className="mt-4 inline-block bg-mauve px-8 py-3.5 text-white uppercase tracking-[0.12em] text-[14px]"
              >
                Shop All
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-[560px]">
              {/* Success panel */}
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mauve">
                  <CheckIcon className="h-8 w-8 text-white" />
                </span>
                <h1 className="heading-track mt-5 text-[28px] md:text-[34px] font-medium text-ink">
                  Thank you for your order!
                </h1>
                <p className="mt-2 text-[16px] text-ink">Order {order.number}</p>
                <p className="mt-1 text-[14px] text-body">
                  A confirmation was sent to {order.email}.
                </p>
              </div>

              {/* Order summary card */}
              <div className="mt-10 rounded-md border border-line bg-white p-6">
                <h2 className="text-[18px] text-ink font-medium">Order Summary</h2>

                <ul className="mt-5 space-y-4">
                  {order.lines.map((line) => (
                    <li key={line.id} className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/${line.image}`}
                        alt={line.title}
                        width={56}
                        height={56}
                        className="h-14 w-14 shrink-0 rounded-sm object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <span className="text-[14px] text-ink">{line.title}</span>
                        <span className="text-[13px] text-body">Qty {line.quantity}</span>
                      </div>
                      <span className="text-[14px] font-medium text-ink">
                        {formatPrice(line.price * line.quantity, line.currency)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-2 border-t border-line pt-5 text-[14px]">
                  <div className="flex items-center justify-between text-ink">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink">
                    <span>Shipping</span>
                    <span>
                      {order.shipping === 0 ? "FREE" : formatPrice(order.shipping, order.currency)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex items-center justify-between text-mauve">
                      <span>Discount</span>
                      <span>−{formatPrice(order.discount, order.currency)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-ink">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax, order.currency)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-3 text-[16px] font-medium text-ink">
                    <span>Total</span>
                    <span>{formatPrice(order.total, order.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="mt-6 rounded-md border border-line bg-white p-6">
                <h2 className="text-[18px] text-ink font-medium">Shipping address</h2>
                <address className="mt-3 not-italic text-[14px] text-body leading-relaxed">
                  <span className="block text-ink">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </span>
                  <span className="block">{order.shippingAddress.line1}</span>
                  {order.shippingAddress.line2 && (
                    <span className="block">{order.shippingAddress.line2}</span>
                  )}
                  <span className="block">
                    {order.shippingAddress.city}
                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                    {order.shippingAddress.zip}
                  </span>
                  <span className="block">{order.shippingAddress.country}</span>
                  {order.shippingAddress.phone && (
                    <span className="block">{order.shippingAddress.phone}</span>
                  )}
                </address>
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/collections/all"
                  className="inline-block bg-ink-2 px-8 py-3.5 text-white uppercase tracking-[0.12em] text-[14px] rounded-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
