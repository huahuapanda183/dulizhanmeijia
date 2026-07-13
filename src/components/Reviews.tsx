import { CarouselRail } from "@/components/CarouselRail";
import { StarIcon, VerifiedIcon } from "@/components/icons";

interface Review {
  name: string;
  product: string;
  title: string;
  body: string;
  thumb: string;
  timeAgo: string;
  verified: boolean;
}

const REVIEWS: Review[] = [
  {
    name: "Natalie",
    product: "Galactic",
    title: "Yas!",
    body: "These lasted over two weeks and looked amazing. Getting more!",
    thumb: "CitrusCoast_1.webp",
    timeAgo: "7 hours ago",
    verified: false,
  },
  {
    name: "Natalie",
    product: "Oslo",
    title: "Love these!",
    body: "So chic and easy to wear. I get compliments every single day.",
    thumb: "LaPerle_1.webp",
    timeAgo: "7 hours ago",
    verified: false,
  },
  {
    name: "Sunny",
    product: "Espresso Glow",
    title: "Fabulous",
    body: "The color is gorgeous and they went on in minutes. Absolutely fabulous.",
    thumb: "AperitivoHour_1.webp",
    timeAgo: "8 hours ago",
    verified: true,
  },
  {
    name: "Jessica",
    product: "Aperitivo Hour",
    title: "So easy to apply",
    body: "Took me five minutes and they look like a salon set. So easy to apply.",
    thumb: "Seaspell_1.webp",
    timeAgo: "1 day ago",
    verified: true,
  },
  {
    name: "Maria",
    product: "Salty Waves",
    title: "Obsessed",
    body: "Completely obsessed with these. Perfect shape and they stayed put all week.",
    thumb: "SaltyWaves_1.webp",
    timeAgo: "1 day ago",
    verified: true,
  },
  {
    name: "Dana",
    product: "Citrus Coast",
    title: "Perfect summer set",
    body: "Bright, fun, and long-lasting. The perfect summer set for vacation.",
    thumb: "Moonstone-1.webp",
    timeAgo: "2 days ago",
    verified: false,
  },
];

export function Reviews() {
  return (
    <section className="w-full bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 className="heading-track mb-8 text-center text-[30px] font-medium text-ink md:mb-10 md:text-[38px]">
          Our Reviews
        </h2>
        <CarouselRail ariaLabel="Reviews">
          {REVIEWS.map((review, index) => (
            <article
              key={`${review.name}-${review.product}-${index}`}
              className="flex h-full min-h-[240px] w-[80vw] shrink-0 snap-start flex-col gap-3 rounded-sm border border-line bg-white p-5 sm:w-[360px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <StarIcon key={starIndex} className="h-4 w-4 text-mauve" />
                  ))}
                </div>
                <span className="text-[13px] text-body">{review.timeAgo}</span>
              </div>
              <h3 className="text-[17px] font-semibold text-ink">{review.title}</h3>
              <p className="text-[14px] text-body">{review.body}</p>
              <div className="mt-auto flex items-center gap-3 border-t border-line pt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${review.thumb}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-sm object-cover"
                  loading="lazy"
                  alt={`${review.product} nail set`}
                />
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-ink">
                    {review.name}
                    {review.verified && (
                      <VerifiedIcon className="ml-1 inline h-4 w-4 text-mauve" />
                    )}
                  </span>
                  <span className="text-[12px] text-body">
                    Reviewing {review.product}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
