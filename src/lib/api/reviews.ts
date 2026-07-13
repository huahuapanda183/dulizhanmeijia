import type { Review } from "@/lib/data/types";
import { REVIEWS } from "@/lib/data/reviews";
import { apiFetch, usingMock } from "./config";

export async function getReviews(productHandle?: string): Promise<Review[]> {
  if (!usingMock()) {
    const path = productHandle ? `/reviews?product=${productHandle}` : `/reviews`;
    return apiFetch<Review[]>(path);
  }
  return productHandle ? REVIEWS.filter((r) => r.productHandle === productHandle) : REVIEWS;
}

export interface ReviewSummary {
  average: number;
  count: number;
  /** star -> count, 5..1 */
  distribution: Record<number, number>;
}

export async function getReviewSummary(productHandle?: string): Promise<ReviewSummary> {
  const list = await getReviews(productHandle);
  const count = list.length;
  const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  list.forEach((r) => {
    distribution[Math.round(r.rating)] = (distribution[Math.round(r.rating)] ?? 0) + 1;
  });
  return { average, count, distribution };
}
