import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { CategoryCards } from "@/components/CategoryCards";
import { BestSellers } from "@/components/BestSellers";
import { WhyChoose } from "@/components/WhyChoose";
import { Reviews } from "@/components/Reviews";
import { ShopAllPressOns } from "@/components/ShopAllPressOns";
import { CollectionCards } from "@/components/CollectionCards";
import { ShopIRL } from "@/components/ShopIRL";
import { RetailerLogos } from "@/components/RetailerLogos";
import { MultiColumn } from "@/components/MultiColumn";
import { Marquee } from "@/components/Marquee";
import { SiteFooter } from "@/components/SiteFooter";

/** Product prices/availability are rendered here (BestSellers, ShopAllPressOns),
 *  so this page must not be frozen at build time in api mode. */
export const revalidate = 0;

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">
        <HeroSlideshow />
        <CategoryCards />
        <BestSellers />
        <WhyChoose />
        <Reviews />
        <ShopAllPressOns />
        <CollectionCards />
        <ShopIRL />
        <RetailerLogos />
        <MultiColumn />
        <Marquee />
      </main>
      <SiteFooter />

      {/* Floating "Shop with AI" pill (decorative, matches live site) */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-40">
        <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink shadow-lg ring-1 ring-line">
          <span className="text-mauve">✦</span> Shop with AI
        </span>
      </div>
    </>
  );
}
