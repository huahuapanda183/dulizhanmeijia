// Domain models for the store. Prices are stored as numbers (major currency
// units, e.g. 21.99) + a currency code so nothing is hardcoded to "$" and the
// backend can return any currency. Format with `formatPrice()`.

export interface Product {
  id: string;
  handle: string;
  title: string;
  /** nail shape / variant label, e.g. "Short Oval", "Full Collection Bundle" */
  shape: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  rating: number; // 0–5
  reviewCount: number;
  /** gallery image filenames in /public/images */
  images: string[];
  /** second image shown on hover in cards */
  hoverImage?: string;
  /** looping video filename in /public/videos, played on hover on the PDP */
  video?: string;
  badge?: string;
  /** collection handles this product belongs to */
  collections: string[];
  description: string;
  available: boolean;
  tags: string[];
  createdAt: string;
}

export interface Collection {
  handle: string;
  title: string;
  description?: string;
  image?: string;
  /** product handles, in curated order */
  products: string[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavColumn {
  heading?: string;
  links: NavLink[];
}

export interface NavFeatured {
  label: string;
  image: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  /** mega-menu columns shown on hover/focus */
  columns?: NavColumn[];
  featured?: NavFeatured[];
}

export interface CartLine {
  /** unique line id (handle + variant) */
  id: string;
  handle: string;
  title: string;
  shape: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
}

export interface Cart {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  currency: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  productHandle: string;
  productTitle: string;
  productImage: string;
  verified: boolean;
  createdAt: string; // ISO
}

export interface PageSection {
  heading?: string;
  /** paragraphs of body copy */
  body: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Page {
  slug: string;
  title: string;
  subtitle?: string;
  sections: PageSection[];
  faq?: FaqItem[];
}

export interface BlogPost {
  handle: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string; // ISO
  body: string[];
}

export type SortKey = "featured" | "best-selling" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductQuery {
  collection?: string;
  search?: string;
  sort?: SortKey;
  /** filter: only products whose shape is in this list */
  shapes?: string[];
  /** filter: only products tagged with any of these */
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  /** filter: only in-stock */
  inStock?: boolean;
  limit?: number;
  page?: number;
  pageSize?: number;
}

/** A single facet value + how many products match it. */
export interface FacetValue {
  value: string;
  label: string;
  count: number;
}

/** Available filters for a collection/search result set. */
export interface ProductFacets {
  shapes: FacetValue[];
  tags: FacetValue[];
  priceRange: { min: number; max: number };
}

/** Paginated list envelope returned by list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---- Checkout / orders ----

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ShippingRate {
  id: string;
  label: string;
  amount: number;
  estimate: string;
}

export interface PromoResult {
  ok: boolean;
  code: string;
  /** discount amount applied to the subtotal */
  amount: number;
  message: string;
}

export interface OrderLineInput {
  handle: string;
  quantity: number;
}

export interface OrderInput {
  lines: OrderLineInput[];
  email: string;
  shippingAddress: Address;
  shippingRateId: string;
  promoCode?: string;
}

export interface Order {
  id: string;
  number: string;
  email: string;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  status: "confirmed" | "processing" | "shipped" | "delivered";
  createdAt: string;
}

export interface WishlistItem {
  handle: string;
  addedAt: string;
}
