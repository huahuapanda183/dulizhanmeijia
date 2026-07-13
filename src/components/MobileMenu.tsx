"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/icons";
import type { NavItem } from "@/lib/data/types";

export function MobileMenu({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center md:hidden">
      <button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className="text-ink">
        {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-[#f4f1ef]">
          <ul className="flex flex-col px-6 py-2">
            {nav.map((item) => (
              <li key={item.label} className="border-b border-line/60 last:border-0">
                <Link href={item.href} onClick={() => setOpen(false)} className="block py-3 text-[14px] font-medium uppercase tracking-[0.08em] text-ink">
                  {item.label}
                </Link>
                {item.columns && (
                  <ul className="pb-3 pl-3">
                    {item.columns.flatMap((c) => c.links).map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} onClick={() => setOpen(false)} className="block py-1.5 text-[13px] text-body">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
