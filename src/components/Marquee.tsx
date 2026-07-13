type Logo = {
  file: string;
  alt: string;
};

const logos: Logo[] = [
  { file: "cosmopolitan.webp", alt: "Cosmopolitan" },
  { file: "elle.webp", alt: "Elle" },
  { file: "instyle.webp", alt: "InStyle" },
  { file: "people.webp", alt: "People" },
  { file: "byrdie.webp", alt: "Byrdie" },
  { file: "oprahdaily.webp", alt: "Oprah Daily" },
  { file: "parade.webp", alt: "Parade" },
  { file: "glamour.webp", alt: "Glamour" },
  { file: "allure.webp", alt: "Allure" },
  { file: "bustle.webp", alt: "Bustle" },
  { file: "teenvogue.webp", alt: "Teen Vogue" },
  { file: "whowhatwear.webp", alt: "Who What Wear" },
];

export function Marquee() {
  return (
    <section className="w-full bg-cream py-8 md:py-10 border-y border-line">
      <h3 className="mb-6 text-center text-[13px] font-semibold uppercase tracking-[0.2em] text-ink">
        As Seen On
      </h3>
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-16">
          {logos.map((logo) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`a-${logo.file}`}
              src={`/images/${logo.file}`}
              alt={logo.alt}
              className="h-6 md:h-7 w-auto shrink-0 object-contain"
              loading="lazy"
            />
          ))}
          {logos.map((logo) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`b-${logo.file}`}
              src={`/images/${logo.file}`}
              alt={logo.alt}
              className="h-6 md:h-7 w-auto shrink-0 object-contain"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
