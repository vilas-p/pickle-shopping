"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product, ProductVariant } from "../types";
import { primaryImage } from "../utils";
import { useCartStore } from "@/features/cart/store";
import { QuantityStepper } from "@/shared/ui/QuantityStepper";
import { whatsappOrderLink } from "@/shared/lib/whatsapp";
import { ROUTES } from "@/shared/constants/routes";
import { formatPrice } from "@/shared/lib/format";

interface Props {
  product: Product;
}

export function ProductActions({ product }: Props) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const variants = product.variants?.filter((v) => v.active) ?? [];
  const hasVariants = variants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    hasVariants ? variants[0] : undefined
  );

  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompare = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const activeWeight = selectedVariant?.weight ?? product.weight;
  const hasDiscount = activeCompare != null && activeCompare > activePrice;

  const handleAdd = (then?: "cart") => {
    add({
      id: product.id,
      variantId: selectedVariant?.id,
      slug: product.slug,
      name: product.name,
      price: activePrice,
      weight: activeWeight,
      image: primaryImage(product),
      quantity: qty,
    });
    if (then === "cart") {
      router.push(ROUTES.cart);
      return;
    }
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Price display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-brand-primary-700">
          {formatPrice(activePrice)}
        </span>
        {hasDiscount && (
          <span className="price-strike text-lg">
            {formatPrice(activeCompare!)}
          </span>
        )}
        <span className="text-sm text-brand-earth-700/70">/ {activeWeight}</span>
      </div>

      {/* Variant selector */}
      {hasVariants && (
        <div>
          <span className="label-field">Weight</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  selectedVariant?.id === v.id
                    ? "border-brand-primary-600 bg-brand-primary-50 text-brand-primary-700"
                    : "border-brand-earth-300 bg-white text-brand-earth-700 hover:border-brand-primary-400"
                }`}
              >
                {v.weight}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <span className="label-field !mb-0">Quantity</span>
        <QuantityStepper value={qty} onChange={setQty} ariaLabel="Quantity to add" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => handleAdd()} className="btn-primary">
          {justAdded ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => handleAdd("cart")}
          className="btn-secondary"
        >
          Buy now
        </button>
        <a
          href={whatsappOrderLink({ productName: product.name, quantity: qty })}
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp"
        >
          Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
