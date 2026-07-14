import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { CollectionSort } from "@/components/CollectionSort";
import { getProducts, getProductFacets } from "@/lib/api";
import type { SortKey } from "@/lib/data/types";
import { formatCount } from "@/lib/format";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type Params = { searchParams: Promise<SearchParamsRecord> };

function arrayOf(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

export const metadata = { title: "Search | LynxiGlam" };

export default async function SearchPage({ searchParams }: Params) {
  const sp = await searchParams;
  const query = (typeof sp.q === "string" ? sp.q : "").trim();

  const sort = (typeof sp.sort === "string" ? sp.sort : undefined) as SortKey | undefined;
  const priceMaxRaw = typeof sp.priceMax === "string" ? Number(sp.priceMax) : undefined;

  const productQuery = {
    search: query,
    sort: sort || "featured",
    shapes: arrayOf(sp.shape),
    tags: arrayOf(sp.tag),
    priceMax: Number.isFinite(priceMaxRaw) ? priceMaxRaw : undefined,
    inStock: sp.inStock === "1",
  };

  const [results, facets] = query
    ? await Promise.all([getProducts(productQuery), getProductFacets({ search: query })])
    : [[], { shapes: [], tags: [], priceRange: { min: 0, max: 0 } }];

  // Whether the base search matched anything (before shape/tag/price filters).
  // Facets are computed against the search scope only, so any facet values or a
  // non-zero price range means the term itself found products.
  const hasBaseMatches =
    facets.shapes.length > 0 || facets.tags.length > 0 || facets.priceRange.max > 0;

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
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
            </div>
            {query && results.length > 0 && <CollectionSort current={sort || "featured"} />}
          </div>

          {query && !hasBaseMatches ? (
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
            <div className="mt-8 flex flex-col gap-8 md:flex-row">
              <ProductFilters facets={facets} basePath="/search" />

              <div className="flex-1">
                {results.length === 0 ? (
                  <p className="py-24 text-center text-[15px] text-body">
                    No products match your filters.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                    {results.map((p) => (
                      <ProductCard key={p.id} product={p} layout="grid" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
