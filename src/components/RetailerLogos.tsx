export function RetailerLogos() {
  return (
    <section className="w-full bg-cream py-10 md:py-14">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-12 gap-y-8 px-6 md:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ULTA_Beauty_Logo_2.png"
          alt="Ulta Beauty"
          className="h-8 w-auto object-contain md:h-10"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Sephora-Logo.png"
          alt="Sephora"
          className="h-8 w-auto object-contain md:h-10"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/ulta_target.png"
          alt="Ulta Beauty at Target"
          className="h-8 w-auto object-contain md:h-10"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/kohls_sephora.png"
          alt="Kohl's Sephora"
          className="h-8 w-auto object-contain md:h-10"
          loading="lazy"
        />
      </div>
    </section>
  );
}
