"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/http";
import { adminDashboardApi } from "../api";
import type { DashboardStats } from "../types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DashboardStats };

type SummaryCardKey =
  | "totalProducts"
  | "totalCustomers"
  | "totalOrders"
  | "pendingOrders"
  | "ordersLast30Days"
  | "lowStockItems"
  | "unhandledContacts"
  | "pendingReviews";

type SummaryCard = {
  key: SummaryCardKey;
  label: string;
  hint: string;
  tone: "neutral" | "success" | "warning" | "danger";
};

type DashboardAlert = {
  id: string;
  label: string;
  value: number;
  description: string;
  severity: "healthy" | "watch" | "urgent";
  metricKey: SummaryCardKey;
};

const summaryCards: SummaryCard[] = [
  { key: "totalProducts", label: "Products", hint: "Active catalogue count", tone: "neutral" },
  { key: "totalCustomers", label: "Customers", hint: "Registered customer base", tone: "success" },
  { key: "totalOrders", label: "Orders", hint: "All-time completed intake", tone: "neutral" },
  { key: "pendingOrders", label: "Pending orders", hint: "Need packing or confirmation", tone: "warning" },
  { key: "ordersLast30Days", label: "Orders in 30 days", hint: "Current demand pace", tone: "success" },
  { key: "lowStockItems", label: "Low stock items", hint: "Inventory at risk", tone: "danger" },
  { key: "unhandledContacts", label: "Unread contacts", hint: "Customer follow-up queue", tone: "warning" },
  { key: "pendingReviews", label: "Pending reviews", hint: "Need moderation", tone: "warning" },
];

const autoRefreshOptions = [
  { value: 0, label: "Manual" },
  { value: 30_000, label: "30s" },
  { value: 60_000, label: "1m" },
  { value: 180_000, label: "3m" },
] as const;

