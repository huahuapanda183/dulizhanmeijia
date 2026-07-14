import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchase } from "@/components/ProductPurchase";
import { ProductReviews } from "@/components/ProductReviews";
import { Recommendations } from "@/components/Recommendations";
import { TrackProductView } from "@/components/TrackProductView";
import { Stars } from "@/components/Stars";
import { ClockIcon, CalendarIcon, SalonIcon, BunnyIcon } from "@/components/icons";
import { getProduct, getAllProductHandles } from "@/lib/api";
import { PRODUCT_FEATURES, MEMBERSHIP_PERKS } from "@/lib/data/content";
import { formatPrice, formatCount } from "@/lib/format";

type Params = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const handles = await getAllProductHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  return { title: p ? `${p.title} | LynxiGlam` : "Product | LynxiGlam" };
}

const FEATURE_ICONS = { clock: ClockIcon, calendar: CalendarIcon, salon: SalonIcon, bunny: BunnyIcon };

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <TrackProductView handle={product.handle} title={product.title} />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
            <ProductGallery images={product.images} video={product.video} name={product.title} />

            <div className="lg:pt-2">
              <span className="inline-block border border-mauve px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink">
                {product.shape}
              </span>

              <h1 className="mt-6 text-[38px] font-medium leading-none text-ink md:text-[44px]">
                {product.title}
              </h1>

              <p className="mt-4 flex items-center gap-3 text-[22px] text-ink">
                {product.compareAtPrice && (
                  <span className="text-body line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                )}
                <span className={product.compareAtPrice ? "text-mauve" : ""}>
                  {formatPrice(product.price, product.currency)}
                </span>
              </p>

              <a href="#reviews" className="mt-3 flex w-fit items-center gap-2">
                <Stars rating={product.rating} />
                <span className="text-[14px] text-body underline-offset-2 hover:underline">
                  {formatCount(product.reviewCount)}
                </span>
              </a>

              <div className="mt-6">
                <ProductPurchase product={product} />
              </div>

              <p className="mt-5 text-[14px] text-body">
                Pay over time for orders over $35.00 with{" "}
                <span className="inline-flex items-center rounded-[4px] bg-[#5a31f4] px-1.5 py-0.5 align-middle text-[12px] font-semibold text-white">
                  shop<span className="font-normal">Pay</span>
                </span>{" "}
                <a href="#" className="underline">Learn more</a>
              </p>

              <div className="mt-8 grid grid-cols-4 gap-4 border-y border-line py-6">
                {PRODUCT_FEATURES.map((f) => {
                  const Icon = FEATURE_ICONS[f.icon];
                  return (
                    <div key={f.icon} className="flex flex-col items-center gap-2 text-center">
                      <Icon className="h-8 w-8 text-ink" />
                      <span className="whitespace-pre-line text-[12px] leading-tight text-body">{f.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-md border border-line bg-white p-6">
                <div className="flex items-start gap-4">
                  <LynxiGlamMark className="h-14 w-14 shrink-0 text-ink" />
                  <div className="flex-1">
                    <h2 className="text-[15px] font-bold uppercase tracking-[0.04em] text-ink">
                      Join LynxiGlam Insider Plus Membership
                    </h2>
                    <ul className="mt-3 space-y-1.5">
                      {MEMBERSHIP_PERKS.map((perk) => (
                        <li key={perk} className="ml-4 list-disc text-[14px] text-body">
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-5 w-full rounded-sm bg-burgundy py-3.5 text-[15px] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
                >
                  Sign Up Now – $59.99/YR
                </button>
              </div>

              <div className="mt-10 border-t border-line pt-8">
                <h2 className="text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">Description</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-body">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div id="reviews" className="mt-16 border-t border-line pt-12">
            <ProductReviews handle={product.handle} />
          </div>

          <Recommendations handle={product.handle} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function LynxiGlamMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path d="M30 16a10 10 0 1 0 3 9h-8" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 15l1.4 3.6L38 20l-3.6 1.4L33 25l-1.4-3.6L28 20l3.6-1.4L33 15Z" fill="currentColor" />
    </svg>
  );
}
