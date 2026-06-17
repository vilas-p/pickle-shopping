"use client";

import Link from "next/link";
import { useCartStore, selectSubtotal, selectCount } from "../store";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";

export function CartSummary() {
  const subtotal = useCartStore(selectSubtotal);
  const count = useCartStore(selectCount);

  return (
    <aside className="card-warm sticky top-24 h-fit">
      <h2 className="font-display text-xl font-bold text-brand-earth-900">Order summary</h2>

      <dl className="mt-4 space-y-2 text-sm text-brand-earth-800">
        <div className="flex justify-between">
          <dt>Items</dt>
          <dd className="font-medium">{count}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-brand-earth-700/70">
          <dt>Shipping</dt>
          <dd>Calculated at checkout</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-brand-cream-200 pt-4">
        <span className="font-display text-lg font-semibold text-brand-earth-900">Total</span>
        <span className="font-display text-2xl font-bold text-brand-primary-700">
          {formatPrice(subtotal)}
        </span>
      </div>

      <Link
        href={ROUTES.checkout}
        className="btn-primary mt-5 w-full justify-center"
      >
        Proceed to checkout
      </Link>

      <Link
        href={ROUTES.products}
        className="mt-3 block text-center text-sm font-medium text-brand-earth-700 hover:text-brand-primary-700"
      >
        Continue shopping
      </Link>
    </aside>
  );
}
