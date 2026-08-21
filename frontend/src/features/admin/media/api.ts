import { http } from "@/shared/lib/http";
import type {
  MediaCategory,
  MediaItem,
  ProductImageItem,
  ProductMediaUploadResult,
} from "./types";

export const adminMediaApi = {
  uploadProductMedia: (file: File, productSlug?: string) => {
    const formData = new FormData();
    formData.set("file", file);
    if (productSlug?.trim()) {
      formData.set("productSlug", productSlug.trim());
    }
    return http<ProductMediaUploadResult>("/admin/uploads/products", {
      method: "POST",
      body: formData,
      auth: "admin",
      cache: "no-store",
    });
  },

  // --- Media Management ---

  uploadMedia: (file: File, category: MediaCategory, opts?: { productId?: number; altText?: string; displayOrder?: number }) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("category", category);
    if (opts?.productId) formData.set("productId", String(opts.productId));
    if (opts?.altText) formData.set("altText", opts.altText);
    if (opts?.displayOrder !== undefined) formData.set("displayOrder", String(opts.displayOrder));
    return http<MediaItem>("/admin/media/upload", {
      method: "POST",
      body: formData,
      auth: "admin",
      cache: "no-store",
    });
  },

  listMedia: (category?: MediaCategory) => {
    const params = category ? `?category=${category}` : "";
    return http<MediaItem[]>(`/admin/media${params}`, {
      auth: "admin",
      cache: "no-store",
    });
  },

  getMedia: (id: number) =>
    http<MediaItem>(`/admin/media/${id}`, { auth: "admin", cache: "no-store" }),

  updateMedia: (id: number, data: { altText?: string; displayOrder?: number; active?: boolean }) =>
    http<MediaItem>(`/admin/media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      auth: "admin",
      cache: "no-store",
    }),

  deleteMedia: (id: number) =>
    http<void>(`/admin/media/${id}`, {
      method: "DELETE",
      auth: "admin",
      cache: "no-store",
    }),

  // --- Product Images ---

  uploadProductImage: (productId: number, file: File, opts?: { altText?: string; primary?: boolean }) => {
    const formData = new FormData();
    formData.set("file", file);
    if (opts?.altText) formData.set("altText", opts.altText);
    if (opts?.primary) formData.set("primary", "true");
    return http<ProductImageItem>(`/admin/products/${productId}/images`, {
      method: "POST",
      body: formData,
      auth: "admin",
      cache: "no-store",
    });
  },

  listProductImages: (productId: number) =>
    http<ProductImageItem[]>(`/admin/products/${productId}/images`, {
      auth: "admin",
      cache: "no-store",
    }),

  deleteProductImage: (productId: number, imageId: number) =>
    http<void>(`/admin/products/${productId}/images/${imageId}`, {
      method: "DELETE",
      auth: "admin",
      cache: "no-store",
    }),

  setPrimaryImage: (productId: number, imageId: number) =>
    http<ProductImageItem>(`/admin/products/${productId}/images/${imageId}/primary`, {
      method: "PUT",
      auth: "admin",
      cache: "no-store",
    }),

  reorderProductImages: (productId: number, imageIds: number[]) =>
    http<ProductImageItem[]>(`/admin/products/${productId}/images/reorder`, {
      method: "PUT",
      body: JSON.stringify(imageIds),
      auth: "admin",
      cache: "no-store",
    }),
};

// Public media API (no auth required)
export const publicMediaApi = {
  getBanners: () =>
    http<MediaItem[]>("/media/banners", { revalidate: 60, tags: ["banners"] }),

  getSiteMedia: (category: MediaCategory) =>
    http<MediaItem[]>(`/media/site?category=${category}`, { revalidate: 60, tags: ["site-media"] }),
};