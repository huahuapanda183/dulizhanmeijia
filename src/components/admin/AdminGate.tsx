"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getAdminSession, adminLogin } from "@/lib/api/admin";
import { useI18n } from "@/lib/i18n/i18n-context";

type Status = "checking" | "authenticated" | "signed-out";

/**
 * Gates admin-only content (analytics) behind an admin session. In mock mode the
 * backend is absent and `getAdminSession()` reports authenticated, so this is a
 * transparent pass-through — no behavior change for local mock development. In
 * api mode it renders an inline sign-in until the admin session is established.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const check = useCallback(() => {
    getAdminSession()
      .then((session) => setStatus(session.authenticated ? "authenticated" : "signed-out"))
      .catch(() => setStatus("signed-out"));
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await adminLogin(email.trim(), password);
      if (result.ok) {
        setStatus("authenticated");
      } else {
        setError(result.message || "Invalid admin credentials.");
      }
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (status === "checking") {
    return <p className="py-8 text-[14px] text-body">{t("Loading…")}</p>;
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-6 max-w-[360px] rounded-md border border-line bg-white p-6"
    >
      <h2 className="text-[16px] font-semibold text-ink">{t("Admin sign-in")}</h2>
      <p className="mt-1 text-[13px] text-body">{t("Sign in to view analytics.")}</p>
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
