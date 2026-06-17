"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, selectItems, selectSubtotal, selectCount } from "@/features/cart/store";
import { ordersApi } from "@/features/order/api";
import { paymentsApi } from "@/features/checkout/api";
import { useApiSubmit } from "@/shared/hooks/useApiSubmit";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import { INDIA_STATES } from "@/shared/constants/india-states";
import { config } from "@/shared/lib/config";
import type { CreateOrderPayload } from "@/features/order/types";

const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING = 60;

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore(selectItems);
  const subtotal = useCartStore(selectSubtotal);
  const count = useCartStore(selectCount);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [localError, setLocalError] = useState("");
  const { status, message, submit } = useApiSubmit(ordersApi.create);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal + shippingFee;

  if (!hasHydrated) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="h-96 animate-pulse rounded-2xl bg-brand-cream-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-brand-cream-100" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card-warm text-center py-12">
        <h2 className="font-display text-2xl text-brand-earth-900">Your cart is empty</h2>
        <p className="mt-2 text-brand-earth-700/70">Add some pickles before checking out!</p>
        <Link href={ROUTES.products} className="btn-primary mt-6 inline-block">
          Browse Pickles
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError("");

    const fd = new FormData(e.currentTarget);

    const payload: CreateOrderPayload = {
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
      items: items.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
      channel: "WEBSITE",
      paymentMethod,
      notes: String(fd.get("notes") ?? "") || undefined,
    };

    const order = await submit(payload);
    if (!order) return; // error handled by useApiSubmit

    if (paymentMethod === "RAZORPAY") {
      try {
        const rpData = await paymentsApi.createOrder(order.id);
        await openRazorpayCheckout(rpData, order.orderNumber);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Payment initiation failed");
      }
    } else {
      // COD: go straight to confirmation
      clearCart();
      router.push(ROUTES.checkoutConfirmation(order.orderNumber));
    }
  };

  const openRazorpayCheckout = (
    rpData: { razorpayOrderId: string; amount: number; currency: string; razorpayKeyId: string; customerName: string; customerEmail: string; customerPhone: string },
    orderNumber: string,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const win = window as { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } };
      if (!win.Razorpay) {
        reject(new Error("Razorpay SDK not loaded. Please refresh and try again."));
        return;
      }

      const rp = new win.Razorpay({
        key: rpData.razorpayKeyId,
        amount: rpData.amount * 100, // paise
        currency: rpData.currency,
        name: config.brand.name,
        description: `Order ${orderNumber}`,
        order_id: rpData.razorpayOrderId,
        prefill: {
          name: rpData.customerName,
          email: rpData.customerEmail,
          contact: rpData.customerPhone,
        },
        theme: { color: "#b91c1c" }, // brand-primary-700
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            router.push(ROUTES.checkoutConfirmation(orderNumber));
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            setLocalError("Payment cancelled. Your order has been saved — you can retry payment.");
            resolve();
          },
        },
      });
      rp.open();
    });
  };

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {/* Contact details */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Contact details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="label-field">Full name</label>
              <input id="fullName" name="fullName" required className="input-field" />
            </div>
            <div>
              <label htmlFor="email" className="label-field">Email</label>
              <input id="email" name="email" type="email" required className="input-field" />
            </div>
            <div>
              <label htmlFor="phone" className="label-field">Phone</label>
              <input id="phone" name="phone" type="tel" required pattern="^\+?[0-9]{10,15}$"
                placeholder="e.g. 9876543210" className="input-field" />
            </div>
          </div>
        </fieldset>

        {/* Shipping address */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Shipping address
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="line1" className="label-field">Address line 1</label>
              <input id="line1" name="line1" required className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="line2" className="label-field">Address line 2 (optional)</label>
              <input id="line2" name="line2" className="input-field" />
            </div>
            <div>
              <label htmlFor="city" className="label-field">City</label>
              <input id="city" name="city" required className="input-field" />
            </div>
            <div>
              <label htmlFor="state" className="label-field">State</label>
              <select id="state" name="state" required className="input-field">
                <option value="">Select state</option>
                {INDIA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pincode" className="label-field">Pincode</label>
              <input id="pincode" name="pincode" required pattern="^[1-9][0-9]{5}$"
                placeholder="e.g. 500001" className="input-field" />
            </div>
            <div>
              <label htmlFor="landmark" className="label-field">Landmark (optional)</label>
              <input id="landmark" name="landmark" className="input-field" />
            </div>
          </div>
        </fieldset>

        {/* Payment method */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Payment method
          </legend>
          <div className="space-y-3">
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
              paymentMethod === "COD" ? "border-brand-primary-600 bg-brand-primary-50" : "border-brand-earth-300"
            }`}>
              <input type="radio" name="paymentMethodRadio" value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="accent-brand-primary-700" />
              <div>
                <span className="font-medium text-brand-earth-900">Cash on Delivery / UPI on Delivery</span>
                <p className="text-sm text-brand-earth-700/70">Pay when your order arrives</p>
              </div>
            </label>
            {config.features.enablePayments && (
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                paymentMethod === "RAZORPAY" ? "border-brand-primary-600 bg-brand-primary-50" : "border-brand-earth-300"
              }`}>
                <input type="radio" name="paymentMethodRadio" value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="accent-brand-primary-700" />
                <div>
                  <span className="font-medium text-brand-earth-900">Pay Online</span>
                  <p className="text-sm text-brand-earth-700/70">UPI, cards, net banking via Razorpay</p>
                </div>
              </label>
            )}
          </div>
        </fieldset>

        {/* Notes */}
        <fieldset className="card-warm" disabled={isSubmitting}>
          <legend className="font-display text-xl font-bold text-brand-earth-900 mb-4">
            Order notes (optional)
          </legend>
          <textarea id="notes" name="notes" rows={3} maxLength={1000}
            placeholder="Any special instructions…" className="input-field" />
        </fieldset>
      </div>

      {/* Order summary sidebar */}
      <div className="lg:sticky lg:top-24 h-fit space-y-6">
        <div className="card-warm">
          <h2 className="font-display text-xl font-bold text-brand-earth-900">Order summary</h2>
          <ul className="mt-4 divide-y divide-brand-cream-200">
            {items.map((line) => (
              <li key={`${line.productId}:${line.variantId ?? ""}`}
                className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-brand-cream-100">
                  <Image src={line.image} alt={line.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-earth-900 truncate">{line.name}</p>
                  <p className="text-xs text-brand-earth-700/70">{line.weight} × {line.quantity}</p>
                </div>
                <p className="text-sm font-medium text-brand-earth-900">
                  {formatPrice(line.unitPrice * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-brand-cream-200 pt-4 text-sm text-brand-earth-800">
            <div className="flex justify-between">
              <dt>Items ({count})</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="font-medium">
                {shippingFee === 0 ? (
                  <span className="text-green-700">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </dd>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-brand-earth-700/70">
                Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </p>
            )}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-brand-cream-200 pt-4">
            <span className="font-display text-lg font-semibold text-brand-earth-900">Total</span>
            <span className="font-display text-2xl font-bold text-brand-primary-700">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {(localError || (status === "error" && message)) && (
          <p className="text-sm text-red-600">{localError || message}</p>
        )}

        <button type="submit" disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:opacity-60">
          {isSubmitting ? "Placing order…" : paymentMethod === "RAZORPAY" ? "Place order & pay" : "Place order (COD)"}
        </button>

        <Link href={ROUTES.cart}
          className="block text-center text-sm font-medium text-brand-earth-700 hover:text-brand-primary-700">
          ← Back to cart
        </Link>
      </div>
    </form>
  );
}
