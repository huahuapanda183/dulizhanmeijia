import type { Product, ProductQuery, SortKey } from "@/lib/data/types";
import { PRODUCTS } from "@/lib/data/catalog";
import { API_CONFIG, apiFetch, usingMock } from "./config";

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

/** List products, optionally filtered by collection/search and sorted. */
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  if (!usingMock()) {
    const qs = new URLSearchParams(query as Record<string, string>).toString();
    return apiFetch<Product[]>(`/products?${qs}`);
  }
  let list = PRODUCTS.filter((p) => p.available);
  if (query.collection) list = list.filter((p) => p.collections.includes(query.collection!));
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shape.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q)),
    );
  }
  list = sortProducts(list, query.sort);
  if (query.limit) list = list.slice(0, query.limit);
  return list;
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!usingMock()) {
    try {
      return await apiFetch<Product>(`/products/${handle}`);
    } catch {
      return null;
    }
  }
  return PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export async function getAllProductHandles(): Promise<string[]> {
  if (!usingMock()) return apiFetch<string[]>(`/products/handles`);
  return PRODUCTS.map((p) => p.handle);
}

export async function searchProducts(term: string): Promise<Product[]> {
  return getProducts({ search: term });
}

// Reference for the future backend branch — unused in mock mode.
void API_CONFIG;
