"use client";

import { useMemo, useState } from "react";
import { reviewsApi } from "../api";
import type { ReviewPayload } from "../types";
import type { Order } from "@/features/order/types";

type ReviewStatus = "idle" | "submitting" | "success" | "error";

interface ProductReviewDraft {
  rating: number;
  comment: string;
  status: ReviewStatus;
  message: string;
}

interface Props {
  order: Order;
}

function fallbackTitle(productName: string, rating: number) {
  if (rating >= 5) return `Loved ${productName}`;
  if (rating === 4) return `Really liked ${productName}`;
  if (rating === 3) return `${productName} was good`;
  return `Feedback for ${productName}`;
}

function fallbackBody(productName: string, rating: number) {
  return `Rated ${productName} ${rating} out of 5.`;
}

export function OrderReviewSection({ order }: Props) {
  const products = useMemo(
    () => Array.from(new Map(order.items.map((item) => [item.productId, item])).values()),
    [order.items],
  );

  const [drafts, setDrafts] = useState<Record<number, ProductReviewDraft>>(() =>
    Object.fromEntries(
      products.map((item) => [
        item.productId,
        { rating: 5, comment: "", status: "idle", message: "" } satisfies ProductReviewDraft,
      ]),
    ),
  );

  const updateDraft = (productId: number, next: Partial<ProductReviewDraft>) => {
    setDrafts((current) => ({
      ...current,
      [productId]: {
        ...(current[productId] ?? { rating: 5, comment: "", status: "idle", message: "" }),
        ...next,
      },
    }));
  };

  const submitReview = async (productId: number, productName: string) => {
    const draft = drafts[productId];
    if (!draft || draft.status === "submitting" || draft.status === "success") {
      return;
    }

    updateDraft(productId, { status: "submitting", message: "" });

    const trimmedComment = draft.comment.trim();
    const payload: ReviewPayload = {
      productId,
      authorName: order.customer.fullName,
      authorCity: order.shippingAddress.city || undefined,
      rating: draft.rating,
      title: fallbackTitle(productName, draft.rating),
      body: trimmedComment || fallbackBody(productName, draft.rating),
    };

    try {
      await reviewsApi.create(payload);
      updateDraft(productId, {
        status: "success",
        message: "Thank you. Your review is now live.",
        comment: "",
      });
    } catch (error) {
      updateDraft(productId, {
        status: "error",
        message: error instanceof Error ? error.message : "Could not submit review. Please try again.",
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 space-y-4 text-left">
      <div className="card-warm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary-700/80">
          Quick review
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-brand-earth-900">
          Rate the products from this order
        </h2>
        <p className="mt-2 text-sm text-brand-earth-700/80">
          Pick a star rating and add a comment only if you want to. Submitted reviews appear right away in the reviews section.
        </p>
      </div>

      {products.map((item) => {
        const draft = drafts[item.productId] ?? {
          rating: 5,
          comment: "",
          status: "idle",
          message: "",
        };

        return (
          <article key={item.productId} className="card-warm space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-brand-earth-900">{item.productName}</h3>
                <p className="text-sm text-brand-earth-700/75">
                  {item.productWeight} • Qty {item.quantity}
                </p>
              </div>
              {draft.status === "success" && (
                <span className="inline-flex items-center rounded-full bg-brand-leaf-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-leaf-700">
                  Submitted
                </span>
              )}
            </div>

            <div>
              <p className="label-field">Your rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= draft.rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateDraft(item.productId, { rating: star, status: "idle", message: "" })}
                      aria-label={`${star} star`}
                      disabled={draft.status === "submitting" || draft.status === "success"}
                      className={active ? "text-3xl text-brand-secondary-500" : "text-3xl text-brand-cream-300"}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor={`comment-${item.productId}`} className="label-field">
                Comment (optional)
              </label>
              <textarea
                id={`comment-${item.productId}`}
                rows={3}
                value={draft.comment}
                disabled={draft.status === "submitting" || draft.status === "success"}
                onChange={(event) =>
                  updateDraft(item.productId, {
                    comment: event.target.value,
                    status: draft.status === "error" ? "idle" : draft.status,
                    message: draft.status === "error" ? "" : draft.message,
                  })
                }
                placeholder="Tell us what you liked, or leave this blank and just submit your rating."
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => submitReview(item.productId, item.productName)}
                disabled={draft.status === "submitting" || draft.status === "success"}
                className="btn-primary"
              >
                {draft.status === "submitting" ? "Submitting…" : draft.status === "success" ? "Review submitted" : "Submit review"}
              </button>

              {draft.message && (
                <p
                  role={draft.status === "error" ? "alert" : "status"}
                  className={
                    draft.status === "success"
                      ? "text-sm text-brand-leaf-700"
                      : draft.status === "error"
                        ? "text-sm text-brand-primary-700"
                        : "text-sm text-brand-earth-700/80"
                  }
                >
                  {draft.message}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}