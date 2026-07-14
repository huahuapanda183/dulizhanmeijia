import Link from "next/link";

export function ShopIRL() {
  return (
    <section
      className="relative h-[360px] w-full overflow-hidden md:h-[440px]"
      style={{ backgroundColor: "#f3d9cf" }}
    >
      <div className="flex h-full flex-col md:flex-row">
        <div className="h-[220px] w-full md:h-full md:w-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/Sea_Spell.png"
            alt="Glamnetic press-on nails"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center md:w-1/2">
          <h2 className="heading-track text-[32px] font-medium text-ink md:text-[44px]">
            Shop Us IRL
          </h2>
          <Link
            href="/pages/store-locator"
            className="mt-6 inline-block bg-mauve px-9 py-3.5 text-[14px] font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-mauve-dark"
          >
            Find Us
          </Link>
        </div>
      </div>
    </section>
  );
}
