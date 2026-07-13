import { CarouselRail } from "@/components/CarouselRail";
import { VerifiedIcon } from "@/components/icons";
import { Stars } from "@/components/Stars";
import { getReviews } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export async function Reviews() {
  const reviews = await getReviews();

  return (
    <section className="w-full bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 className="heading-track mb-8 text-center text-[30px] font-medium text-ink md:mb-10 md:text-[38px]">
          Our Reviews
        </h2>
        <CarouselRail ariaLabel="Reviews">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex h-full min-h-[240px] w-[80vw] shrink-0 snap-start flex-col gap-3 rounded-sm border border-line bg-white p-5 sm:w-[360px]"
            >
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span className="text-[13px] text-body">{timeAgo(review.createdAt)}</span>
              </div>
              <h3 className="text-[17px] font-semibold text-ink">{review.title}</h3>
              <p className="text-[14px] text-body">{review.body}</p>
              <div className="mt-auto flex items-center gap-3 border-t border-line pt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${review.productImage}`}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-sm object-cover"
                  loading="lazy"
                  alt={`${review.productTitle} nail set`}
                />
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-ink">
                    {review.author}
                    {review.verified && <VerifiedIcon className="ml-1 inline h-4 w-4 text-mauve" />}
                  </span>
                  <span className="text-[12px] text-body">Reviewing {review.productTitle}</span>
                </div>
              </div>
            </article>
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
