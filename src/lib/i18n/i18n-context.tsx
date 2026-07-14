"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type Locale } from "./messages";

const STORAGE_KEY = "lynxiglam-locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "en" || stored === "zh") setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: (key) => translate(locale, key) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

/**
 * Translate a string inside SERVER components. Renders the localized text as a
 * client leaf that switches instantly when the locale changes.
 *   <T k="Our Best Sellers" />
 */
export function T({ k }: { k: string }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
