import type { Review } from "../types";

interface Props {
  review: Review;
}

export function ReviewCard({ review }: Props) {
  return (
    <article className="card-warm flex h-full flex-col">
      <div
        className="flex items-center gap-1 text-brand-secondary-500"
        aria-label={`Rated ${review.rating} out of 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < review.rating} />
        ))}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-brand-earth-900">
        {review.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-earth-700/85">
        “{review.body}”
      </p>
      <footer className="mt-4 border-t border-brand-cream-200 pt-3 text-sm">
        <p className="font-semibold text-brand-earth-900">{review.authorName}</p>
        {(review.authorCity || review.productName) && (
          <p className="text-xs text-brand-earth-700/70">
            {[review.authorCity, review.productName].filter(Boolean).join(" • ")}
          </p>
        )}
      </footer>
    </article>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345l2.125-5.11Z"
      />
    </svg>
  );
}
