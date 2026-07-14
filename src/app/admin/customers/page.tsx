export default function AdminCustomersPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink">Customers</h1>
        <p className="mt-1 text-[14px] text-body">View and manage your customer base.</p>
      </header>

      <div className="rounded-md border border-line bg-white px-6 py-16">
        <div className="mx-auto max-w-[440px] text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f8] text-[26px]">
            👥
          </div>
          <h2 className="text-[18px] font-semibold text-ink">No customers yet</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            Customer profiles will appear here once accounts and a payment backend are connected.
            Account endpoints are already stubbed in the API layer — see{" "}
            <code className="rounded-sm bg-[#f7f7f8] px-1 py-0.5 text-[13px] text-ink">docs/API_CONTRACT.md</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
