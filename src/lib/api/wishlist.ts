import type { WishlistItem } from "@/lib/data/types";
import { apiFetch, usingMock } from "./config";

// Wishlist state lives client-side (localStorage) via WishlistProvider. These
// endpoints are the backend sync points for a signed-in user — no-ops in mock.

export async function getWishlist(): Promise<WishlistItem[]> {
  if (!usingMock()) return apiFetch<WishlistItem[]>(`/account/wishlist`);
  return [];
}

export async function saveWishlist(items: WishlistItem[]): Promise<{ ok: boolean }> {
  if (!usingMock()) {
    return apiFetch<{ ok: boolean }>(`/account/wishlist`, {
      method: "PUT",
      body: JSON.stringify(items),
    });
  }
  return { ok: true };
}
