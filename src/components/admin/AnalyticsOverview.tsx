"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getAnalytics } from "@/lib/api";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { AnalyticsSummary } from "@/lib/data/types";

const EMPTY: AnalyticsSummary = { totalViews: 0, totalClicks: 0, totalAdds: 0, products: [] };

/** Compact analytics widget for the dashboard: totals + top clicked products. */
export function AnalyticsOverview() {
  const { t } = useI18n();
  const [data, setData] = useState<AnalyticsSummary>(EMPTY);

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

  const top = [...data.products].sort((a, b) => b.clicks + b.views - (a.clicks + a.views)).slice(0, 5);

  return (
    <div className="rounded-md border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-[16px] font-semibold text-ink">{t("Top Products")}</h2>
        <Link href="/admin/analytics" className="text-[13px] text-mauve hover:underline">
          {t("View all")} →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b border-line px-5 py-4 text-center">
        <div>
          <div className="text-[22px] font-semibold text-ink">{data.totalViews}</div>
          <div className="text-[11px] uppercase tracking-wide text-body">{t("Total Views")}</div>
        </div>
        <div>
          <div className="text-[22px] font-semibold text-ink">{data.totalClicks}</div>
          <div className="text-[11px] uppercase tracking-wide text-body">{t("Total Clicks")}</div>
        </div>
        <div>
          <div className="text-[22px] font-semibold text-ink">{data.totalAdds}</div>
          <div className="text-[11px] uppercase tracking-wide text-body">{t("Total Add to Cart")}</div>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="px-5 py-8 text-center text-[13px] text-body">
          {t("No analytics yet — browse the storefront to generate data.")}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {top.map((p) => (
            <li key={p.handle} className="flex items-center justify-between px-5 py-3 text-[14px]">
              <span className="text-ink">{p.title}</span>
              <span className="flex gap-4 text-[13px] text-body tabular-nums">
                <span>{p.views} {t("Views")}</span>
                <span>{p.clicks} {t("Clicks")}</span>
                <span>{p.adds} {t("Add to Cart")}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
