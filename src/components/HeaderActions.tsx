"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useUI } from "@/lib/ui/ui-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { useI18n } from "@/lib/i18n/i18n-context";
import { UserIcon, SearchIcon, BagIcon } from "@/components/icons";
import { LanguageToggle } from "@/components/LanguageToggle";

export function HeaderActions() {
  const { itemCount, openCart } = useCart();
  const { openSearch } = useUI();
  const { count: wishlistCount } = useWishlist();
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-end gap-3 text-ink md:gap-4">
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
      <button type="button" aria-label={`${t("Cart")}, ${itemCount}`} onClick={openCart} className="relative">
        <BagIcon className="h-[22px] w-[22px]" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mauve px-1 text-[11px] font-semibold text-white">
            {itemCount}
          </span>
        )}
      </button>

      {/* language toggle + admin entry */}
      <span className="mx-0.5 hidden h-5 w-px bg-line sm:block" />
      <LanguageToggle className="hidden sm:flex" />
      <Link
        href="/admin"
        aria-label={t("Admin")}
        title={t("Admin")}
        className="hidden text-body transition-colors hover:text-ink md:block"
      >
        <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] fill-none stroke-current" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3 4 6v6c0 4.5 3.4 7.6 8 9 4.6-1.4 8-4.5 8-9V6l-8-3Z" />
          <path d="M9.5 12l1.8 1.8L15 10" />
        </svg>
      </Link>
    </div>
  );
}
