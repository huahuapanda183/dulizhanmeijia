"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useUI } from "@/lib/ui/ui-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { UserIcon, SearchIcon, BagIcon } from "@/components/icons";

export function HeaderActions() {
  const { itemCount, openCart } = useCart();
  const { openSearch } = useUI();
  const { count: wishlistCount } = useWishlist();

  return (
    <div className="flex items-center justify-end gap-4 text-ink md:gap-5">
      <Link href="/account/login" aria-label="Account" className="hidden sm:block">
        <UserIcon className="h-[22px] w-[22px]" />
      </Link>
      <button type="button" aria-label="Search" onClick={openSearch}>
        <SearchIcon className="h-[22px] w-[22px]" />
      </button>
      <Link href="/account/wishlist" aria-label="Wishlist" className="relative">
        <svg
          viewBox="0 0 24 24"
          className="h-[22px] w-[22px] fill-none stroke-current"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 20.5 4.2 12.9a4.6 4.6 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l1.2 1.2 1.2-1.2a4.7 4.7 0 0 1 6.6 0 4.6 4.6 0 0 1 0 6.6L12 20.5Z" />
        </svg>
        {wishlistCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mauve px-1 text-[11px] font-semibold text-white">
            {wishlistCount}
          </span>
        )}
      </Link>
      <button type="button" aria-label={`Cart, ${itemCount} items`} onClick={openCart} className="relative">
        <BagIcon className="h-[22px] w-[22px]" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mauve px-1 text-[11px] font-semibold text-white">
            {itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
