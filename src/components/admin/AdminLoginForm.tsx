"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { adminLogin } from "@/lib/api/admin";
import { useI18n } from "@/lib/i18n/i18n-context";

/**
 * Standalone admin sign-in, used by /admin/login (the route src/proxy.ts exempts).
 * On success the backend has set the session cookie, so a normal navigation to the
 * originally-requested page now passes the gate.
 */
export function AdminLoginForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Only accept a same-site path, never an absolute URL — otherwise ?next= is an
  // open-redirect into someone else's site straight off our admin login.
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await adminLogin(email.trim(), password);
      if (result.ok) {
        // Full navigation, not router.push: the gate runs on the server and must
        // see the freshly-set cookie.
        window.location.assign(next);
        return;
      }
      setError(result.message || "Invalid admin credentials.");
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[360px] rounded-md border border-line bg-white p-6">
      <h1 className="text-[18px] font-semibold text-ink">{t("Admin sign-in")}</h1>
      <p className="mt-1 text-[13px] text-body">{t("Sign in to continue.")}</p>
      <div className="mt-4 space-y-3">
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("Email")}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[14px] outline-none focus:border-mauve"
        />
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("Password")}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-[14px] outline-none focus:border-mauve"
        />
      </div>
      {error && (
        <p className="mt-3 text-[13px] text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-sm bg-mauve py-2.5 text-[13px] uppercase tracking-[0.1em] text-white disabled:opacity-60"
      >
        {pending ? t("Signing in…") : t("Sign in")}
      </button>
    </form>
  );
}
