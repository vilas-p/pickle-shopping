"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../store";
import type { CartLine } from "../types";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import { QuantityStepper } from "@/shared/ui/QuantityStepper";

export function CartLineItem({ line }: { line: CartLine }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const lineTotal = line.unitPrice * line.quantity;

  return (
    <div className="flex gap-4 rounded-2xl bg-white p-4 shadow-card sm:p-5">
      <Link
        href={ROUTES.productDetail(line.slug)}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-brand-cream-100 sm:h-28 sm:w-28"
      >
        <Image src={line.image} alt={line.name} fill sizes="120px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={ROUTES.productDetail(line.slug)}
              className="font-display text-lg font-semibold text-brand-earth-900 hover:text-brand-primary-700"
            >
              {line.name}
            </Link>
            <p className="text-sm text-brand-earth-700/70">{line.weight}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(line.productId, line.variantId)}
            aria-label={`Remove ${line.name} from cart`}
            className="text-sm font-medium text-brand-earth-700/70 transition hover:text-brand-primary-700"
          >
            Remove
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            onChange={(n) => setQuantity(line.productId, n, line.variantId)}
            ariaLabel={`Quantity for ${line.name}`}
          />
          <div className="text-right">
            <p className="text-sm text-brand-earth-700/70">
              {formatPrice(line.unitPrice)} each
            </p>
            <p className="font-display text-lg font-bold text-brand-primary-700">
              {formatPrice(lineTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
