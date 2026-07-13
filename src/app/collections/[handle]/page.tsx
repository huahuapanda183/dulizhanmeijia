import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, getCollectionHandles, getProducts } from "@/lib/api";
import type { SortKey } from "@/lib/data/types";
import { formatCount } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { CollectionSort } from "@/components/CollectionSort";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Params = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateStaticParams() {
  return (await getCollectionHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Pick<Params, "params">) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  return {
    title: collection ? `${collection.title} | Glamnetic` : "Collection | Glamnetic",
  };
}

export default async function CollectionPage({ params, searchParams }: Params) {
  const { handle } = await params;
  const { sort } = await searchParams;
  const collection = await getCollection(handle);
  if (!collection) notFound();

  const products = await getProducts({
    collection: handle,
    sort: (sort as SortKey) || "featured",
  });

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

          {products.length === 0 ? (
            <p className="py-24 text-center text-[15px] text-body">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} layout="grid" />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
