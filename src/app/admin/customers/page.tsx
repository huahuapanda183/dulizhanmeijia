import { T } from "@/lib/i18n/i18n-context";

export default function AdminCustomersPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink"><T k="Customers" /></h1>
        <p className="mt-1 text-[14px] text-body"><T k="View and manage your customer base." /></p>
      </header>

      <div className="rounded-md border border-line bg-white px-6 py-16">
        <div className="mx-auto max-w-[440px] text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f8] text-[26px]">
            👥
          </div>
          <h2 className="text-[18px] font-semibold text-ink"><T k="This view isn't built yet" /></h2>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            <T k="Customers can already register and sign in — there is just no admin list to read them with yet." />{" "}
            <T k="Query the customers table directly until this page is wired to a read endpoint." />
          </p>
        </div>
      </div>
    </div>
  );
}
