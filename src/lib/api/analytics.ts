import type { AnalyticsEventType, AnalyticsSummary } from "@/lib/data/types";
import { recordEvent, readSummary } from "@/lib/analytics/store";
import { apiFetch, usingMock } from "./config";

export interface TrackInput {
  type: AnalyticsEventType;
  handle: string;
  title: string;
}

/** Record a product interaction. MOCK stores per-browser in localStorage;
 *  backend POSTs the event to be aggregated server-side.
 *
 *  Telemetry is fire-and-forget by contract: it must never reject. Callers use
 *  `void trackEvent(...)` in click handlers and effects, so a rejection would
 *  become an unhandled promise rejection and surface as a dev-overlay error on
 *  every product view — for an event whose loss is inconsequential. A failure
 *  here (offline, 404 on an unknown handle, backend down) is swallowed and
 *  logged, never propagated. */
export async function trackEvent(input: TrackInput): Promise<void> {
  if (!usingMock()) {
    try {
      await apiFetch<void>(`/analytics/events`, { method: "POST", body: JSON.stringify(input) });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.debug("analytics event dropped", error);
    }
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
