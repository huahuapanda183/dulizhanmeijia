"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUI } from "@/lib/ui/ui-context";
import { searchProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SearchIcon, CloseIcon } from "@/components/icons";
import type { Product } from "@/lib/data/types";

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // focus input + reset when opened; close on Escape
  useEffect(() => {
    if (searchOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTerm("");
      setResults([]);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSearch();
    if (searchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  // debounced quick results
  useEffect(() => {
    if (!term.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setResults((await searchProducts(term)).slice(0, 5));
    }, 200);
    return () => clearTimeout(id);
  }, [term]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <>
      <div
        onClick={closeSearch}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300",
          searchOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[70] bg-cream transition-transform duration-300",
          searchOpen ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="mx-auto max-w-[900px] px-4 py-6 md:px-8">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-ink pb-3">
            <SearchIcon className="h-5 w-5 text-body" />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search press-on nails, bundles, collections…"
              className="w-full bg-transparent text-[18px] text-ink outline-none placeholder:text-body"
              aria-label="Search"
            />
            <button type="button" aria-label="Close search" onClick={closeSearch} className="text-ink">
              <CloseIcon className="h-5 w-5" />
            </button>
          </form>

          {term.trim() && (
            <div className="py-4">
              {results.length === 0 ? (
                <p className="text-[14px] text-body">No matches yet — press Enter to search all products.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.handle}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 py-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/images/${p.images[0]}`} alt={p.title} className="h-14 w-14 rounded-sm object-cover" />
                        <div className="flex-1">
                          <p className="text-[15px] text-ink">{p.title}</p>
                          <p className="text-[13px] text-body">{p.shape}</p>
                        </div>
                        <span className="text-[14px] text-ink">{formatPrice(p.price, p.currency)}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={submit}
                      className="w-full py-3 text-left text-[14px] font-medium text-mauve"
                    >
                      See all results for “{term.trim()}” →
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
