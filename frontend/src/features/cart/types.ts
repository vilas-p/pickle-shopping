import type { Product } from "@/features/product/types";

export interface CartLine {
  productId: number;
  variantId?: number;
  slug: string;
  name: string;
  unitPrice: number;
  weight: string;
  image: string;
  quantity: number;
}

export type AddToCartInput = Pick<Product, "id" | "slug" | "name" | "price" | "weight"> & {
  variantId?: number;
  image: string;
  quantity?: number;
};
