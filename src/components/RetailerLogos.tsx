import { RETAILER_LOGOS } from "@/lib/data/content";

export function RetailerLogos() {
  return (
    <section className="w-full bg-cream py-10 md:py-14">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-12 gap-y-8 px-6 md:justify-between">
        {RETAILER_LOGOS.map((logo) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={logo.image}
            src={`/images/${logo.image}`}
            alt={logo.name}
            className="h-8 w-auto object-contain md:h-10"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
