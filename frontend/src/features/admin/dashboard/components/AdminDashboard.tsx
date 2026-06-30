"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/shared/constants/routes";
import { ApiError } from "@/shared/lib/http";
import { adminDashboardApi } from "../api";
import type { DashboardStats } from "../types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DashboardStats };

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatCurrency(amount: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(lastUpdatedAt: number | null): string {
  if (!lastUpdatedAt) return "Not synced yet";

  const diffMs = Date.now() - lastUpdatedAt;
  if (diffMs < 15_000) return "Updated just now";

  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes <= 1) return "Updated 1 minute ago";
  if (diffMinutes < 60) return `Updated ${diffMinutes} minutes ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours <= 1) return "Updated 1 hour ago";
  return `Updated ${diffHours} hours ago`;
}

function statusLabel(status: string): string {
  return status.toLowerCase().replaceAll("_", " ");
}

export function AdminDashboard() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const statusRows = useMemo(
    () => (state.status === "success"
      ? Object.entries(state.data.ordersByStatus).sort((a, b) => b[1] - a[1])
      : []),
    [state],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await adminDashboardApi.getStats();
        if (cancelled) return;
        setState({ status: "success", data });
        setLastUpdatedAt(Date.now());
      } catch (error: unknown) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          setState({ status: "error", message: "Your admin session has expired. Please sign in again." });
          return;
        }
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load dashboard stats.",
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await adminDashboardApi.getStats();
      setState({ status: "success", data });
      setLastUpdatedAt(Date.now());
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setState({ status: "error", message: "Your admin session has expired. Please sign in again." });
        return;
      }
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to refresh dashboard stats.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card-warm h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="card-warm text-center">
        <h2 className="font-display text-2xl font-semibold text-brand-earth-900">Dashboard unavailable</h2>
        <p className="mt-3 text-brand-earth-700/80">{state.message}</p>
      </div>
    );
  }

  const { data } = state;

  const metricCards = [
    { label: "Products", value: formatNumber(data.totalProducts), hint: "Live catalogue items" },
    { label: "Orders", value: formatNumber(data.totalOrders), hint: "All recorded orders" },
    { label: "Pending orders", value: formatNumber(data.pendingOrders), hint: "Need confirmation or packing" },
    { label: "Revenue", value: formatCurrency(data.revenueLast30Days), hint: "Last 30 days" },
    { label: "Low stock", value: formatNumber(data.lowStockItems), hint: "Items that need review" },
    { label: "Unread contacts", value: formatNumber(data.unhandledContacts), hint: "Customer follow-up queue" },
  ];

  const attentionItems = [
    { label: "Pending orders", value: data.pendingOrders, note: "Open the orders page and move confirmations forward." },
    { label: "Low stock items", value: data.lowStockItems, note: "Review items at risk and replenish or pause them." },
    { label: "Pending reviews", value: data.pendingReviews, note: "Approve fresh feedback so it shows on the storefront." },
  ];

  return (
    <div className="space-y-6">
      <section className="card-warm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary-700">
              Simple overview
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
              See what needs attention without digging through the dashboard
            </h2>
            <p className="mt-3 max-w-3xl text-brand-earth-700/80">
              This screen keeps only the store totals, current order status counts, and the few admin actions you use most often.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-brand-cream-50 px-4 py-3 text-sm text-brand-earth-800 ring-1 ring-brand-cream-200">
              {formatRelativeTime(lastUpdatedAt)}
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <div key={card.label} className="card-warm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl font-bold text-brand-earth-900">{card.value}</p>
            <p className="mt-2 text-sm text-brand-earth-700/80">{card.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <section className="space-y-6">
          <div className="card-warm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              Quick actions
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href={ROUTES.adminOrders} className="rounded-2xl border border-brand-cream-200 bg-white px-4 py-4 transition hover:border-brand-primary-300 hover:bg-brand-cream-50">
                <p className="font-semibold text-brand-earth-900">Manage orders</p>
                <p className="mt-1 text-sm text-brand-earth-700/80">Review, pack, ship, and close orders.</p>
              </Link>
              <Link href={ROUTES.products} className="rounded-2xl border border-brand-cream-200 bg-white px-4 py-4 transition hover:border-brand-primary-300 hover:bg-brand-cream-50">
                <p className="font-semibold text-brand-earth-900">View storefront</p>
                <p className="mt-1 text-sm text-brand-earth-700/80">Open the live product catalogue in a new view.</p>
              </Link>
            </div>
          </div>

          <div className="card-warm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              Needs attention
            </p>
            <div className="mt-4 space-y-3">
              {attentionItems.map((item) => (
                <div key={item.label} className="rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-brand-earth-900">{item.label}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-primary-700 ring-1 ring-brand-cream-200">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brand-earth-700/80">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card-warm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
                Order status
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-brand-earth-900">
                Current queue by stage
              </h3>
            </div>
            <Link href={ROUTES.adminOrders} className="text-sm font-semibold text-brand-primary-700 hover:text-brand-primary-800">
              Open orders
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {statusRows.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-2xl bg-brand-cream-50 px-4 py-4 ring-1 ring-brand-cream-200">
                <div>
                  <p className="font-semibold capitalize text-brand-earth-900">{statusLabel(status)}</p>
                  <p className="mt-1 text-sm text-brand-earth-700/75">Current order count in this stage</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-primary-700 ring-1 ring-brand-cream-200">
                  {formatNumber(count)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}