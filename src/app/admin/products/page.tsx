import { getProducts } from "@/lib/api";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink">Products</h1>
        <p className="mt-1 text-[14px] text-body">
          Manage your catalog — search, review, and edit products.
        </p>
      </header>
      <AdminProductsTable products={products} />
    </div>
  );
}
