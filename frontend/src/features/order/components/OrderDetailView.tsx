"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ordersApi } from "@/features/order/api";
import { OrderStatusBadge } from "@/features/order/components/OrderStatusBadge";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import type { Order } from "@/features/order/types";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] as const;

function OrderTimeline({ current }: { current: string }) {
  const idx = STATUS_STEPS.indexOf(current as (typeof STATUS_STEPS)[number]);
  const isCancelled = current === "CANCELLED";

  return (
    <div className="mt-6">
      {isCancelled ? (
        <p className="text-sm font-medium text-red-600">This order has been cancelled.</p>
      ) : (
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= idx;
            const isActive = i === idx;
            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-brand-primary-600 text-white"
                      : "bg-brand-cream-200 text-brand-earth-700/50"
                  } ${isActive ? "ring-2 ring-brand-primary-300 ring-offset-2" : ""}`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium ${
                    done ? "text-brand-primary-700" : "text-brand-earth-700/50"
                  }`}
                >
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OrderDetailView() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    ordersApi
      .myOrderByNumber(orderNumber)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load order")
      )
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-brand-cream-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-brand-cream-100" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="card-warm text-center">
        <p className="text-red-600">{error || "Order not found"}</p>
        <Link href={ROUTES.accountOrders} className="btn-secondary mt-4 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentMethod === "RAZORPAY";

  return (
    <div>
      <Link
        href={ROUTES.accountOrders}
        className="text-sm font-medium text-brand-earth-700 hover:text-brand-primary-700"
      >
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-2xl font-bold text-brand-earth-900 sm:text-3xl">
          {order.orderNumber}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mt-1 text-sm text-brand-earth-700/70">
        Placed on{" "}
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <OrderTimeline current={order.status} />

      {/* Items */}
      <div className="mt-8 card-warm">
        <h2 className="font-display text-lg font-bold text-brand-earth-900">Items</h2>
        <ul className="mt-3 divide-y divide-brand-cream-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-brand-earth-900">{item.productName}</p>
                <p className="text-sm text-brand-earth-700/70">
                  {item.productWeight} × {item.quantity}
                </p>
              </div>
              <p className="font-medium text-brand-earth-900">
                {formatPrice(item.lineTotal)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing & address */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card-warm">
          <h2 className="font-display text-lg font-bold text-brand-earth-900">Payment</h2>
          <dl className="mt-3 space-y-2 text-sm text-brand-earth-800">
            <div className="flex justify-between">
              <dt>Method</dt>
              <dd>{isPaid ? "Paid online" : "Cash on Delivery"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-cream-200 pt-2 text-base font-bold text-brand-earth-900">
              <dt>Total</dt>
              <dd className="text-brand-primary-700">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="card-warm">
          <h2 className="font-display text-lg font-bold text-brand-earth-900">
            Shipping address
          </h2>
          <address className="mt-3 not-italic text-sm text-brand-earth-800 leading-relaxed">
            {order.shippingAddress.line1}
            <br />
            {order.shippingAddress.line2 && (
              <>
                {order.shippingAddress.line2}
                <br />
              </>
            )}
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.pincode}
            {order.shippingAddress.landmark && (
              <>
                <br />
                Landmark: {order.shippingAddress.landmark}
              </>
            )}
          </address>
        </div>
      </div>
    </div>
  );
}
