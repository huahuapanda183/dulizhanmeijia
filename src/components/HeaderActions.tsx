"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useUI } from "@/lib/ui/ui-context";
import { UserIcon, SearchIcon, BagIcon } from "@/components/icons";

export function HeaderActions() {
  const { itemCount, openCart } = useCart();
  const { openSearch } = useUI();

  return (
    <div className="flex items-center justify-end gap-4 text-ink md:gap-5">
      <Link href="/account/login" aria-label="Account" className="hidden sm:block">
        <UserIcon className="h-[22px] w-[22px]" />
      </Link>
      <button type="button" aria-label="Search" onClick={openSearch}>
        <SearchIcon className="h-[22px] w-[22px]" />
      </button>
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
