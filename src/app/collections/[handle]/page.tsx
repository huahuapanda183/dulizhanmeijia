import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCollection,
  getCollectionHandles,
  getProducts,
  getProductFacets,
} from "@/lib/api";
import type { SortKey } from "@/lib/data/types";
import { formatCount } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { CollectionSort } from "@/components/CollectionSort";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type Params = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

function arrayOf(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

export async function generateStaticParams() {
  return (await getCollectionHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Pick<Params, "params">) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  return {
    title: collection ? `${collection.title} | LynxiGlam` : "Collection | LynxiGlam",
  };
}

export default async function CollectionPage({ params, searchParams }: Params) {
  const { handle } = await params;
  const sp = await searchParams;
  const collection = await getCollection(handle);
  if (!collection) notFound();

  const sort = (typeof sp.sort === "string" ? sp.sort : undefined) as SortKey | undefined;
  const priceMaxRaw = typeof sp.priceMax === "string" ? Number(sp.priceMax) : undefined;

  const query = {
    collection: handle,
    sort: sort || "featured",
    shapes: arrayOf(sp.shape),
    tags: arrayOf(sp.tag),
    priceMax: Number.isFinite(priceMaxRaw) ? priceMaxRaw : undefined,
    inStock: sp.inStock === "1",
  };

  const [products, facets] = await Promise.all([
    getProducts(query),
    getProductFacets({ collection: handle }),
  ]);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8">
          <nav className="text-[13px] text-body pt-6">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>{" "}
            / <span className="text-ink">{collection.title}</span>
          </nav>

          <div className="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="heading-track text-[30px] md:text-[40px] font-medium text-ink">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="mt-2 text-[15px] text-body max-w-xl">{collection.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <CollectionSort current={sort || "featured"} />
              <span className="text-[13px] text-body">
                {formatCount(products.length)} products
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-8 pb-16 md:flex-row">
            <ProductFilters facets={facets} basePath={`/collections/${handle}`} />

            <div className="flex-1">
              {products.length === 0 ? (
                <p className="py-24 text-center text-[15px] text-body">
                  No products match your filters.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} layout="grid" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
