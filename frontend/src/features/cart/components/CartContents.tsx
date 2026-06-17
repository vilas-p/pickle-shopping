"use client";

import { useCartStore, selectItems } from "../store";
import { CartEmpty } from "./CartEmpty";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";

export function CartContents() {
  const items = useCartStore(selectItems);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <div
        role="status"
        aria-label="Loading cart"
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-brand-cream-100" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-brand-cream-100" />
      </div>
    );
  }

  if (items.length === 0) {
    return <CartEmpty />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((line) => (
          <CartLineItem key={`${line.productId}:${line.variantId ?? ''}`} line={line} />
        ))}
      </div>
      <CartSummary />
    </div>
  );
}
