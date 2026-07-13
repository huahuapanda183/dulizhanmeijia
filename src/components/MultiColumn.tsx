export function MultiColumn() {
  const cards = [
    {
      label: "Join Our Membership Program",
      image: "2.0HP-Widget_VIPInsiders.webp",
      href: "/pages/membership",
    },
    {
      label: "Join the GlamFam Community",
      image: "2.0HP-Widget_GlamFam.webp",
      href: "/pages/glamfam",
    },
  ] as const;

  return (
    <section className="w-full bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="group relative block overflow-hidden h-[460px] md:h-[620px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${card.image}`}
              alt={card.label}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute bottom-7 left-7 text-white text-[22px] md:text-[26px] font-semibold underline decoration-1 underline-offset-4">
              {card.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
