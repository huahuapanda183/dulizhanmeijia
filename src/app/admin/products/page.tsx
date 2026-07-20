import { getProducts } from "@/lib/api";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { T } from "@/lib/i18n/i18n-context";

// Rendered per request. Without this the page is prerendered ONCE at build
// time and the catalog is frozen into the HTML: adding or repricing a product
// never showed up until the next deploy.
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink"><T k="Products" /></h1>
        <p className="mt-1 text-[14px] text-body">
          <T k="Manage your catalog — search, review, and edit products." />
        </p>
      </header>
      <AdminProductsTable products={products} />
    </div>
  );
}
