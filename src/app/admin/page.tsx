import Link from "next/link";
import { getProducts, getCollections } from "@/lib/api";
import { formatPrice, formatCount } from "@/lib/format";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="text-[12px] uppercase tracking-wide text-body">{label}</div>
      <div className="mt-2 text-[28px] font-semibold leading-none text-ink">{value}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);

  const totalProducts = products.length;
  const totalCollections = collections.length;
  const avgRating = totalProducts
    ? (products.reduce((s, p) => s + p.rating, 0) / totalProducts).toFixed(1)
    : "0.0";
  const revenue = products.reduce((s, p) => s + p.price * p.reviewCount, 0);
  const currency = products[0]?.currency ?? "USD";

  const recent = products.slice(0, 8);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-[14px] text-body">
          Overview of your store — {formatCount(totalProducts)} products across{" "}
          {formatCount(totalCollections)} collections.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Products" value={formatCount(totalProducts)} />
        <StatCard label="Collections" value={formatCount(totalCollections)} />
        <StatCard label="Avg Rating" value={`${avgRating} ★`} />
        <StatCard label="Revenue (demo)" value={formatPrice(revenue, currency)} />
      </div>

      {/* Analytics overview */}
      <div className="mt-8">
        <AnalyticsOverview />
      </div>

      {/* Recent products */}
      <section className="mt-8 rounded-md border border-line bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[16px] font-semibold text-ink">Recent Products</h2>
          <Link href="/admin/products" className="text-[13px] font-medium text-mauve hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-body text-[12px] uppercase border-b border-line">
                <th className="px-5 py-3 text-left font-medium">Image</th>
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-5 py-3 text-left font-medium">Price</th>
                <th className="px-5 py-3 text-left font-medium">Rating</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/${p.images[0]}`}
                      alt={p.title}
                      className="h-14 w-14 rounded-sm border border-line object-cover"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{p.title}</div>
                    <div className="text-[12px] text-body">{p.handle}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-ink">{formatPrice(p.price, p.currency)}</span>
                    {p.compareAtPrice ? (
                      <span className="ml-2 text-[13px] text-body line-through">
                        {formatPrice(p.compareAtPrice, p.currency)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-body">
                    <span className="text-ink">{p.rating.toFixed(1)} ★</span>{" "}
                    <span className="text-[12px]">({formatCount(p.reviewCount)} reviews)</span>
                  </td>
                  <td className="px-5 py-3">
                    {p.available ? (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-gray-500">
                        Draft
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
