"use client";

import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/i18n-context";

const OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export function CollectionSort({ current }: { current: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 text-[13px] text-body">
      <span>{t("Sort by")}</span>
      <select
        value={current}
        onChange={(e) => router.push(`${pathname}?sort=${e.target.value}`)}
        className="border border-line rounded-sm bg-white px-3 py-2 text-[14px] text-ink"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
          </option>
        ))}
      </select>
    </label>
  );
}
