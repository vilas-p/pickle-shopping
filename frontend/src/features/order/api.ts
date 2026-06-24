import { http } from "@/shared/lib/http";
import type { PageResponse } from "@/shared/types/api";
import type { CreateOrderPayload, Order } from "./types";

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    http<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
      cache: "no-store",
    }),
  byNumber: (orderNumber: string) =>
    http<Order>(`/orders/number/${encodeURIComponent(orderNumber)}`, {
      cache: "no-store",
    }),
  myOrders: (page = 0, size = 10) =>
    http<PageResponse<Order>>(`/orders/my?page=${page}&size=${size}&sort=createdAt,desc`, {
      cache: "no-store",
      auth: true,
    }),
  myOrderByNumber: (orderNumber: string) =>
    http<Order>(`/orders/my/${encodeURIComponent(orderNumber)}`, {
      cache: "no-store",
      auth: true,
    }),
};
