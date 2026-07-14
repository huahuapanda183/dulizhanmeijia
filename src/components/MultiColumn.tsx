import { FEATURE_CARDS } from "@/lib/data/content";
import { T } from "@/lib/i18n/i18n-context";

export function MultiColumn() {
  return (
    <section className="w-full bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {FEATURE_CARDS.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="group relative block h-[460px] overflow-hidden md:h-[620px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${card.image}`}
              alt={card.label}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute bottom-7 left-7 text-[22px] font-semibold text-white underline decoration-1 underline-offset-4 md:text-[26px]">
              <T k={card.label} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
