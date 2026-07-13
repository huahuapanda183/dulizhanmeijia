"use client";

import { useState } from "react";
import {
  MenuIcon,
  UserIcon,
  SearchIcon,
  BagIcon,
  CloseIcon,
  GlamneticLogo,
} from "@/components/icons";
import type { NavItem } from "@/types";

const NAV: NavItem[] = [
  { label: "SHOP ALL", href: "/collections/all" },
  { label: "GLUE-ON NAILS", href: "/collections/all-nails" },
  { label: "QUICK PRESS MANI", href: "/collections/quick-press-mani" },
  { label: "LASHES", href: "/collections/all-lashes" },
  { label: "BUNDLES", href: "/collections/bundles" },
  { label: "LOYALTY", href: "/pages/loyalty" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#f4f1ef]">
      {/* top row */}
      <div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="text-ink"
          >
            {open ? <MenuIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        <a href="/" aria-label="Glamnetic home" className="justify-self-center">
          <GlamneticLogo className="text-[26px] text-ink md:text-[30px]" />
        </a>

        <div className="flex items-center justify-end gap-4 md:gap-5 text-ink">
          <button type="button" aria-label="Account" className="hidden sm:block">
            <UserIcon className="h-[22px] w-[22px]" />
          </button>
          <button type="button" aria-label="Search">
            <SearchIcon className="h-[22px] w-[22px]" />
          </button>
          <button type="button" aria-label="Cart">
            <BagIcon className="h-[22px] w-[22px]" />
          </button>
        </div>
      </div>

      {/* nav row (desktop) */}
      <nav className="hidden border-t border-line/70 md:block">
        <ul className="mx-auto flex max-w-[1500px] items-center justify-center gap-9 px-8 py-3.5">
          {NAV.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:text-mauve"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="border-t border-line bg-[#f4f1ef] md:hidden">
          <ul className="flex flex-col px-6 py-2">
            {NAV.map((item) => (
              <li key={item.label} className="border-b border-line/60 last:border-0">
                <a
                  href={item.href}
                  className="block py-3 text-[14px] font-medium uppercase tracking-[0.08em] text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
