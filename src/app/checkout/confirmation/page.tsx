import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OrderConfirmation } from "@/components/OrderConfirmation";

export const metadata: Metadata = { title: "Order Confirmed | LynxiGlam" };

export default function ConfirmationPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <OrderConfirmation />
      </main>
      <SiteFooter />
    </>
  );
}
