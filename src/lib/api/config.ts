// Central switch between the local MOCK data source and a real backend.
// When the backend is ready: set NEXT_PUBLIC_DATA_SOURCE=api and
// NEXT_PUBLIC_API_URL=https://api.yourdomain.com — the functions in this folder
// already branch on this; only the `api` branch bodies need implementing.
export const API_CONFIG = {
  source: (process.env.NEXT_PUBLIC_DATA_SOURCE as "mock" | "api" | undefined) ?? "mock",
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
};

export function usingMock(): boolean {
  return API_CONFIG.source !== "api";
}

/** Small helper for the future real API branch. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
