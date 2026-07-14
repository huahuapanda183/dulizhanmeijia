"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { subscribe } from "@/lib/api";
import { ChevronRightIcon } from "@/components/icons";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await subscribe({ email, phone, consent });
      setOk(result.ok);
      setMessage(result.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center border-b border-line">
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent py-2 text-[14px] outline-none placeholder:text-body"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 flex items-center gap-1 text-[13px] uppercase tracking-wide text-ink"
        >
          Join Us
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 flex items-center border-b border-line">
        <input
          type="tel"
          placeholder="Your Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-transparent py-2 text-[14px] outline-none placeholder:text-body"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 flex items-center gap-1 text-[13px] uppercase tracking-wide text-ink"
        >
          Join Us
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-[13px] ${ok ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}

      <div className="mt-6 flex gap-3">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <p className="text-[11px] leading-relaxed text-body italic">
          By submitting this form, you agree to receive recurring automated promotional and
          personalized marketing text messages (e.g. cart reminders) from LynxiGlam at the cell
          number used when signing up. Consent is not a condition of any purchase. Reply HELP for
          help and STOP to cancel. Msg frequency varies. Msg &amp; data rates may apply. View{" "}
          <Link href="/pages/terms" className="underline">
            Terms
          </Link>{" "}
          &amp;{" "}
          <Link href="/pages/privacy" className="underline">
            Privacy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
