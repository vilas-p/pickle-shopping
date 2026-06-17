import Image from "next/image";
import Link from "next/link";
import type { Product } from "../types";
import { formatPrice } from "@/shared/lib/format";
import { hasDiscount, primaryImage } from "../utils";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const img = primaryImage(product);
  const discounted = hasDiscount(product);
  const activeVariants = product.variants?.filter((v) => v.active) ?? [];
  const hasVariants = activeVariants.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...activeVariants.map((v) => v.price))
    : product.price;

  return (
    <Link href={`/products/${product.slug}`} className="product-card group">
      <div className="product-card-media">
        <Image
          src={img}
          alt={product.images?.[0]?.altText ?? product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="product-card-image"
        />
        {product.featured && <span className="product-card-badge">Bestseller</span>}
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category.name}</p>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">{product.shortDescription}</p>
        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="product-card-price">
                {hasVariants ? `from ${formatPrice(lowestPrice)}` : formatPrice(product.price)}
              </span>
              {!hasVariants && discounted && (
                <span className="price-strike">{formatPrice(product.compareAtPrice!)}</span>
              )}
            </div>
            <span className="text-xs text-brand-earth-700/70">{product.weight}</span>
          </div>
          <span className="product-card-link">View →</span>
        </div>
      </div>
    </Link>
  );
}
