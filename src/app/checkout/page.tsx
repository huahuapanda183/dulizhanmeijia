"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { getShippingRates, applyPromoCode, createOrder } from "@/lib/api";
import type { Address, PromoResult, ShippingRate } from "@/lib/data/types";

const TAX_RATE = 0.0725;
const LAST_ORDER_KEY = "glamnetic-last-order";

const inputClass =
  "w-full border border-line rounded-sm px-3 py-2.5 text-[14px] outline-none focus:border-mauve";

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

const INITIAL_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, currency, clear } = useCart();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>("");

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoPending, setPromoPending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Load shipping rates once we know the subtotal.
  useEffect(() => {
    let active = true;
    getShippingRates(subtotal).then((r) => {
      if (!active) return;
      setRates(r);
      setSelectedRateId((prev) => (prev && r.some((x) => x.id === prev) ? prev : r[0]?.id ?? ""));
    });
    return () => {
      active = false;
    };
  }, [subtotal]);

  const selectedRate = useMemo(
    () => rates.find((r) => r.id === selectedRateId) ?? rates[0],
    [rates, selectedRateId],
  );

  // FREESHIP zeroes shipping; other valid codes discount the subtotal.
  const isFreeShip = promo?.ok === true && promo.code === "FREESHIP";
  const discount = promo?.ok && !isFreeShip ? promo.amount : 0;
  const shipping = isFreeShip ? 0 : selectedRate?.amount ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = +(taxable * TAX_RATE).toFixed(2);
  const total = +(taxable + shipping + tax).toFixed(2);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code || promoPending) return;
    setPromoPending(true);
    try {
      const result = await applyPromoCode(code, subtotal);
      setPromo(result);
    } finally {
      setPromoPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    if (!form.email.trim() || !form.line1.trim() || !form.city.trim() || !form.zip.trim()) {
      setError("Please fill in your email and shipping address (street, city, and ZIP).");
      return;
    }
    if (!selectedRate) {
      setError("Please select a shipping method.");
      return;
    }
    setError(null);
    setPending(true);

    const shippingAddress: Address = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      line1: form.line1,
      line2: form.line2 || undefined,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
    };

    try {
      const order = await createOrder({
        lines: lines.map((l) => ({ handle: l.handle, quantity: l.quantity })),
        email: form.email,
        shippingAddress,
        shippingRateId: selectedRate.id,
        promoCode: promo?.ok ? promo.code : undefined,
      });
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      clear();
      router.push("/checkout/confirmation");
    } catch {
      setError("Something went wrong placing your order. Please try again.");
      setPending(false);
    }
  }

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
          <h1 className="heading-track text-[30px] md:text-[36px] font-medium text-ink mb-8">
            Checkout
          </h1>

          {lines.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-[18px] text-ink">Your bag is empty</p>
              <Link
                href="/collections/all"
                className="mt-4 inline-block bg-mauve px-8 py-3.5 text-white uppercase tracking-[0.12em] text-[14px]"
              >
                Shop All
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
              {/* LEFT: form */}
              <form onSubmit={handleSubmit} className="min-w-0">
                {/* Contact */}
                <section>
                  <h2 className="text-[18px] text-ink font-medium">Contact</h2>
                  <div className="mt-4">
                    <label htmlFor="email" className="block text-[13px] text-body mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>
                </section>

                {/* Shipping address */}
                <section className="mt-10">
                  <h2 className="text-[18px] text-ink font-medium">Shipping address</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-[13px] text-body mb-1.5">
                        First name
                      </label>
                      <input
                        id="firstName"
                        autoComplete="given-name"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-[13px] text-body mb-1.5">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="line1" className="block text-[13px] text-body mb-1.5">
                        Address
                      </label>
                      <input
                        id="line1"
                        autoComplete="address-line1"
                        value={form.line1}
                        onChange={(e) => update("line1", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="line2" className="block text-[13px] text-body mb-1.5">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        id="line2"
                        autoComplete="address-line2"
                        value={form.line2}
                        onChange={(e) => update("line2", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-[13px] text-body mb-1.5">
                        City
                      </label>
                      <input
                        id="city"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-[13px] text-body mb-1.5">
                        State / Province
                      </label>
                      <input
                        id="state"
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-[13px] text-body mb-1.5">
                        ZIP / Postal code
                      </label>
                      <input
                        id="zip"
                        autoComplete="postal-code"
                        value={form.zip}
                        onChange={(e) => update("zip", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-[13px] text-body mb-1.5">
                        Country
                      </label>
                      <input
                        id="country"
                        autoComplete="country-name"
                        value={form.country}
                        onChange={(e) => update("country", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-[13px] text-body mb-1.5">
                        Phone (optional)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>

                {/* Shipping method */}
                <section className="mt-10">
                  <h2 className="text-[18px] text-ink font-medium">Shipping method</h2>
                  <div className="mt-4 space-y-3">
                    {rates.length === 0 ? (
                      <p className="text-[14px] text-body">Loading shipping options…</p>
                    ) : (
                      rates.map((rate) => {
                        const active = rate.id === selectedRateId;
                        return (
                          <label
                            key={rate.id}
                            className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border px-4 py-3 ${
                              active ? "border-mauve bg-white" : "border-line bg-white"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shippingRate"
                                value={rate.id}
                                checked={active}
                                onChange={() => setSelectedRateId(rate.id)}
                                className="accent-mauve"
                              />
                              <span>
                                <span className="block text-[14px] text-ink">{rate.label}</span>
                                <span className="block text-[13px] text-body">{rate.estimate}</span>
                              </span>
                            </span>
                            <span className="text-[14px] font-medium text-ink">
                              {rate.amount === 0 ? "FREE" : formatPrice(rate.amount, currency)}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Payment (demo) */}
                <section className="mt-10">
                  <h2 className="text-[18px] text-ink font-medium">Payment</h2>
                  <p className="mt-2 text-[13px] text-body">
                    Demo checkout — no real payment is processed.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="card" className="block text-[13px] text-body mb-1.5">
                        Card number
                      </label>
                      <input
                        id="card"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="expiry" className="block text-[13px] text-body mb-1.5">
                        Expiry
                      </label>
                      <input id="expiry" placeholder="MM / YY" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-[13px] text-body mb-1.5">
                        CVC
                      </label>
                      <input id="cvc" inputMode="numeric" placeholder="123" className={inputClass} />
                    </div>
                  </div>
                </section>

                {error && (
                  <p className="mt-6 text-[14px] text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-6 w-full bg-ink-2 text-white uppercase tracking-[0.12em] py-3.5 rounded-sm text-[14px] disabled:opacity-60"
                >
                  {pending ? "Placing Order…" : "Place Order"}
                </button>
              </form>

              {/* RIGHT: order summary */}
              <aside className="h-fit lg:sticky lg:top-6">
                <div className="rounded-md border border-line bg-white p-6">
                  <h2 className="text-[18px] text-ink font-medium">Order Summary</h2>

                  <ul className="mt-5 space-y-4">
                    {lines.map((line) => (
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

                  {/* Promo code */}
                  <div className="mt-6 border-t border-line pt-5">
                    <label htmlFor="promo" className="block text-[13px] text-body mb-1.5">
                      Promo code
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="promo"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className={inputClass}
                        placeholder="Enter code"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoPending}
                        className="shrink-0 border border-ink-2 px-4 text-[13px] uppercase tracking-[0.1em] text-ink rounded-sm disabled:opacity-60"
                      >
                        {promoPending ? "…" : "Apply"}
                      </button>
                    </div>
                    {promo && (
                      <p
                        className={`mt-2 text-[13px] ${promo.ok ? "text-mauve" : "text-red-600"}`}
                        role="status"
                      >
                        {promo.message}
                      </p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="mt-6 space-y-2 border-t border-line pt-5 text-[14px]">
                    <div className="flex items-center justify-between text-ink">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "FREE" : formatPrice(shipping, currency)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-mauve">
                        <span>Discount</span>
                        <span>−{formatPrice(discount, currency)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-ink">
                      <span>Tax (est.)</span>
                      <span>{formatPrice(tax, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-3 text-[16px] font-medium text-ink">
                      <span>Total</span>
                      <span>{formatPrice(total, currency)}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
