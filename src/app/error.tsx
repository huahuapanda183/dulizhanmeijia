"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Without this, any failure reaching a server
 * component — most realistically the backend being unreachable in api mode —
 * renders Next's raw error page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col items-center justify-center px-4 text-center">
      <h1 className="heading-track text-[28px] font-medium text-ink">出了点问题</h1>
      <p className="mt-3 text-[15px] text-body">
        页面暂时无法加载，请稍后重试。
      </p>
      {error.digest && <p className="mt-2 text-[12px] text-body/60">错误编号：{error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-sm bg-mauve px-6 py-3 text-[13px] uppercase tracking-[0.12em] text-white"
        >
          重试
        </button>
        <Link
          href="/"
          className="rounded-sm border border-ink-2 px-6 py-3 text-[13px] uppercase tracking-[0.12em] text-ink"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
