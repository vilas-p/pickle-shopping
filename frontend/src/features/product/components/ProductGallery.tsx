"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "../types";
import { primaryImage } from "../utils";

interface Props {
  product: Product;
}

export function ProductGallery({ product }: Props) {
  const images = product.images ?? [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images[currentImageIndex];
  const imageUrl = currentImage?.url ?? primaryImage(product);
  const imageAlt = currentImage?.altText ?? product.name;

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-brand-cream-100 shadow-card">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, index) => {
            const isActive = index === currentImageIndex;

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-xl bg-brand-cream-100 ring-2 transition ${
                  isActive
                    ? "ring-brand-primary-600"
                    : "ring-transparent hover:ring-brand-primary-300"
                }`}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={isActive}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? product.name}
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}