function formatCurrency(amount: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatRelativeTime(lastUpdatedAt: number | null): string {
  if (!lastUpdatedAt) return "Not synced yet";

  const diffMs = Date.now() - lastUpdatedAt;
  if (diffMs < 15_000) return "Updated just now";

  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return "Updated less than a minute ago";
  if (diffMinutes === 1) return "Updated 1 minute ago";
  if (diffMinutes < 60) return `Updated ${diffMinutes} minutes ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours === 1) return "Updated 1 hour ago";
  return `Updated ${diffHours} hours ago`;
}

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function toneClasses(tone: SummaryCard["tone"], active: boolean): string {
  if (active) {
    return "border-brand-primary-600 bg-brand-primary-50 shadow-card";
  }

  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300";
    case "warning":
      return "border-amber-200 bg-amber-50/70 hover:border-amber-300";
    case "danger":
      return "border-red-200 bg-red-50/70 hover:border-red-300";
    default:
      return "border-brand-cream-200 bg-white hover:border-brand-primary-200";
  }
}

function buildAlerts(data: DashboardStats): DashboardAlert[] {
  return [
    {
      id: "pending-orders",
      label: "Pending orders",
      value: data.pendingOrders,
      description: data.pendingOrders > 0
        ? "Orders are waiting for confirmation, packing, or dispatch."
        : "No pending orders in the queue.",
      severity: data.pendingOrders >= 15 ? "urgent" : data.pendingOrders >= 5 ? "watch" : "healthy",
      metricKey: "pendingOrders",
    },
    {
      id: "low-stock",
      label: "Low stock items",
      value: data.lowStockItems,
      description: data.lowStockItems > 0
        ? "Replenish or pause stock before popular SKUs run out."
        : "Inventory is comfortably stocked.",
      severity: data.lowStockItems >= 8 ? "urgent" : data.lowStockItems >= 3 ? "watch" : "healthy",
      metricKey: "lowStockItems",
    },
    {
      id: "customer-messages",
      label: "Unread contacts",
      value: data.unhandledContacts,
      description: data.unhandledContacts > 0
        ? "Customers are waiting for a reply from the team."
        : "Inbox is clear.",
      severity: data.unhandledContacts >= 6 ? "urgent" : data.unhandledContacts >= 2 ? "watch" : "healthy",
      metricKey: "unhandledContacts",
    },
    {
      id: "review-queue",
      label: "Pending reviews",
      value: data.pendingReviews,
      description: data.pendingReviews > 0
        ? "Moderate reviews so fresh feedback appears on the storefront."
        : "No reviews are waiting for moderation.",
      severity: data.pendingReviews >= 6 ? "urgent" : data.pendingReviews >= 2 ? "watch" : "healthy",
      metricKey: "pendingReviews",
    },
  ];
}

function progressWidth(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.max(8, Math.round((value / total) * 100))}%`;
}

export function AdminDashboard() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedMetric, setSelectedMetric] = useState<SummaryCardKey>("pendingOrders");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(60_000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (state.status !== "success") return;

    const hasSelectedStatus = selectedStatus && selectedStatus in state.data.ordersByStatus;
    if (!hasSelectedStatus) {
      const firstOpenStatus = Object.entries(state.data.ordersByStatus)
        .sort((a, b) => b[1] - a[1])
        .find(([, count]) => count > 0)?.[0] ?? Object.keys(state.data.ordersByStatus)[0] ?? null;
      setSelectedStatus(firstOpenStatus);
    }
  }, [selectedStatus, state]);

  useEffect(() => {
    let cancelled = false;

    const load = async (reason: "initial" | "refresh" | "poll") => {
      if (reason !== "initial") {
        setIsRefreshing(true);
      }

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
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    };

    void load("initial");

    let intervalId: number | null = null;
    if (refreshIntervalMs > 0) {
      intervalId = window.setInterval(() => {
        void load("poll");
      }, refreshIntervalMs);
    }

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [refreshIntervalMs]);

  const alerts = useMemo(
    () => (state.status === "success" ? buildAlerts(state.data) : []),
    [state],
  );

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
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
  const totalOrdersByStatus = Object.values(data.ordersByStatus).reduce((sum, count) => sum + count, 0);
  const selectedCard = summaryCards.find((card) => card.key === selectedMetric) ?? summaryCards[0];
  const selectedCardValue = data[selectedCard.key];
  const selectedAlert = alerts.find((alert) => alert.metricKey === selectedMetric) ?? null;
  const selectedStatusValue = selectedStatus ? data.ordersByStatus[selectedStatus] ?? 0 : 0;
  const fulfillmentRate = totalOrdersByStatus > 0
    ? Math.round((((data.ordersByStatus.DELIVERED ?? 0) + (data.ordersByStatus.SHIPPED ?? 0)) / totalOrdersByStatus) * 100)
    : 0;
  const pendingShare = totalOrdersByStatus > 0 ? Math.round((data.pendingOrders / totalOrdersByStatus) * 100) : 0;
  const attentionCount = alerts.filter((alert) => alert.severity !== "healthy").length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await adminDashboardApi.getStats();
      setState({ status: "success", data: refreshed });
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

  return (
    <div className="space-y-6">
      <section className="card-warm overflow-hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary-700">
              Live operations board
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
              Keep dispatch, inventory, and customer follow-up in one view
            </h2>
            <p className="mt-3 max-w-3xl text-brand-earth-700/80">
              This dashboard updates from the current admin stats endpoint and lets you focus the queue,
              inventory risk, and customer attention points without leaving the screen.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-brand-cream-200 bg-brand-cream-50 p-1">
              <div className="flex flex-wrap gap-1">
                {autoRefreshOptions.map((option) => {
                  const active = refreshIntervalMs === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRefreshIntervalMs(option.value)}
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "bg-white text-brand-primary-700 shadow-sm"
                          : "text-brand-earth-700/80 hover:text-brand-earth-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
              className="btn-secondary min-w-32 justify-center disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-brand-cream-200 pt-5 md:grid-cols-3">
          <div className="rounded-2xl bg-brand-cream-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Sync status</p>
            <p className="mt-1 text-sm font-medium text-brand-earth-900">{formatRelativeTime(lastUpdatedAt)}</p>
          </div>
          <div className="rounded-2xl bg-brand-cream-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Attention items</p>
            <p className="mt-1 text-sm font-medium text-brand-earth-900">{attentionCount} queues need review</p>
          </div>
          <div className="rounded-2xl bg-brand-cream-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Fulfillment health</p>
            <p className="mt-1 text-sm font-medium text-brand-earth-900">{fulfillmentRate}% shipped or delivered</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setSelectedMetric(card.key)}
            className={`rounded-brand border p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${toneClasses(
              card.tone,
              selectedMetric === card.key,
            )}`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl font-bold text-brand-earth-900">
              {formatNumber(data[card.key])}
            </p>
            <p className="mt-2 text-sm text-brand-earth-700/80">{card.hint}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="space-y-6">
          <div className="card-warm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
                  Focus panel
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-brand-earth-900">
                  {selectedCard.label}
                </h3>
              </div>
              <span className="rounded-full bg-brand-primary-50 px-4 py-2 text-sm font-bold text-brand-primary-700 ring-1 ring-brand-primary-100">
                {formatNumber(selectedCardValue)}
              </span>
            </div>

            <p className="mt-3 text-brand-earth-700/80">{selectedCard.hint}</p>

            {selectedAlert ? (
              <div className="mt-4 rounded-2xl border border-brand-cream-200 bg-brand-cream-50 p-4">
                <p className="text-sm font-semibold text-brand-earth-900">{selectedAlert.label}</p>
                <p className="mt-2 text-sm text-brand-earth-700/80">{selectedAlert.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
                  {selectedAlert.severity === "urgent"
                    ? "Needs immediate action"
                    : selectedAlert.severity === "watch"
                      ? "Keep under watch"
                      : "Healthy"}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-brand-cream-200 bg-brand-cream-50 p-4">
                <p className="text-sm text-brand-earth-700/80">
                  Use the metric cards above to switch operational focus across demand, inventory, and customer queues.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-cream-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Revenue</p>
                <p className="mt-2 font-display text-2xl font-bold text-brand-earth-900">
                  {formatCurrency(data.revenueLast30Days)}
                </p>
                <p className="mt-2 text-sm text-brand-earth-700/75">Last 30 days</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-cream-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Pending share</p>
                <p className="mt-2 font-display text-2xl font-bold text-brand-earth-900">{pendingShare}%</p>
                <p className="mt-2 text-sm text-brand-earth-700/75">Of tracked order statuses</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-brand-cream-200">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Orders tracked</p>
                <p className="mt-2 font-display text-2xl font-bold text-brand-earth-900">{formatNumber(totalOrdersByStatus)}</p>
                <p className="mt-2 text-sm text-brand-earth-700/75">Across all statuses</p>
              </div>
            </div>
          </div>

          <div className="card-warm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
                  Order pipeline
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-brand-earth-900">
                  Drill into status distribution
                </h3>
              </div>
              {selectedStatus && (
                <span className="rounded-full bg-brand-cream-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-earth-800">
                  {statusLabel(selectedStatus)}
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {Object.entries(data.ordersByStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const active = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-brand-primary-600 bg-brand-primary-50"
                          : "border-brand-cream-200 hover:border-brand-primary-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-brand-earth-900">{statusLabel(status)}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-primary-700 shadow-sm">
                          {formatNumber(count)}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-cream-100">
                        <div
                          className="h-full rounded-full bg-brand-primary-600 transition-all"
                          style={{ width: progressWidth(count, totalOrdersByStatus) }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-brand-earth-700/70">
                        {totalOrdersByStatus > 0 ? Math.round((count / totalOrdersByStatus) * 100) : 0}% of tracked orders
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card-warm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              Selected queue
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-brand-earth-900">
              {selectedStatus ? statusLabel(selectedStatus) : "No status selected"}
            </h3>
            <p className="mt-3 text-sm text-brand-earth-700/80">
              {selectedStatus
                ? `${formatNumber(selectedStatusValue)} orders currently sit in this stage.`
                : "Select any status from the pipeline to inspect its current volume."}
            </p>

            {selectedStatus && (
              <div className="mt-4 rounded-2xl bg-brand-cream-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">Queue share</p>
                <p className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
                  {totalOrdersByStatus > 0 ? Math.round((selectedStatusValue / totalOrdersByStatus) * 100) : 0}%
                </p>
                <p className="mt-2 text-sm text-brand-earth-700/80">
                  Of all orders currently represented in status tracking.
                </p>
              </div>
            )}
          </section>

          <section className="card-warm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              Attention radar
            </p>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => {
                const active = selectedMetric === alert.metricKey;
                const severityClass =
                  alert.severity === "urgent"
                    ? "bg-red-100 text-red-700 ring-red-200"
                    : alert.severity === "watch"
                      ? "bg-amber-100 text-amber-800 ring-amber-200"
                      : "bg-emerald-100 text-emerald-700 ring-emerald-200";

                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => setSelectedMetric(alert.metricKey)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-brand-primary-600 bg-brand-primary-50"
                        : "border-brand-cream-200 hover:border-brand-primary-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-brand-earth-900">{alert.label}</p>
                        <p className="mt-1 text-sm text-brand-earth-700/80">{alert.description}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ${severityClass}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-brand-earth-900">{formatNumber(alert.value)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="card-warm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-earth-700/70">
              Revenue pulse
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold text-brand-earth-900">
              {formatCurrency(data.revenueLast30Days)}
            </h3>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-cream-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-secondary-500 to-brand-primary-600"
                style={{ width: `${Math.min(100, Math.max(18, Math.round((data.ordersLast30Days / Math.max(1, data.totalOrders)) * 1000)) / 10)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-brand-earth-700/80">
              Using the last 30-day order pace as the current activity signal.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}