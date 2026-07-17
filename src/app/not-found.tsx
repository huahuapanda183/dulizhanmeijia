import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[600px] flex-col items-center justify-center px-4 text-center">
      <h1 className="heading-track text-[28px] font-medium text-ink">页面不存在</h1>
      <p className="mt-3 text-[15px] text-body">你访问的商品或页面可能已下架或链接有误。</p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/collections/all"
          className="rounded-sm bg-mauve px-6 py-3 text-[13px] uppercase tracking-[0.12em] text-white"
        >
          去逛逛
        </Link>
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
