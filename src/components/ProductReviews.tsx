import { getReviews, getReviewSummary } from "@/lib/api";
import type { Review } from "@/lib/data/types";
import { Stars } from "@/components/Stars";
import { VerifiedIcon } from "@/components/icons";
import { timeAgo, formatCount } from "@/lib/format";
import { T } from "@/lib/i18n/i18n-context";

/** Product detail reviews block: rating summary, distribution, and review cards. */
export async function ProductReviews({ handle }: { handle: string }) {
  const reviews = await getReviews(handle);
  const summary = await getReviewSummary(handle);

  return (
    <section className="bg-cream text-ink">
      <h2 className="heading-track text-[26px] md:text-[32px] font-medium text-ink text-center">
        <T k="Reviews" />
      </h2>

      <div className="flex flex-col items-center gap-2 mt-6">
        <span className="text-[44px] font-medium text-ink">{summary.average.toFixed(1)}</span>
        <Stars rating={summary.average} />
        <span className="text-[14px] text-body">
          <T k="Based on" /> {formatCount(summary.count)} <T k="review(s)" />
        </span>

        {summary.count > 0 && (
          <div className="mt-4 w-full max-w-[320px] flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-[12px] text-body">
                <span>{star}★</span>
                <span className="h-2 flex-1 max-w-[220px] rounded-full bg-line overflow-hidden">
                  <span
                    className="bg-mauve h-full block"
                    style={{
                      width: `${summary.count ? (summary.distribution[star] / summary.count) * 100 : 0}%`,
                    }}
                  />
                </span>
                <span>{formatCount(summary.distribution[star] ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        {reviews.length === 0 ? (
          <p className="text-center text-body">
            <T k="No reviews yet — be the first to review this product." />
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((r: Review) => (
              <article
                key={r.id}
                className="rounded-md border border-line bg-white p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <span className="text-[13px] text-body">{timeAgo(r.createdAt)}</span>
                </div>

                <h3 className="text-[16px] font-semibold text-ink">{r.title}</h3>

                <p className="text-[14px] text-body leading-relaxed">{r.body}</p>

                <div className="mt-auto pt-3 border-t border-line flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/${r.productImage}`}
                    alt={r.productTitle}
                    className="h-10 w-10 rounded-sm object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-ink inline-flex items-center gap-1">
                      {r.author}
                      {r.verified && <VerifiedIcon className="h-4 w-4 text-mauve" />}
                    </span>
                    <span className="text-[12px] text-body"><T k="Reviewing" /> {r.productTitle}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <a
          href="#"
          className="mt-8 mx-auto block w-fit border border-ink text-ink uppercase tracking-[0.12em] text-[13px] px-8 py-3 rounded-sm hover:bg-ink hover:text-white transition-colors"
        >
          <T k="Write a Review" />
        </a>
      </div>
    </section>
  );
}
