import { http } from "@/shared/lib/http";
import type { Shipment } from "@/features/shipping/types";

export interface CreateShipmentRequest {
  orderId: number;
  courierId?: number;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminShipmentsApi = {
  create: (request: CreateShipmentRequest) =>
    http<Shipment>("/shipments", {
      method: "POST",
      body: JSON.stringify(request),
      auth: "admin",
    }),

  list: (page = 0, size = 20) =>
    http<PageResponse<Shipment>>(`/shipments?page=${page}&size=${size}`, {
      auth: "admin",
      cache: "no-store",
    }),

  getById: (id: number) =>
    http<Shipment>(`/shipments/${id}`, {
      auth: "admin",
      cache: "no-store",
    }),

  getByOrderId: (orderId: number) =>
    http<Shipment>(`/shipments/order/${orderId}`, {
      auth: "admin",
      cache: "no-store",
    }),

  assignAwb: (id: number) =>
    http<Shipment>(`/shipments/${id}/assign-awb`, {
      method: "POST",
      auth: "admin",
    }),

  schedulePickup: (id: number) =>
    http<Shipment>(`/shipments/${id}/pickup`, {
      method: "POST",
      auth: "admin",
    }),

  cancel: (id: number, reason: string) =>
    http<Shipment>(
      `/shipments/${id}/cancel?reason=${encodeURIComponent(reason)}`,
      { method: "POST", auth: "admin" },
    ),

  getLabel: (id: number) =>
    http<string>(`/shipments/${id}/label`, {
      auth: "admin",
      cache: "no-store",
    }),
};
