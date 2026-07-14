// Local (per-browser) analytics store backing the MOCK data source. In backend
// mode (src/lib/api/analytics.ts) these are replaced by real API calls.
import type { AnalyticsEventType, AnalyticsSummary, ProductAnalytics } from "@/lib/data/types";

const KEY = "lynxiglam-analytics";

type Aggregate = Record<string, ProductAnalytics>;

function read(): Aggregate {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Aggregate;
  } catch {
    return {};
  }
}

function write(agg: Aggregate) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(agg));
  } catch {
    /* ignore */
  }
}

const FIELD: Record<AnalyticsEventType, keyof ProductAnalytics> = {
  view: "views",
  click: "clicks",
  add: "adds",
};

export function recordEvent(type: AnalyticsEventType, handle: string, title: string) {
  const agg = read();
  const row = agg[handle] ?? { handle, title, views: 0, clicks: 0, adds: 0 };
  row.title = title || row.title;
  (row[FIELD[type]] as number) += 1;
  agg[handle] = row;
  write(agg);
  // let same-tab listeners (admin open in another tab uses storage event) refresh
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lynxiglam-analytics-change"));
  }
}

export function readSummary(): AnalyticsSummary {
  const products = Object.values(read());
  return {
    totalViews: products.reduce((s, p) => s + p.views, 0),
    totalClicks: products.reduce((s, p) => s + p.clicks, 0),
    totalAdds: products.reduce((s, p) => s + p.adds, 0),
    products,
  };
}

export function resetAnalytics() {
  write({});
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lynxiglam-analytics-change"));
  }
}
