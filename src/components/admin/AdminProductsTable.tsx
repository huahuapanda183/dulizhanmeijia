"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/data/types";
import { formatPrice, formatCount } from "@/lib/format";
import { useI18n } from "@/lib/i18n/i18n-context";

export function AdminProductsTable({ products }: { products: Product[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.shape.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div className="rounded-md border border-line bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search by title, handle, or shape…")}
          className="w-full max-w-[320px] rounded-sm border border-line bg-white px-3 py-2 text-[14px] text-ink placeholder:text-body focus:border-mauve focus:outline-none"
        />
        <span className="text-[13px] text-body">
          {formatCount(filtered.length)} {t("of")} {formatCount(products.length)} {t("products")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-body text-[12px] uppercase border-b border-line">
              <th className="px-4 py-3 text-left font-medium">{t("Image")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Product")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Shape")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Price")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Rating")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Reviews")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Collections")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("Status")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-[#f7f7f8]">
                <td className="px-4 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${p.images[0]}`}
                    alt={p.title}
                    className="h-11 w-11 rounded-sm border border-line object-cover"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <div className="font-medium text-ink">{p.title}</div>
                  <div className="text-[12px] text-body">{p.handle}</div>
                </td>
                <td className="px-4 py-2.5 text-body">{t(p.shape)}</td>
                <td className="px-4 py-2.5">
                  <span className="text-ink">{formatPrice(p.price, p.currency)}</span>
                  {p.compareAtPrice ? (
                    <span className="ml-1.5 text-[12px] text-body line-through">
                      {formatPrice(p.compareAtPrice, p.currency)}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-2.5 text-ink">{p.rating.toFixed(1)} ★</td>
                <td className="px-4 py-2.5 text-body">{formatCount(p.reviewCount)}</td>
                <td className="px-4 py-2.5 text-body">{formatCount(p.collections.length)}</td>
                <td className="px-4 py-2.5">
                  {p.available ? (
                    <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
                      {t("Active")}
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-gray-500">
                      {t("Draft")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => alert("Editing is available once the backend is connected.")}
                    className="text-[13px] font-medium text-mauve hover:underline"
                  >
                    {t("Edit")}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[14px] text-body">
                  {t("No products match")} “{query}”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
