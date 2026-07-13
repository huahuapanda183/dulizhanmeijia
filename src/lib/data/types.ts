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

export type SortKey = "featured" | "best-selling" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductQuery {
  collection?: string;
  search?: string;
  sort?: SortKey;
  limit?: number;
}
