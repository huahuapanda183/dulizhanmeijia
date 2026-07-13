import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { searchProducts } from "@/lib/api";
import { formatCount } from "@/lib/format";

type Params = { searchParams: Promise<{ q?: string }> };

export const metadata = { title: "Search | Glamnetic" };

export default async function SearchPage({ searchParams }: Params) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
          <h1 className="heading-track text-[26px] font-medium text-ink md:text-[32px]">
            Search
          </h1>

          {query ? (
            <p className="mt-2 text-[15px] text-body">
              {formatCount(results.length)} result{results.length === 1 ? "" : "s"} for
              “{query}”
            </p>
          ) : (
            <p className="mt-2 text-[15px] text-body">
              Enter a search term to find products.
            </p>
          )}

          {query && results.length === 0 ? (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center text-center">
              <p className="text-[15px] text-body">
                No results for “{query}”. Try another search.
              </p>
              <Link
                href="/collections/all"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-mauve px-8 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Shop all products
              </Link>
            </div>
          ) : query ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} layout="grid" />
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
