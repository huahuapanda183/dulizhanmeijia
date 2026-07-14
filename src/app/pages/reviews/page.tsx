import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Stars } from "@/components/Stars";
import { VerifiedIcon } from "@/components/icons";
import { getReviews, getReviewSummary } from "@/lib/api";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Reviews | Glamnetic" };

export default async function ReviewsPage() {
  const [reviews, summary] = await Promise.all([getReviews(), getReviewSummary()]);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8">
          <h1 className="heading-track text-center text-[32px] font-medium text-ink md:text-[40px]">
            Our Reviews
          </h1>

          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="text-[44px] font-medium text-ink">{summary.average.toFixed(1)}</div>
            <Stars rating={summary.average} />
            <p className="text-[14px] text-body">Based on {summary.count} reviews</p>

            <div className="mt-4 flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const starCount = summary.distribution[star] ?? 0;
                const percentage = summary.count ? (starCount / summary.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-8 text-[13px] text-body">{star} ★</span>
                    <div className="h-2 w-[240px] rounded-full bg-line">
                      <div
                        className="h-2 rounded-full bg-mauve"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-[13px] text-body">{starCount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-sm border border-line bg-white p-5">
                <div className="flex items-center justify-between">
                  <Stars rating={review.rating} />
                  <span className="text-[13px] text-body">{timeAgo(review.createdAt)}</span>
                </div>
                <h2 className="mt-2 text-[16px] font-semibold text-ink">{review.title}</h2>
                <p className="mt-1 text-[14px] text-body">{review.body}</p>
                <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${review.productImage}`}
                    alt={review.productTitle}
                    className="h-12 w-12 rounded-sm object-cover"
                  />
                  <div>
                    <div className="text-[14px] font-medium text-ink">
                      {review.author}
                      {review.verified && (
                        <VerifiedIcon className="ml-1 inline h-4 w-4 text-mauve" />
                      )}
                    </div>
                    <div className="text-[12px] text-body">Reviewing {review.productTitle}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
