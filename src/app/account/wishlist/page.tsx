import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WishlistGrid } from "@/components/WishlistGrid";

export const metadata: Metadata = { title: "Your Wishlist | LynxiGlam" };

export default function WishlistPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <WishlistGrid />
      </main>
      <SiteFooter />
    </>
  );
}
