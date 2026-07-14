"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/api";

/** A next/link that records a product "click" analytics event on activation. */
export function ProductLink({
  handle,
  title,
  href,
  className,
  children,
  onClick,
}: {
  handle: string;
  title: string;
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        void trackEvent({ type: "click", handle, title });
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
}
