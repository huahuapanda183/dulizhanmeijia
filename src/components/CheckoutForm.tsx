"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { getShippingRates, applyPromoCode, createOrder, ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Address, PromoResult, ShippingRate } from "@/lib/data/types";

/**
 * Tax as basis points (725 = 7.25%). The backend computes tax on integer cents
 * with HALF_UP rounding (common/Money.java); doing the same here in integer
 * arithmetic keeps the displayed total identical to the charged total. Floating
 * point would drift: 174.00 * 0.0725 is 12.6149999… in IEEE-754, which rounds to
 * 12.61 while the server bills 12.62.
 */
const TAX_BASIS_POINTS = 725;
const LAST_ORDER_KEY = "glamnetic-last-order";

const toCents = (major: number) => Math.round(major * 100);
const fromCents = (cents: number) => cents / 100;

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

export function CheckoutForm() {
  const router = useRouter();
  const { t } = useI18n();
  const { lines, subtotal, currency, clear } = useCart();

  // One idempotency key per (cart contents) submission attempt. It MUST rotate
  // when the cart changes: the backend returns the stored order for a repeated
  // key without comparing the payload, so reusing a key after an edit would
  // return the *previous* cart's order.
  const cartSignature = useMemo(
    () => lines.map((l) => `${l.handle}:${l.quantity}`).join("|"),
    [lines],
  );
  const idempotencyKey = useRef(crypto.randomUUID());
  const keyedFor = useRef(cartSignature);
  if (keyedFor.current !== cartSignature) {
    keyedFor.current = cartSignature;
    idempotencyKey.current = crypto.randomUUID();
  }

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string>("");

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoPending, setPromoPending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  // A promo is validated against the subtotal at apply-time. If the cart changes
  // afterwards the discount may no longer hold (e.g. GLAM20 needs a $65+ subtotal),
  // and the server would re-evaluate and charge more than we displayed — so drop it.
  const promoSubtotal = useRef<number | null>(null);
  useEffect(() => {
    if (promo && promoSubtotal.current !== null && promoSubtotal.current !== subtotal) {
      setPromo(null);
      promoSubtotal.current = null;
    }
  }, [subtotal, promo]);

  const isFreeShip = promo?.ok === true && promo.code === "FREESHIP";

  // All money math in integer cents, mirroring the backend exactly.
  const subtotalCents = toCents(subtotal);
  const discountCents = promo?.ok && !isFreeShip ? toCents(promo.amount) : 0;
  const shippingCents = isFreeShip ? 0 : toCents(selectedRate?.amount ?? 0);
  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round((taxableCents * TAX_BASIS_POINTS) / 10000);
  const totalCents = taxableCents + shippingCents + taxCents;

  const discount = fromCents(discountCents);
  const shipping = fromCents(shippingCents);
  const tax = fromCents(taxCents);
  const total = fromCents(totalCents);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code || promoPending) return;
    setPromoPending(true);
    try {
      setPromo(await applyPromoCode(code, subtotal));
      promoSubtotal.current = subtotal;
    } finally {
      setPromoPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    // Must mirror the backend's AddressDto constraints (common/dto/Dtos.java);
    // anything laxer here surfaces as an opaque 400 at submit time.
    const required: Array<[keyof FormState, string]> = [
      ["email", "Email"],
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["line1", "Address"],
      ["city", "City"],
      ["state", "State / Province"],
      ["zip", "ZIP / Postal code"],
      ["country", "Country"],
    ];
    const missing = required.filter(([k]) => !form[k].trim()).map(([, label]) => t(label));
    if (missing.length > 0) {
      setError(`${t("Please fill in")}: ${missing.join("、")}`);
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

    let order;
    try {
      order = await createOrder({
        lines: lines.map((l) => ({ handle: l.handle, quantity: l.quantity })),
        email: form.email,
        shippingAddress,
        shippingRateId: selectedRate.id,
        promoCode: promo?.ok ? promo.code : undefined,
        idempotencyKey: idempotencyKey.current,
      });
    } catch (err) {
      // Surface what the server actually objected to. The uniform error envelope
      // carries per-field reasons for a 400; without this the user only ever sees
      // "something went wrong" and retries forever.
      if (err instanceof ApiError) {
        const fields = err.body?.fields;
        const detail = fields && Object.keys(fields).length > 0 ? Object.keys(fields).join("、") : null;
        setError(detail ? `${t("Please check")}: ${detail}` : err.message);
      } else {
        setError(t("Something went wrong placing your order. Please try again."));
      }
      setPending(false);
      return;
    }

    // The order is committed at this point — nothing below may report it as failed.
    try {
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    } catch {
      /* storage full / private mode — the confirmation page degrades, the order stands */
    }
    clear();
    router.push("/checkout/confirmation");
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
      <h1 className="heading-track mb-8 text-[30px] font-medium text-ink md:text-[36px]">{t("Checkout")}</h1>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-[18px] text-ink">{t("Your bag is empty")}</p>
          <Link
            href="/collections/all"
            className="mt-4 inline-block bg-mauve px-8 py-3.5 text-[14px] uppercase tracking-[0.12em] text-white"
          >
            {t("Shop All")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handleSubmit} className="min-w-0">
            <section>
              <h2 className="text-[18px] font-medium text-ink">{t("Contact")}</h2>
              <div className="mt-4">
                <label htmlFor="email" className="mb-1.5 block text-[13px] text-body">{t("Email")}</label>
                <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="you@example.com" />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[18px] font-medium text-ink">{t("Shipping address")}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-[13px] text-body">{t("First name")}</label>
                  <input id="firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-[13px] text-body">{t("Last name")}</label>
                  <input id="lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line1" className="mb-1.5 block text-[13px] text-body">{t("Address")}</label>
                  <input id="line1" autoComplete="address-line1" value={form.line1} onChange={(e) => update("line1", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line2" className="mb-1.5 block text-[13px] text-body">{t("Apartment, suite, etc. (optional)")}</label>
                  <input id="line2" autoComplete="address-line2" value={form.line2} onChange={(e) => update("line2", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-[13px] text-body">{t("City")}</label>
                  <input id="city" autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1.5 block text-[13px] text-body">{t("State / Province")}</label>
                  <input id="state" autoComplete="address-level1" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="zip" className="mb-1.5 block text-[13px] text-body">{t("ZIP / Postal code")}</label>
                  <input id="zip" autoComplete="postal-code" value={form.zip} onChange={(e) => update("zip", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="country" className="mb-1.5 block text-[13px] text-body">{t("Country")}</label>
                  <input id="country" autoComplete="country-name" value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="mb-1.5 block text-[13px] text-body">{t("Phone (optional)")}</label>
                  <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[18px] font-medium text-ink">{t("Shipping method")}</h2>
              <div className="mt-4 space-y-3">
                {rates.length === 0 ? (
                  <p className="text-[14px] text-body">{t("Loading shipping options…")}</p>
                ) : (
                  rates.map((rate) => {
                    const active = rate.id === selectedRateId;
                    return (
                      <label key={rate.id} className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border bg-white px-4 py-3 ${active ? "border-mauve" : "border-line"}`}>
                        <span className="flex items-center gap-3">
                          <input type="radio" name="shippingRate" value={rate.id} checked={active} onChange={() => setSelectedRateId(rate.id)} className="accent-mauve" />
                          <span>
                            <span className="block text-[14px] text-ink">{t(rate.label)}</span>
                            <span className="block text-[13px] text-body">{t(rate.estimate)}</span>
                          </span>
                        </span>
                        <span className="text-[14px] font-medium text-ink">{rate.amount === 0 ? t("FREE") : formatPrice(rate.amount, currency)}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-[18px] font-medium text-ink">{t("Payment")}</h2>
              <p className="mt-2 text-[13px] text-body">{t("Demo checkout — no real payment is processed.")}</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="card" className="mb-1.5 block text-[13px] text-body">{t("Card number")}</label>
                  <input id="card" inputMode="numeric" placeholder="4242 4242 4242 4242" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="expiry" className="mb-1.5 block text-[13px] text-body">{t("Expiry")}</label>
                  <input id="expiry" placeholder="MM / YY" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="cvc" className="mb-1.5 block text-[13px] text-body">{t("CVC")}</label>
                  <input id="cvc" inputMode="numeric" placeholder="123" className={inputClass} />
                </div>
              </div>
            </section>

            {error && <p className="mt-6 text-[14px] text-red-600" role="alert">{error}</p>}

            <button type="submit" disabled={pending} className="mt-6 w-full rounded-sm bg-ink-2 py-3.5 text-[14px] uppercase tracking-[0.12em] text-white disabled:opacity-60">
              {pending ? t("Placing Order…") : t("Place Order")}
            </button>
          </form>

          <aside className="h-fit lg:sticky lg:top-6">
            <div className="rounded-md border border-line bg-white p-6">
              <h2 className="text-[18px] font-medium text-ink">{t("Order Summary")}</h2>
              <ul className="mt-5 space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/images/${line.image}`} alt={line.title} width={56} height={56} className="h-14 w-14 shrink-0 rounded-sm object-cover" />
                    <div className="flex flex-1 flex-col">
                      <span className="text-[14px] text-ink">{line.title}</span>
                      <span className="text-[13px] text-body">{t("Qty")} {line.quantity}</span>
                    </div>
                    <span className="text-[14px] font-medium text-ink">{formatPrice(line.price * line.quantity, line.currency)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-line pt-5">
                <label htmlFor="promo" className="mb-1.5 block text-[13px] text-body">{t("Promo code")}</label>
                <div className="flex gap-2">
                  <input id="promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} className={inputClass} placeholder="Enter code" />
                  <button type="button" onClick={handleApplyPromo} disabled={promoPending} className="shrink-0 rounded-sm border border-ink-2 px-4 text-[13px] uppercase tracking-[0.1em] text-ink disabled:opacity-60">
                    {promoPending ? "…" : t("Apply")}
                  </button>
                </div>
                {promo && <p className={`mt-2 text-[13px] ${promo.ok ? "text-mauve" : "text-red-600"}`} role="status">{promo.message}</p>}
              </div>

              <div className="mt-6 space-y-2 border-t border-line pt-5 text-[14px]">
                <div className="flex items-center justify-between text-ink"><span>{t("Subtotal")}</span><span>{formatPrice(subtotal, currency)}</span></div>
                <div className="flex items-center justify-between text-ink"><span>{t("Shipping")}</span><span>{shipping === 0 ? t("FREE") : formatPrice(shipping, currency)}</span></div>
                {discount > 0 && <div className="flex items-center justify-between text-mauve"><span>{t("Discount")}</span><span>−{formatPrice(discount, currency)}</span></div>}
                <div className="flex items-center justify-between text-ink"><span>{t("Tax (est.)")}</span><span>{formatPrice(tax, currency)}</span></div>
                <div className="flex items-center justify-between border-t border-line pt-3 text-[16px] font-medium text-ink"><span>{t("Total")}</span><span>{formatPrice(total, currency)}</span></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
