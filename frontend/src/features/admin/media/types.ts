import type { ProductMediaType } from "@/features/product/types";

export interface ProductMediaUploadResult {
  key: string;
  url: string;
  mediaType: ProductMediaType;
  contentType: string;
  size: number;
}

export type MediaCategory =
  | "BANNER"
  | "HERO"
  | "ABOUT"
  | "LOGO"
  | "PRODUCT"
  | "GENERAL";

export interface MediaItem {
  id: number;
  originalFilename: string;
  s3Key: string;
  url: string;
  contentType: string;
  mediaType: ProductMediaType;
  fileSize: number;
  category: MediaCategory;
  productId: number | null;
  altText: string | null;
  displayOrder: number;
  active: boolean;
  uploadedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageItem {
  id: number;
  url: string;
  s3Key: string | null;
  altText: string | null;
  displayOrder: number;
  primary: boolean;
  mediaType: ProductMediaType;
  createdAt: string;
}