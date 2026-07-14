"use client";

import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { cn } from "@/lib/utils";

/**
 * Round heart toggle button. Sits inside a Link (product card), so it must
 * stop propagation / prevent default to avoid navigating on click.
 */
export function WishlistButton({ handle, className }: { handle: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const active = has(handle);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(handle);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition-colors",
        active ? "text-mauve" : "text-ink",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-4 w-4", active ? "fill-mauve stroke-mauve" : "fill-none stroke-current")}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 20.5 4.2 12.9a4.6 4.6 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l1.2 1.2 1.2-1.2a4.7 4.7 0 0 1 6.6 0 4.6 4.6 0 0 1 0 6.6L12 20.5Z" />
      </svg>
    </button>
  );
}
