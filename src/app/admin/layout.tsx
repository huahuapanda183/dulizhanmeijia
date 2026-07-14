import Link from "next/link";

export const metadata = { title: "LynxiGlam Admin" };

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "▤" },
  { label: "Products", href: "/admin/products", icon: "◇" },
  { label: "Collections", href: "/admin/collections", icon: "▣" },
  { label: "Orders", href: "/admin/orders", icon: "🧾" },
  { label: "Customers", href: "/admin/customers", icon: "👥" },
];

function BrandBlock() {
  return (
    <span className="text-[20px] tracking-tight text-ink">
      <span className="font-bold">Lynxi</span>
      <span className="font-light">Glam</span>
    </span>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-line bg-white">
        <div className="px-5 pt-6 pb-5 border-b border-line">
          <BrandBlock />
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-mauve">
            Admin
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-body hover:bg-[#f7f7f8] rounded-sm"
            >
              <span className="w-4 text-center text-[13px] leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-line space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-body hover:bg-[#f7f7f8] rounded-sm"
          >
            ← Back to store
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-body hover:bg-[#f7f7f8] rounded-sm"
          >
            Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-[#f7f7f8] min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <BrandBlock />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-mauve">
            Admin
          </span>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
