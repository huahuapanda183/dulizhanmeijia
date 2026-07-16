import type { WishlistItem } from "@/lib/data/types";
import { ApiError, apiFetch, usingMock } from "./config";

// Wishlist state lives client-side (localStorage) via WishlistProvider. These
// endpoints are the backend sync points for a signed-in user — no-ops in mock.
//
// Error semantics (backend mode): a 401 means "no signed-in customer", which is
// an expected state — the caller falls back to the local wishlist, so we return
// an empty result. Any other failure (5xx, network) is a real problem and is
// re-thrown rather than masked as "empty", so it can surface to the caller.

export async function getWishlist(): Promise<WishlistItem[]> {
  if (!usingMock()) {
    try {
      return await apiFetch<WishlistItem[]>(`/account/wishlist`);
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) return [];
      throw error;
    }
  }
  return [];
}

export async function saveWishlist(items: WishlistItem[]): Promise<{ ok: boolean }> {
  if (!usingMock()) {
    try {
      return await apiFetch<{ ok: boolean }>(`/account/wishlist`, {
        method: "PUT",
        body: JSON.stringify(items),
      });
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) return { ok: false };
      throw error;
    }
  }
  return { ok: true };
}
