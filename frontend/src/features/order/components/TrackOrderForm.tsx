"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ordersApi } from "@/features/order/api";
import { OrderStatusBadge } from "@/features/order/components/OrderStatusBadge";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import type { Order } from "@/features/order/types";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] as const;

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const result = await ordersApi.byNumber(trimmed);
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. AAP-20260616-12345678"
          required
          className="input-field flex-1 min-w-[240px]"
        />
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? "Looking up…" : "Track order"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {order && (
        <div className="mt-8 card-warm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-bold text-brand-primary-700">
                {order.orderNumber}
              </p>
              <p className="mt-1 text-sm text-brand-earth-700/70">
                Placed{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Progress timeline */}
          {order.status !== "CANCELLED" && (
            <div className="mt-6 flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => {
                const idx = STATUS_STEPS.indexOf(
                  order.status as (typeof STATUS_STEPS)[number]
                );
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
          {order.status === "CANCELLED" && (
            <p className="mt-4 text-sm font-medium text-red-600">
              This order has been cancelled.
            </p>
          )}

          {/* Items + total */}
          <div className="mt-6 border-t border-brand-cream-200 pt-4">
            <h3 className="text-sm font-semibold text-brand-earth-900">Items</h3>
            <ul className="mt-2 space-y-1">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-brand-earth-800">
                  <span>
                    {item.productName} ({item.productWeight}) × {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-brand-cream-200 pt-3 text-base font-bold text-brand-earth-900">
              <span>Total</span>
              <span className="text-brand-primary-700">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
