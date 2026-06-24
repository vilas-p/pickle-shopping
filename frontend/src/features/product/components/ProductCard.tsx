"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product, ProductVariant } from "../types";
import { formatPrice } from "@/shared/lib/format";
import { hasDiscount, primaryImage } from "../utils";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/store";
import { ROUTES } from "@/shared/constants/routes";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const items = useCartStore((s) => s.items);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images.length > 0 ? images[currentImageIndex] : primaryImage(product);
  const imageUrl = typeof currentImage === 'string' ? currentImage : (currentImage?.url ?? primaryImage(product));

  const activeVariants = product.variants?.filter((v) => v.active) ?? [];
  const activeVariantsSorted = [...activeVariants].sort((a, b) => a.displayOrder - b.displayOrder);
  const effectiveVariant = selectedVariant ?? (activeVariantsSorted[0] ?? null);
  const displayPrice = effectiveVariant ? effectiveVariant.price : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  if (inCart) {
    router.push(ROUTES.cart);
    return;
  }

  add({
    id: product.id,
    variantId: effectiveVariant?.id,
    slug: product.slug,
    name: product.name,
    price: displayPrice,
    weight: effectiveVariant?.weight ?? product.weight,
    image: primaryImage(product),
    quantity: 1,
  });
};

  const inCart = items.some(
  (line) =>
    line.productId === product.id &&
    line.variantId === (effectiveVariant?.id ?? undefined)
);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Link href={`/products/${product.slug}`} className="product-card group flex h-full flex-col">
  {/* Product Image Section */}
  <div className="relative bg-[#F7F3E8] rounded-t-3xl overflow-hidden">

    {/* Main Product Image with Carousel Controls */}
    <div className="product-card-media relative group/carousel">
      <Image
        src={imageUrl}
        alt={images[currentImageIndex]?.altText ?? product.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="product-card-media"
      />

      {/* Navigation Arrows - Show on Hover */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
            aria-label="Previous image"
          >
            <svg
              className="w-5 h-5 text-brand-primary-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
            aria-label="Next image"
          >
            <svg
              className="w-5 h-5 text-brand-primary-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex
                    ? "bg-brand-primary-700 w-6"
                    : "bg-white/50 w-2"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  </div>

  {/* Content */}
  <div className="flex flex-1 flex-col p-5 text-center">
  <div>
    <div className="flex justify-center gap-2 mb-3">
      <span className="badge">🌶 Flavorful</span>
      <span className="badge">🏺 Traditional</span>
    </div>

    <h3 className="text-3xl font-semibold">{product.name}</h3>

    <p className="mt-2 text-neutral-500">{product.shortDescription}</p>

    <div className="mt-4 flex items-center justify-center gap-2">
      ⭐⭐⭐⭐⭐
      <span className="font-bold">4.8</span>
      <span>(190)</span>
    </div>
  </div>

  <div className="mt-auto">
    {activeVariantsSorted.length > 0 && (
      <div className="mt-6 grid grid-cols-3 gap-3">
        {activeVariantsSorted.map((v) => (
          <button
            key={v.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedVariant(v);
            }}
            className={effectiveVariant?.id === v.id ? "weight-active" : "weight-btn"}
          >
            {v.weight}
          </button>
        ))}
      </div>
    )}

    <button
      onClick={handleAddToCart}
      className={`mt-6 w-full rounded-2xl px-6 py-5 flex items-center justify-between font-bold text-xl transition-colors ${
        inCart ? "bg-green-600 text-white" : "bg-brand-primary text-white"
      }`}
    >
      <span>{inCart ? "VIEW CART" : "ADD TO CART"}</span>
      <span>{!inCart ? formatPrice(displayPrice) : null}</span>
    </button>
  </div>
</div>
</Link>

  );
}
