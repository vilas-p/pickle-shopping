import { http } from "@/shared/lib/http";
import type { Product, Category, ProductImage } from "@/features/product/types";
import type { PageResponse } from "@/shared/types/api";

export interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  ingredients?: string;
  shelfLife?: string;
  price: number;
  compareAtPrice?: number;
  weight: string;
  categoryId: number;
  active: boolean;
  featured: boolean;
}

interface ImagePayload {
  url: string;
  altText?: string;
  displayOrder: number;
  primary: boolean;
  mediaType: string;
}

function toImagePayload(images: ProductImage[]): ImagePayload[] {
  return images.map((img) => ({
    url: img.url,
    altText: img.altText,
    displayOrder: img.displayOrder,
    primary: img.primary,
    mediaType: img.mediaType,
  }));
}

export const adminProductsApi = {
  list: (page = 0, size = 100) =>
    http<PageResponse<Product>>(`/products/admin?page=${page}&size=${size}`, {
      auth: "admin",
      cache: "no-store",
    }),

  getById: (id: number) =>
    http<Product>(`/products/${id}`, { auth: "admin", cache: "no-store" }),

  create: (data: ProductFormData) =>
    http<Product>("/products", {
      method: "POST",
      body: JSON.stringify({ ...data, images: [] }),
      auth: "admin",
      cache: "no-store",
    }),

  // Preserves existing images when updating product details
  update: (id: number, data: ProductFormData, existingImages: ProductImage[] = []) =>
    http<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...data, images: toImagePayload(existingImages) }),
      auth: "admin",
      cache: "no-store",
    }),

  delete: (id: number) =>
    http<void>(`/products/${id}`, {
      method: "DELETE",
      auth: "admin",
      cache: "no-store",
    }),

  listCategories: () =>
    http<Category[]>("/categories/admin", { auth: "admin", cache: "no-store" }),
};
