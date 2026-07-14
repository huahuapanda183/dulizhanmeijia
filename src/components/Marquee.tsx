import { PRESS_LOGOS } from "@/lib/data/content";
import { T } from "@/lib/i18n/i18n-context";

export function Marquee() {
  return (
    <section className="w-full border-y border-line bg-cream py-8 md:py-10">
      <h3 className="mb-6 text-center text-[13px] font-semibold uppercase tracking-[0.2em] text-ink"><T k="As Seen On" /></h3>
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-16">
          {[...PRESS_LOGOS, ...PRESS_LOGOS].map((logo, idx) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`${idx}-${logo.image}`}
              src={`/images/${logo.image}`}
              alt={logo.name}
              className="h-6 w-auto shrink-0 object-contain md:h-7"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
