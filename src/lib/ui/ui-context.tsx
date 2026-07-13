"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface UIContextValue {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <UIContext.Provider
      value={{ searchOpen, openSearch: () => setSearchOpen(true), closeSearch: () => setSearchOpen(false) }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIProvider>");
  return ctx;
}
