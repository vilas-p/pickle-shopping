"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/http";
import { formatPrice } from "@/shared/lib/format";
import { OrderStatusBadge } from "@/features/order/components/OrderStatusBadge";
import type { Order, OrderStatus } from "@/features/order/types";
import { adminOrdersApi } from "../api";

const ORDER_STATUS_OPTIONS: Array<OrderStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: OrderStatus | "ALL"): string {
  return status === "ALL" ? "All orders" : status.charAt(0) + status.slice(1).toLowerCase();
}

export function AdminOrdersBoard() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] = useState<Record<number, OrderStatus | "">>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await adminOrdersApi.list({ status: statusFilter, page, size: 10 });
        if (cancelled) return;
        setOrders(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setSelectedNextStatus((prev) => {
          const next = { ...prev };
          for (const order of result.content) {
            if (!(order.id in next)) {
              next[order.id] = STATUS_TRANSITIONS[order.status][0] ?? "";
            }
          }
          return next;
        });
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setError("Your admin session expired. Please sign in again.");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load orders.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter]);

  const visibleSummary = useMemo(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const packed = orders.filter((order) => order.status === "PACKED").length;
    const shipped = orders.filter((order) => order.status === "SHIPPED").length;
    return { pending, packed, shipped };
  }, [orders]);

  const changeStatus = async (order: Order) => {
    const nextStatus = selectedNextStatus[order.id];
    if (!nextStatus) return;

    setUpdatingOrderId(order.id);
    setError("");

    try {
      const updated = await adminOrdersApi.updateStatus(order.id, nextStatus);
      setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)));
      setSelectedNextStatus((current) => ({
        ...current,
        [order.id]: STATUS_TRANSITIONS[updated.status][0] ?? "",
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card-warm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary-700">
              Order fulfillment
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
              See who ordered what, where it goes, and move the order forward
            </h2>
            <p className="mt-3 max-w-3xl text-brand-earth-700/80">
              Use this screen to review customer details, shipping addresses, ordered items, and update order status as you confirm, pack, ship, and deliver.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Loaded now</p>
              <p className="mt-1 text-lg font-bold text-brand-earth-900">{orders.length}</p>
            </div>
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Pending on page</p>
              <p className="mt-1 text-lg font-bold text-brand-earth-900">{visibleSummary.pending}</p>
            </div>
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Packed / shipped</p>
              <p className="mt-1 text-lg font-bold text-brand-earth-900">{visibleSummary.packed + visibleSummary.shipped}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-warm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS_OPTIONS.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(0);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-brand-primary-600 text-white"
                      : "bg-brand-cream-100 text-brand-earth-800 hover:bg-brand-cream-200"
                  }`}
                >
                  {statusLabel(status)}
                </button>
              );
            })}
          </div>

          <p className="text-sm text-brand-earth-700/80">
            {totalElements} total orders in this view
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card-warm h-64 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-warm text-center">
          <h3 className="font-display text-2xl font-semibold text-brand-earth-900">No orders found</h3>
          <p className="mt-2 text-brand-earth-700/80">
            There are no orders in the {statusLabel(statusFilter).toLowerCase()} view right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatuses = STATUS_TRANSITIONS[order.status];
            const selectedStatus = selectedNextStatus[order.id] ?? nextStatuses[0] ?? "";
            const isTerminal = nextStatuses.length === 0;

            return (
              <article key={order.id} className="card-warm overflow-hidden">
                <div className="flex flex-col gap-5 border-b border-brand-cream-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl font-semibold text-brand-earth-900">
                        {order.orderNumber}
                      </h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 text-sm text-brand-earth-700/75">
                      Ordered on {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 ring-1 ring-brand-cream-200 lg:min-w-80">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Update status</p>
                    {isTerminal ? (
                      <p className="mt-2 text-sm text-brand-earth-700/80">
                        This order is in a terminal state and cannot move further.
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <select
                          value={selectedStatus}
                          onChange={(event) =>
                            setSelectedNextStatus((current) => ({
                              ...current,
                              [order.id]: event.target.value as OrderStatus,
                            }))
                          }
                          className="input-field"
                        >
                          {nextStatuses.map((status) => (
                            <option key={status} value={status}>
                              {statusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => void changeStatus(order)}
                          disabled={updatingOrderId === order.id || !selectedStatus}
                          className="btn-primary justify-center disabled:opacity-60"
                        >
                          {updatingOrderId === order.id ? "Saving..." : "Change status"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 pt-5 xl:grid-cols-[0.9fr,1.1fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Customer</p>
                      <p className="mt-2 font-semibold text-brand-earth-900">{order.customer.fullName}</p>
                      <p className="mt-1 text-sm text-brand-earth-800">{order.customer.phone}</p>
                      <p className="text-sm text-brand-earth-700/80">{order.customer.email}</p>
                    </div>

                    <div className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Shipping address</p>
                      <address className="mt-2 not-italic text-sm leading-relaxed text-brand-earth-800">
                        <div>{order.shippingAddress.line1}</div>
                        {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                        <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</div>
                        {order.shippingAddress.landmark && <div>Landmark: {order.shippingAddress.landmark}</div>}
                      </address>
                    </div>

                    <div className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Payment</p>
                      <div className="mt-2 space-y-1 text-sm text-brand-earth-800">
                        <div>Method: {order.paymentMethod === "UPI"
                          ? "UPI"
                          : order.paymentMethod === "RAZORPAY"
                            ? "Paid online"
                            : "Cash on Delivery"}</div>
                        <div>Subtotal: {formatPrice(order.subtotal)}</div>
                        <div>Shipping: {order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</div>
                        <div className="font-semibold text-brand-earth-900">Total: {formatPrice(order.total)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-brand-cream-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Items ordered</p>
                        <p className="mt-1 text-sm text-brand-earth-700/80">Review exactly what needs to be packed for this shipment.</p>
                      </div>
                      <span className="rounded-full bg-brand-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary-700 ring-1 ring-brand-primary-100">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <ul className="mt-4 divide-y divide-brand-cream-200">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                          <div>
                            <p className="font-medium text-brand-earth-900">{item.productName}</p>
                            <p className="text-sm text-brand-earth-700/75">
                              {item.productWeight} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-brand-earth-900">{formatPrice(item.lineTotal)}</p>
                        </li>
                      ))}
                    </ul>

                    {order.notes && (
                      <div className="mt-4 rounded-2xl bg-brand-cream-50 px-4 py-3 text-sm text-brand-earth-800 ring-1 ring-brand-cream-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Order note</p>
                        <p className="mt-2">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-brand-cream-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-brand-earth-700/80">
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            className="btn-secondary disabled:opacity-60"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => (current + 1 < totalPages ? current + 1 : current))}
            disabled={totalPages === 0 || page + 1 >= totalPages}
            className="btn-secondary disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}