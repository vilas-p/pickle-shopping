import { http } from "@/shared/lib/http";
import type {
  ServiceabilityRequest,
  ServiceabilityResponse,
  TrackingResponse,
} from "./types";

export const shippingApi = {
  checkServiceability: (input: ServiceabilityRequest) =>
    http<ServiceabilityResponse>("/shipping/serviceability", {
      method: "POST",
      body: JSON.stringify(input),
      cache: "no-store",
    }),

  getTracking: (orderNumber: string) =>
    http<TrackingResponse>(`/tracking/${orderNumber}`, {
      cache: "no-store",
    }),
};
