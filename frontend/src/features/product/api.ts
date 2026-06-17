import { http } from "@/shared/lib/http";
import type { PageResponse } from "@/shared/types/api";
import type { Product } from "./types";

export interface ProductListParams {
  search?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  size?: number;
}

function toQuery(params?: ProductListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.category) q.set("category", params.category);
  if (params.featured !== undefined) q.set("featured", String(params.featured));
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export const productsApi = {
  list: (params?: ProductListParams) =>
    http<PageResponse<Product>>(`/products${toQuery(params)}`, {
      revalidate: 60,
      tags: ["products"],
    }),
  featured: () =>
    http<Product[]>("/products/featured", { revalidate: 300, tags: ["products"] }),
  bySlug: (slug: string) =>
    http<Product>(`/products/slug/${encodeURIComponent(slug)}`, {
      revalidate: 60,
      tags: [`product:${slug}`, "products"],
    }),
};
