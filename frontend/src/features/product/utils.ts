import type { Product } from "./types";

/**
 * Returns the primary image URL for a product, falling back to the first image
 * or a placeholder. Centralized so the rule is consistent across cards, detail
 * pages and JSON-LD.
 */
export function primaryImage(product: Product): string {
  const img = product.images?.find((i) => i.primary) ?? product.images?.[0];
  return img?.url ?? "/images/products/placeholder.svg";
}

export function hasDiscount(product: Product): boolean {
  return (
    product.compareAtPrice !== undefined &&
    product.compareAtPrice !== null &&
    product.compareAtPrice > product.price
  );
}
