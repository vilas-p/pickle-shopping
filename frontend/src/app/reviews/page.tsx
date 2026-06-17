import type { Metadata } from "next";
import { reviewsApi } from "@/features/review/api";
import { ReviewCard } from "@/features/review/components/ReviewCard";
import { ReviewForm } from "@/features/review/components/ReviewForm";
import { SectionHeading } from "@/shared/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description:
    "Read what customers across India are saying about Appa & Amma's pickles — share your own review too.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const page = await reviewsApi.list(0, 30).catch(() => ({
    content: [], page: 0, size: 0, totalElements: 0, totalPages: 0, first: true, last: true,
  }));
  const reviews = page.content;

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Reviews"
        title="From our customers' kitchens"
        description="Honest, unedited reviews from the families who eat our pickles every day."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {reviews.length === 0 ? (
            <div className="card-warm text-center">
              <p className="text-brand-earth-700/80">Be the first to share your story!</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          )}
        </div>
        <div>
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
