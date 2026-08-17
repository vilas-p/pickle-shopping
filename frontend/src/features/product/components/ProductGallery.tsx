"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "../types";
import { isVideoMedia, primaryImage } from "../utils";

interface Props {
  product: Product;
}

export function ProductGallery({ product }: Props) {
  const media = product.images ?? [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = media[currentImageIndex];
  const imageUrl = currentImage?.url ?? primaryImage(product);
  const imageAlt = currentImage?.altText ?? product.name;
  const currentIsVideo = isVideoMedia(currentImage);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-brand-cream-100 shadow-card">
        {currentIsVideo ? (
          <video
            src={imageUrl}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          >
            Your browser does not support product video playback.
          </video>
        ) : (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {media.slice(0, 4).map((img, index) => {
            const isActive = index === currentImageIndex;
            const isVideo = isVideoMedia(img);

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
                aria-label={`View media ${index + 1} of ${media.length}`}
                aria-pressed={isActive}
              >
                {isVideo ? (
                  <>
                    <video
                      src={img.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                      Video
                    </span>
                  </>
                ) : (
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.name}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}