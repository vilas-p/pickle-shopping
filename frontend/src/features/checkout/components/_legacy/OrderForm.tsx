"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Product } from "@/features/product/types";
import { ordersApi } from "@/features/order/api";
import { formatPrice } from "@/shared/lib/format";
import { whatsappOrderLink } from "@/shared/lib/whatsapp";
import { INDIA_STATES } from "@/shared/constants/india-states";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";

interface Props {
  products: Product[];
  preselectedProductId?: number;
}

interface CartLine {
  productId: number;
  quantity: number;
}

const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING = 60;

/**
 * Legacy single-page order form. Preserved as-is during Phase 1 so the existing
 * `/order` route keeps working. Will be retired in Phase 6 when the cart →
 * checkout → payment flow ships.
 */
export function OrderForm({ products, preselectedProductId }: Props) {
  const initial: CartLine[] = preselectedProductId
    ? [{ productId: preselectedProductId, quantity: 1 }]
    : products.length > 0
      ? [{ productId: products[0].id, quantity: 1 }]
      : [];

  const [cart, setCart] = useState<CartLine[]>(initial);
  const [localError, setLocalError] = useState("");
  const { status, message, data, submit } = useApiSubmit(ordersApi.create);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const subtotal = cart.reduce((sum, line) => {
    const p = productMap.get(line.productId);
    return p ? sum + p.price * line.quantity : sum;
  }, 0);

  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal + shippingFee;

  const updateLine = (index: number, patch: Partial<CartLine>) => {
    setCart((c) => c.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const removeLine = (index: number) => {
    setCart((c) => c.filter((_, i) => i !== index));
  };

  const addLine = () => {
    const used = new Set(cart.map((c) => c.productId));
    const next = products.find((p) => !used.has(p.id));
    if (next) setCart((c) => [...c, { productId: next.id, quantity: 1 }]);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");
    if (cart.length === 0) {
      setLocalError("Please add at least one pickle to your order.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    await submit({
      customer: {
        fullName: String(fd.get("fullName") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
      },
      shippingAddress: {
        line1: String(fd.get("line1") ?? ""),
        line2: String(fd.get("line2") ?? "") || undefined,
        city: String(fd.get("city") ?? ""),
        state: String(fd.get("state") ?? ""),
        pincode: String(fd.get("pincode") ?? ""),
        landmark: String(fd.get("landmark") ?? "") || undefined,
      },
      items: cart,
      channel: "WEBSITE",
      notes: String(fd.get("notes") ?? "") || undefined,
    });
  };

  if (status === "success" && data) {
    return (
      <div className="card-warm text-center">
        <p className="font-script text-2xl text-brand-primary-700">Thank you!</p>
        <h2 className="mt-2 font-display text-3xl text-brand-earth-900">
          Order {data.orderNumber} placed! We&apos;ll WhatsApp you shortly to confirm.
        </h2>
        <p className="mt-2 text-sm text-brand-earth-700/70">
          Your order number is <strong>{data.orderNumber}</strong>. Please save it for reference.
        </p>
        <Link href="/products" className="btn-secondary mt-6">Continue Shopping</Link>
      </div>
    );
  }

  const displayedError = localError || (status === "error" ? message : "");

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
      {/* Cart */}
      <section className="card-warm lg:col-span-2">
        <h2 className="font-display text-2xl font-semibold text-brand-earth-900">Your Pickles</h2>
        <p className="mt-1 text-sm text-brand-earth-700/70">
          Pick what you&apos;d like and the quantity.
        </p>

        {cart.length === 0 ? (
          <p className="mt-6 text-sm text-brand-earth-700/70">No items yet.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {cart.map((line, index) => {
              const product = productMap.get(line.productId);
              if (!product) return null;
              return (
                <li
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border border-brand-cream-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <label className="label-field" htmlFor={`product-${index}`}>Pickle</label>
                    <select
                      id={`product-${index}`}
                      value={line.productId}
                      onChange={(e) => updateLine(index, { productId: Number(e.target.value) })}
                      className="input-field"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.weight} ({formatPrice(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="label-field" htmlFor={`qty-${index}`}>Qty</label>
                    <input
                      id={`qty-${index}`}
                      type="number"
                      min={1}
                      max={50}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(index, { quantity: Math.max(1, Number(e.target.value)) })
                      }
                      className="input-field"
                    />
                  </div>
                  <div className="sm:w-28 sm:text-right">
                    <p className="text-xs text-brand-earth-700/70 sm:hidden">Subtotal</p>
                    <p className="text-lg font-bold text-brand-primary-700">
                      {formatPrice(product.price * line.quantity)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="text-sm text-brand-primary-700 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {cart.length < products.length && (
          <button type="button" onClick={addLine} className="btn-secondary mt-4">
            + Add another pickle
          </button>
        )}

        <hr className="my-6 border-brand-cream-200" />

        <h2 className="font-display text-2xl font-semibold text-brand-earth-900">Delivery Details</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className="label-field">Full name</label>
            <input id="fullName" name="fullName" required className="input-field" />
          </div>
          <div>
            <label htmlFor="phone" className="label-field">Phone (with country code)</label>
            <input
              id="phone"
              name="phone"
              required
              placeholder="+919XXXXXXXXX"
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="email" className="label-field">Email</label>
          <input id="email" name="email" type="email" required className="input-field" />
        </div>
        <div className="mt-4">
          <label htmlFor="line1" className="label-field">Address line 1</label>
          <input id="line1" name="line1" required className="input-field" />
        </div>
        <div className="mt-4">
          <label htmlFor="line2" className="label-field">Address line 2 (optional)</label>
          <input id="line2" name="line2" className="input-field" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className="label-field">City</label>
            <input id="city" name="city" required className="input-field" />
          </div>
          <div>
            <label htmlFor="state" className="label-field">State</label>
            <select id="state" name="state" required className="input-field" defaultValue="">
              <option value="" disabled>Select state</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pincode" className="label-field">Pincode</label>
            <input
              id="pincode"
              name="pincode"
              required
              pattern="^[1-9][0-9]{5}$"
              maxLength={6}
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="landmark" className="label-field">Landmark (optional)</label>
          <input id="landmark" name="landmark" className="input-field" />
        </div>
        <div className="mt-4">
          <label htmlFor="notes" className="label-field">Order notes (optional)</label>
          <textarea id="notes" name="notes" rows={3} className="input-field" />
        </div>
      </section>

      {/* Summary */}
      <aside className="card-warm h-fit">
        <h2 className="font-display text-2xl font-semibold text-brand-earth-900">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping (India)</dt>
            <dd>
              {shippingFee === 0 ? (subtotal === 0 ? "—" : "FREE") : formatPrice(shippingFee)}
            </dd>
          </div>
          <div className="border-t border-brand-cream-200 pt-3" />
          <div className="flex justify-between text-lg font-bold text-brand-earth-900">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
          <p className="mt-3 rounded-lg bg-brand-accent-100 px-3 py-2 text-xs text-brand-accent-700">
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting" || cart.length === 0}
          className="btn-primary mt-6 w-full"
        >
          {status === "submitting" ? "Placing order…" : "Place Order"}
        </button>

        <p className="mt-3 text-center text-xs text-brand-earth-700/70">
          You&apos;ll pay on delivery or via UPI / bank transfer — we&apos;ll WhatsApp you the
          details after confirming.
        </p>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-brand-cream-200" />
          <span className="text-xs uppercase tracking-wider text-brand-earth-700/60">or</span>
          <span className="h-px flex-1 bg-brand-cream-200" />
        </div>

        <a
          href={whatsappOrderLink({
            productName:
              cart.length > 0
                ? cart
                    .map((c) => `${productMap.get(c.productId)?.name} x${c.quantity}`)
                    .join(", ")
                : undefined,
          })}
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp w-full"
        >
          Order on WhatsApp
        </a>

        {displayedError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-brand-primary-100 px-4 py-3 text-sm text-brand-primary-700"
          >
            {displayedError}
          </p>
        )}
      </aside>
    </form>
  );
}
