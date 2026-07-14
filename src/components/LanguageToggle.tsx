"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { LOCALES } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={cn("flex items-center rounded-full border border-line text-[12px]", className)}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition-colors",
            locale === l.code ? "bg-ink text-white" : "text-body hover:text-ink",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
