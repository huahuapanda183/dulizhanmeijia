// Admin authentication. Intentionally separate from the storefront `StoreApi`
// contract (it is admin-only, not part of the public data layer) and swappable —
// a future SSO/OIDC provider can replace these three calls without touching the
// admin UI. In mock mode the admin area is open (local dev), matching the
// pre-backend behavior; in api mode it goes through the backend session endpoints.
import { apiFetch, usingMock } from "./config";

export interface AdminSession {
  authenticated: boolean;
  email?: string;
}

export interface AdminActionResult {
  ok: boolean;
  message: string;
}

export async function getAdminSession(): Promise<AdminSession> {
  if (usingMock()) return { authenticated: true };
  try {
    return await apiFetch<AdminSession>(`/admin/session`);
  } catch {
    return { authenticated: false };
  }
}

export async function adminLogin(email: string, password: string): Promise<AdminActionResult> {
  if (usingMock()) return { ok: true, message: "Signed in." };
  return apiFetch<AdminActionResult>(`/admin/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLogout(): Promise<AdminActionResult> {
  if (usingMock()) return { ok: true, message: "Signed out." };
  return apiFetch<AdminActionResult>(`/admin/logout`, { method: "POST" });
}
