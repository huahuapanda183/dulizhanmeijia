"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAnalytics } from "@/lib/api";
import { resetAnalytics } from "@/lib/analytics/store";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary, ProductAnalytics } from "@/lib/data/types";

type SortKey = "views" | "clicks" | "adds" | "conv";

const EMPTY: AnalyticsSummary = { totalViews: 0, totalClicks: 0, totalAdds: 0, products: [] };

function conv(p: ProductAnalytics): number {
  return p.views > 0 ? p.adds / p.views : 0;
}

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
  t,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (k: SortKey) => void;
  t: (s: string) => string;
}) {
  return (
    <th className="px-3 py-2 text-right">
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 hover:text-ink">
        {t(label)}
        <span className={cn("text-[10px]", sort.key === sortKey ? "text-mauve" : "text-transparent")}>
          {sort.dir === -1 ? "▼" : "▲"}
        </span>
      </button>
    </th>
  );
}

export function AnalyticsView() {
  const { t } = useI18n();
  const [data, setData] = useState<AnalyticsSummary>(EMPTY);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "views", dir: -1 });

  const load = useCallback(() => {
    getAnalytics().then(setData);
  }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener("lynxiglam-analytics-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("lynxiglam-analytics-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [load]);

  const rows = useMemo(() => {
    const val = (p: ProductAnalytics) =>
      sort.key === "conv" ? conv(p) : sort.key === "views" ? p.views : sort.key === "clicks" ? p.clicks : p.adds;
    return [...data.products].sort((a, b) => (val(a) - val(b)) * sort.dir);
  }, [data.products, sort]);

  const setSortKey = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: -1 }));

  return (
    <div>
      {/* totals */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Views", value: data.totalViews },
          { label: "Total Clicks", value: data.totalClicks },
          { label: "Total Add to Cart", value: data.totalAdds },
        ].map((c) => (
          <div key={c.label} className="rounded-md border border-line bg-white p-5">
            <div className="text-[12px] uppercase tracking-wide text-body">{t(c.label)}</div>
            <div className="mt-1 text-[28px] font-semibold text-ink">{c.value}</div>
          </div>
        ))}
      </div>

      {/* per-product table */}
      <div className="mt-6 rounded-md border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-semibold text-ink">{t("Product Analytics")}</h2>
          {data.products.length > 0 && (
            <button
              type="button"
              onClick={() => {
                resetAnalytics();
                setData(EMPTY);
              }}
              className="text-[13px] text-body underline underline-offset-2 hover:text-ink"
            >
              {t("Reset data")}
            </button>
          )}
        </div>

        {data.products.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-body">
            {t("No analytics yet — browse the storefront to generate data.")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-line text-[12px] uppercase text-body">
                  <th className="px-5 py-2 text-left">{t("Product")}</th>
                  <SortableTh label="Views" sortKey="views" sort={sort} onSort={setSortKey} t={t} />
                  <SortableTh label="Clicks" sortKey="clicks" sort={sort} onSort={setSortKey} t={t} />
                  <SortableTh label="Add to Cart" sortKey="adds" sort={sort} onSort={setSortKey} t={t} />
                  <SortableTh label="Conversion" sortKey="conv" sort={sort} onSort={setSortKey} t={t} />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.handle} className="border-b border-line last:border-0">
                    <td className="px-5 py-3">
                      <a href={`/products/${p.handle}`} className="text-ink hover:text-mauve">
                        {p.title}
                      </a>
                      <span className="ml-2 text-[12px] text-body">{p.handle}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink">{p.views}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink">{p.clicks}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink">{p.adds}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-body">
                      {p.views > 0 ? `${Math.round(conv(p) * 100)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
