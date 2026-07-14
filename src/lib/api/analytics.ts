import type { AnalyticsEventType, AnalyticsSummary } from "@/lib/data/types";
import { recordEvent, readSummary } from "@/lib/analytics/store";
import { apiFetch, usingMock } from "./config";

export interface TrackInput {
  type: AnalyticsEventType;
  handle: string;
  title: string;
}

/** Record a product interaction. MOCK stores per-browser in localStorage;
 *  backend POSTs the event to be aggregated server-side. */
export async function trackEvent(input: TrackInput): Promise<void> {
  if (!usingMock()) {
    await apiFetch<void>(`/analytics/events`, { method: "POST", body: JSON.stringify(input) });
    return;
  }
  recordEvent(input.type, input.handle, input.title);
}

/** Aggregated per-product analytics. MOCK reads the local store (client-only);
 *  backend returns server-aggregated data. */
export async function getAnalytics(): Promise<AnalyticsSummary> {
  if (!usingMock()) return apiFetch<AnalyticsSummary>(`/analytics`);
  return readSummary();
}
