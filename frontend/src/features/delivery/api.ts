import { http } from "@/shared/lib/http";
import type { DeliveryEstimate, DeliveryEstimateRequest } from "./types";

export const deliveryApi = {
  estimate: (input: DeliveryEstimateRequest) =>
    http<DeliveryEstimate>("/delivery/estimate", {
      method: "POST",
      body: JSON.stringify(input),
      cache: "no-store",
    }),
};