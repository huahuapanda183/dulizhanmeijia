"use client";

import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ProductFacets } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { CloseIcon, ChevronDownIcon } from "@/components/icons";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = {
  facets: ProductFacets;
  basePath: string;
};

export function ProductFilters({ facets, basePath }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const selectedShapes = searchParams.getAll("shape");
  const selectedTags = searchParams.getAll("tag");
  const priceMaxParam = searchParams.get("priceMax");
  const inStock = searchParams.get("inStock") === "1";

  const { min, max } = facets.priceRange;
  const priceMaxValue = priceMaxParam ? Number(priceMaxParam) : max;

  // basePath and pathname are equivalent for these pages; prefer the explicit
  // basePath prop as the navigation target.
  const target = basePath || pathname;

  /** Clone params, preserving q + sort, resetting page, then navigate. */
  function commit(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
  }

  function toggleMulti(key: string, value: string) {
    commit((params) => {
      const current = params.getAll(key);
      params.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...current, value].forEach((v) => params.append(key, v));
      }
    });
  }

  function setPriceMax(value: number) {
    commit((params) => {
      if (value >= max) params.delete("priceMax");
      else params.set("priceMax", String(value));
    });
  }

  function toggleInStock() {
    commit((params) => {
      if (inStock) params.delete("inStock");
      else params.set("inStock", "1");
    });
  }

  function removeParam(key: string, value?: string) {
    commit((params) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        const current = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        current.forEach((v) => params.append(key, v));
      }
    });
  }

  function clearAll() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `${target}?${qs}` : target);
  }

  const shapeLabel = (value: string) =>
    facets.shapes.find((s) => s.value === value)?.label ?? value;
  const tagLabel = (value: string) =>
    facets.tags.find((t) => t.value === value)?.label ?? value;

  const hasActiveFilters =
    selectedShapes.length > 0 ||
    selectedTags.length > 0 ||
    priceMaxParam !== null ||
    inStock;

  const panel = (
    <div className="flex flex-col gap-8">
      {facets.shapes.length > 0 && (
        <FilterSection title={t("Shape")}>
          {facets.shapes.map((s) => (
            <CheckboxRow
              key={s.value}
              label={s.label}
              count={s.count}
              checked={selectedShapes.includes(s.value)}
              onChange={() => toggleMulti("shape", s.value)}
            />
          ))}
        </FilterSection>
      )}

      {facets.tags.length > 0 && (
        <FilterSection title={t("Type")}>
          {facets.tags.map((tag) => (
            <CheckboxRow
              key={tag.value}
              label={tag.label}
              count={tag.count}
              checked={selectedTags.includes(tag.value)}
              onChange={() => toggleMulti("tag", tag.value)}
            />
          ))}
        </FilterSection>
      )}

      {max > min && (
        <FilterSection title={t("Price")}>
          <PriceRange min={min} max={max} value={priceMaxValue} onCommit={setPriceMax} />
        </FilterSection>
      )}

      <FilterSection title={t("Availability")}>
        <CheckboxRow label={t("In stock only")} checked={inStock} onChange={toggleInStock} />
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile: Filter button */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2 text-[14px] font-medium text-ink"
        >
          {t("Filter")}
          <ChevronDownIcon className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mauve px-1.5 text-[11px] font-medium text-white">
              {selectedShapes.length + selectedTags.length + (priceMaxParam ? 1 : 0) + (inStock ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Mobile: slide-over drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85%] flex-col bg-cream">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="heading-track text-[15px] font-medium text-ink">{t("FILTERS")}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <CloseIcon className="h-5 w-5 text-ink" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
            <div className="border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-mauve px-6 py-3 text-[14px] font-medium text-white"
              >
                {t("View results")}
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-2 w-full text-center text-[13px] text-body underline hover:text-ink"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop: left column */}
      <aside className="hidden w-[240px] shrink-0 md:block">
        <div className="mb-6 flex items-center justify-between">
          <span className="heading-track text-[15px] font-medium text-ink">{t("FILTERS")}</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] text-body underline hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>
        {panel}

        {hasActiveFilters && (
          <div className="mt-8 border-t border-line pt-6">
            <div className="flex flex-wrap items-center gap-2">{renderChips()}</div>
          </div>
        )}
      </aside>

      {/* Mobile: active-filter chips row shown below the Filter button */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 md:hidden">
          {renderChips()}
          <button
            type="button"
            onClick={clearAll}
            className="text-[13px] text-body underline hover:text-ink"
          >
            {t("Clear all")}
          </button>
        </div>
      )}
    </>
  );

  function renderChips() {
    return (
      <>
        {selectedShapes.map((v) => (
          <Chip key={`shape-${v}`} label={shapeLabel(v)} onRemove={() => removeParam("shape", v)} />
        ))}
        {selectedTags.map((v) => (
          <Chip key={`tag-${v}`} label={tagLabel(v)} onRemove={() => removeParam("tag", v)} />
        ))}
        {priceMaxParam !== null && (
          <Chip
            label={`Up to ${formatPrice(Number(priceMaxParam), "USD")}`}
            onRemove={() => removeParam("priceMax")}
          />
        )}
        {inStock && <Chip label="In stock" onRemove={() => removeParam("inStock")} />}
      </>
    );
  }
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="heading-track mb-3 text-[13px] font-medium uppercase tracking-wide text-ink">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function CheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[14px] text-body hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-mauve"
      />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && <span className="text-[12px] text-body/70">{count}</span>}
    </label>
  );
}

function PriceRange({
  min,
  max,
  value,
  onCommit,
}: {
  min: number;
  max: number;
  value: number;
  onCommit: (value: number) => void;
}) {
  const { t } = useI18n();
  const [local, setLocal] = useState(value);

  return (
    <>
      <p className="text-[13px] text-body">{t("Up to")} {formatPrice(local, "USD")}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={local}
        onChange={(e) => setLocal(Number(e.target.value))}
        onMouseUp={() => onCommit(local)}
        onTouchEnd={() => onCommit(local)}
        onKeyUp={() => onCommit(local)}
        className="mt-3 w-full accent-mauve"
        aria-label="Maximum price"
      />
      <div className="mt-1 flex justify-between text-[12px] text-body">
        <span>{formatPrice(min, "USD")}</span>
        <span>{formatPrice(max, "USD")}</span>
      </div>
    </>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <CloseIcon className="h-3.5 w-3.5 text-body hover:text-ink" />
      </button>
    </span>
  );
}
