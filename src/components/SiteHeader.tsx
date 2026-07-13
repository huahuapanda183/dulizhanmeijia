import Link from "next/link";
import { getNavigation } from "@/lib/api";
import { GlamneticLogo, ChevronDownIcon } from "@/components/icons";
import { HeaderActions } from "@/components/HeaderActions";
import { MobileMenu } from "@/components/MobileMenu";

export async function SiteHeader() {
  const nav = await getNavigation();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#f4f1ef]">
      {/* top row */}
      <div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
        <div className="flex items-center">
          <MobileMenu nav={nav} />
        </div>

        <Link href="/" aria-label="Glamnetic home" className="justify-self-center">
          <GlamneticLogo className="text-[26px] text-ink md:text-[30px]" />
        </Link>

        <HeaderActions />
      </div>

      {/* nav row (desktop, CSS-hover mega-menu) */}
      <nav className="hidden border-t border-line/70 md:block">
        <ul className="mx-auto flex max-w-[1500px] items-center justify-center gap-9 px-8">
          {nav.map((item) => (
            <li key={item.label} className="group/nav static">
              <Link
                href={item.href}
                className="flex items-center gap-1 py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:text-mauve"
              >
                {item.label}
                {item.columns && <ChevronDownIcon className="h-3 w-3" />}
              </Link>

              {item.columns && (
                <div className="invisible absolute inset-x-0 top-full z-40 opacity-0 transition-opacity duration-150 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100">
                  <div className="mx-auto flex max-w-[1500px] gap-12 border-t border-line bg-[#f4f1ef] px-8 py-8 shadow-[0_12px_20px_-8px_rgba(0,0,0,0.15)]">
                    {item.columns.map((col) => (
                      <div key={col.heading ?? col.links[0]?.label} className="min-w-[180px]">
                        {col.heading && (
                          <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-body">
                            {col.heading}
                          </h4>
                        )}
                        <ul className="space-y-2">
                          {col.links.map((l) => (
                            <li key={l.label}>
                              <Link href={l.href} className="text-[14px] text-ink transition-colors hover:text-mauve">
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {item.featured?.map((f) => (
                      <Link key={f.label} href={f.href} className="group/feat ml-auto block w-[280px]">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/images/${f.image}`}
                            alt={f.label}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/feat:scale-105"
                          />
                        </div>
                        <span className="mt-2 block text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">
                          {f.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
