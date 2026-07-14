import Link from "next/link";
import { getCollections } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { T } from "@/lib/i18n/i18n-context";

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink"><T k="Collections" /></h1>
        <p className="mt-1 text-[14px] text-body">
          {formatCount(collections.length)} <T k="collections in your store." />
        </p>
      </header>

      <div className="rounded-md border border-line bg-white overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-body text-[12px] uppercase border-b border-line">
              <th className="px-5 py-3 text-left font-medium"><T k="Image" /></th>
              <th className="px-5 py-3 text-left font-medium"><T k="Title" /></th>
              <th className="px-5 py-3 text-left font-medium"><T k="Handle" /></th>
              <th className="px-5 py-3 text-left font-medium"><T k="Products" /></th>
              <th className="px-5 py-3 text-right font-medium"><T k="Action" /></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.handle} className="border-b border-line last:border-0 hover:bg-[#f7f7f8]">
                <td className="px-5 py-3">
                  {c.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/${c.image}`}
                        alt={c.title}
                        className="h-11 w-11 rounded-sm border border-line object-cover"
                      />
                    </>
                  ) : (
                    <div className="h-11 w-11 rounded-sm border border-line bg-[#f7f7f8]" />
                  )}
                </td>
                <td className="px-5 py-3 font-medium text-ink"><T k={c.title} /></td>
                <td className="px-5 py-3 text-body">{c.handle}</td>
                <td className="px-5 py-3 text-body">{formatCount(c.products.length)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/collections/${c.handle}`}
                    className="text-[13px] font-medium text-mauve hover:underline"
                  >
                    <T k="View" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
