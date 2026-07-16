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

/** Shape of the backend's uniform error envelope (com…common.dto.Dtos.ApiError). */
interface ApiErrorBody {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

/**
 * Typed transport error. Carries the HTTP `status`, the backend error `code`,
 * and the parsed `body` so callers can branch precisely (e.g. 404 → null, 401 →
 * signed-out) instead of collapsing every failure into a generic Error.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody | undefined, path: string) {
    super(body?.message ?? `API ${path} failed: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Fetch + JSON helper for the real API branch. Throws {@link ApiError} on non-2xx. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let body: ApiErrorBody | undefined;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = undefined; // non-JSON error page — surface the status only
    }
    throw new ApiError(res.status, body, path);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
