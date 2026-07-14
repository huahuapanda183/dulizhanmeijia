import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BundleBuilder } from "@/components/BundleBuilder";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = { title: "Build Your Own Nail Bundle | LynxiGlam" };

export default async function BuildYourOwnBundlePage() {
  const products = await getProducts({ collection: "all-nails" });
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
          <h1 className="heading-track text-center text-[30px] font-medium text-ink md:text-[40px]">
            Build Your Own Nail Bundle
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-center text-[15px] text-body">
            Mix &amp; match your favorite sets. The more you add, the more you save — 3 for 15% off, 5 for 20% off.
          </p>
          <div className="mt-8">
            <BundleBuilder products={products} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
