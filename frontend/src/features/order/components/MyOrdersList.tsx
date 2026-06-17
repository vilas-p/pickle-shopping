"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ordersApi } from "@/features/order/api";
import { OrderStatusBadge } from "@/features/order/components/OrderStatusBadge";
import { formatPrice } from "@/shared/lib/format";
import { ROUTES } from "@/shared/constants/routes";
import type { Order } from "@/features/order/types";
import type { PageResponse } from "@/shared/types/api";

export function MyOrdersList() {
  const [data, setData] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const result = await ordersApi.myOrders(p);
      setData(result);
      setPage(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-brand-cream-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-warm text-center">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={() => load(page)} className="btn-secondary mt-4">
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="card-warm text-center py-12">
        <h2 className="font-display text-xl text-brand-earth-900">No orders yet</h2>
        <p className="mt-2 text-brand-earth-700/70">Once you place an order, it will appear here.</p>
        <Link href={ROUTES.products} className="btn-primary mt-6 inline-block">
          Browse Pickles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.content.map((order) => (
        <Link
          key={order.id}
          href={ROUTES.accountOrderDetail(order.orderNumber)}
          className="block rounded-2xl bg-white p-5 shadow-card transition hover:shadow-lg"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-brand-primary-700">
                {order.orderNumber}
              </p>
              <p className="mt-1 text-xs text-brand-earth-700/70">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-brand-earth-700/80">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
            <p className="font-display text-lg font-bold text-brand-earth-900">
              {formatPrice(order.total)}
            </p>
          </div>
        </Link>
      ))}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={data.first || loading}
            onClick={() => load(page - 1)}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="self-center text-sm text-brand-earth-700/70">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            type="button"
            disabled={data.last || loading}
            onClick={() => load(page + 1)}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
