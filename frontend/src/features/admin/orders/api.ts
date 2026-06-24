import { http } from "@/shared/lib/http";
import type { PageResponse } from "@/shared/types/api";
import type { Order, OrderStatus } from "@/features/order/types";

export const adminOrdersApi = {
  list: (params?: { status?: OrderStatus | "ALL"; page?: number; size?: number }) => {
    const search = new URLSearchParams();
    search.set("page", String(params?.page ?? 0));
    search.set("size", String(params?.size ?? 10));
    search.set("sort", "createdAt,desc");
    if (params?.status && params.status !== "ALL") {
      search.set("status", params.status);
    }

    return http<PageResponse<Order>>(`/orders?${search.toString()}`, {
      auth: "admin",
      cache: "no-store",
    });
  },

  updateStatus: (orderId: number, status: OrderStatus) =>
    http<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      auth: "admin",
      cache: "no-store",
      body: JSON.stringify({ status }),
    }),
};