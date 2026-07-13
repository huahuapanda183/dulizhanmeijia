/** Currency + number formatting helpers — single source of truth for display. */

export function formatPrice(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** "7 hours ago" style relative time from an ISO date. */
export function timeAgo(iso: string, now: number = Date.parse("2026-07-13T12:00:00Z")): string {
  const then = Date.parse(iso);
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (mins >= 1) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  return "just now";
}
