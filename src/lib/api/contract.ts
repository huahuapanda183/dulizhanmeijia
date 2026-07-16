/**
 * StoreApi — the formal data contract for the storefront.
 *
 * Every function exported from `@/lib/api` conforms to this interface. Today
 * they run against the local MOCK (src/lib/data/*). To connect a real backend:
 *
 *   1. Implement an HTTP client that satisfies `StoreApi` (see api/config.ts →
 *      apiFetch, and the `!usingMock()` branch already present in each module).
 *   2. Set NEXT_PUBLIC_DATA_SOURCE=api and NEXT_PUBLIC_API_URL=<your base url>.
 *
 * No component imports change — components only ever call `@/lib/api`.
 * See docs/API_CONTRACT.md for the REST endpoint map the backend must expose.
 */
import type {
  Product,
  ProductQuery,
  ProductFacets,
  Collection,
  NavItem,
  Review,
  Page,
  BlogPost,
  ShippingRate,
  PromoResult,
  Order,
  OrderInput,
  Address,
  WishlistItem,
  AnalyticsSummary,
} from "@/lib/data/types";
import type { ReviewSummary } from "./reviews";
import type { ActionResult, AuthInput, SubscribeInput } from "./account";
import type { TrackInput } from "./analytics";

export interface StoreApi {
  // Catalog
  getProducts(query?: ProductQuery): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getProductsByHandles(handles: string[]): Promise<Product[]>;
  /** Facets are scoped by collection/search only — other filters don't shape counts. */
  getProductFacets(query?: Pick<ProductQuery, "collection" | "search">): Promise<ProductFacets>;
  getRecommendations(handle: string, limit?: number): Promise<Product[]>;
  searchProducts(term: string): Promise<Product[]>;
  getAllProductHandles(): Promise<string[]>;

  // Collections & navigation
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
  getCollectionHandles(): Promise<string[]>;
  getNavigation(): Promise<NavItem[]>;

  // Reviews
  getReviews(productHandle?: string): Promise<Review[]>;
  getReviewSummary(productHandle?: string): Promise<ReviewSummary>;

  // Content
  getPage(slug: string): Promise<Page | null>;
  getPageSlugs(): Promise<string[]>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(handle: string): Promise<BlogPost | null>;

  // Checkout & orders
  getShippingRates(subtotal?: number, address?: Address): Promise<ShippingRate[]>;
  applyPromoCode(code: string, subtotal: number): Promise<PromoResult>;
  createOrder(input: OrderInput): Promise<Order>;

  // Account
  login(input: AuthInput): Promise<ActionResult>;
  register(input: AuthInput): Promise<ActionResult>;
  subscribe(input: SubscribeInput): Promise<ActionResult>;
  getWishlist(): Promise<WishlistItem[]>;
  saveWishlist(items: WishlistItem[]): Promise<{ ok: boolean }>;

  // Analytics (click / view tracking)
  trackEvent(input: TrackInput): Promise<void>;
  getAnalytics(): Promise<AnalyticsSummary>;
}
