import { T } from "@/lib/i18n/i18n-context";
import { AnalyticsView } from "@/components/admin/AnalyticsView";
import { AdminGate } from "@/components/admin/AdminGate";

export const metadata = { title: "Analytics | LynxiGlam Admin" };

export default function AdminAnalyticsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[26px] font-semibold text-ink">
          <T k="Analytics" />
        </h1>
        <p className="mt-1 text-[14px] text-body">
          <T k="Per-product views, clicks and add-to-cart." />
        </p>
      </header>
      <AdminGate>
        <AnalyticsView />
      </AdminGate>
    </div>
  );
}
