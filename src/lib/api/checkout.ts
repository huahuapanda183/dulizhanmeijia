import type {
  Address,
  CartLine,
  Order,
  OrderInput,
  PromoResult,
  ShippingRate,
} from "@/lib/data/types";
import { PRODUCTS } from "@/lib/data/catalog";
import { apiFetch, usingMock } from "./config";

export const FREE_SHIPPING_THRESHOLD = 65;

/** Available shipping options. Standard is free over the threshold. */
export async function getShippingRates(subtotal = 0, address?: Address): Promise<ShippingRate[]> {
  if (!usingMock()) {
    const params = new URLSearchParams({ subtotal: String(subtotal) });
    // Destination is a reserved, backward-compatible extension point: rates are
    // subtotal-only today, but forward country/state/zip so region-based rating
    // can be added without changing callers.
    if (address?.country) params.set("country", address.country);
    if (address?.state) params.set("state", address.state);
    if (address?.zip) params.set("zip", address.zip);
    return apiFetch<ShippingRate[]>(`/checkout/shipping-rates?${params.toString()}`);
  }
  const standard = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.95;
  return [
    { id: "standard", label: "Standard (5–7 business days)", amount: standard, estimate: "5–7 business days" },
    { id: "express", label: "Express (2–3 business days)", amount: 12.95, estimate: "2–3 business days" },
    { id: "overnight", label: "Overnight", amount: 24.95, estimate: "1 business day" },
  ];
}

/** Mock promo codes. Replace with a real validation endpoint later. */
export async function applyPromoCode(code: string, subtotal: number): Promise<PromoResult> {
  if (!usingMock()) {
    return apiFetch<PromoResult>(`/checkout/promo`, {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
  }
  const normalized = code.trim().toUpperCase();
  const CODES: Record<string, (s: number) => number> = {
    WELCOME10: (s) => +(s * 0.1).toFixed(2),
    GLAM20: (s) => (s >= 65 ? 20 : 0),
    FREESHIP: () => 0, // handled as free shipping at checkout; no line discount
    SAVE15: (s) => +(s * 0.15).toFixed(2),
  };
  if (!(normalized in CODES)) {
    return { ok: false, code: normalized, amount: 0, message: "That code isn't valid." };
  }
  if (normalized === "GLAM20" && subtotal < 65) {
    return { ok: false, code: normalized, amount: 0, message: "GLAM20 requires a $65+ subtotal." };
  }
  const amount = CODES[normalized](subtotal);
  return {
    ok: true,
    code: normalized,
    amount,
    message: normalized === "FREESHIP" ? "Free shipping applied!" : `Code applied — you saved $${amount.toFixed(2)}.`,
  };
}

const TAX_RATE = 0.0725;

/**
 * Create an order. MOCK computes totals + a fake order number; a real backend
 * would persist the order and (optionally) return a payment intent.
 */
export async function createOrder(input: OrderInput): Promise<Order> {
  if (!usingMock()) {
    return apiFetch<Order>(`/orders`, { method: "POST", body: JSON.stringify(input) });
  }

  // Match the backend's failure semantics: an unknown product 404s and an unknown
  // shipping rate 400s server-side, so the mock must reject them too rather than
  // silently dropping lines or falling back to a default rate.
  const lines: CartLine[] = input.lines.map((li) => {
    const p = PRODUCTS.find((x) => x.handle === li.handle);
    if (!p) throw new Error(`Product is unavailable: ${li.handle}`);
    return {
      id: p.handle,
      handle: p.handle,
      title: p.title,
      shape: p.shape,
      image: p.images[0],
      price: p.price,
      currency: p.currency,
      quantity: li.quantity,
    } satisfies CartLine;
  });

  const currency = lines[0]?.currency ?? "USD";
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const rates = await getShippingRates(subtotal, input.shippingAddress);
  const rate = rates.find((r) => r.id === input.shippingRateId);
  if (!rate) throw new Error(`Unknown shipping rate: ${input.shippingRateId}`);
  let shipping = rate.amount;

  let discount = 0;
  if (input.promoCode) {
    const promo = await applyPromoCode(input.promoCode, subtotal);
    // Match the backend: an invalid or below-threshold code is rejected, not
    // silently dropped. Ignoring it charged full price behind a success response,
    // so the customer believed a discount had applied.
    if (!promo.ok) throw new Error(promo.message);
    if (promo.code === "FREESHIP") shipping = 0;
    else discount = promo.amount;
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = +(taxable * TAX_RATE).toFixed(2);
  const total = +(taxable + shipping + tax).toFixed(2);

  const stamp = input.idempotencyKey.replaceAll("-", "").slice(-8).toUpperCase();
  const number = `LX${stamp}`;

  return {
    id: number.toLowerCase(),
    number,
    email: input.email,
    lines,
    subtotal: +subtotal.toFixed(2),
    shipping,
    discount,
    tax,
    total,
    currency,
    shippingAddress: input.shippingAddress,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
}
