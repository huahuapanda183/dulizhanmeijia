import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CartContents } from "@/components/CartContents";

export const metadata = { title: "Your Bag | LynxiGlam" };

export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <CartContents />
      </main>
      <SiteFooter />
    </>
  );
}
