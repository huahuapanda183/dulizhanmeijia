import type { Collection, NavItem } from "@/lib/data/types";
import { COLLECTIONS, NAVIGATION } from "@/lib/data/collections";
import { PRODUCTS } from "@/lib/data/catalog";
import { apiFetch, usingMock } from "./config";

function withProducts(meta: Omit<Collection, "products">): Collection {
  return {
    ...meta,
    products: PRODUCTS.filter((p) => p.collections.includes(meta.handle)).map((p) => p.handle),
  };
}

export async function getCollections(): Promise<Collection[]> {
  if (!usingMock()) return apiFetch<Collection[]>(`/collections`);
  return COLLECTIONS.map(withProducts);
}

export async function getCollection(handle: string): Promise<Collection | null> {
  if (!usingMock()) {
    try {
      return await apiFetch<Collection>(`/collections/${handle}`);
    } catch {
      return null;
    }
  }
  const meta = COLLECTIONS.find((c) => c.handle === handle);
  return meta ? withProducts(meta) : null;
}

export async function getCollectionHandles(): Promise<string[]> {
  if (!usingMock()) return apiFetch<string[]>(`/collections/handles`);
  return COLLECTIONS.map((c) => c.handle);
}

export async function getNavigation(): Promise<NavItem[]> {
  if (!usingMock()) return apiFetch<NavItem[]>(`/navigation`);
  return NAVIGATION;
}
