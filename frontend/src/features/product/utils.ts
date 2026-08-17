import type { Product } from "./types";

export function isVideoMedia(urlOrMedia: { mediaType: "IMAGE" | "VIDEO" } | string | undefined): boolean {
  return typeof urlOrMedia === "object" && urlOrMedia?.mediaType === "VIDEO";
}

export function productImages(product: Product) {
  return (product.images ?? []).filter((item) => item.mediaType !== "VIDEO");
}

export function primaryImageMedia(product: Product) {
  const images = productImages(product);
  return images.find((item) => item.primary) ?? images[0];
}

/**
 * Returns the primary image URL for a product, falling back to the first image
 * or a placeholder. Centralized so the rule is consistent across cards, detail
 * pages and JSON-LD.
 */
export function primaryImage(product: Product): string {
  const img = primaryImageMedia(product);
  return img?.url ?? "/images/products/placeholder.svg";
}
