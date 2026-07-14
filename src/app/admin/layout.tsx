import Link from "next/link";
import { T } from "@/lib/i18n/i18n-context";
import { LanguageToggle } from "@/components/LanguageToggle";

export const metadata = { title: "LynxiGlam Admin" };

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "▤" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈" },
  { label: "Products", href: "/admin/products", icon: "◇" },
  { label: "Collections", href: "/admin/collections", icon: "▣" },
  { label: "Orders", href: "/admin/orders", icon: "🧾" },
  { label: "Customers", href: "/admin/customers", icon: "👥" },
];

/** Brand mark — clicking it returns to the storefront. */
function BrandLink() {
  return (
    <Link href="/" className="text-[20px] tracking-tight text-ink" aria-label="Back to store">
      <span className="font-bold">Lynxi</span>
      <span className="font-light">Glam</span>
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="border-b border-line px-5 pb-5 pt-6">
          <BrandLink />
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-mauve">Admin</div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-sm px-4 py-2.5 text-[14px] text-body hover:bg-[#f7f7f8]"
            >
              <span className="w-4 text-center text-[13px] leading-none">{item.icon}</span>
              <T k={item.label} />
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-line px-5 py-4">
          <LanguageToggle />
          <Link href="/" className="block text-[14px] text-body hover:text-ink">
            ← <T k="Back to store" />
          </Link>
          <Link href="/" className="block text-[14px] text-body hover:text-ink">
            <T k="Sign out" />
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen flex-1 bg-[#f7f7f8]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <BrandLink />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-mauve">Admin</span>
          </div>
          <LanguageToggle />
        </div>
        <div className="mx-auto max-w-[1200px] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
