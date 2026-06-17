import { http } from "@/shared/lib/http";
import type { PageResponse } from "@/shared/types/api";
import type { Review, ReviewPayload } from "./types";

export const reviewsApi = {
  list: (page = 0, size = 12) =>
    http<PageResponse<Review>>(`/reviews?page=${page}&size=${size}`, {
      revalidate: 60,
      tags: ["reviews"],
    }),
  latest: () =>
    http<Review[]>("/reviews/latest", { revalidate: 60, tags: ["reviews"] }),
  forProduct: (productId: number, page = 0, size = 10) =>
    http<PageResponse<Review>>(
      `/reviews/product/${productId}?page=${page}&size=${size}`,
      { revalidate: 60, tags: ["reviews", `product:${productId}`] },
    ),
  create: (payload: ReviewPayload) =>
    http<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    }),
};
