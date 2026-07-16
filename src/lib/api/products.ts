import type { Product, ProductQuery, ProductFacets, SortKey, FacetValue } from "@/lib/data/types";
import { PRODUCTS } from "@/lib/data/catalog";
import { ApiError, apiFetch, usingMock } from "./config";

/** Backend `/products/facets` only scopes by collection + search (see CatalogService). */
type FacetQuery = Pick<ProductQuery, "collection" | "search">;

function sortProducts(list: Product[], sort: SortKey = "featured"): Product[] {
  const out = [...list];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating);
    case "best-selling":
      return out.sort((a, b) => b.reviewCount - a.reviewCount);
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return out;
  }
}

/** Apply all filters in a ProductQuery (except sort/pagination). */
function applyFilters(list: Product[], query: ProductQuery): Product[] {
  let out = list.filter((p) => p.available || query.inStock === false);
  if (query.inStock) out = out.filter((p) => p.available);
  if (query.collection) out = out.filter((p) => p.collections.includes(query.collection!));
  if (query.search) {
    const q = query.search.toLowerCase();
    out = out.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shape.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)),
    );
  }
  if (query.shapes?.length) out = out.filter((p) => query.shapes!.includes(p.shape));
  if (query.tags?.length) out = out.filter((p) => p.tags.some((t) => query.tags!.includes(t)));
  if (typeof query.priceMin === "number") out = out.filter((p) => p.price >= query.priceMin!);
  if (typeof query.priceMax === "number") out = out.filter((p) => p.price <= query.priceMax!);
  return out;
}

/** List products, filtered + sorted. */
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  if (!usingMock()) {
    const qs = new URLSearchParams(
      Object.entries(query).flatMap(([k, v]) =>
        v == null ? [] : Array.isArray(v) ? v.map((x) => [k, String(x)]) : [[k, String(v)]],
      ) as [string, string][],
    ).toString();
    return apiFetch<Product[]>(`/products?${qs}`);
  }
  let out = sortProducts(applyFilters(PRODUCTS, query), query.sort);
  if (query.page && query.pageSize) {
    const start = (query.page - 1) * query.pageSize;
    out = out.slice(start, start + query.pageSize);
  } else if (query.limit) {
    out = out.slice(0, query.limit);
  }
  return out;
}

/**
 * Available filter facets for a result set (collection/search), with counts.
 * Facet counts are computed against the collection/search filter only (not the
 * currently-selected shape/tag/price), so users can widen their selection.
 */
export async function getProductFacets(query: FacetQuery = {}): Promise<ProductFacets> {
  if (!usingMock()) {
    // Only forward the scope the backend supports; other filters don't shape facet counts.
    const facetParams: FacetQuery = { collection: query.collection, search: query.search };
    const qs = new URLSearchParams(
      Object.entries(facetParams).flatMap(([k, v]) => (v == null ? [] : [[k, String(v)]])) as [string, string][],
    ).toString();
    return apiFetch<ProductFacets>(`/products/facets?${qs}`);
  }
  const scoped = applyFilters(PRODUCTS, { collection: query.collection, search: query.search });
  const shapeMap = new Map<string, number>();
  const tagMap = new Map<string, number>();
  let min = Infinity;
  let max = 0;
  scoped.forEach((p) => {
    shapeMap.set(p.shape, (shapeMap.get(p.shape) ?? 0) + 1);
    p.tags.forEach((t) => tagMap.set(t, (tagMap.get(t) ?? 0) + 1));
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
  });
  const toFacet = (m: Map<string, number>): FacetValue[] =>
    [...m.entries()]
      .map(([value, count]) => ({ value, label: value.replace(/\b\w/g, (c) => c.toUpperCase()), count }))
      .sort((a, b) => b.count - a.count);
  return {
    shapes: toFacet(shapeMap),
    tags: toFacet(tagMap),
    priceRange: { min: scoped.length ? Math.floor(min) : 0, max: Math.ceil(max) },
  };
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!usingMock()) {
    try {
      return await apiFetch<Product>(`/products/${handle}`);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error; // don't mask 5xx / network errors as "not found"
    }
  }
  return PRODUCTS.find((p) => p.handle === handle) ?? null;
}

/** Products in the same collections as `handle`, excluding it — "You may also like". */
export async function getRecommendations(handle: string, limit = 4): Promise<Product[]> {
  if (!usingMock()) return apiFetch<Product[]>(`/products/${handle}/recommendations?limit=${limit}`);
  const product = PRODUCTS.find((p) => p.handle === handle);
  if (!product) return PRODUCTS.slice(0, limit);
  const scored = PRODUCTS.filter((p) => p.handle !== handle)
    .map((p) => ({ p, score: p.collections.filter((c) => product.collections.includes(c)).length }))
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating);
  return scored.slice(0, limit).map((s) => s.p);
}

export async function getProductsByHandles(handles: string[]): Promise<Product[]> {
  if (!usingMock()) {
    const qs = handles.map((h) => `handle=${encodeURIComponent(h)}`).join("&");
    return apiFetch<Product[]>(`/products/batch?${qs}`);
  }
  return handles.map((h) => PRODUCTS.find((p) => p.handle === h)).filter((p): p is Product => Boolean(p));
}

export async function getAllProductHandles(): Promise<string[]> {
  if (!usingMock()) return apiFetch<string[]>(`/products/handles`);
  return PRODUCTS.map((p) => p.handle);
}

export async function searchProducts(term: string): Promise<Product[]> {
  return getProducts({ search: term });
}
