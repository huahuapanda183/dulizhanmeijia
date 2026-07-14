"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { WishlistItem } from "@/lib/data/types";

const STORAGE_KEY = "glamnetic-wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  has: (handle: string) => boolean;
  toggle: (handle: string) => void;
  remove: (handle: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw) as WishlistItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
    // Backend sync point: when signed in, call api.saveWishlist(items) here.
  }, [items, hydrated]);

  const value = useMemo<WishlistContextValue>(() => {
    const has = (handle: string) => items.some((i) => i.handle === handle);
    return {
      items,
      count: items.length,
      has,
      toggle: (handle) =>
        setItems((prev) =>
          prev.some((i) => i.handle === handle)
            ? prev.filter((i) => i.handle !== handle)
            : [...prev, { handle, addedAt: new Date().toISOString() }],
        ),
      remove: (handle) => setItems((prev) => prev.filter((i) => i.handle !== handle)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
