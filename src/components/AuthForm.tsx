"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { login, register } from "@/lib/api";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result =
        mode === "login"
          ? await login({ email, password })
          : await register({ email, password, firstName, lastName });
      setOk(result.ok);
      setMessage(result.message);
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "w-full border border-line rounded-sm px-4 py-3 text-[15px] outline-none focus:border-mauve";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <input
        type="password"
        placeholder="Password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ink-2 text-white uppercase tracking-[0.12em] text-[14px] py-3.5 rounded-sm disabled:opacity-50"
      >
        {mode === "login" ? "Sign In" : "Create Account"}
      </button>

      {mode === "login" ? (
        <Link href="/account/register" className="block text-[14px] text-mauve underline">
          New here? Create an account
        </Link>
      ) : (
        <Link href="/account/login" className="block text-[14px] text-mauve underline">
          Already have an account? Sign in
        </Link>
      )}

      {message && (
        <p className={`mt-4 text-[14px] ${ok ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}
    </form>
  );
}
