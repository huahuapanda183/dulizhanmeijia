import { T } from "@/lib/i18n/i18n-context";

export default function AdminOrdersPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink"><T k="Orders" /></h1>
        <p className="mt-1 text-[14px] text-body"><T k="Track and fulfill customer orders." /></p>
      </header>

      <div className="rounded-md border border-line bg-white px-6 py-16">
        <div className="mx-auto max-w-[440px] text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f8] text-[26px]">
            🧾
          </div>
          <h2 className="text-[18px] font-semibold text-ink"><T k="No orders yet" /></h2>
          <p className="mt-2 text-[14px] leading-relaxed text-body">
            <T k="Orders will appear here once a payment backend is connected." /> The checkout flow already
            builds order objects via <code className="rounded-sm bg-[#f7f7f8] px-1 py-0.5 text-[13px] text-ink">createOrder()</code> — see{" "}
            <code className="rounded-sm bg-[#f7f7f8] px-1 py-0.5 text-[13px] text-ink">docs/API_CONTRACT.md</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
